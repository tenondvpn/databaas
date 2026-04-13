# Seth SDK 迁移检查清单

## ✅ 代码迁移

- [x] 创建 `horae/seth_adapter.py` 适配层
- [x] 修改 `horae/views.py` 导入语句
- [x] 更新 `dags/settings.py` 配置
- [x] 实现所有必需的 API 函数
  - [x] `get_account_info()`
  - [x] `contract_prefund()`
  - [x] `call_contract_function()`
  - [x] `query_contract_function()`
  - [x] `deploy_contract_with_bytes()`
  - [x] `gen_gid()`
  - [x] `keccak256_str()`
  - [x] `check_address_valid()`

## ✅ 文档

- [x] 创建 `MIGRATION_GUIDE.md` - 详细迁移指南
- [x] 创建 `SETH_MIGRATION_README.md` - 快速开始
- [x] 创建 `VIEWS_MIGRATION_COMPLETE.md` - Views 迁移报告
- [x] 创建 `MIGRATION_SUMMARY.md` - 迁移总结
- [x] 创建 `CHECKLIST.md` - 本检查清单

## ✅ 测试和验证

- [x] 创建 `test_seth_migration.py` - 测试脚本
- [x] 创建 `verify_migration.py` - 验证脚本
- [x] 创建 `requirements_seth.txt` - 依赖包列表

## ⏳ 待完成（部署前）

### 环境准备

- [ ] 安装依赖包
  ```bash
  pip install -r requirements_seth.txt
  ```

- [ ] 配置 Seth 节点
  - [ ] 确认节点 IP 和端口
  - [ ] 更新 `dags/settings.py` 或设置环境变量
  - [ ] 测试节点连接

### 测试

- [ ] 运行验证脚本
  ```bash
  python3 verify_migration.py
  ```

- [ ] 运行测试脚本
  ```bash
  python3 test_seth_migration.py
  ```

- [ ] 测试每个 API 端点
  - [ ] `set_gas_prefund` - Gas 预充值
  - [ ] `get_contract_info` - 获取合约信息
  - [ ] `call_function_solidity` - 调用合约函数
  - [ ] `query_function_solidity` - 查询合约函数
  - [ ] `deploy_solidity` - 部署合约

### 性能测试

- [ ] 基准测试
  - [ ] 合约部署性能
  - [ ] 函数调用性能
  - [ ] 查询性能
  - [ ] 并发性能

- [ ] 压力测试
  - [ ] 高并发场景
  - [ ] 长时间运行
  - [ ] 错误恢复

### 安全检查

- [ ] 代码审查
  - [ ] 适配层代码
  - [ ] 错误处理
  - [ ] 日志记录

- [ ] 安全测试
  - [ ] 私钥处理
  - [ ] 输入验证
  - [ ] SQL 注入防护

### 文档审查

- [ ] 技术文档完整性
- [ ] API 文档准确性
- [ ] 示例代码可用性
- [ ] 故障排查指南

## ⏳ 部署步骤

### 开发环境

- [ ] 部署到开发环境
- [ ] 功能测试
- [ ] 修复发现的问题

### 测试环境

- [ ] 部署到测试环境
- [ ] 集成测试
- [ ] 性能测试
- [ ] 用户验收测试

### 生产环境

- [ ] 准备回滚方案
- [ ] 备份当前版本
- [ ] 部署到生产环境
- [ ] 监控和验证
- [ ] 性能监控

## 📋 验证清单

### 功能验证

- [ ] 合约部署成功
- [ ] 合约调用成功
- [ ] 合约查询成功
- [ ] Gas 充值成功
- [ ] 账户信息查询成功

### 性能验证

- [ ] 响应时间符合预期
- [ ] 吞吐量符合预期
- [ ] 资源使用正常
- [ ] 无内存泄漏

### 兼容性验证

- [ ] 所有现有功能正常
- [ ] API 接口兼容
- [ ] 数据格式兼容
- [ ] 错误处理兼容

## 🔧 配置检查

### Seth 节点配置

- [ ] `SETH_HTTP_IP` 已设置
- [ ] `SETH_HTTP_PORT` 已设置
- [ ] 节点可访问
- [ ] 节点版本兼容

### Django 配置

- [ ] `settings.py` 已更新
- [ ] 环境变量已设置（如需要）
- [ ] 数据库连接正常
- [ ] 静态文件配置正常

### 依赖包

- [ ] `web3` 已安装
- [ ] `eth-abi` 已安装
- [ ] `eth-utils` 已安装
- [ ] `pycryptodome` 已安装
- [ ] `ecdsa` 已安装
- [ ] `solcx` 已安装

## 📊 监控指标

### 关键指标

- [ ] 设置成功率监控
  - [ ] 合约部署成功率
  - [ ] 函数调用成功率
  - [ ] 查询成功率

- [ ] 设置性能监控
  - [ ] 平均响应时间
  - [ ] P95/P99 延迟
  - [ ] 吞吐量

- [ ] 设置错误监控
  - [ ] 错误率
  - [ ] 错误类型分布
  - [ ] 超时率

### 告警设置

- [ ] 成功率低于阈值告警
- [ ] 响应时间超过阈值告警
- [ ] 错误率超过阈值告警
- [ ] 节点连接失败告警

## 🔄 回滚准备

- [ ] 备份当前代码
- [ ] 准备回滚脚本
- [ ] 测试回滚流程
- [ ] 文档化回滚步骤

### 回滚步骤

1. [ ] 修改 `horae/views.py` 第 41 行
   ```python
   # 从
   from horae import seth_adapter as shardora_api
   # 改回
   from horae import shardora_api
   ```

2. [ ] 重启服务
   ```bash
   python manage.py runserver
   ```

3. [ ] 验证功能正常

## 📝 文档更新

- [ ] 更新 API 文档
- [ ] 更新部署文档
- [ ] 更新运维手册
- [ ] 更新故障排查指南

## 👥 团队沟通

- [ ] 通知开发团队
- [ ] 通知测试团队
- [ ] 通知运维团队
- [ ] 通知产品团队

## 🎯 验收标准

### 功能验收

- [ ] 所有 API 端点正常工作
- [ ] 所有测试用例通过
- [ ] 无已知 bug

### 性能验收

- [ ] 响应时间 < 2 秒（95%）
- [ ] 吞吐量 >= 100 TPS
- [ ] 错误率 < 0.1%

### 稳定性验收

- [ ] 连续运行 24 小时无故障
- [ ] 压力测试通过
- [ ] 内存使用稳定

## ✅ 最终确认

- [ ] 所有检查项完成
- [ ] 所有测试通过
- [ ] 文档完整
- [ ] 团队已通知
- [ ] 监控已设置
- [ ] 回滚方案已准备

---

## 签字确认

| 角色 | 姓名 | 签字 | 日期 |
|------|------|------|------|
| 开发负责人 | | | |
| 测试负责人 | | | |
| 运维负责人 | | | |
| 产品负责人 | | | |

---

**检查清单版本**：1.0  
**最后更新**：2024  
**状态**：代码迁移完成，待部署测试  
