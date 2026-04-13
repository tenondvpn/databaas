#!/usr/bin/env python3
"""
测试 WebSocket 订阅功能
"""
import sys
import time

def test_websocket_import():
    """测试 websocket-client 是否安装"""
    print("\n=== 测试 WebSocket 模块导入 ===")
    try:
        import websocket
        print(f"✓ websocket-client 已安装，版本: {websocket.__version__ if hasattr(websocket, '__version__') else 'unknown'}")
        return True
    except ImportError:
        print("✗ websocket-client 未安装")
        print("  安装命令: pip install websocket-client>=1.6.0")
        return False


def test_websocket_connection():
    """测试 WebSocket 连接"""
    print("\n=== 测试 WebSocket 连接 ===")
    
    try:
        import websocket
        import threading
        
        # 从配置读取
        try:
            import os
            import sys
            sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
            os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dags.settings')
            import django
            django.setup()
            from dags import settings
            
            ws_ip = getattr(settings, 'SETH_HTTP_IP', '127.0.0.1')
            ws_port = getattr(settings, 'SETH_WS_PORT', 33001)
        except:
            ws_ip = '127.0.0.1'
            ws_port = 33001
        
        url = f"ws://{ws_ip}:{ws_port}"
        print(f"连接到: {url}")
        
        connected = False
        error_msg = None
        done = threading.Event()
        
        def on_open(ws):
            nonlocal connected
            connected = True
            print("✓ WebSocket 连接成功")
            ws.close()
            done.set()
        
        def on_error(ws, error):
            nonlocal error_msg
            error_msg = str(error)
            done.set()
        
        def on_close(ws, code, msg):
            done.set()
        
        ws_app = websocket.WebSocketApp(
            url,
            on_open=on_open,
            on_error=on_error,
            on_close=on_close
        )
        
        t = threading.Thread(target=lambda: ws_app.run_forever(), daemon=True)
        t.start()
        
        # 等待 5 秒
        if done.wait(timeout=5):
            if connected:
                return True
            else:
                print(f"✗ WebSocket 连接失败: {error_msg}")
                return False
        else:
            print("✗ WebSocket 连接超时")
            ws_app.close()
            return False
            
    except Exception as e:
        print(f"✗ WebSocket 测试异常: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_adapter_import():
    """测试适配器导入"""
    print("\n=== 测试适配器导入 ===")
    
    try:
        import os
        import sys
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        
        # 设置 Django 环境
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dags.settings')
        import django
        django.setup()
        
        from horae import seth_adapter
        
        print("✓ seth_adapter 导入成功")
        
        # 检查 WebSocket 功能
        if hasattr(seth_adapter, 'subscribe_txhash'):
            print("✓ subscribe_txhash 函数存在")
        else:
            print("✗ subscribe_txhash 函数不存在")
            return False
        
        if hasattr(seth_adapter, 'WS_AVAILABLE'):
            if seth_adapter.WS_AVAILABLE:
                print("✓ WebSocket 功能可用")
            else:
                print("⚠ WebSocket 功能不可用（将使用 HTTP 轮询）")
        
        return True
        
    except Exception as e:
        print(f"✗ 适配器导入失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_configuration():
    """测试配置"""
    print("\n=== 测试配置 ===")
    
    try:
        import os
        import sys
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dags.settings')
        import django
        django.setup()
        
        from dags import settings
        
        http_ip = getattr(settings, 'SETH_HTTP_IP', None)
        http_port = getattr(settings, 'SETH_HTTP_PORT', None)
        ws_port = getattr(settings, 'SETH_WS_PORT', None)
        
        print(f"SETH_HTTP_IP: {http_ip}")
        print(f"SETH_HTTP_PORT: {http_port}")
        print(f"SETH_WS_PORT: {ws_port}")
        
        if http_ip and http_port and ws_port:
            print("✓ 配置完整")
            return True
        else:
            print("✗ 配置不完整")
            return False
            
    except Exception as e:
        print(f"✗ 配置测试失败: {e}")
        return False


def main():
    """运行所有测试"""
    print("=" * 60)
    print("WebSocket 功能测试")
    print("=" * 60)
    
    tests = [
        ("WebSocket 模块", test_websocket_import),
        ("配置", test_configuration),
        ("适配器导入", test_adapter_import),
        ("WebSocket 连接", test_websocket_connection),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"✗ {name} 测试异常: {e}")
            results.append((name, False))
    
    print("\n" + "=" * 60)
    print("测试结果汇总")
    print("=" * 60)
    
    for name, result in results:
        status = "✓ 通过" if result else "✗ 失败"
        print(f"{name}: {status}")
    
    passed = sum(1 for _, r in results if r)
    total = len(results)
    
    print(f"\n总计: {passed}/{total} 通过")
    
    if passed == total:
        print("\n✓ 所有测试通过！WebSocket 功能正常。")
        return 0
    else:
        print("\n✗ 部分测试失败。")
        print("\n故障排查:")
        print("1. 确保安装了 websocket-client: pip install websocket-client")
        print("2. 确保 Seth 节点的 WebSocket 服务运行在配置的端口")
        print("3. 检查防火墙设置")
        print("4. 查看 WEBSOCKET_INTEGRATION.md 获取更多帮助")
        return 1


if __name__ == "__main__":
    sys.exit(main())
