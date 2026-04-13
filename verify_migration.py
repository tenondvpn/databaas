#!/usr/bin/env python
"""
快速验证 Seth SDK 迁移是否成功
检查所有必要的文件和配置
"""
import os
import sys

def check_file_exists(filepath, description):
    """检查文件是否存在"""
    if os.path.exists(filepath):
        print(f"✓ {description}: {filepath}")
        return True
    else:
        print(f"✗ {description} 不存在: {filepath}")
        return False

def check_import(module_path, description):
    """检查模块是否可以导入"""
    try:
        parts = module_path.split('.')
        if len(parts) == 1:
            __import__(module_path)
        else:
            module = __import__('.'.join(parts[:-1]), fromlist=[parts[-1]])
            getattr(module, parts[-1])
        print(f"✓ {description} 可以导入")
        return True
    except Exception as e:
        print(f"✗ {description} 导入失败: {e}")
        return False

def check_views_import():
    """检查 views.py 中的导入是否正确"""
    views_path = 'horae/views.py'
    if not os.path.exists(views_path):
        print(f"✗ views.py 不存在")
        return False
    
    with open(views_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # 检查是否使用了新的导入
    if 'from horae import seth_adapter as shardora_api' in content:
        print(f"✓ views.py 使用了正确的导入语句")
        return True
    elif 'from horae import shardora_api' in content:
        print(f"⚠ views.py 仍在使用旧的导入语句")
        print(f"  请修改为: from horae import seth_adapter as shardora_api")
        return False
    else:
        print(f"✗ views.py 中没有找到 shardora_api 导入")
        return False

def check_settings():
    """检查 settings.py 中的配置"""
    settings_path = 'dags/settings.py'
    if not os.path.exists(settings_path):
        print(f"✗ settings.py 不存在")
        return False
    
    with open(settings_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    has_ip = 'SETH_HTTP_IP' in content
    has_port = 'SETH_HTTP_PORT' in content
    
    if has_ip and has_port:
        print(f"✓ settings.py 包含 Seth 配置")
        return True
    else:
        print(f"⚠ settings.py 缺少 Seth 配置")
        if not has_ip:
            print(f"  缺少: SETH_HTTP_IP")
        if not has_port:
            print(f"  缺少: SETH_HTTP_PORT")
        return False

def check_adapter_functions():
    """检查适配层是否实现了所有必要的函数"""
    adapter_path = 'horae/seth_adapter.py'
    if not os.path.exists(adapter_path):
        print(f"✗ seth_adapter.py 不存在")
        return False
    
    with open(adapter_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    required_functions = [
        'get_account_info',
        'contract_prefund',
        'call_contract_function',
        'query_contract_function',
        'deploy_contract_with_bytes',
        'gen_gid',
        'keccak256_str',
        'check_address_valid'
    ]
    
    missing = []
    for func in required_functions:
        if f'def {func}(' not in content:
            missing.append(func)
    
    if not missing:
        print(f"✓ seth_adapter.py 实现了所有必要的函数")
        return True
    else:
        print(f"✗ seth_adapter.py 缺少以下函数:")
        for func in missing:
            print(f"  - {func}")
        return False

def main():
    """运行所有检查"""
    print("=" * 60)
    print("Seth SDK 迁移验证")
    print("=" * 60)
    print()
    
    checks = []
    
    # 1. 检查文件存在性
    print("1. 检查文件...")
    checks.append(check_file_exists('horae/seth_sdk.py', 'Seth SDK'))
    checks.append(check_file_exists('horae/seth3.py', 'Seth 测试文件'))
    checks.append(check_file_exists('horae/seth_adapter.py', 'Seth 适配层'))
    checks.append(check_file_exists('horae/views.py', 'Views 文件'))
    checks.append(check_file_exists('dags/settings.py', 'Settings 文件'))
    print()
    
    # 2. 检查导入
    print("2. 检查 views.py 导入...")
    checks.append(check_views_import())
    print()
    
    # 3. 检查配置
    print("3. 检查 settings.py 配置...")
    checks.append(check_settings())
    print()
    
    # 4. 检查适配层函数
    print("4. 检查适配层函数...")
    checks.append(check_adapter_functions())
    print()
    
    # 5. 检查依赖包
    print("5. 检查依赖包...")
    dependencies = [
        ('web3', 'Web3'),
        ('eth_abi', 'eth-abi'),
        ('eth_utils', 'eth-utils'),
        ('Crypto', 'pycryptodome'),
        ('ecdsa', 'ecdsa'),
        ('solcx', 'py-solc-x'),
    ]
    
    for module, name in dependencies:
        checks.append(check_import(module, name))
    print()
    
    # 6. 检查文档
    print("6. 检查文档...")
    checks.append(check_file_exists('MIGRATION_GUIDE.md', '迁移指南'))
    checks.append(check_file_exists('SETH_MIGRATION_README.md', '快速开始'))
    checks.append(check_file_exists('VIEWS_MIGRATION_COMPLETE.md', '迁移完成报告'))
    checks.append(check_file_exists('test_seth_migration.py', '测试脚本'))
    print()
    
    # 总结
    print("=" * 60)
    passed = sum(checks)
    total = len(checks)
    percentage = (passed / total * 100) if total > 0 else 0
    
    print(f"检查结果: {passed}/{total} 通过 ({percentage:.1f}%)")
    print("=" * 60)
    print()
    
    if passed == total:
        print("✓ 所有检查通过！迁移成功！")
        print()
        print("下一步:")
        print("1. 运行测试: python test_seth_migration.py")
        print("2. 启动服务: python manage.py runserver")
        print("3. 测试 API 端点")
        return 0
    else:
        print("✗ 部分检查失败，请修复上述问题")
        print()
        print("常见问题:")
        print("1. 如果缺少依赖包，运行: pip install -r requirements.txt")
        print("2. 如果导入错误，检查 Python 路径")
        print("3. 如果配置缺失，参考 MIGRATION_GUIDE.md")
        return 1

if __name__ == "__main__":
    sys.exit(main())
