# Seth SDK 迁移指南

## 概述

本次迁移将 `shardora_api.py` 的功能替换为基于 `seth_sdk.py` 和 `seth3.py` 的新实现。

## 主要变更

### 1. 新增文件

- **horae/seth_adapter.py**: 适配层，提供与原 `shardora_api` 兼容的接口
- **test_seth_migration.py**: 迁移测试脚本

### 2. 修改文件

- **horae/views.py**: 
  - 将 `from horae import shardora_api` 改为 `from horae import seth_adapter as shardora_api`
  - 保持所有调用代码不变，通过适配层实现兼容

- **dags/settings.py**:
  - 新增 Seth SDK 配置项：
    - `SETH_HTTP_IP`: Seth 节点 IP（默认 127.0.0.1）
    - `SETH_HTTP_PORT`: Seth 节点端口（默认 23001）

### 3. 核心功能映射

| 原 shardora_api 函数 | 新 seth_adapter 函数 | 说明 |
|---------------------|---------------------|------|
| `get_account_info()` | `get_account_info()` | 获取账户信息（余额、nonce） |
| `contract_prefund()` | `contract_prefund()` | 为合约充值 Gas |
| `call_contract_function()` | `call_contract_function()` | 调用合约函数（发送交易） |
| `query_contract_function()` | `query_contract_function()` | 查询合约函数（只读） |
| `deploy_contract_with_bytes()` | `deploy_contract_with_bytes()` | 部署合约 |
| `gen_gid()` | `gen_gid()` | 生成全局唯一ID |
| `keccak256_str()` | `keccak256_str()` | 计算 Keccak256 哈希 |
| `check_address_valid()` | `check_address_valid()` | 检查地址有效性 |

## 技术细节

### Seth SDK 特性

1. **多签名算法支持**:
   - ECDSA (标准以太坊签名)
   - OQS (后量子密码学)
   - GmSSL (国密 SM2/SM3)

2. **Web3 兼容接口**:
   - 类似 Web3.py 的 API 设计
   - 支持合约部署、调用、查询
   - 自动处理 ABI 编码/解码

3. **增强功能**:
   - Gas Prefund 管理
   - CREATE2 地址计算
   - 事件日志解析
   - 交易回执等待

### 适配层实现

`seth_adapter.py` 作为适配层，主要功能：

1. **接口兼容**: 保持与原 `shardora_api` 相同的函数签名
2. **配置管理**: 从 Django settings 读取节点配置
3. **错误处理**: 统一的异常处理和日志记录
4. **类型转换**: 处理不同数据格式之间的转换

## 配置说明

### 环境变量

可以通过环境变量配置 Seth 节点：

```bash
export SETH_HTTP_IP="10.152.0.12"
export SETH_HTTP_PORT="23001"
```

### Django Settings

在 `dags/settings.py` 中配置：

```python
# Seth SDK Configuration
SETH_HTTP_IP = '10.152.0.12'
SETH_HTTP_PORT = 23001
```

## 测试

运行迁移测试：

```bash
python test_seth_migration.py
```

测试内容：
- ✓ Keccak256 哈希计算
- ✓ 全局唯一ID生成
- ✓ 账户信息查询
- ✓ 合约部署 API
- ✓ 合约交互 API

## 使用示例

### 1. 部署合约

```python
from horae import seth_adapter

contract_address = seth_adapter.deploy_contract_with_bytes(
    private_key="your_private_key",
    amount=0,
    bytes_codes="contract_bytecode",
    constructor_types=["uint256"],
    constructor_params=[100],
    prefund=10000000,
    check_tx_valid=True
)
```

### 2. 调用合约函数

```python
# 发送交易
success = seth_adapter.call_contract_function(
    private_key="your_private_key",
    contract_address="0x...",
    amount=0,
    function_name="setValue",
    types_list=["uint256"],
    params_list=[42]
)

# 只读查询
response = seth_adapter.query_contract_function(
    private_key="your_private_key",
    contract_address="0x...",
    function_name="getValue",
    types_list=[],
    params_list=[]
)
result = response.text
```

### 3. Gas Prefund 管理

```python
# 充值 Gas
seth_adapter.contract_prefund(
    private_key="your_private_key",
    contract_address="0x...",
    prefund=5000000,
    check_res=True
)
```

## 兼容性说明

### 保持兼容

- ✓ 所有原有 API 调用保持不变
- ✓ 函数签名完全兼容
- ✓ 返回值格式兼容

### 新增功能

- ✓ 支持多种签名算法（ECDSA/OQS/GmSSL）
- ✓ 更强大的事件解析
- ✓ WebSocket 订阅支持（可选）

### 已知限制

1. 需要 Seth 节点运行在指定的 IP:Port
2. 某些高级功能（如 OQS、GmSSL）需要额外的依赖库
3. WebSocket 功能需要单独配置

## 回滚方案

如需回滚到原实现：

1. 修改 `horae/views.py`:
   ```python
   # 从
   from horae import seth_adapter as shardora_api
   # 改回
   from horae import shardora_api
   ```

2. 重启 Django 服务

## 依赖项

确保安装以下 Python 包：

```bash
pip install web3 eth-abi eth-utils pycryptodome ecdsa solcx
```

可选依赖（用于高级功能）：

```bash
# 国密支持
pip install gmssl

# 后量子密码学支持
pip install liboqs-python

# WebSocket 支持
pip install websocket-client
```

## 故障排查

### 问题 1: 连接节点失败

**症状**: `get_account_info` 返回 None

**解决方案**:
1. 检查 Seth 节点是否运行
2. 验证 IP 和端口配置
3. 检查防火墙设置

### 问题 2: 合约部署失败

**症状**: `deploy_contract_with_bytes` 返回 None

**解决方案**:
1. 检查私钥是否正确
2. 确认账户有足够余额
3. 验证字节码格式正确
4. 查看节点日志

### 问题 3: 函数调用失败

**症状**: `call_contract_function` 返回 False

**解决方案**:
1. 验证合约地址正确
2. 检查函数签名匹配
3. 确认参数类型和值正确
4. 查看交易回执状态

## 支持

如有问题，请查看：
- Seth SDK 文档: `seth_sdk.py` 和 `seth3.py` 中的注释
- 测试用例: `test_seth_migration.py`
- 原始实现: `shardora_api.py`（保留作为参考）

## 更新日志

### v1.0.0 (当前版本)
- ✓ 完成基础功能迁移
- ✓ 实现适配层
- ✓ 添加配置支持
- ✓ 创建测试脚本
- ✓ 编写迁移文档
