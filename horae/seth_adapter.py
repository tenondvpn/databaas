"""
Seth SDK Adapter for Horae Views
用 seth_sdk.py 和 seth3.py 的逻辑替换 shardora_api.py
使用 WebSocket 订阅 txhash 方式等待交易确认
"""
import json
import time
import threading
from horae.seth_sdk import SethWeb3Mock, StepType, compile_and_link
from dags import settings as dags_settings

# WebSocket 支持
try:
    import websocket
    WS_AVAILABLE = True
except ImportError:
    WS_AVAILABLE = False
    print("Warning: websocket-client not installed. Falling back to HTTP polling.")

# 从 Django settings 获取配置，如果没有则使用默认值
http_ip = getattr(dags_settings, 'SETH_HTTP_IP', '35.197.170.240')
http_port = getattr(dags_settings, 'SETH_HTTP_PORT', 23001)
ws_port = getattr(dags_settings, 'SETH_WS_PORT', 33001)  # WebSocket 端口

# 创建全局 Web3 实例
w3 = SethWeb3Mock(http_ip, http_port)


# ============================================================================
# WebSocket 订阅功能
# ============================================================================

def _decode_ws_payload(raw):
    """
    从 WebSocket 消息中提取文本内容
    """
    if isinstance(raw, str):
        return raw
    if not isinstance(raw, (bytes, bytearray)):
        return None
    
    # 检测 WS 文本帧: 第一个字节 = 0x81 (FIN + opcode 1)
    if len(raw) >= 2 and raw[0] == 0x81:
        b1 = raw[1] & 0x7f
        if b1 <= 125:
            payload = raw[2:2 + b1]
        elif b1 == 126 and len(raw) >= 4:
            length = (raw[2] << 8) | raw[3]
            payload = raw[4:4 + length]
        elif b1 == 127 and len(raw) >= 10:
            length = int.from_bytes(raw[2:10], "big")
            payload = raw[10:10 + length]
        else:
            payload = raw
        try:
            return payload.decode("utf-8")
        except Exception:
            return None
    
    # 纯 UTF-8 字节（无帧头）
    try:
        return raw.decode("utf-8")
    except Exception:
        return None


def _build_ws_msg(action: str, tx_hash: str) -> str:
    """构建订阅/取消订阅命令"""
    return f"{action}:{tx_hash}"


def subscribe_txhash(tx_hash: str, timeout: int = 120) -> dict:
    """
    通过 WebSocket 订阅交易哈希，等待交易确认
    
    Args:
        tx_hash: 交易哈希
        timeout: 超时时间（秒）
        
    Returns:
        dict: 交易回执，如果超时返回 None
    """
    if not WS_AVAILABLE:
        # 回退到 HTTP 轮询
        return w3.client.wait_for_receipt(tx_hash)
    
    url = f"ws://{http_ip}:{ws_port}"
    result = None
    done = threading.Event()

    def on_open(ws):
        msg = _build_ws_msg("subscribe", tx_hash)
        ws.send(msg)
        print(f"[WS] Subscribed to txhash: {tx_hash}")

    def on_message(ws, raw):
        nonlocal result
        text = _decode_ws_payload(raw)
        if text is None:
            return
        
        try:
            data = json.loads(text.strip().lstrip('\ufeff'))
            if isinstance(data, str):
                data = json.loads(data)
        except Exception as e:
            print(f"[WS] JSON parse error: {e}")
            return

        if not isinstance(data, dict):
            return

        # 忽略订阅/取消订阅确认
        if data.get("status") in ("subscribed", "unsubscribed"):
            print(f"[WS] Server ack: {data.get('status')}")
            return

        # 处理错误
        if "error" in data:
            print(f"[WS] Server error: {data}")
            ws.close()
            done.set()
            return

        # 真实的交易推送
        if data.get("tx_hash", "").lower() == tx_hash.lower():
            result = data
            print(f"[WS] Transaction confirmed: {tx_hash}")
            ws.send(_build_ws_msg("unsubscribe", tx_hash))
            ws.close()
            done.set()

    def on_error(ws, err):
        if isinstance(err, (bytes, bytearray)):
            on_message(ws, err)
            return
        print(f"[WS] Error: {err}")
        done.set()

    def on_close(ws, code, msg):
        print(f"[WS] Connection closed, code={code}")
        done.set()

    try:
        ws_app = websocket.WebSocketApp(
            url,
            on_open=on_open,
            on_message=on_message,
            on_error=on_error,
            on_close=on_close,
        )

        t = threading.Thread(
            target=lambda: ws_app.run_forever(skip_utf8_validation=True), 
            daemon=True
        )
        t.start()

        if not done.wait(timeout=timeout):
            print(f"[WS] Timeout ({timeout}s): no confirmation for txhash={tx_hash}")
            ws_app.close()
            # 超时后回退到 HTTP 查询
            return w3.client.wait_for_receipt(tx_hash)

        return result if result else {}
        
    except Exception as e:
        print(f"[WS] Exception: {e}, falling back to HTTP polling")
        return w3.client.wait_for_receipt(tx_hash)


