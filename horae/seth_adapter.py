"""
Seth SDK Adapter for Horae Views
用 seth_sdk.py 和 seth3.py 的逻辑替换 shardora_api.py
"""
import json
import time
from horae.seth_sdk import SethWeb3Mock, StepType, compile_and_link
from dags import settings as dags_settings

# 从 Django settings 获取配置，如果没有则使用默认值
http_ip = getattr(dags_settings, 'SETH_HTTP_IP', '35.197.170.240')
http_port = getattr(dags_settings, 'SETH_HTTP_PORT', 23001)

# 创建全局 Web3 实例
w3 = SethWeb3Mock(http_ip, http_port)


def get_account_info(address):
    """
    获取账户信息
    
    Args:
        address: 账户地址
        
    Returns:
        dict: 包含 balance, nonce 等信息的字典
    """
    try:
        balance = w3.client.get_balance(address)
        nonce = w3.client.get_nonce(address)
        return {
            'balance': str(balance),
            'nonce': str(nonce),
            'address': address
        }
    except Exception as e:
        print(f"get_account_info error: {e}")
        return None


def contract_prefund(private_key, contract_address, prefund, check_res=True, nonce=-1):
    """
    为合约充值 Gas Prefund
    
    Args:
        private_key: 私钥
        contract_address: 合约地址
        prefund: 预充值金额
        check_res: 是否检查结果
        nonce: nonce值（-1表示自动获取）
        
    Returns:
        bool: 是否成功
    """
    try:
        # 使用 seth_sdk 的 send_transaction_auto 发送 prefund 交易
        tx_hash = w3.client.send_transaction_auto(
            private_key,
            contract_address,
            StepType.kContractGasPrefund,
            amount=0,
            prefund=prefund
        )
        
        if check_res:
            # 等待交易确认
            receipt = w3.client.wait_for_receipt(tx_hash)
            return receipt.get('status') == 0
        
        return True
    except Exception as e:
        print(f"contract_prefund error: {e}")
        return False


def call_contract_function(private_key, contract_address, amount, 
                          function_name, types_list, params_list):
    """
    调用合约函数（发送交易）
    
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
    try:
        from Crypto.Hash import keccak
        import eth_abi
        
        # 构造函数调用数据
        sig = f"{function_name}({','.join(types_list)})"
        selector = keccak.new(digest_bits=256).update(sig.encode()).digest()[:4].hex()
        
        if types_list and params_list:
            encoded_params = eth_abi.encode(types_list, params_list).hex()
        else:
            encoded_params = ""
            
        input_hex = selector + encoded_params
        
        # 发送交易
        tx_hash = w3.client.send_transaction_auto(
            private_key,
            contract_address,
            StepType.kContractExcute,
            amount=amount,
            input_hex=input_hex
        )
        
        # 等待交易确认
        receipt = w3.client.wait_for_receipt(tx_hash)
        return receipt.get('status') == 0
        
    except Exception as e:
        print(f"call_contract_function error: {e}")
        return False


def query_contract_function(private_key, contract_address, 
                           function_name, types_list, params_list, call_type=0):
    """
    查询合约函数（只读调用）
    
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
    try:
        from Crypto.Hash import keccak
        import eth_abi
        
        # 构造函数调用数据
        sig = f"{function_name}({','.join(types_list)})"
        selector = keccak.new(digest_bits=256).update(sig.encode()).digest()[:4].hex()
        
        if types_list and params_list:
            encoded_params = eth_abi.encode(types_list, params_list).hex()
        else:
            encoded_params = ""
            
        input_hex = selector + encoded_params
        
        # 获取调用者地址
        from_address = w3.client.get_address(private_key)
        
        # 调用合约查询
        result = w3.client.query_contract(from_address, contract_address, input_hex)
        
        # 创建一个类似 requests.Response 的对象
        class MockResponse:
            def __init__(self, text):
                self.text = text
                self.status_code = 200
        
        return MockResponse(result)
        
    except Exception as e:
        print(f"query_contract_function error: {e}")
        return None


def deploy_contract_with_bytes(private_key, amount, bytes_codes, 
                               constructor_types, constructor_params,
                               nonce=-1, prefund=0, check_tx_valid=False,
                               is_library=False, salt="00", to=""):
    """
    使用字节码部署合约
    
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
    try:
        import eth_abi
        from horae.seth_sdk import calc_create2_address
        
        # 构造完整的字节码（包含构造函数参数）
        full_bytecode = bytes_codes
        if constructor_types and constructor_params:
            encoded_params = eth_abi.encode(constructor_types, constructor_params).hex()
            full_bytecode += encoded_params
        
        # 获取发送者地址
        sender = w3.client.get_address(private_key)
        
        # 计算合约地址
        if to:
            contract_address = to
        else:
            contract_address = calc_create2_address(sender, salt, full_bytecode)
        
        # 确定步骤类型
        step = StepType.kCreateLibrary if is_library else StepType.kCreateContract
        
        # 发送部署交易
        tx_hash = w3.client.send_transaction_auto(
            private_key,
            contract_address,
            step,
            amount=amount,
            contract_code=full_bytecode,
            prefund=prefund if prefund > 0 else 10000000
        )
        
        if check_tx_valid:
            # 等待交易确认
            receipt = w3.client.wait_for_receipt(tx_hash)
            if receipt.get('status') != 0:
                return None
            
            # 等待合约地址可用
            for i in range(30):
                balance = w3.client.get_balance(contract_address)
                if balance >= 0:  # 地址存在
                    return contract_address
                time.sleep(3)
            
            return None
        
        return contract_address
        
    except Exception as e:
        print(f"deploy_contract_with_bytes error: {e}")
        import traceback
        traceback.print_exc()
        return None


# 保持与 shardora_api 兼容的其他函数
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
