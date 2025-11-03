# VSCode 插件开发完整指南

> 基于 [VS Code Extension API 官方文档](https://code.visualstudio.com/api) 编写

## 📚 目录

- [第一部分：开发入门](#第一部分开发入门)
- [第二部分：核心概念](#第二部分核心概念)
- [第三部分：开发实践](#第三部分开发实践)
- [第四部分：测试与调试](#第四部分测试与调试)
- [第五部分：打包与优化](#第五部分打包与优化)
- [第六部分：发布上架](#第六部分发布上架)
- [第七部分：维护更新](#第七部分维护更新)

---

## 第一部分：开发入门

### 1.1 环境准备

#### 必需工具
```bash
# Node.js (v18.0.0+)
node --version

# npm (v8.0.0+)
npm --version

# Git
git --version

# Visual Studio Code
code --version
```

#### 安装脚手架工具
```bash
# 安装 Yeoman 和 VS Code 扩展生成器
npm install -g yo generator-code

# 安装打包工具
npm install -g @vscode/vsce
```

### 1.2 创建第一个扩展

#### 使用生成器创建项目
```bash
# 运行生成器
yo code

# 选择以下选项：
# ? What type of extension do you want to create? New Extension (TypeScript)
# ? What's the name of your extension? Hello World
# ? What's the identifier of your extension? hello-world
# ? What's the description of your extension? My first VS Code extension
# ? Initialize a git repository? Yes
# ? Bundle the source code with webpack? No
# ? Which package manager to use? npm
```

#### 项目结构说明
```
hello-world/
├── .vscode/              # VS Code 配置
│   ├── launch.json       # 调试配置
│   └── tasks.json        # 构建任务
├── src/                  # 源代码
│   └── extension.ts      # 扩展入口
├── .gitignore
├── .vscodeignore         # 发布时忽略的文件
├── CHANGELOG.md
├── package.json          # 扩展清单
├── README.md
└── tsconfig.json         # TypeScript 配置
```

### 1.3 理解 package.json

参考：[Extension Manifest](https://code.visualstudio.com/api/references/extension-manifest)

#### 必需字段
```json
{
  "name": "hello-world",              // 扩展标识符（小写，无空格）
  "displayName": "Hello World",       // 显示名称
  "description": "我的第一个扩展",     // 描述
  "version": "1.0.0",                 // 版本号（语义化版本）
  "publisher": "your-publisher-id",   // 发布者 ID（必需）
  "engines": {
    "vscode": "^1.80.0"               // VS Code 最低版本
  },
  "categories": [                     // 分类
    "Other"
  ],
  "main": "./out/extension.js",       // 入口文件
  "contributes": {},                  // 贡献点
  "scripts": {},                      // 脚本命令
  "devDependencies": {}               // 开发依赖
}
```

#### 重要字段详解

**categories（分类）**
- Programming Languages
- Snippets
- Linters
- Themes
- Debuggers
- Formatters
- Keymaps
- SCM Providers
- Other
- Extension Packs
- Language Packs
- Data Science
- Machine Learning
- Visualization
- Notebooks
- Education
- Testing

**keywords（关键词）**
```json
"keywords": [
  "git",
  "commit",
  "productivity",
  "automation"
]
```

**repository（仓库）**
```json
"repository": {
  "type": "git",
  "url": "https://github.com/username/repo.git"
}
```

**icon（图标）**
```json
"icon": "icon.png"  // 128x128 或 256x256 PNG
```

---

## 第二部分：核心概念

### 2.1 激活事件（Activation Events）

参考：[Activation Events](https://code.visualstudio.com/api/references/activation-events)

#### 常用激活事件

```json
"activationEvents": [
  "onStartupFinished",              // VS Code 启动完成后（推荐）
  "onCommand:extension.helloWorld", // 命令执行时
  "onLanguage:javascript",          // 打开特定语言文件时
  "onView:nodeDependencies",        // 打开特定视图时
  "workspaceContains:**/.git",      // 工作区包含特定文件时
  "onFileSystem:sftp",              // 访问特定协议文件时
  "onDebug",                        // 调试会话开始前
  "onUri",                          // 通过 URI 打开扩展时
  "*"                               // 启动时立即激活（不推荐）
]
```

#### 最佳实践
- ✅ 使用 `onStartupFinished` 替代 `*`
- ✅ 按需激活，减少启动时间
- ✅ 使用具体的激活事件而非全局激活

### 2.2 贡献点（Contribution Points）

参考：[Contribution Points](https://code.visualstudio.com/api/references/contribution-points)

#### 命令（Commands）
```json
"contributes": {
  "commands": [
    {
      "command": "extension.helloWorld",
      "title": "Hello World",
      "category": "My Extension",      // 命令分类
      "icon": "$(heart)",              // 图标（Codicon）
      "enablement": "editorIsOpen"     // 启用条件
    }
  ]
}
```

#### 配置项（Configuration）
```json
"contributes": {
  "configuration": {
    "title": "My Extension",
    "properties": {
      "myExtension.enable": {
        "type": "boolean",
        "default": true,
        "description": "启用扩展功能",
        "scope": "window"              // window | resource | language-overridable
      },
      "myExtension.maxItems": {
        "type": "number",
        "default": 10,
        "minimum": 1,
        "maximum": 100,
        "description": "最大项目数"
      },
      "myExtension.mode": {
        "type": "string",
        "enum": ["auto", "manual"],
        "default": "auto",
        "description": "运行模式"
      }
    }
  }
}
```

#### 快捷键（Keybindings）
```json
"contributes": {
  "keybindings": [
    {
      "command": "extension.helloWorld",
      "key": "ctrl+f1",
      "mac": "cmd+f1",
      "when": "editorTextFocus"        // 激活条件
    }
  ]
}
```

#### 菜单（Menus）
```json
"contributes": {
  "menus": {
    "editor/context": [               // 编辑器右键菜单
      {
        "command": "extension.helloWorld",
        "when": "editorHasSelection",
        "group": "navigation"
      }
    ],
    "explorer/context": [             // 资源管理器右键菜单
      {
        "command": "extension.helloWorld",
        "when": "resourceExtname == .js"
      }
    ],
    "commandPalette": [               // 命令面板
      {
        "command": "extension.helloWorld",
        "when": "workspaceHasPackageJSON"
      }
    ]
  }
}
```

#### 视图容器和视图（View Containers & Views）
```json
"contributes": {
  "viewsContainers": {
    "activitybar": [
      {
        "id": "myExtension",
        "title": "My Extension",
        "icon": "resources/icon.svg"
      }
    ]
  },
  "views": {
    "myExtension": [
      {
        "id": "myView",
        "name": "My View",
        "when": "workspaceHasPackageJSON"
      }
    ]
  }
}
```

### 2.3 VS Code API

参考：[VS Code API](https://code.visualstudio.com/api/references/vscode-api)

#### 核心模块

**命令（Commands）**
```typescript
import * as vscode from 'vscode';

// 注册命令
const disposable = vscode.commands.registerCommand(
  'extension.helloWorld',
  () => {
    vscode.window.showInformationMessage('Hello World!');
  }
);

// 执行命令
vscode.commands.executeCommand('workbench.action.files.save');

// 获取所有命令
vscode.commands.getCommands();
```

**窗口（Window）**
```typescript
// 显示消息
vscode.window.showInformationMessage('信息');
vscode.window.showWarningMessage('警告');
vscode.window.showErrorMessage('错误');

// 显示输入框
const result = await vscode.window.showInputBox({
  prompt: '请输入名称',
  placeHolder: '名称',
  validateInput: (value) => {
    return value ? null : '名称不能为空';
  }
});

// 显示快速选择
const picked = await vscode.window.showQuickPick(
  ['选项1', '选项2', '选项3'],
  {
    placeHolder: '请选择一个选项'
  }
);

// 显示进度
vscode.window.withProgress(
  {
    location: vscode.ProgressLocation.Notification,
    title: '处理中',
    cancellable: true
  },
  async (progress, token) => {
    progress.report({ increment: 0 });
    // 执行任务
    progress.report({ increment: 50, message: '进行中...' });
    await doWork();
    progress.report({ increment: 50, message: '完成！' });
  }
);
```

**工作区（Workspace）**
```typescript
// 获取工作区文件夹
const folders = vscode.workspace.workspaceFolders;

// 获取配置
const config = vscode.workspace.getConfiguration('myExtension');
const value = config.get<boolean>('enable', true);

// 更新配置
await config.update('enable', false, vscode.ConfigurationTarget.Global);

// 监听配置变化
vscode.workspace.onDidChangeConfiguration((e) => {
  if (e.affectsConfiguration('myExtension.enable')) {
    console.log('配置已更改');
  }
});

// 查找文件
const files = await vscode.workspace.findFiles(
  '**/*.js',      // include
  '**/node_modules/**' // exclude
);

// 打开文本文档
const doc = await vscode.workspace.openTextDocument(uri);
```

**文件系统（FileSystem）**
```typescript
// 读取文件
const uri = vscode.Uri.file('/path/to/file');
const bytes = await vscode.workspace.fs.readFile(uri);
const content = Buffer.from(bytes).toString('utf8');

// 写入文件
const content = Buffer.from('Hello World', 'utf8');
await vscode.workspace.fs.writeFile(uri, content);

// 创建目录
await vscode.workspace.fs.createDirectory(uri);

// 删除文件
await vscode.workspace.fs.delete(uri);

// 检查文件是否存在
try {
  await vscode.workspace.fs.stat(uri);
  console.log('文件存在');
} catch {
  console.log('文件不存在');
}
```

**编辑器（TextEditor）**
```typescript
// 获取活动编辑器
const editor = vscode.window.activeTextEditor;

if (editor) {
  // 获取文档
  const document = editor.document;
  
  // 获取选中文本
  const selection = editor.selection;
  const text = document.getText(selection);
  
  // 编辑文档
  await editor.edit((editBuilder) => {
    editBuilder.replace(selection, 'New Text');
    editBuilder.insert(new vscode.Position(0, 0), 'Header\n');
    editBuilder.delete(new vscode.Range(1, 0, 2, 0));
  });
  
  // 设置光标位置
  editor.selection = new vscode.Selection(0, 0, 0, 0);
  
  // 滚动到指定位置
  editor.revealRange(
    new vscode.Range(10, 0, 10, 0),
    vscode.TextEditorRevealType.InCenter
  );
}
```

**状态栏（Status Bar）**
```typescript
// 创建状态栏项
const statusBarItem = vscode.window.createStatusBarItem(
  vscode.StatusBarAlignment.Right,
  100  // 优先级
);

statusBarItem.text = '$(heart) 状态';
statusBarItem.tooltip = '点击执行命令';
statusBarItem.command = 'extension.helloWorld';
statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
statusBarItem.show();

// 更新状态
statusBarItem.text = '$(sync~spin) 处理中...';

// 清理
context.subscriptions.push(statusBarItem);
```

---

## 第三部分：开发实践

### 3.1 扩展激活和停用

#### extension.ts 基本结构
```typescript
import * as vscode from 'vscode';

/**
 * 扩展激活时调用
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('扩展已激活');
  
  // 注册命令
  const disposable = vscode.commands.registerCommand(
    'extension.helloWorld',
    () => {
      vscode.window.showInformationMessage('Hello World!');
    }
  );
  
  // 添加到订阅中，确保正确清理
  context.subscriptions.push(disposable);
  
  // 访问扩展上下文
  const storagePath = context.globalStoragePath;  // 全局存储路径
  const workspaceState = context.workspaceState;  // 工作区状态
  const globalState = context.globalState;        // 全局状态
  const extensionPath = context.extensionPath;    // 扩展路径
}

/**
 * 扩展停用时调用
 */
export function deactivate() {
  console.log('扩展已停用');
  // 清理资源
}
```

### 3.2 配置管理

```typescript
import * as vscode from 'vscode';

class ConfigManager {
  private config: vscode.WorkspaceConfiguration;
  
  constructor() {
    this.config = vscode.workspace.getConfiguration('myExtension');
    
    // 监听配置变化
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('myExtension')) {
        this.config = vscode.workspace.getConfiguration('myExtension');
        this.onConfigChanged();
      }
    });
  }
  
  /**
   * 获取配置值
   */
  get<T>(key: string, defaultValue: T): T {
    return this.config.get<T>(key, defaultValue);
  }
  
  /**
   * 更新配置
   */
  async update(
    key: string,
    value: any,
    target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Global
  ): Promise<void> {
    await this.config.update(key, value, target);
  }
  
  /**
   * 配置变化回调
   */
  private onConfigChanged(): void {
    console.log('配置已更改');
  }
}
```

### 3.3 状态管理

```typescript
import * as vscode from 'vscode';

class StateManager {
  constructor(private context: vscode.ExtensionContext) {}
  
  /**
   * 工作区状态（仅当前工作区）
   */
  getWorkspaceState<T>(key: string, defaultValue: T): T {
    return this.context.workspaceState.get(key, defaultValue);
  }
  
  async setWorkspaceState(key: string, value: any): Promise<void> {
    await this.context.workspaceState.update(key, value);
  }
  
  /**
   * 全局状态（跨所有工作区）
   */
  getGlobalState<T>(key: string, defaultValue: T): T {
    return this.context.globalState.get(key, defaultValue);
  }
  
  async setGlobalState(key: string, value: any): Promise<void> {
    await this.context.globalState.update(key, value);
  }
  
  /**
   * 秘密存储（用于敏感信息）
   */
  async getSecret(key: string): Promise<string | undefined> {
    return await this.context.secrets.get(key);
  }
  
  async setSecret(key: string, value: string): Promise<void> {
    await this.context.secrets.store(key, value);
  }
  
  async deleteSecret(key: string): Promise<void> {
    await this.context.secrets.delete(key);
  }
}
```

### 3.4 命令实现最佳实践

```typescript
import * as vscode from 'vscode';

/**
 * 命令处理器基类
 */
abstract class CommandHandler {
  abstract readonly commandId: string;
  
  register(context: vscode.ExtensionContext): void {
    const disposable = vscode.commands.registerCommand(
      this.commandId,
      async (...args: any[]) => {
        try {
          await this.execute(...args);
        } catch (error) {
          this.handleError(error);
        }
      }
    );
    context.subscriptions.push(disposable);
  }
  
  protected abstract execute(...args: any[]): Promise<void>;
  
  protected handleError(error: any): void {
    vscode.window.showErrorMessage(`命令执行失败：${error.message}`);
    console.error(`[${this.commandId}]`, error);
  }
}

/**
 * 具体命令实现
 */
class HelloWorldCommand extends CommandHandler {
  readonly commandId = 'extension.helloWorld';
  
  protected async execute(): Promise<void> {
    const result = await vscode.window.showInformationMessage(
      'Hello World!',
      '确定',
      '取消'
    );
    
    if (result === '确定') {
      console.log('用户点击了确定');
    }
  }
}

// 在 activate 中注册
export function activate(context: vscode.ExtensionContext) {
  new HelloWorldCommand().register(context);
}
```

### 3.5 错误处理

```typescript
import * as vscode from 'vscode';

/**
 * 自定义错误类
 */
class ExtensionError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly showToUser: boolean = true
  ) {
    super(message);
    this.name = 'ExtensionError';
  }
}

/**
 * 错误处理器
 */
class ErrorHandler {
  /**
   * 处理错误
   */
  static handle(error: unknown): void {
    if (error instanceof ExtensionError) {
      if (error.showToUser) {
        vscode.window.showErrorMessage(error.message);
      }
      console.error(`[${error.code}]`, error.message);
    } else if (error instanceof Error) {
      vscode.window.showErrorMessage(`发生错误：${error.message}`);
      console.error(error);
    } else {
      vscode.window.showErrorMessage('发生未知错误');
      console.error(error);
    }
  }
  
  /**
   * 安全执行异步函数
   */
  static async safeExecute<T>(
    fn: () => Promise<T>,
    errorMessage?: string
  ): Promise<T | undefined> {
    try {
      return await fn();
    } catch (error) {
      if (errorMessage) {
        vscode.window.showErrorMessage(errorMessage);
      }
      this.handle(error);
      return undefined;
    }
  }
}

// 使用示例
async function doSomething() {
  await ErrorHandler.safeExecute(
    async () => {
      // 执行操作
      throw new ExtensionError('操作失败', 'OP_FAILED');
    },
    '无法完成操作'
  );
}
```

---

## 第四部分：测试与调试

参考：[Testing Extensions](https://code.visualstudio.com/api/working-with-extensions/testing-extension)

### 4.1 调试配置

#### .vscode/launch.json
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "运行扩展",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}"
      ],
      "outFiles": [
        "${workspaceFolder}/out/**/*.js"
      ],
      "preLaunchTask": "${defaultBuildTask}",
      "sourceMaps": true
    },
    {
      "name": "扩展测试",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}",
        "--extensionTestsPath=${workspaceFolder}/out/test/suite/index"
      ],
      "outFiles": [
        "${workspaceFolder}/out/test/**/*.js"
      ],
      "preLaunchTask": "${defaultBuildTask}"
    }
  ]
}
```

### 4.2 单元测试

#### 安装测试依赖
```bash
npm install --save-dev @vscode/test-electron mocha @types/mocha
```

#### src/test/suite/extension.test.ts
```typescript
import * as assert from 'assert';
import * as vscode from 'vscode';

suite('扩展测试套件', () => {
  vscode.window.showInformationMessage('开始所有测试');
  
  test('示例测试', () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });
  
  test('命令注册测试', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('extension.helloWorld'));
  });
  
  test('配置读取测试', () => {
    const config = vscode.workspace.getConfiguration('myExtension');
    const value = config.get('enable');
    assert.notStrictEqual(value, undefined);
  });
});
```

#### src/test/runTest.ts
```typescript
import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');
    const extensionTestsPath = path.resolve(__dirname, './suite/index');
    
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath
    });
  } catch (err) {
    console.error('测试失败');
    process.exit(1);
  }
}