# ============================================================================
# API 函数实现
# ============================================================================

def get_account_info(address):
    """
    获取账户信息
    
    Args:
        address: 账户地址
        
    Returns:
        dict: 包含 balance, nonce 等信息的字典
    """
    print(f"\n[DEBUG] get_account_info 开始")
    print(f"  - address: {address}")
    
    try:
        print(f"  - 查询余额...")
        balance = w3.client.get_balance(address)
        print(f"  - 余额: {balance}")
        
        print(f"  - 查询 nonce...")
        nonce = w3.client.get_nonce(address)
        print(f"  - nonce: {nonce}")
        
        result = {
            'balance': str(balance),
            'nonce': str(nonce),
            'address': address
        }
        print(f"  ✓ 账户信息获取成功")
        return result
        
    except Exception as e:
        print(f"  ✗ get_account_info error: {e}")
        import traceback
        traceback.print_exc()
        return None


def contract_prefund(private_key, contract_address, prefund, check_res=True, nonce=-1):
    """
    为合约充值 Gas Prefund（使用 WebSocket 订阅）
    
    Args:
        private_key: 私钥
        contract_address: 合约地址
        prefund: 预充值金额
        check_res: 是否检查结果
        nonce: nonce值（-1表示自动获取）
        
    Returns:
        bool: 是否成功
    """
    print(f"\n[DEBUG] contract_prefund 开始")
    print(f"  - contract_address: {contract_address}")
    print(f"  - prefund: {prefund}")
    print(f"  - check_res: {check_res}")
    
    try:
        # 使用 seth_sdk 的 send_transaction_auto 发送 prefund 交易
        print(f"  - 发送 Gas Prefund 交易...")
        tx_hash = w3.client.send_transaction_auto(
            private_key,
            contract_address,
            StepType.kContractGasPrefund,
            amount=0,
            prefund=prefund
        )
        print(f"  - 交易哈希: {tx_hash}")
        
        if check_res:
            print(f"  - 等待交易确认...")
            # 使用 WebSocket 订阅等待交易确认
            receipt = subscribe_txhash(tx_hash, timeout=120)
            status = receipt.get('status')
            print(f"  - 交易状态: {status}")
            
            if status == 0:
                print(f"  ✓ Gas Prefund 成功")
                return True
            else:
                print(f"  ✗ Gas Prefund 失败: {receipt.get('msg', 'Unknown error')}")
                return False
        
        print(f"  ✓ Gas Prefund 交易已发送（未等待确认）")
        return True
        
    except Exception as e:
        print(f"  ✗ contract_prefund error: {e}")
        import traceback
        traceback.print_exc()
        return False


