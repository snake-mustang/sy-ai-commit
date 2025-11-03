# AI Auto Commit Assistant - 配置检查脚本

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "  AI Auto Commit Assistant 配置检查" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# 检查 keybindings.json (Cursor)
Write-Host "`n[1] 检查 Cursor keybindings.json..." -ForegroundColor Yellow
$cursorPath = "$env:APPDATA\Cursor\User\keybindings.json"
if (Test-Path $cursorPath) {
    Write-Host "✅ 文件存在: $cursorPath" -ForegroundColor Green
    $content = Get-Content $cursorPath -Raw
    if ($content -match "ctrl\+g ctrl\+g") {
        Write-Host "✅ 发现快捷键配置 ctrl+g ctrl+g" -ForegroundColor Green
    } else {
        Write-Host "⚠️  未找到快捷键配置" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ 文件不存在" -ForegroundColor Red
}

# 检查 keybindings.json (VS Code)
Write-Host "`n[2] 检查 VS Code keybindings.json..." -ForegroundColor Yellow
$vscodePath = "$env:APPDATA\Code\User\keybindings.json"
if (Test-Path $vscodePath) {
    Write-Host "✅ 文件存在: $vscodePath" -ForegroundColor Green
    $content = Get-Content $vscodePath -Raw
    if ($content -match "ctrl\+g ctrl\+g") {
        Write-Host "✅ 发现快捷键配置 ctrl+g ctrl+g" -ForegroundColor Green
    } else {
        Write-Host "⚠️  未找到快捷键配置" -ForegroundColor Yellow
    }
} else {
    Write-Host "ℹ️  文件不存在（可能未使用 VS Code）" -ForegroundColor Gray
}

# 提示：需要在测试项目中检查
Write-Host "`n[3] 检查 .cursorrules 文件..." -ForegroundColor Yellow
Write-Host "ℹ️  请在测试项目的根目录查找 .cursorrules 文件" -ForegroundColor Gray
Write-Host "   示例：cd 到测试项目目录，然后运行:" -ForegroundColor Gray
Write-Host "   Get-Item .cursorrules -Force" -ForegroundColor Cyan

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "检查完成！" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan

Write-Host "`n💡 提示：" -ForegroundColor Yellow
Write-Host "- 如果未找到配置，请先运行插件测试（按F5启动调试）" -ForegroundColor White
Write-Host "- 在扩展开发宿主窗口打开项目并点击配置提示" -ForegroundColor White
Write-Host "- 或手动执行命令：Ctrl+Shift+P → AI Auto Commit: 初始化配置" -ForegroundColor White
Write-Host ""