main();
```

### 4.3 调试技巧

#### 使用断点
```typescript
// 在代码中设置断点
function doSomething() {
  const value = getValue();  // ← 在此行设置断点
  console.log(value);
}
```

#### 条件断点
```typescript
// 右键断点 → 编辑断点 → 添加条件
for (let i = 0; i < 100; i++) {
  processItem(i);  // 断点条件：i === 50
}
```

#### 日志输出
```typescript
// 输出通道
const outputChannel = vscode.window.createOutputChannel('My Extension');
outputChannel.appendLine('这是一条日志');
outputChannel.show();

// 调试控制台
console.log('普通日志');
console.warn('警告信息');
console.error('错误信息');
console.debug('调试信息');
```

---

## 第五部分：打包与优化

参考：[Bundling Extensions](https://code.visualstudio.com/api/working-with-extensions/bundling-extension)

### 5.1 使用 Webpack 打包

#### 安装依赖
```bash
npm install --save-dev webpack webpack-cli ts-loader
```

#### webpack.config.js
```javascript
//@ts-check
'use strict';

const path = require('path');

/** @type {import('webpack').Configuration} */
const config = {
  target: 'node',
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: "log"
  }
};

module.exports = config;
```

#### 更新 package.json
```json
{
  "main": "./dist/extension.js",
  "scripts": {
    "vscode:prepublish": "npm run package",
    "compile": "webpack",
    "watch": "webpack --watch",
    "package": "webpack --mode production --devtool hidden-source-map",
    "compile-tests": "tsc -p . --outDir out",
    "watch-tests": "tsc -p . -w --outDir out",
    "pretest": "npm run compile-tests && npm run compile && npm run lint",
    "lint": "eslint src --ext ts",
    "test": "node ./out/test/runTest.js"
  }
}
```

### 5.2 优化扩展大小

#### .vscodeignore
```
.vscode/**
.vscode-test/**
src/**
.gitignore
.yarnrc
webpack.config.js
vsc-extension-quickstart.md
**/tsconfig.json
**/.eslintrc.json
**/*.map
**/*.ts
!dist/**/*.js
node_modules/**
.DS_Store
*.vsix
.github/**
.editorconfig
.prettierrc
test/**
coverage/**
```

#### 排除开发依赖
```json
{
  "dependencies": {
    // 运行时需要的依赖（会被打包）
  },
  "devDependencies": {
    // 开发时需要的依赖（不会被打包）
    "@types/vscode": "^1.80.0",
    "@types/node": "^18.0.0",
    "typescript": "^5.1.6"
  }
}
```

### 5.3 性能优化

#### 延迟加载
```typescript
// 延迟导入大型模块
async function heavyOperation() {
  const module = await import('./heavyModule');
  return module.doSomething();
}
```

#### 异步激活
```typescript
export async function activate(context: vscode.ExtensionContext) {
  // 快速激活，延迟初始化
  initializeAsync(context).catch(console.error);
}

async function initializeAsync(context: vscode.ExtensionContext) {
  // 执行耗时的初始化操作
  await loadConfiguration();
  await setupWatchers();
}
```

#### 缓存机制
```typescript
class CacheManager {
  private cache = new Map<string, any>();
  private cacheExpiry = new Map<string, number>();
  
  get<T>(key: string, ttl: number = 60000): T | undefined {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return undefined;
    }
    return this.cache.get(key);
  }
  
  set(key: string, value: any, ttl: number = 60000): void {
    this.cache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + ttl);
  }
}
```

---

## 第六部分：发布上架

参考：[Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

### 6.1 创建 Azure DevOps 账号和 PAT

#### 步骤 1：注册 Azure DevOps
1. 访问 [Azure DevOps](https://dev.azure.com/)
2. 使用 Microsoft 账号登录（没有则免费注册）
3. 创建一个组织（Organization）

#### 步骤 2：创建 Personal Access Token (PAT)
1. 点击右上角用户头像
2. 选择 **"Security"** → **"Personal access tokens"**
3. 点击 **"+ New Token"**
4. 填写信息：
   - **Name**: VSCode Extension Publisher
   - **Organization**: All accessible organizations
   - **Expiration**: 90 days（或自定义）
   - **Scopes**: 
     - ✅ 选择 **"Custom defined"**
     - ✅ 展开 **"Marketplace"**
     - ✅ 勾选 **"Acquire"** 和 **"Manage"**
5. 点击 **"Create"**
6. **重要**：复制并保存生成的 Token（只显示一次）

### 6.2 创建 Publisher

#### 方法 1：通过网页创建
1. 访问 [Visual Studio Marketplace Publisher Management](https://marketplace.visualstudio.com/manage)
2. 点击 **"Create publisher"**
3. 填写信息：
   - **ID**: publisher-id（小写字母、数字、连字符，唯一标识）
   - **Name**: 显示名称（支持中文）
   - **Email**: 联系邮箱
4. 点击 **"Create"**

#### 方法 2：通过 vsce 创建
```bash
vsce create-publisher your-publisher-id
# 输入 Personal Access Token
# 输入 Publisher Name
```

### 6.3 准备发布

#### 检查清单

**必需项**
- [ ] `package.json` 中的 `publisher` 字段已填写
- [ ] `package.json` 中的 `version` 字段符合语义化版本
- [ ] `README.md` 文件存在且内容完善
- [ ] `LICENSE` 文件存在
- [ ] `CHANGELOG.md` 文件存在
- [ ] 扩展图标 `icon.png` 已准备（推荐）

**推荐项**
- [ ] 添加了功能截图和 GIF 演示
- [ ] 添加了详细的使用说明
- [ ] 添加了 GitHub 仓库链接
- [ ] 添加了问题反馈链接
- [ ] 运行 `vsce package` 测试打包

#### 完善 package.json
```json
{
  "name": "auto-commit-assistant",
  "displayName": "AI Auto Commit Assistant",
  "description": "自动配置 Git 提交快捷键和 Cursor 规则，提升提交效率",
  "version": "1.0.0",
  "publisher": "your-publisher-id",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  },
  "license": "MIT",
  "homepage": "https://github.com/username/repo#readme",
  "repository": {
    "type": "git",
    "url": "https://github.com/username/repo.git"
  },
  "bugs": {
    "url": "https://github.com/username/repo/issues"
  },
  "icon": "icon.png",
  "galleryBanner": {
    "color": "#1e1e1e",
    "theme": "dark"
  },
  "keywords": [
    "git",
    "commit",
    "productivity",
    "automation",
    "cursor"
  ],
  "categories": [
    "Other",
    "SCM Providers"
  ],
  "engines": {
    "vscode": "^1.80.0"
  },
  "qna": "marketplace"
}
```

#### 完善 README.md
```markdown
# 扩展名称

[![Version](https://img.shields.io/visual-studio-marketplace/v/publisher.extension-name)](https://marketplace.visualstudio.com/items?itemName=publisher.extension-name)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/publisher.extension-name)](https://marketplace.visualstudio.com/items?itemName=publisher.extension-name)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/publisher.extension-name)](https://marketplace.visualstudio.com/items?itemName=publisher.extension-name)

简短描述（一句话介绍扩展功能）

![功能演示](images/demo.gif)

## ✨ 功能特性

- 功能 1
- 功能 2
- 功能 3

## 📦 安装

在 VS Code 扩展市场搜索 "扩展名称" 或[点击这里安装](vscode:extension/publisher.extension-name)

## 🚀 快速开始

1. 步骤 1
2. 步骤 2
3. 步骤 3

![使用示例](images/usage.png)

## ⚙️ 配置

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `extension.setting1` | boolean | true | 设置说明 |

## 📝 命令

| 命令 | 说明 |
|------|------|
| `extension.command1` | 命令说明 |

## 🐛 问题反馈

[GitHub Issues](https://github.com/username/repo/issues)

## 📄 许可证

[MIT](LICENSE)
```

### 6.4 登录和发布

#### 登录 Publisher
```bash
# 使用 vsce 登录
vsce login your-publisher-id

# 输入 Personal Access Token
```

#### 首次发布
```bash
# 方法 1：直接发布
vsce publish

# 方法 2：先打包，再发布
vsce package              # 生成 .vsix 文件
vsce publish --packagePath ./extension-1.0.0.vsix

# 方法 3：指定版本号发布
vsce publish 1.0.0        # 自动设置版本号并发布
```

#### 增量版本发布
```bash
# 发布补丁版本（1.0.0 → 1.0.1）
vsce publish patch

# 发布次版本（1.0.0 → 1.1.0）
vsce publish minor

# 发布主版本（1.0.0 → 2.0.0）
vsce publish major
```

### 6.5 发布常见问题

#### 问题 1：Missing publisher name
```bash
# 解决：在 package.json 中添加 publisher 字段
{
  "publisher": "your-publisher-id"
}
```

#### 问题 2：Missing README.md
```bash
# 解决：确保根目录有 README.md 文件
```

#### 问题 3：Missing LICENSE
```bash
# 解决：添加 LICENSE 文件，或在 package.json 中指定
{
  "license": "MIT"
}
```

#### 问题 4：Icon must be PNG
```bash
# 解决：使用 PNG 格式图标，推荐尺寸 128x128 或 256x256
```

#### 问题 5：Package size too large
```bash
# 解决：优化 .vscodeignore，排除不必要的文件
# 使用 webpack 打包
# 检查是否意外包含了 node_modules
```

#### 问题 6：Extension validation failed
```bash
# 查看详细错误信息
vsce publish --verbose

# 先打包检查
vsce package
vsce ls  # 查看将要包含的文件
```

### 6.6 发布后管理

#### 查看扩展统计
1. 访问 [Marketplace Publisher Management](https://marketplace.visualstudio.com/manage/publishers/your-publisher-id)
2. 选择您的扩展
3. 查看：
   - 安装量
   - 评分和评论
   - 下载趋势
   - 用户反馈

#### 更新扩展信息
1. 登录 Publisher Management
2. 点击扩展名称
3. 可以更新：
   - 图标
   - 详细描述
   - 分类
   - 标签

#### 撤销发布
```bash
# 撤销特定版本
vsce unpublish your-publisher-id.extension-name@1.0.0

# 撤销整个扩展（慎用）
vsce unpublish your-publisher-id.extension-name
```

---

## 第七部分：维护更新

### 7.1 版本管理

#### 语义化版本规范
- **主版本号（Major）**: 不兼容的 API 修改
- **次版本号（Minor）**: 向下兼容的功能性新增
- **修订号（Patch）**: 向下兼容的问题修正

```bash
# 示例
1.0.0  # 初始版本
1.0.1  # Bug 修复
1.1.0  # 新增功能
2.0.0  # 重大变更
```

#### 更新 CHANGELOG.md
```markdown
# 更新日志

## [1.1.0] - 2025-11-01

### 新增
- 添加了自动推送功能
- 新增配置项 `enablePush`

### 修复
- 修复了 Windows 路径问题
- 修复了配置读取错误

### 变更
- 优化了性能
- 更新了依赖包

## [1.0.0] - 2025-10-30

### 新增
- 初始发布
```

### 7.2 持续集成 (CI/CD)

参考：[Continuous Integration](https://code.visualstudio.com/api/working-with-extensions/continuous-integration)

#### GitHub Actions 配置

**.github/workflows/publish.yml**
```yaml
name: Publish Extension

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - run: npm ci
      
      - run: npm run lint
      
      - run: npm run test
      
      - run: npm run compile
      
      - name: Publish to VS Code Marketplace
        run: npm run deploy
        env:
          VSCE_PAT: ${{ secrets.VSCE_PAT }}
```

**package.json scripts**
```json
{
  "scripts": {
    "deploy": "vsce publish -p $VSCE_PAT"
  }
}
```

#### 自动化测试
```yaml
name: Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
```

### 7.3 用户反馈处理

#### 收集反馈渠道
1. **GitHub Issues** - 问题追踪
2. **Marketplace 评论** - 用户评价
3. **GitHub Discussions** - 功能讨论
4. **社交媒体** - 社区互动

#### Issue 模板

**.github/ISSUE_TEMPLATE/bug_report.md**
```markdown
---
name: Bug 报告
about: 创建报告帮助我们改进
title: '[BUG] '
labels: bug
---

**描述问题**
清晰简洁地描述问题是什么。

**复现步骤**
1. 打开 '...'
2. 点击 '....'
3. 看到错误

**预期行为**
描述您期望发生什么。

**截图**
如果适用，添加截图帮助解释问题。

**环境信息**
- OS: [e.g. Windows 11]
- VS Code 版本: [e.g. 1.85.0]
- 扩展版本: [e.g. 1.0.0]
```

### 7.4 安全性

#### 敏感信息处理
```typescript
// ✅ 使用 secrets API
await context.secrets.store('apiKey', apiKey);
const apiKey = await context.secrets.get('apiKey');

// ❌ 不要存储在 globalState
context.globalState.update('apiKey', apiKey);  // 不安全！
```

#### 依赖安全检查
```bash
# 检查已知漏洞
npm audit

# 自动修复
npm audit fix

# 更新依赖
npm update
```

#### 定期更新依赖
```json
{
  "scripts": {
    "check-updates": "npx npm-check-updates",
    "update-deps": "npx npm-check-updates -u && npm install"
  }
}
```

### 7.5 性能监控

#### 使用遥测（Telemetry）

参考：[Telemetry](https://code.visualstudio.com/api/extension-guides/telemetry)

```typescript
import * as vscode from 'vscode';
import TelemetryReporter from '@vscode/extension-telemetry';

const reporter = new TelemetryReporter(
  'your-extension-id',
  '1.0.0',
  'your-app-insights-key'
);

// 发送事件
reporter.sendTelemetryEvent('commandExecuted', {
  command: 'helloWorld'
}, {
  duration: 100
});

// 发送错误
reporter.sendTelemetryErrorEvent('errorOccurred', {
  error: error.message
});

// 清理
context.subscriptions.push(reporter);
```

---

## 附录

### A. 常用命令速查

```bash
# vsce 命令
vsce --version                    # 查看版本
vsce ls                          # 列出将要打包的文件
vsce package                     # 打包扩展
vsce publish                     # 发布扩展
vsce publish patch               # 发布补丁版本
vsce publish minor               # 发布次版本
vsce publish major               # 发布主版本
vsce unpublish                   # 撤销发布
vsce login                       # 登录 publisher
vsce logout                      # 登出 publisher

# npm 命令
npm install                      # 安装依赖
npm run compile                  # 编译
npm run watch                    # 监听编译
npm run lint                     # 代码检查
npm run test                     # 运行测试
npm audit                        # 安全检查
```

### B. 有用的资源

#### 官方文档
- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Samples](https://github.com/microsoft/vscode-extension-samples)
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

#### 社区资源
- [VS Code Discussions](https://github.com/microsoft/vscode-discussions)
- [Stack Overflow - vscode-extensions](https://stackoverflow.com/questions/tagged/vscode-extensions)
- [VS Code Dev Slack](https://aka.ms/vscode-dev-community)

#### 工具
- [Yeoman Generator](https://github.com/microsoft/vscode-generator-code)
- [vsce - Publishing Tool](https://github.com/microsoft/vscode-vsce)
- [Extension Test Runner](https://github.com/microsoft/vscode-test)

### C. 图标资源

#### Codicons
VS Code 内置图标：[Codicon Reference](https://microsoft.github.io/vscode-codicons/dist/codicon.html)

```json
{
  "icon": "$(heart)",
  "icon": "$(gear)",
  "icon": "$(check)",
  "icon": "$(error)",
  "icon": "$(warning)"
}
```

### D. 发布检查清单

#### 发布前
- [ ] 运行所有测试通过
- [ ] 运行 `npm run lint` 无错误
- [ ] 更新 `CHANGELOG.md`
- [ ] 更新 `package.json` 版本号
- [ ] 更新 `README.md`（如有新功能）
- [ ] 本地运行 `vsce package` 测试打包
- [ ] 在干净环境测试 `.vsix` 安装
- [ ] 检查 `.vscodeignore` 是否正确
- [ ] 准备好发布说明

#### 发布后
- [ ] 验证扩展在 Marketplace 正常显示
- [ ] 测试从 Marketplace 安装
- [ ] 在 GitHub 创建 Release
- [ ] 打标签 `git tag v1.0.0`
- [ ] 推送标签 `git push --tags`
- [ ] 通知用户（如适用）
- [ ] 监控错误报告

---

## 总结

本指南涵盖了 VS Code 扩展开发的完整流程，从环境搭建到发布上架。关键要点：

1. **开发阶段**
   - 使用 TypeScript 和官方 API
   - 遵循最佳实践和设计模式
   - 注重性能和用户体验

2. **测试阶段**
   - 编写单元测试
   - 在多平台测试
   - 使用调试工具排查问题

3. **发布阶段**
   - 完善文档和截图
   - 优化包大小
   - 通过 vsce 发布到 Marketplace

4. **维护阶段**
   - 及时响应用户反馈
   - 定期更新依赖
   - 持续改进功能

参考官方文档获取最新信息：[https://code.visualstudio.com/api](https://code.visualstudio.com/api)

---

**最后更新：** 2025-10-30  
**文档版本：** 1.0.0

