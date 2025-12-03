# 使用统计功能测试指南

## 功能说明

从 v1.2.0 版本开始，扩展会在生成的提交信息末尾自动添加 `Generated-by: sy-ai-commit@版本号` 标记，用于统计扩展使用情况。

## 测试步骤

### 1. 更新扩展

确保已安装 v1.2.0 或更高版本的扩展。

### 2. 初始化配置

```bash
Ctrl+Shift+P → sy commit: 初始化配置
```

### 3. 测试生成提交信息

#### 方式一：一键提交（Ctrl+G Ctrl+G）

1. 修改一些文件
2. 按 `Ctrl+G Ctrl+G`
3. 等待提交完成

#### 方式二：仅生成信息（Ctrl+T Ctrl+T）

1. 修改一些文件
2. 按 `Ctrl+T Ctrl+T`
3. 打开源代码管理面板，查看生成的提交信息
4. **检查点**：提交信息末尾应该包含 `Generated-by: sy-ai-commit@1.2.0`

### 4. 验证提交信息格式

提交信息应该类似于：

```
Feat(用户模块): 添加用户登录功能

- 实现用户名密码登录
- 添加记住密码功能
- 优化登录页面UI

Generated-by: sy-ai-commit@1.2.0
```

### 5. 查看使用统计

提交几次后，运行以下命令查看统计：

```bash
# 查看所有使用本扩展的提交
git log --grep="Generated-by: sy-ai-commit"

# 统计使用次数
git log --grep="Generated-by: sy-ai-commit" --oneline | wc -l

# 查看最近 5 次使用记录
git log --grep="Generated-by: sy-ai-commit" --oneline -5
```

## 测试关闭标记功能

### 1. 修改设置

```json
{
  "autoCommitAssistant.addGeneratedByTrailer": false
}
```

### 2. 重新配置

```bash
Ctrl+Shift+P → sy commit: 初始化配置
```

### 3. 生成提交信息

1. 按 `Ctrl+T Ctrl+T` 生成提交信息
2. 打开源代码管理面板
3. **检查点**：提交信息末尾应该**不包含** `Generated-by` 标记

### 4. 恢复默认设置

```json
{
  "autoCommitAssistant.addGeneratedByTrailer": true
}
```

## 常见使用场景

### 场景 1：个人统计

```bash
# 查看本月使用次数
git log --grep="Generated-by: sy-ai-commit" --since="1 month ago" --oneline | wc -l

# 查看本周使用次数
git log --grep="Generated-by: sy-ai-commit" --since="1 week ago" --oneline | wc -l

# 查看今天使用次数
git log --grep="Generated-by: sy-ai-commit" --since="today" --oneline | wc -l
```

### 场景 2：团队统计

```bash
# 统计所有分支的使用次数（包括远程分支）
git log --all --grep="Generated-by: sy-ai-commit" --oneline | wc -l

# 查看每个作者的使用情况
git log --grep="Generated-by: sy-ai-commit" --format="%an" | sort | uniq -c | sort -nr
```

### 场景 3：项目分析

```bash
# 查看某个版本范围内的使用情况
git log v1.0.0..v2.0.0 --grep="Generated-by: sy-ai-commit" --oneline | wc -l

# 查看某个文件的提交中使用扩展的次数
git log --grep="Generated-by: sy-ai-commit" --oneline -- path/to/file.ts | wc -l
```

### 场景 4：时间趋势分析

```bash
# 按月统计（需要配合脚本）
for month in {1..12}; do
  count=$(git log --grep="Generated-by: sy-ai-commit" \
    --since="2025-$month-01" --until="2025-$month-31" \
    --oneline | wc -l)
  echo "2025-$month: $count"
done
```

## 验证清单

- [ ] 启用标记后，生成的提交信息包含 `Generated-by` 标记
- [ ] 关闭标记后，生成的提交信息不包含 `Generated-by` 标记
- [ ] 标记格式正确：`Generated-by: sy-ai-commit@1.2.0`
- [ ] 标记位置正确：在提交信息末尾，与正文之间有空行
- [ ] 可以通过 `git log --grep` 命令查询到使用记录
- [ ] 统计命令返回正确的数量
- [ ] 标记不影响提交信息的可读性
- [ ] 修改配置后需要重新初始化才能生效

## 注意事项

1. **隐私保护**：标记只包含扩展名称和版本号，不包含任何个人信息
2. **可选功能**：用户可以随时通过配置关闭此功能
3. **本地存储**：所有数据存储在本地 Git 历史中，不会上报到任何服务器
4. **标准格式**：符合 Git trailer 标准，与 `Signed-off-by` 等标记格式一致
5. **团队协作**：如果团队不希望看到标记，可以统一配置关闭

## 问题排查

### 问题 1：提交信息中没有标记

**可能原因**：
- 配置 `addGeneratedByTrailer` 设置为 `false`
- 使用的是旧版本扩展
- Git 扩展 API 获取失败

**解决方法**：
1. 检查设置：搜索 `autoCommitAssistant.addGeneratedByTrailer`，确认为 `true`
2. 检查版本：确认扩展版本为 v1.2.0 或更高
3. 查看控制台：`帮助` → `切换开发人员工具` → `控制台`，查看是否有错误信息

### 问题 2：统计命令无结果

**可能原因**：
- 还没有使用扩展提交过代码
- Git 命令语法错误
- 搜索的分支不正确

**解决方法**：
1. 确认已使用扩展提交至少一次代码
2. 检查命令语法是否正确
3. 使用 `--all` 参数搜索所有分支

### 问题 3：标记重复添加

**可能原因**：
- 已经包含标记的提交信息被再次编辑

**解决方法**：
- 代码中已包含防重复逻辑，不应该出现此问题
- 如果出现，请报告 Issue

## 反馈

如果在测试过程中发现任何问题，请访问：
- GitHub Issues: https://github.com/snake-mustang/sy-ai-commit/issues

