import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

/**
 * 插件激活时调用
 * @param context - 扩展上下文
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('AI Auto Commit Assistant 已激活');

    // 注册命令：完整初始化
    const setupCommand = vscode.commands.registerCommand(
        'auto-commit-assistant.setup',
        async () => {
            await setupAll();
        }
    );

    // 注册命令：一键提交（Ctrl+G Ctrl+G）
    const commitWithGenerateCommand = vscode.commands.registerCommand(
        'auto-commit-assistant.commitWithGenerate',
        async () => {
            await executeCommitWithGenerate();
        }
    );

    // 注册命令：仅生成提交信息（Ctrl+T Ctrl+T）
    const generateOnlyCommand = vscode.commands.registerCommand(
        'auto-commit-assistant.generateOnly',
        async () => {
            await executeGenerateOnly();
        }
    );

    // 注册命令：测试进度显示（Ctrl+R Ctrl+R）
    const testProgressCommand = vscode.commands.registerCommand(
        'auto-commit-assistant.testProgress',
        async () => {
            await executeTestProgress();
        }
    );

    context.subscriptions.push(setupCommand, commitWithGenerateCommand, generateOnlyCommand, testProgressCommand);

    // 首次打开时自动配置
    checkAndAutoSetup(context);
}

/**
 * 检查是否需要自动配置
 * @param context - 扩展上下文
 */
async function checkAndAutoSetup(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('autoCommitAssistant');
    const autoSetup = config.get<boolean>('autoSetupOnStartup', true);

    if (!autoSetup) {
        return;
    }

    // 检查是否已经配置过
    const hasSetup = context.globalState.get<boolean>('hasSetup', false);
    
    if (!hasSetup && vscode.workspace.workspaceFolders) {
        const result = await vscode.window.showInformationMessage(
            '🚀 AI Auto Commit Assistant: 是否要自动配置快捷键和 Cursor 规则？',
            '是',
            '否',
            '不再提示'
        );

        if (result === '是') {
            await setupAll();
            await context.globalState.update('hasSetup', true);
        } else if (result === '不再提示') {
            await context.globalState.update('hasSetup', true);
            await config.update('autoSetupOnStartup', false, vscode.ConfigurationTarget.Global);
        }
    }
}

/**
 * 完整配置：快捷键 + Cursor 规则
 */
async function setupAll() {
    let cursorRulesPath: string | undefined;
    
    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'AI Auto Commit Assistant',
            cancellable: false
        },
        async (progress) => {
            progress.report({ increment: 0, message: '正在配置快捷键...' });
            await setupKeybindings();

            progress.report({ increment: 50, message: '正在配置 Cursor 规则...' });
            cursorRulesPath = await setupCursorRules(false); // 不在进度条内询问

            progress.report({ increment: 50, message: '配置完成！' });
            
            // 延迟一下让用户看到完成消息
            await new Promise(resolve => setTimeout(resolve, 500));
        } 
    );
    
    // 显示初始化成功提示，包含快捷键说明（带按钮的弹窗）
    await vscode.window.showInformationMessage(
        '✅ 初始化配置成功！\n\n' +
        '💡 快捷键说明：\n' +
        '• Ctrl+G Ctrl+G：一键提交（保存→暂存→生成→提交）\n' +
        '• Ctrl+T Ctrl+T：仅生成信息（可查看后手动提交）\n\n' +
        '✓ 已配置快捷键到 keybindings.json\n' +
        '✓ 已创建 .cursorrules 文件到项目根目录\n\n' +
        '⚠️ 提示：切换项目时需要重新运行"sy commit: 初始化配置"',
        { modal: true },  // 使用模态对话框，更明显
        '我知道了'
    );
    
    // 进度条关闭后再询问是否打开文件
    if (cursorRulesPath) {
        const openFile = await vscode.window.showInformationMessage(
            '是否查看 .cursorrules 文件？',
            '查看',
            '稍后'
        );

        if (openFile === '查看') {
            const document = await vscode.workspace.openTextDocument(cursorRulesPath);
            await vscode.window.showTextDocument(document);
        }
    }
}