def call_contract_function(private_key, contract_address, amount, 
                          function_name, types_list, params_list):
    """
    调用合约函数（发送交易，使用 WebSocket 订阅）
    
    Args:
        private_key: 私钥
        contract_address: 合约地址
        amount: 转账金额
        function_name: 函数名
        types_list: 参数类型列表
        params_list: 参数值列表
        
    Returns:
        bool: 是否成功
    """
    print(f"\n[DEBUG] call_contract_function 开始")
    print(f"  - contract_address: {contract_address}")
    print(f"  - function_name: {function_name}")
    print(f"  - types_list: {types_list}")
    print(f"  - params_list: {params_list}")
    print(f"  - amount: {amount}")
    
    try:
        from Crypto.Hash import keccak
        import eth_abi
        
        # 构造函数调用数据
        print(f"  - 构造函数签名...")
        sig = f"{function_name}({','.join(types_list)})"
        print(f"  - 函数签名: {sig}")
        
        selector = keccak.new(digest_bits=256).update(sig.encode()).digest()[:4].hex()
        print(f"  - 函数选择器: {selector}")
        
        if types_list and params_list:
            print(f"  - 编码参数...")
            encoded_params = eth_abi.encode(types_list, params_list).hex()
            print(f"  - 编码后参数长度: {len(encoded_params)} 字符")
        else:
            encoded_params = ""
            print(f"  - 无参数")
            
        input_hex = selector + encoded_params
        print(f"  - 完整 input 长度: {len(input_hex)} 字符")
        
        # 发送交易
        print(f"  - 发送交易...")
        tx_hash = w3.client.send_transaction_auto(
            private_key,
            contract_address,
            StepType.kContractExcute,
            amount=amount,
            input_hex=input_hex
        )
        print(f"  - 交易哈希: {tx_hash}")
        
        # 使用 WebSocket 订阅等待交易确认
        print(f"  - 等待交易确认...")
        receipt = subscribe_txhash(tx_hash, timeout=120)
        status = receipt.get('status')
        print(f"  - 交易状态: {status}")
        
        if status == 0:
            print(f"  ✓ 合约函数调用成功")
            return True
        else:
            print(f"  ✗ 合约函数调用失败: {receipt.get('msg', 'Unknown error')}")
            print(f"  - 完整回执: {receipt}")
            return False
        
    except Exception as e:
        print(f"  ✗ call_contract_function error: {e}")
        import traceback
        traceback.print_exc()
        return False


def query_contract_function(private_key, contract_address, 
                           function_name, types_list, params_list, call_type=0):
    """
    查询合约函数（只读调用，不需要 WebSocket）
    
    Args:
        private_key: 私钥
        contract_address: 合约地址
        function_name: 函数名
        types_list: 参数类型列表
        params_list: 参数值列表
        call_type: 调用类型（0=abi_query, 1=query）
        
    Returns:
        Response对象，包含 .text 属性
    """
    print(f"\n[DEBUG] query_contract_function 开始")
    print(f"  - contract_address: {contract_address}")
    print(f"  - function_name: {function_name}")
    print(f"  - types_list: {types_list}")
    print(f"  - params_list: {params_list}")
    print(f"  - call_type: {call_type}")
    
    try:
        from Crypto.Hash import keccak
        import eth_abi
        
        # 构造函数调用数据
        print(f"  - 构造函数签名...")
        sig = f"{function_name}({','.join(types_list)})"
        print(f"  - 函数签名: {sig}")
        
        selector = keccak.new(digest_bits=256).update(sig.encode()).digest()[:4].hex()
        print(f"  - 函数选择器: {selector}")
        
        if types_list and params_list:
            print(f"  - 编码参数...")
            encoded_params = eth_abi.encode(types_list, params_list).hex()
            print(f"  - 编码后参数长度: {len(encoded_params)} 字符")
        else:
            encoded_params = ""
            print(f"  - 无参数")
            
        input_hex = selector + encoded_params
        print(f"  - 完整 input 长度: {len(input_hex)} 字符")
        
        # 获取调用者地址
        from_address = w3.client.get_address(private_key)
        print(f"  - 调用者地址: {from_address}")
        
        # 调用合约查询（只读，不需要 WebSocket）
        print(f"  - 发送查询请求...")
        result = w3.client.query_contract(from_address, contract_address, input_hex)
        print(f"  - 查询结果: {result[:100] if len(str(result)) > 100 else result}...")
        print(f"  ✓ 合约查询成功")
        
        # 创建一个类似 requests.Response 的对象
        class MockResponse:
            def __init__(self, text):
                self.text = text
                self.status_code = 200
        
        return MockResponse(result)
        
    except Exception as e:
        print(f"  ✗ query_contract_function error: {e}")
        import traceback
        traceback.print_exc()
        return None


