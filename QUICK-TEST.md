# 快速测试指南 - v1.2.0

## 🚀 5分钟快速测试

### 准备工作

1. **安装扩展**
   ```bash
   # 在 Cursor 中
   cursor --install-extension sy-ai-commit-1.2.0.vsix
   
   # 或手动安装：
   # Ctrl+Shift+P → "Extensions: Install from VSIX..." → 选择文件
   ```

2. **重启编辑器**
   - 安装完成后重启 Cursor/VS Code

---

## 测试 1：项目切换检测功能（2分钟）

### 步骤 1：创建测试项目

```bash
# 创建一个新的测试项目
mkdir test-sy-commit
cd test-sy-commit
git init
echo "# Test" > README.md
git add .
git commit -m "init"
```

### 步骤 2：打开项目测试

1. **打开 Cursor**
2. **打开 test-sy-commit 文件夹**
3. **等待 2-3 秒**

### ✅ 预期结果

应该弹出这样的提示：

```
⚠️ 当前项目未初始化 sy-ai-commit

检测到您切换了项目，但当前项目未配置 sy-ai-commit。
是否立即初始化？

[立即初始化]  [稍后]  [不再提示]
```

### 步骤 3：测试立即初始化

1. **点击"立即初始化"按钮**
2. **等待配置完成**

### ✅ 预期结果

- 显示进度条
- 弹出配置成功提示
- 项目根目录生成 `.cursorrules` 文件

### 验证

```bash
# 检查 .cursorrules 文件是否存在
ls -la | grep cursorrules
# 或 Windows
dir | findstr cursorrules

# 查看文件内容
cat .cursorrules
# 或 Windows
type .cursorrules
```

✅ **测试 1 通过标准：**
- [ ] 提示正确弹出
- [ ] 初始化流程正常
- [ ] `.cursorrules` 文件已创建

---

## 测试 2：提交信息预览功能（2分钟）

### 步骤 1：修改文件

```bash
# 在 test-sy-commit 项目中
echo "test content" >> README.md
```

### 步骤 2：生成提交信息

1. **在 Cursor 中，按 `Ctrl+T Ctrl+T`**
2. **等待 AI 生成完成（约 2-3 秒）**

### ✅ 预期结果

弹出窗口显示：

```
✅ 已生成提交信息！

📝 生成的提交信息：
━━━━━━━━━━━━━━━━━━━━
Docs(README): 更新 README 文件

- 添加测试内容

Generated-by: sy-ai-commit@1.2.0
━━━━━━━━━━━━━━━━━━━━

👉 下一步：查看提交信息并点击"提交"按钮（或按 Ctrl+Enter）

[打开源代码管理]  [知道了]
```

### 步骤 3：测试打开源代码管理

1. **点击"打开源代码管理"按钮**

### ✅ 预期结果

- 自动切换到源代码管理视图
- 提交信息已填入输入框
- 提交信息包含 `Generated-by: sy-ai-commit@1.2.0`

### 步骤 4：完成提交

1. **在源代码管理面板中，点击"提交"按钮（或按 Ctrl+Enter）**

### 验证

```bash
# 查看最新的提交信息
git log -1 --format=full
```

✅ **测试 2 通过标准：**
- [ ] 提交信息在弹窗中正确显示
- [ ] 格式正确（带分隔线）
- [ ] 包含 Generated-by 标记
- [ ] "打开源代码管理"按钮正常工作
- [ ] 提交成功

---

## 测试 3：一键提交功能（1分钟）

### 步骤 1：再次修改文件

```bash
echo "test content 2" >> README.md
```

### 步骤 2：一键提交

1. **在 Cursor 中，按 `Ctrl+G Ctrl+G`**
2. **等待完成（约 3-4 秒）**

### ✅ 预期结果

- 显示进度条（保存 → 暂存 → 生成 → 添加标记 → 提交）
- 弹出成功提示

### 验证

```bash
# 查看最新的提交
git log -1 --oneline

# 查看提交信息
git log -1
```

✅ **测试 3 通过标准：**
- [ ] 进度条正常显示
- [ ] 提交成功
- [ ] 提交信息包含 Generated-by 标记

---

## 测试 4：使用统计功能（30秒）

### 步骤：查看统计

```bash
# 查看所有使用扩展的提交
git log --grep="Generated-by: sy-ai-commit"

# 统计使用次数（应该显示 2）
git log --grep="Generated-by: sy-ai-commit" --oneline | wc -l
# Windows PowerShell
git log --grep="Generated-by: sy-ai-commit" --oneline | Measure-Object -Line
```

### ✅ 预期结果

- 显示 2 条提交记录
- 都包含 `Generated-by: sy-ai-commit@1.2.0`

✅ **测试 4 通过标准：**
- [ ] 统计命令正常工作
- [ ] 显示正确的提交数量
- [ ] 提交信息格式正确

---

## 总结验收

### 核心功能测试结果

| 功能 | 状态 | 备注 |
|------|------|------|
| 项目切换检测 | ⬜ | 测试 1 |
| 立即初始化 | ⬜ | 测试 1 |
| 提交信息预览 | ⬜ | 测试 2 |
| 打开源代码管理 | ⬜ | 测试 2 |
| 一键提交 | ⬜ | 测试 3 |
| Generated-by 标记 | ⬜ | 测试 2, 3, 4 |
| 使用统计 | ⬜ | 测试 4 |

### 通过标准

- ✅ 全部功能正常工作
- ⚠️ 有 1-2 个小问题，但不影响主要功能
- ❌ 有重大问题需要修复

---

## 常见问题排查

### 问题 1：提示没有弹出

**检查：**
```bash
# 检查是否已有 .cursorrules 文件
ls -la .cursorrules
```

**解决：**
- 如果文件存在，说明已初始化，这是正常的
- 如果想重新测试，删除文件后重新打开项目

### 问题 2：提交信息没有显示在弹窗中

**检查：**
- 打开开发者工具：`帮助` → `切换开发人员工具` → `控制台`
- 查看是否有错误信息

**解决：**
- 确保 Git 扩展已启用
- 确保项目是 Git 仓库
- 查看控制台错误信息

### 问题 3：快捷键不生效

**检查：**
```bash
# 查看 keybindings.json 是否配置
# Windows
type %APPDATA%\Cursor\User\keybindings.json

# macOS
cat ~/Library/Application\ Support/Cursor/User/keybindings.json

# Linux
cat ~/.config/Cursor/User/keybindings.json
```

**解决：**
- 重新运行 `sy commit: 初始化配置`
- 重启 Cursor

---

## 清理测试环境

```bash
# 删除测试项目
cd ..
rm -rf test-sy-commit

# 卸载扩展（如果需要）
# Ctrl+Shift+X → 找到 sy-ai-commit → 右键 → 卸载
```

---

## 测试通过后

### 1. 填写测试结果

在上面的表格中标记每个功能的测试结果：
- ✅ 通过
- ⚠️ 有小问题
- ❌ 失败

### 2. 记录问题（如果有）

**问题描述：**


**复现步骤：**


**预期结果：**


**实际结果：**


**错误信息：**


### 3. 提交反馈

- 如果测试通过，可以发布新版本
- 如果有问题，在 GitHub Issues 中报告

---

**测试时间：** _____ 分钟  
**测试结果：** ⬜ 通过 / ⬜ 部分通过 / ⬜ 失败  
**测试人员：** __________  
**测试日期：** __________