/**
 * 配置快捷键到 keybindings.json
 */
async function setupKeybindings() {
    try {
        const config = vscode.workspace.getConfiguration('autoCommitAssistant');
        const keybinding = config.get<string>('keybinding', 'ctrl+g ctrl+g');
        const generateOnlyKeybinding = config.get<string>('generateOnlyKeybinding', 'ctrl+t ctrl+t');
        const testProgressKeybinding = config.get<string>('testProgressKeybinding', 'ctrl+r ctrl+r');
        const enablePush = config.get<boolean>('enablePush', false);

        // 获取用户的 keybindings.json 路径
        const keybindingsPath = getKeybindingsPath();
        
        if (!keybindingsPath) {
            vscode.window.showErrorMessage('❌ 无法找到 keybindings.json 文件路径');
            return;
        }

        // 确保目录存在
        const dir = path.dirname(keybindingsPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // 读取或创建 keybindings.json
        let keybindings: any[] = [];
        if (fs.existsSync(keybindingsPath)) {
            const content = fs.readFileSync(keybindingsPath, 'utf8');
            try {
                keybindings = content.trim() ? JSON.parse(content) : [];
            } catch (error) {
                vscode.window.showWarningMessage('⚠️ keybindings.json 格式有误，将创建新配置');
                keybindings = [];
            }
        }

        // 移除可能存在的旧配置
        keybindings = keybindings.filter(
            (kb: any) => !(
                (kb.key === keybinding || kb.key === generateOnlyKeybinding || kb.key === testProgressKeybinding) && 
                (kb.command === 'runCommands' || 
                 kb.command === 'auto-commit-assistant.commitWithGenerate' || 
                 kb.command === 'auto-commit-assistant.generateOnly' ||
                 kb.command === 'auto-commit-assistant.testProgress')
            )
        );

        // 添加完整提交配置
        keybindings.push({
            key: keybinding,
            command: 'auto-commit-assistant.commitWithGenerate'
        });

        // 添加仅生成信息配置
        keybindings.push({
            key: generateOnlyKeybinding,
            command: 'auto-commit-assistant.generateOnly'
        });

        // 添加测试进度配置
        keybindings.push({
            key: testProgressKeybinding,
            command: 'auto-commit-assistant.testProgress'
        });

        // 写入文件（带注释）
        const fileContent = generateKeybindingsContent(keybindings, keybinding, generateOnlyKeybinding, testProgressKeybinding, enablePush);
        fs.writeFileSync(
            keybindingsPath,
            fileContent,
            'utf8'
        );

        vscode.window.showInformationMessage(
            `✅ 快捷键已配置成功！\n\n` +
            `${keybinding}：一键提交（保存 → 暂存 → 生成信息 → 提交${enablePush ? ' → 推送' : ''}）\n` +
            `${generateOnlyKeybinding}：仅生成信息（保存 → 暂存 → 生成信息，可查看后再手动提交）\n` +
            `${testProgressKeybinding}：测试模式（仅显示进度，不执行实际操作）`
        );
    } catch (error) {
        vscode.window.showErrorMessage(`❌ 配置快捷键失败：${error}`);
    }
}

/**
 * 生成带注释的 keybindings.json 内容
 * @param keybindings - 快捷键配置数组
 * @param commitKey - 完整提交快捷键
 * @param generateOnlyKey - 仅生成信息快捷键
 * @param testProgressKey - 测试进度快捷键
 * @param enablePush - 是否启用推送
 * @returns 格式化的 JSON 字符串（带注释）
 */
function generateKeybindingsContent(keybindings: any[], commitKey: string, generateOnlyKey: string, testProgressKey: string, enablePush: boolean): string {
    const lines: string[] = ['['];
    
    for (let i = 0; i < keybindings.length; i++) {
        const kb = keybindings[i];
        const isLast = i === keybindings.length - 1;
        
        // 如果是完整提交配置，添加详细注释
        if (kb.key === commitKey && kb.command === 'auto-commit-assistant.commitWithGenerate') {
            lines.push('    // ================================================');
            lines.push('    // AI Auto Commit Assistant - 一键提交配置');
            lines.push('    // ================================================');
            lines.push('    // 快捷键：' + kb.key);
            lines.push('    // 功能：自动执行完整的提交流程');
            lines.push('    //');
            lines.push('    // 执行步骤：');
            lines.push('    // 1. 保存所有文件');
            lines.push('    // 2. 暂存所有更改 (git add .)');
            lines.push('    // 3. 使用 AI 生成提交信息');
            lines.push('    // 4. 自动提交 (git commit)');
            if (enablePush) {
                lines.push('    // 5. 推送到远程 (git push)');
            }
            lines.push('    //');
            lines.push('    // ✅ 执行完成后会显示模态弹窗提示');
            lines.push('    // 💡 推荐：适合确定更改无误，希望快速提交的场景');
            lines.push('    // ================================================');
        }
        // 如果是仅生成信息配置，添加详细注释
        else if (kb.key === generateOnlyKey && kb.command === 'auto-commit-assistant.generateOnly') {
            lines.push('    // ================================================');
            lines.push('    // AI Auto Commit Assistant - 仅生成提交信息');
            lines.push('    // ================================================');
            lines.push('    // 快捷键：' + kb.key);
            lines.push('    // 功能：生成 AI 提交信息，但不自动提交');
            lines.push('    //');
            lines.push('    // 执行步骤：');
            lines.push('    // 1. 保存所有文件');
            lines.push('    // 2. 暂存所有更改 (git add .)');
            lines.push('    // 3. 使用 AI 生成提交信息');
            lines.push('    //');
            lines.push('    // ✅ 执行完成后会显示模态弹窗提示，并可打开源代码管理面板');
            lines.push('    // 💡 推荐：生成后可在源代码管理面板查看和修改提交信息');
            lines.push('    // 💡 确认无误后，点击"提交"按钮或按 Ctrl+Enter 完成提交');
            lines.push('    // ================================================');
        }
        // 如果是测试进度配置，添加详细注释
        else if (kb.key === testProgressKey && kb.command === 'auto-commit-assistant.testProgress') {
            lines.push('    // ================================================');
            lines.push('    // AI Auto Commit Assistant - 测试模式（仅用于调试）');
            lines.push('    // ================================================');
            lines.push('    // 快捷键：' + kb.key);
            lines.push('    // 功能：测试进度显示和完成提示，不执行实际 git 操作');
            lines.push('    //');
            lines.push('    // ⚠️ 注意：这是测试模式，不会执行任何实际的 git 操作');
            lines.push('    // 💡 用途：调试插件功能，测试进度条和完成提示是否正常显示');
            lines.push('    // 🔧 开发调试专用，生产环境可以删除此配置');
            lines.push('    // ================================================');
        }
        
        // 生成配置项的 JSON
        const jsonStr = JSON.stringify(kb, null, 4);
        const indentedJson = jsonStr.split('\n').map((line, idx) => {
            if (idx === 0) {
                return '    ' + line;
            }
            return '    ' + line;
        }).join('\n');
        
        lines.push(indentedJson + (isLast ? '' : ','));
        
        // 在配置项之间添加空行
        if (!isLast) {
            lines.push('');
        }
    }
    
    lines.push(']');
    return lines.join('\n');
}

/**
 * 获取 keybindings.json 文件路径
 * @returns 文件路径或 null
 */
function getKeybindingsPath(): string | null {
    const appName = vscode.env.appName.toLowerCase();
    const userHome = os.homedir();
    
    let configDir: string;

    if (process.platform === 'win32') {
        const appData = process.env.APPDATA || path.join(userHome, 'AppData', 'Roaming');
        
        // 判断是 Cursor 还是 VSCode
        if (appName.includes('cursor')) {
            configDir = path.join(appData, 'Cursor', 'User');
        } else {
            configDir = path.join(appData, 'Code', 'User');
        }
    } else if (process.platform === 'darwin') {
        // macOS
        if (appName.includes('cursor')) {
            configDir = path.join(userHome, 'Library', 'Application Support', 'Cursor', 'User');
        } else {
            configDir = path.join(userHome, 'Library', 'Application Support', 'Code', 'User');
        }
    } else {
        // Linux
        if (appName.includes('cursor')) {
            configDir = path.join(userHome, '.config', 'Cursor', 'User');
        } else {
            configDir = path.join(userHome, '.config', 'Code', 'User');
        }
    }

    return path.join(configDir, 'keybindings.json');
}

/**
 * 配置或合并 .cursorrules 文件
 * @param showPrompt - 是否显示查看文件的询问框
 * @returns 配置文件的路径（如果成功）
 */
async function setupCursorRules(showPrompt: boolean = true): Promise<string | undefined> {
    try {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showWarningMessage('⚠️ 请先打开一个工作区');
            return;
        }

        const rootPath = workspaceFolders[0].uri.fsPath;
        const cursorRulesPath = path.join(rootPath, '.cursorrules');

        // Git 提交规则模板
        const gitCommitRules = `# Git 提交信息规则
When generating git commit messages, please follow these rules STRICTLY:

## 严格遵循以下格式模板：

<类型>(<范围>): <主题>

<正文>

<页脚>

## 类型选项（必须首字母大写）：
- Feat: 新功能
- Fix: 修复 bug
- Docs: 文档更新
- Style: 代码格式调整（不影响代码运行）
- Refactor: 代码重构
- Test: 添加测试
- Chore: 构建过程或辅助工具的变动
- Perf: 性能优化
- Ci: CI/CD 相关变更
- Revert: 回滚之前的提交

## 格式要求（必须严格遵守）：

### 标题行（必填）：
1. **类型**：使用英文，首字母必须大写（如 Feat、Fix、Docs）
2. **范围**：使用中文，放在括号中（如：问卷、后台、前端、记录页面）
3. **主题**：使用中文描述
4. **格式示例**：\`Feat(记录页面): 调整记录表格样式\`

### 正文（⚠️ 重要）：
- **必须分析所有暂存的文件变更（git staged changes）**
- **必须列出所有重要的变更点，不要遗漏任何文件的修改**
- 必须与标题之间空一行
- 使用中文描述
- 每个变更点必须以 \`- \` 开头（项目符号）
- 每行不超过 72 个字符
- 如果有多个文件变更，每个文件的主要变更都应该有对应的说明

### 页脚（可选）：
- 用于关联 issue 或 breaking changes

## 完整示例：

### 示例 1（推荐格式）：
\`\`\`
Feat(问卷): 添加卡片模式展示功能

- 在发布配置页面添加显示模式选择器
- 支持正常模式和卡片模式切换
- 实现卡片翻页式问卷展示
- 添加答题进度显示和导航按钮
\`\`\`

### 示例 2（记录页面样式调整）：
\`\`\`
Style(记录页面): 调整记录表格样式以提升视觉效果

- 修改记录表格主体单元格背景为透明，增强整体美观性
- 更新表格底部边框颜色，提升视觉层次感
- 调整表格行悬停时的背景色，优化用户交互体验
\`\`\`

### 示例 3（Bug 修复）：
\`\`\`
Fix(登录模块): 修复用户登录失败的问题

- 修复密码验证逻辑错误
- 添加登录失败的错误提示
\`\`\`

## ⚠️ 常见错误（不要这样写）：

❌ 错误示例 1（类型小写）：
\`\`\`
feat(记录页面): 调整记录表格样式
\`\`\`

❌ 错误示例 2（正文没有项目符号）：
\`\`\`
Style(记录页面): 调整记录表格样式

修改记录表格主体单元格背景为透明
更新表格底部边框颜色
\`\`\`

✅ 正确格式：
\`\`\`
Style(记录页面): 调整记录表格样式

- 修改记录表格主体单元格背景为透明
- 更新表格底部边框颜色
\`\`\`
`;

        // 检查文件是否存在
        if (fs.existsSync(cursorRulesPath)) {
            const existingContent = fs.readFileSync(cursorRulesPath, 'utf8');
            
            // 检查是否已包含 Git 提交规则
            if (existingContent.includes('When generating git commit messages')) {
                vscode.window.showInformationMessage('ℹ️ .cursorrules 已包含 Git 提交规则');
                return cursorRulesPath;
            }

            // 合并规则
            const mergedContent = existingContent + '\n\n' + gitCommitRules;
            fs.writeFileSync(cursorRulesPath, mergedContent, 'utf8');
            
            vscode.window.showInformationMessage('✅ Git 提交规则已合并到现有 .cursorrules 文件');
        } else {
            // 创建新文件
            fs.writeFileSync(cursorRulesPath, gitCommitRules, 'utf8');
            vscode.window.showInformationMessage('✅ .cursorrules 文件已创建');
        }

        // 如果需要显示询问框（单独调用命令时）
        if (showPrompt) {
            const openFile = await vscode.window.showInformationMessage(
                '是否查看 .cursorrules 文件？',
                '查看',
                '稍后'
            );

            if (openFile === '查看') {
                const document = await vscode.workspace.openTextDocument(cursorRulesPath);
                await vscode.window.showTextDocument(document);
            }
        }
        
        return cursorRulesPath;
    } catch (error) {
        vscode.window.showErrorMessage(`❌ 配置 Cursor 规则失败：${error}`);
    }
}

