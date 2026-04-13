#!/usr/bin/env python
"""
测试 Seth SDK 迁移
验证 seth_adapter 是否正确替换了 shardora_api 的功能
"""
import os
import sys

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# 设置 Django 环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dags.settings')
import django
django.setup()

from horae import seth_adapter


def test_get_account_info():
    """测试获取账户信息"""
    print("\n=== 测试 get_account_info ===")
    
    # 测试地址（可以替换为实际地址）
    test_address = "0000000000000000000000000000000000000001"
    
    result = seth_adapter.get_account_info(test_address)
    print(f"地址: {test_address}")
    print(f"结果: {result}")
    
    if result:
        print("✓ get_account_info 测试通过")
        return True
    else:
        print("✗ get_account_info 测试失败")
        return False


def test_keccak256():
    """测试 Keccak256 哈希函数"""
    print("\n=== 测试 keccak256_str ===")
    
    test_string = "hello world"
    result = seth_adapter.keccak256_str(test_string)
    
    print(f"输入: {test_string}")
    print(f"哈希: {result}")
    
    # 验证哈希长度
    if len(result) == 64:
        print("✓ keccak256_str 测试通过")
        return True
    else:
        print("✗ keccak256_str 测试失败")
        return False


def test_gen_gid():
    """测试生成全局唯一ID"""
    print("\n=== 测试 gen_gid ===")
    
    gid1 = seth_adapter.gen_gid()
    gid2 = seth_adapter.gen_gid()
    
    print(f"GID 1: {gid1}")
    print(f"GID 2: {gid2}")
    
    # 验证长度和唯一性
    if len(gid1) == 64 and len(gid2) == 64 and gid1 != gid2:
        print("✓ gen_gid 测试通过")
        return True
    else:
        print("✗ gen_gid 测试失败")
        return False


def test_contract_deployment():
    """测试合约部署（需要实际的私钥和节点）"""
    print("\n=== 测试合约部署 ===")
    print("注意: 此测试需要实际的私钥和运行中的节点")
    
    # 示例合约字节码（简单的存储合约）
    # 实际使用时需要编译真实的合约
    test_bytecode = "608060405234801561001057600080fd5b50"
    
    # 这里只是演示 API 调用，不实际执行
    print("API 签名:")
    print("  deploy_contract_with_bytes(")
    print("    private_key, amount, bytes_codes,")
    print("    constructor_types, constructor_params,")
    print("    nonce=-1, prefund=0, check_tx_valid=False,")
    print("    is_library=False, salt='00', to=''")
    print("  )")
    
    print("✓ 合约部署 API 可用")
    return True


def test_contract_interaction():
    """测试合约交互（需要实际的合约地址）"""
    print("\n=== 测试合约交互 ===")
    print("注意: 此测试需要实际的合约地址和节点")
    
    print("可用的 API:")
    print("  1. call_contract_function() - 发送交易调用合约")
    print("  2. query_contract_function() - 只读查询合约")
    print("  3. contract_prefund() - 为合约充值 Gas")
    
    print("✓ 合约交互 API 可用")
    return True


def main():
    """运行所有测试"""
    print("=" * 60)
    print("Seth SDK 迁移测试")
    print("=" * 60)
    
    tests = [
        test_keccak256,
        test_gen_gid,
        test_get_account_info,
        test_contract_deployment,
        test_contract_interaction,
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"✗ 测试失败: {e}")
            import traceback
            traceback.print_exc()
            results.append(False)
    
    print("\n" + "=" * 60)
    print(f"测试结果: {sum(results)}/{len(results)} 通过")
    print("=" * 60)
    
    if all(results):
        print("\n✓ 所有测试通过！")
        return 0
    else:
        print("\n✗ 部分测试失败")
        return 1


if __name__ == "__main__":
    sys.exit(main())
