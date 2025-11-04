# AI Auto Commit Assistant

🚀 一键自动提交的 VSCode/Cursor 扩展，AI 生成规范的中文提交信息！

[![Version](https://img.shields.io/open-vsx/v/sy-ai-commit/sy-ai-commit)](https://open-vsx.org/extension/sy-ai-commit/sy-ai-commit)
[![Downloads](https://img.shields.io/open-vsx/dt/sy-ai-commit/sy-ai-commit)](https://open-vsx.org/extension/sy-ai-commit/sy-ai-commit)
[![Rating](https://img.shields.io/open-vsx/rating/sy-ai-commit/sy-ai-commit)](https://open-vsx.org/extension/sy-ai-commit/sy-ai-commit)

---

## 📖 使用教程（快速上手）

### ⚠️ 重要提示

**切换项目时需要重新初始化配置！**

每次打开新的项目或切换到不同的工作区时，都需要重新运行初始化配置：
- 按 `Ctrl+Shift+P` 打开命令面板
- 输入并选择：`sy commit: 初始化配置`
- 等待配置完成

---

### 1️⃣ 如何初始化配置？

#### 自动配置（首次）
**安装插件后首次打开项目会自动弹出配置提示**，点击"是"即可自动配置。

#### 手动配置（切换项目或重新配置）
如果没有自动提示，或者切换了项目，请手动运行：

1. 按 `Ctrl+Shift+P` 打开命令面板
2. 输入：`sy commit`
3. 选择：**sy commit: 初始化配置**
4. 等待配置完成（会显示进度）

**配置完成后会弹窗提示：**
- ✅ 初始化配置成功
- 💡 显示快捷键说明
- ✓ 已配置快捷键到 keybindings.json
- ✓ 已创建 .cursorrules 文件到项目根目录
- ⚠️ 提醒切换项目时需重新配置

**⚠️ 配置完成后请验证：**

1. **检查项目根目录**：确认是否有 `.cursorrules` 文件
   - 文件位置：项目根目录（与 package.json 同级）
   - 如果没有，请重新运行初始化配置

2. **检查快捷键配置**：（可选）
   - Windows: `C:\Users\你的用户名\AppData\Roaming\Cursor\User\keybindings.json`
   - macOS: `~/Library/Application Support/Cursor/User/keybindings.json`
   - Linux: `~/.config/Cursor/User/keybindings.json`
   - 应该包含 `ctrl+g ctrl+g` 和 `ctrl+t ctrl+t` 两个快捷键

**配置内容：**
- 自动配置两个快捷键（Ctrl+G Ctrl+G 和 Ctrl+T Ctrl+T）
- 创建 `.cursorrules` 文件（Git 提交规范）
- 自动合并现有规则（如果已存在）

---

### 2️⃣ 如何使用快捷键？

**配置完成后，就可以使用快捷键了：**

#### 方式一：一键提交（推荐快速提交）
```
修改代码 → 按 Ctrl+G Ctrl+G → 自动提交 → 弹窗提示完成 ✅
```
**自动执行：** 
1. 保存所有文件
2. 暂存所有更改
3. AI 生成提交信息
4. 自动提交
5. **弹窗提示完成**（不会直接 PUSH 到远程！）

**完成提示：**
```
✅ 已自动提交成功！

💡 提交已完成，未推送到远程
👉 下一步：如需推送，请运行 git push
       或在源代码管理中点击"推送"

[推送到远程]  ← 点击可直接推送
```

#### 方式二：先生成后确认（推荐谨慎提交）
```
修改代码 → 按 Ctrl+T Ctrl+T → 弹窗提示 → 查看并提交 ✅
```
**自动执行：**
1. 保存所有文件
2. 暂存所有更改
3. AI 生成提交信息
4. **弹窗提示完成**（可查看和修改）

**完成提示：**
```
✅ 已生成提交信息！

📝 提交信息已填入源代码管理面板
👉 下一步：查看提交信息并点击"提交"按钮
       （或按 Ctrl+Enter）

[打开源代码管理]  ← 点击可直接跳转
```

---

### 3️⃣ 两种快捷键的区别

| 快捷键 | 功能 | 适用场景 | 提交方式 |
|--------|------|----------|----------|
| **Ctrl+G Ctrl+G** | 一键提交 | 确定更改无误，快速提交 | 自动提交 |
| **Ctrl+T Ctrl+T** | 生成信息 | 希望先查看提交信息 | 手动确认提交 |

**使用建议：**
- 🚀 **小改动**：用 `Ctrl+G Ctrl+G` 快速提交
- 🔍 **重要更改**：用 `Ctrl+T Ctrl+T` 生成后查看，确认无误再点击"提交"按钮

---

![功能演示](https://pingtai-img.shiyue.com/bbs/others/plugins/sy-ai-commit-video.gif)

## ✨ 核心功能

- 🚀 **双快捷键模式**：
  - `Ctrl+G Ctrl+G`：一键完整提交（保存→暂存→生成→提交）
  - `Ctrl+T Ctrl+T`：先生成信息，查看确认后再提交
- 🤖 **AI 生成提交信息**：自动生成规范的中文约定式提交（Cursor AI）
- ⚙️ **自动配置**：首次使用自动配置快捷键和提交规范
- 📝 **规范化**：自动创建 `.cursorrules` 文件，统一团队提交规范
- 🌍 **跨平台**：支持 Windows、macOS、Linux

### 📝 提交信息示例

![提交案例](https://pingtai-img.shiyue.com/bbs/others/plugins/sy-ai-commit-template-1.png)

---

## 📦 安装

### 在 Cursor 中安装
1. 按 `Ctrl+Shift+X` 打开扩展
2. 搜索 **"AI Auto Commit"**
3. 点击安装

### 在 VSCode 中安装
同样步骤，或访问 [Open VSX Registry](https://open-vsx.org/extension/sy-ai-commit/sy-ai-commit)

---

## ⚙️ 如何修改设置？

如果需要自定义快捷键或开启自动推送功能，可以修改设置：

### 修改步骤

1. 按 `Ctrl+,` 打开设置
2. 搜索 **"auto commit"**
3. 修改相应配置项

### 常用配置

```json
{
  // 是否在提交后自动推送到远程
  "autoCommitAssistant.enablePush": false,  // 改为 true 开启自动推送
  
  // 一键提交快捷键
  "autoCommitAssistant.keybinding": "ctrl+g ctrl+g",
  
  // 仅生成信息快捷键
  "autoCommitAssistant.generateOnlyKeybinding": "ctrl+t ctrl+t",
  
  // 首次打开自动配置
  "autoCommitAssistant.autoSetupOnStartup": true
}
```

⚠️ **注意**：修改配置后需要重新运行 `sy commit: 初始化配置` 使快捷键生效！

---

## 📋 配置项说明

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `autoCommitAssistant.keybinding` | `"ctrl+g ctrl+g"` | 一键提交快捷键 |
| `autoCommitAssistant.generateOnlyKeybinding` | `"ctrl+t ctrl+t"` | 仅生成信息快捷键 |
| `autoCommitAssistant.enablePush` | `false` | 提交后是否自动推送 |
| `autoCommitAssistant.autoSetupOnStartup` | `true` | 首次打开自动配置 |

---

## 💡 常见问题

**Q: 切换项目后快捷键不能用了？**  
A: **这是正常的！** 每个项目都需要单独配置。切换项目后请重新运行 `sy commit: 初始化配置`。

**Q: 为什么切换项目要重新配置？**  
A: 因为每个项目可能有不同的 `.cursorrules` 规则，插件需要为每个项目单独配置快捷键和规则文件。

**Q: 两个快捷键有什么区别？**  
A: `Ctrl+G Ctrl+G` 自动完成所有操作包括提交；`Ctrl+T Ctrl+T` 只生成提交信息，需手动确认后提交。

**Q: 如何查看生成的提交信息？**  
A: 使用 `Ctrl+T Ctrl+T` 后，在左侧"源代码管理"面板查看提交信息，确认无误后点击"提交"按钮。

**Q: 快捷键不生效？**  
A: 运行命令 `sy commit: 初始化配置` 重新配置。

**Q: 想修改快捷键？**  
A: 在设置中修改 `autoCommitAssistant.keybinding` 或 `autoCommitAssistant.generateOnlyKeybinding`，然后重新配置。

**Q: 提交后想自动推送？**  
A: 设置 `autoCommitAssistant.enablePush` 为 `true`，重新初始化配置。

**Q: VSCode 中能用吗？**  
A: 可以！但 AI 生成提交信息功能需要配合其他 AI 扩展。Cursor 中功能最完整。

---

## 📝 提交信息规范

扩展会在项目根目录创建 `.cursorrules` 文件，定义提交规范：

```
<类型>(<范围>): <主题>

<正文>

<页脚>
```

**支持的类型：**
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 代码重构
- `test`: 测试
- `chore`: 构建/工具
- `perf`: 性能优化
- `ci`: CI/CD
- `revert`: 回滚

**示例：**
```
feat(用户模块): 添加用户登录功能

- 实现用户名密码登录
- 添加记住密码功能
- 优化登录页面UI
```

---

## 🔧 高级用法

### 重新配置
如果修改了设置或快捷键，运行：
```
Ctrl+Shift+P → sy commit: 初始化配置
```

### 团队使用
将 `.cursorrules` 文件提交到仓库，团队成员使用统一的提交规范。

### 自定义工作流
生成的快捷键配置存储在 `keybindings.json` 中，可以手动编辑添加更多命令：
```json
{
  "key": "ctrl+g ctrl+g",
  "command": "runCommands",
  "args": {
    "commands": [
      "workbench.action.files.save",
      "git.stageAll",
      "cursor.generateGitCommitMessage",
      "git.commit",
      "git.push"  // 可手动添加推送
    ]
  }
}
```

---

## 🐛 问题反馈

- 💬 [GitHub Issues](https://github.com/your-username/sy-ai-commit/issues)

---

## 📄 更新日志

查看 [CHANGELOG.md](CHANGELOG.md)

---

## 📜 许可证

[MIT License](LICENSE)

---

**⭐️ 觉得好用？给个 Star 支持一下！**

**🎉 享受高效的 Git 提交体验！**