/**
 * 执行一键提交流程（Ctrl+G Ctrl+G）
 */
async function executeCommitWithGenerate() {
    try {
        const config = vscode.workspace.getConfiguration('autoCommitAssistant');
        const enablePush = config.get<boolean>('enablePush', false);

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "AI Auto Commit",
            cancellable: false
        }, async (progress) => {
            // 1. 保存所有文件
            progress.report({ increment: 0, message: "保存文件..." });
            await vscode.commands.executeCommand('workbench.action.files.saveAll');
            await delay(300);

            // 2. 暂存所有更改
            progress.report({ increment: 25, message: "暂存更改..." });
            await vscode.commands.executeCommand('git.stageAll');
            await delay(500);

            // 3. 生成提交信息
            progress.report({ increment: 25, message: "AI 生成提交信息..." });
            await vscode.commands.executeCommand('cursor.generateGitCommitMessage');
            await delay(2000); // 等待 AI 生成完成

            // 4. 提交
            progress.report({ increment: 25, message: "提交更改..." });
            await vscode.commands.executeCommand('git.commit');
            await delay(500);

            // 5. 推送（如果启用）
            if (enablePush) {
                progress.report({ increment: 25, message: "推送到远程..." });
                await vscode.commands.executeCommand('git.push');
            }
        });

        // 显示完成提示
        if (enablePush) {
            await vscode.window.showInformationMessage(
                '✅ 已自动提交并推送！\n\n' +
                '🎉 提交已完成并推送到远程仓库',
                { modal: true },
                '知道了'
            );
        } else {
            await vscode.window.showInformationMessage(
                '✅ 已自动提交成功！\n\n' +
                '💡 提交已完成，未推送到远程\n' +
                '👉 下一步：请在源代码管理中手动点击"推送"按钮',
                { modal: true },
                '知道了',
                '取消'
            );
        }
    } catch (error) {
        vscode.window.showErrorMessage(`❌ 提交失败：${error}`);
    }
}