def deploy_contract_with_bytes(private_key, amount, bytes_codes, 
                               constructor_types, constructor_params,
                               nonce=-1, prefund=0, check_tx_valid=False,
                               is_library=False, salt="00", to=""):
    """
    使用字节码部署合约（使用 WebSocket 订阅）
    
    Args:
        private_key: 私钥
        amount: 转账金额
        bytes_codes: 合约字节码
        constructor_types: 构造函数参数类型列表
        constructor_params: 构造函数参数值列表
        nonce: nonce值（-1表示自动获取）
        prefund: 预充值金额
        check_tx_valid: 是否检查交易有效性
        is_library: 是否是库合约
        salt: CREATE2 salt
        to: 指定的合约地址（如果为空则自动计算）
        
    Returns:
        str: 合约地址，失败返回 None
    """
    print("\n" + "="*80)
    print("DEBUG: deploy_contract_with_bytes 开始")
    print("="*80)
    
    try:
        import eth_abi
        from horae.seth_sdk import calc_create2_address
        
        # 1. 打印输入参数
        print(f"[DEBUG] 输入参数:")
        print(f"  - private_key: {'*' * 10}...{private_key[-10:] if len(private_key) > 10 else '***'}")
        print(f"  - amount: {amount}")
        print(f"  - bytes_codes 长度: {len(bytes_codes)} 字符")
        print(f"  - bytes_codes 前缀: {bytes_codes[:20]}...")
        print(f"  - constructor_types: {constructor_types}")
        print(f"  - constructor_params: {constructor_params}")
        print(f"  - nonce: {nonce}")
        print(f"  - prefund: {prefund}")
        print(f"  - check_tx_valid: {check_tx_valid}")
        print(f"  - is_library: {is_library}")
        print(f"  - salt: {salt}")
        print(f"  - to: {to}")
        
        # 2. 构造完整的字节码（包含构造函数参数）
        print(f"\n[DEBUG] 步骤 1: 构造完整字节码")
        full_bytecode = bytes_codes
        
        if constructor_types and constructor_params:
            print(f"  - 检测到构造函数参数，开始编码...")
            print(f"  - 参数类型: {constructor_types}")
            print(f"  - 参数值: {constructor_params}")
            
            try:
                encoded_params = eth_abi.encode(constructor_types, constructor_params).hex()
                print(f"  - 编码后的参数长度: {len(encoded_params)} 字符")
                print(f"  - 编码后的参数: {encoded_params[:40]}...")
                full_bytecode += encoded_params
                print(f"  ✓ 构造函数参数编码成功")
            except Exception as e:
                print(f"  ✗ 构造函数参数编码失败: {e}")
                raise
        else:
            print(f"  - 无构造函数参数")
        
        print(f"  - 完整字节码长度: {len(full_bytecode)} 字符")
        
        # 3. 获取发送者地址
        print(f"\n[DEBUG] 步骤 2: 获取发送者地址")
        try:
            sender = w3.client.get_address(private_key)
            print(f"  - 发送者地址: {sender}")
            print(f"  ✓ 发送者地址获取成功")
        except Exception as e:
            print(f"  ✗ 获取发送者地址失败: {e}")
            raise
        
        # 4. 计算合约地址
        print(f"\n[DEBUG] 步骤 3: 计算合约地址")
        if to:
            contract_address = to
            print(f"  - 使用指定的合约地址: {contract_address}")
        else:
            try:
                print(f"  - 使用 CREATE2 计算地址")
                print(f"  - sender: {sender}")
                print(f"  - salt: {salt}")
                print(f"  - bytecode 长度: {len(full_bytecode)}")
                contract_address = calc_create2_address(sender, salt, full_bytecode)
                print(f"  - 计算出的合约地址: {contract_address}")
                print(f"  ✓ CREATE2 地址计算成功")
            except Exception as e:
                print(f"  ✗ CREATE2 地址计算失败: {e}")
                raise
        
        # 5. 确定步骤类型
        print(f"\n[DEBUG] 步骤 4: 确定交易类型")
        step = StepType.kCreateLibrary if is_library else StepType.kCreateContract
        step_name = "kCreateLibrary" if is_library else "kCreateContract"
        print(f"  - 交易类型: {step_name} (值: {step})")
        
        # 6. 计算实际的 prefund
        actual_prefund = prefund if prefund > 0 else 10000000
        print(f"  - 实际 prefund: {actual_prefund}")
        
        # 7. 发送部署交易
        print(f"\n[DEBUG] 步骤 5: 发送部署交易")
        print(f"  - 目标地址: {contract_address}")
        print(f"  - 交易类型: {step_name}")
        print(f"  - 转账金额: {amount}")
        print(f"  - Gas prefund: {actual_prefund}")
        print(f"  - 字节码长度: {len(full_bytecode)}")
        
        try:
            tx_hash = w3.client.send_transaction_auto(
                private_key,
                contract_address,
                step,
                amount=amount,
                contract_code=full_bytecode,
                prefund=actual_prefund
            )
            print(f"  - 交易哈希: {tx_hash}")
            print(f"  ✓ 交易发送成功")
        except Exception as e:
            print(f"  ✗ 交易发送失败: {e}")
            import traceback
            traceback.print_exc()
            raise
        
        # 8. 检查交易有效性
        if check_tx_valid:
            print(f"\n[DEBUG] 步骤 6: 等待交易确认")
            print(f"  - 使用 WebSocket 订阅交易: {tx_hash}")
            
            try:
                receipt = subscribe_txhash(tx_hash, timeout=120)
                print(f"  - 收到交易回执")
                print(f"  - 回执状态: {receipt.get('status')}")
                print(f"  - 回执内容: {json.dumps(receipt, indent=2)}")
                
                if receipt.get('status') != 0:
                    error_msg = receipt.get('msg', 'Unknown error')
                    print(f"  ✗ 合约部署失败: {error_msg}")
                    print(f"  - 完整回执: {receipt}")
                    return None
                
                print(f"  ✓ 交易确认成功")
                
            except Exception as e:
                print(f"  ✗ 等待交易确认失败: {e}")
                import traceback
                traceback.print_exc()
                raise
            
            # 9. 等待合约地址可用
            print(f"\n[DEBUG] 步骤 7: 验证合约地址")
            print(f"  - 检查地址: {contract_address}")
            
            for i in range(30):
                try:
                    balance = w3.client.get_balance(contract_address)
                    print(f"  - 尝试 {i+1}/30: 余额 = {balance}")
                    
                    if balance >= 0:  # 地址存在
                        print(f"  ✓ 合约地址已可用")
                        print(f"\n" + "="*80)
                        print(f"SUCCESS: 合约部署成功!")
                        print(f"合约地址: {contract_address}")
                        print(f"交易哈希: {tx_hash}")
                        print("="*80 + "\n")
                        return contract_address
                        
                except Exception as e:
                    print(f"  - 尝试 {i+1}/30: 查询失败 - {e}")
                
                time.sleep(3)
            
            print(f"  ✗ 合约地址在 90 秒后仍不可用")
            print(f"\n" + "="*80)
            print(f"FAILURE: 合约部署超时")
            print(f"合约地址: {contract_address}")
            print(f"交易哈希: {tx_hash}")
            print("="*80 + "\n")
            return None
        
        # 不检查有效性，直接返回地址
        print(f"\n[DEBUG] 跳过交易确认检查")
        print(f"\n" + "="*80)
        print(f"INFO: 合约部署交易已发送（未等待确认）")
        print(f"合约地址: {contract_address}")
        print(f"交易哈希: {tx_hash}")
        print("="*80 + "\n")
        return contract_address
        
    except Exception as e:
        print(f"\n" + "="*80)
        print(f"ERROR: deploy_contract_with_bytes 异常")
        print(f"异常类型: {type(e).__name__}")
        print(f"异常信息: {e}")
        print("="*80)
        import traceback
        print("\n完整堆栈跟踪:")
        traceback.print_exc()
        print("="*80 + "\n")
        return None


# ============================================================================
# 工具函数
# ============================================================================

def gen_gid():
    """生成全局唯一ID"""
    import uuid
    import hashlib
    hex_str = uuid.uuid4().hex
    ret = hashlib.sha256(hex_str.encode('utf-8')).hexdigest()
    return (64 - len(ret)) * '0' + ret


def keccak256_str(s: str) -> str:
    """计算字符串的 Keccak256 哈希"""
    from Crypto.Hash import keccak
    k = keccak.new(digest_bits=256)
    k.update(bytes(s, 'utf-8'))
    return k.hexdigest()


def check_address_valid(address, balance=0):
    """检查地址是否有效"""
    try:
        account_info = get_account_info(address)
        if not account_info:
            return False
        
        if balance > 0:
            return int(account_info.get('balance', 0)) >= balance
        
        return True
    except:
        return False
