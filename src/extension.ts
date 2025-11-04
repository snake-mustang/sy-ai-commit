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

    // 注册命令：显示生成完成提示（用于 Ctrl+T Ctrl+T）
    const showGenerateCompleteHintCommand = vscode.commands.registerCommand(
        'auto-commit-assistant.showGenerateCompleteHint',
        async () => {
            const selection = await vscode.window.showInformationMessage(
                '✅ 已生成提交信息！\n\n' +
                '📝 提交信息已填入源代码管理面板\n' +
                '👉 下一步：查看提交信息并点击"提交"按钮（或按 Ctrl+Enter）',
                { modal: true },  // 使用模态对话框，更明显
                '打开源代码管理',
                '知道了'
            );
            
            if (selection === '打开源代码管理') {
                vscode.commands.executeCommand('workbench.view.scm');
            }
        }
    );

    // 注册命令：显示提交完成提示（用于 Ctrl+G Ctrl+G）
    const showCommitCompleteHintCommand = vscode.commands.registerCommand(
        'auto-commit-assistant.showCommitCompleteHint',
        async () => {
            const config = vscode.workspace.getConfiguration('autoCommitAssistant');
            const enablePush = config.get<boolean>('enablePush', false);
            
            if (enablePush) {
                await vscode.window.showInformationMessage(
                    '✅ 已自动提交并推送！\n\n' +
                    '🎉 提交已完成并推送到远程仓库',
                    { modal: true },  // 使用模态对话框，更明显
                    '知道了'
                );
            } else {
                await vscode.window.showInformationMessage(
                    '✅ 已自动提交成功！\n\n' +
                    '💡 提交已完成，未推送到远程\n' +
                    '👉 下一步：请在源代码管理中手动点击"推送"按钮',
                    { modal: true },  // 使用模态对话框，更明显
                    '知道了',
                    '取消'
                );
            }
        }
    );

    context.subscriptions.push(setupCommand, showGenerateCompleteHintCommand, showCommitCompleteHintCommand);

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

        // 构建完整提交命令列表（ctrl+g ctrl+g）
        const fullCommands = [
            'workbench.action.files.save',
            'git.stageAll',
            'cursor.generateGitCommitMessage',
            'git.commit',
            'auto-commit-assistant.showCommitCompleteHint'  // 添加提交完成提示
        ];

        if (enablePush) {
            // 如果启用了自动推送，在 commit 后、提示前添加 push
            fullCommands.splice(4, 0, 'git.push');
        }

        // 构建仅生成信息命令列表（ctrl+t ctrl+t）
        const generateOnlyCommands = [
            'workbench.action.files.save',
            'git.stageAll',
            'cursor.generateGitCommitMessage',
            'auto-commit-assistant.showGenerateCompleteHint'  // 添加生成完成提示
        ];

        // 移除可能存在的旧配置
        keybindings = keybindings.filter(
            (kb: any) => !(
                (kb.key === keybinding || kb.key === generateOnlyKeybinding) && 
                kb.command === 'runCommands'
            )
        );

        // 添加完整提交配置
        keybindings.push({
            key: keybinding,
            command: 'runCommands',
            args: {
                commands: fullCommands
            }
        });

        // 添加仅生成信息配置
        keybindings.push({
            key: generateOnlyKeybinding,
            command: 'runCommands',
            args: {
                commands: generateOnlyCommands
            }
        });

        // 写入文件（带注释）
        const fileContent = generateKeybindingsContent(keybindings, keybinding, generateOnlyKeybinding, enablePush);
        fs.writeFileSync(
            keybindingsPath,
            fileContent,
            'utf8'
        );

        vscode.window.showInformationMessage(
            `✅ 快捷键已配置成功！\n\n` +
            `${keybinding}：一键提交（保存 → 暂存 → 生成信息 → 提交${enablePush ? ' → 推送' : ''}）\n` +
            `${generateOnlyKeybinding}：仅生成信息（保存 → 暂存 → 生成信息，可查看后再手动提交）`
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
 * @param enablePush - 是否启用推送
 * @returns 格式化的 JSON 字符串（带注释）
 */
function generateKeybindingsContent(keybindings: any[], commitKey: string, generateOnlyKey: string, enablePush: boolean): string {
    const lines: string[] = ['['];
    
    for (let i = 0; i < keybindings.length; i++) {
        const kb = keybindings[i];
        const isLast = i === keybindings.length - 1;
        
        // 如果是完整提交配置，添加详细注释
        if (kb.key === commitKey && kb.command === 'runCommands') {
            lines.push('    // ================================================');
            lines.push('    // AI Auto Commit Assistant - 一键提交配置');
            lines.push('    // ================================================');
            lines.push('    // 快捷键：' + kb.key);
            lines.push('    // 功能：自动执行完整的提交流程');
            lines.push('    //');
            lines.push('    // 命令说明：');
            lines.push('    // 1. workbench.action.files.save                      - 保存所有文件');
            lines.push('    // 2. git.stageAll                                     - 暂存所有更改 (git add .)');
            lines.push('    // 3. cursor.generateGitCommitMessage                  - 使用 AI 生成提交信息');
            lines.push('    // 4. git.commit                                       - 提交更改 (git commit)');
            if (enablePush) {
                lines.push('    // 5. git.push                                         - 推送到远程 (git push)');
                lines.push('    // 6. auto-commit-assistant.showCommitCompleteHint     - 显示完成提示');
            } else {
                lines.push('    // 5. auto-commit-assistant.showCommitCompleteHint     - 显示完成提示');
            }
            lines.push('    //');
            lines.push('    // ✅ 执行完成后会弹窗提示，并提供下一步操作引导');
            lines.push('    // 💡 推荐：适合确定更改无误，希望快速提交的场景');
            lines.push('    // ================================================');
        }
        // 如果是仅生成信息配置，添加详细注释
        else if (kb.key === generateOnlyKey && kb.command === 'runCommands') {
            lines.push('    // ================================================');
            lines.push('    // AI Auto Commit Assistant - 仅生成提交信息');
            lines.push('    // ================================================');
            lines.push('    // 快捷键：' + kb.key);
            lines.push('    // 功能：生成 AI 提交信息，但不自动提交');
            lines.push('    //');
            lines.push('    // 命令说明：');
            lines.push('    // 1. workbench.action.files.save                        - 保存所有文件');
            lines.push('    // 2. git.stageAll                                       - 暂存所有更改 (git add .)');
            lines.push('    // 3. cursor.generateGitCommitMessage                    - 使用 AI 生成提交信息');
            lines.push('    // 4. auto-commit-assistant.showGenerateCompleteHint     - 显示生成完成提示');
            lines.push('    //');
            lines.push('    // ✅ 执行完成后会弹窗提示，并引导到源代码管理面板');
            lines.push('    // 💡 推荐：生成后可在源代码管理面板查看和修改提交信息');
            lines.push('    // 💡 推荐：确认无误后，点击"提交"按钮或按 Ctrl+Enter 完成提交');
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
When generating git commit messages, please follow these rules:

使用中文生成提交信息，遵循以下模板：

<类型>(<范围>): <主题>

<正文>

<页脚>

类型选项(use English)：
- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- style: 代码格式调整（不影响代码运行）
- refactor: 代码重构
- test: 添加测试
- chore: 构建过程或辅助工具的变动
- perf: 性能优化
- ci: CI/CD 相关变更
- revert: 回滚之前的提交

要求：
- 标题行必填（类型、范围、主题全部使用中文）
- 正文和页脚可选
- 每行不超过 72 个字符（中文字符按 2 个字符计算）
- 各部分之间必须有空行分隔
- 正文提供详细描述，可分多行
- 多个变更使用项目符号列出
- 范围应反映模块/组件名称（如：问卷、后台、前端等）

示例：
Feat(问卷): 添加卡片模式展示功能

管理后台变更：
- 在发布配置页面添加显示模式选择器
- 支持正常模式和卡片模式切换

H5 客户端变更：
- 实现卡片翻页式问卷展示
- 添加答题进度显示和导航按钮
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
 * 插件停用时调用
 */
export function deactivate() {
    console.log('AI Auto Commit Assistant 已停用');
}