/**
 * 执行仅生成提交信息流程（Ctrl+T Ctrl+T）
 */
async function executeGenerateOnly() {
    try {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "AI Auto Commit",
            cancellable: false
        }, async (progress) => {
            // 1. 保存所有文件
            progress.report({ increment: 0, message: "保存文件..." });
            await vscode.commands.executeCommand('workbench.action.files.saveAll');
            await delay(300);

            // 2. 暂存所有更改
            progress.report({ increment: 33, message: "暂存更改..." });
            await vscode.commands.executeCommand('git.stageAll');
            await delay(500);

            // 3. 生成提交信息
            progress.report({ increment: 34, message: "AI 生成提交信息..." });
            await vscode.commands.executeCommand('cursor.generateGitCommitMessage');
            await delay(2000); // 等待 AI 生成完成
        });

        // 显示完成提示
        const selection = await vscode.window.showInformationMessage(
            '✅ 已生成提交信息！\n\n' +
            '📝 提交信息已填入源代码管理面板\n' +
            '👉 下一步：查看提交信息并点击"提交"按钮（或按 Ctrl+Enter）',
            { modal: true },
            '打开源代码管理',
            '知道了'
        );

        if (selection === '打开源代码管理') {
            await vscode.commands.executeCommand('workbench.view.scm');
        }
    } catch (error) {
        vscode.window.showErrorMessage(`❌ 生成提交信息失败：${error}`);
    }
}

/**
 * 执行测试进度显示（Ctrl+R Ctrl+R）
 * 仅用于调试，不执行实际的 git 操作
 */
async function executeTestProgress() {
    try {
        const config = vscode.workspace.getConfiguration('autoCommitAssistant');
        const enablePush = config.get<boolean>('enablePush', false);

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "🧪 测试模式 - AI Auto Commit",
            cancellable: false
        }, async (progress) => {
            // 1. 模拟保存所有文件
            progress.report({ increment: 0, message: "保存文件... (模拟)" });
            await delay(500);

            // 2. 模拟暂存所有更改
            progress.report({ increment: 25, message: "暂存更改... (模拟)" });
            await delay(500);

            // 3. 模拟生成提交信息
            progress.report({ increment: 25, message: "AI 生成提交信息... (模拟)" });
            await delay(1500);

            // 4. 模拟提交
            progress.report({ increment: 25, message: "提交更改... (模拟)" });
            await delay(500);

            // 5. 模拟推送（如果启用）
            if (enablePush) {
                progress.report({ increment: 25, message: "推送到远程... (模拟)" });
                await delay(500);
            }
        });

        // 显示完成提示
        if (enablePush) {
            await vscode.window.showInformationMessage(
                '🧪 测试完成！（未执行实际操作）\n\n' +
                '✅ 已模拟：保存 → 暂存 → 生成 → 提交 → 推送\n\n' +
                '💡 这是测试模式，没有执行任何实际的 git 操作\n' +
                '👉 使用 Ctrl+G Ctrl+G 执行真实的提交流程',
                { modal: true },
                '知道了'
            );
        } else {
            await vscode.window.showInformationMessage(
                '🧪 测试完成！（未执行实际操作）\n\n' +
                '✅ 已模拟：保存 → 暂存 → 生成 → 提交\n\n' +
                '💡 这是测试模式，没有执行任何实际的 git 操作\n' +
                '👉 使用 Ctrl+G Ctrl+G 执行真实的提交流程',
                { modal: true },
                '知道了'
            );
        }
    } catch (error) {
        vscode.window.showErrorMessage(`❌ 测试失败：${error}`);
    }
}

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 插件停用时调用
 */
export function deactivate() {
    console.log('AI Auto Commit Assistant 已停用');
}

