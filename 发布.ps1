# AI Auto Commit Assistant 发布脚本
# 用途：一键发布插件到 VSCode Marketplace

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI Auto Commit Assistant 发布工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 读取当前版本
$packageJson = Get-Content -Path "package.json" -Raw | ConvertFrom-Json
$version = $packageJson.version
Write-Host "📦 当前版本: v$version" -ForegroundColor Green
Write-Host ""

# 询问发布方式
Write-Host "请选择发布方式：" -ForegroundColor Yellow
Write-Host "1. 发布到 VSCode Marketplace" -ForegroundColor White
Write-Host "2. 发布到 Open VSX Registry" -ForegroundColor White
Write-Host "3. 同时发布到两个平台" -ForegroundColor White
Write-Host "4. 仅打包不发布" -ForegroundColor White
Write-Host ""

$choice = Read-Host "请输入选项 (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🚀 开始发布到 VSCode Marketplace..." -ForegroundColor Green
        Write-Host ""
        
        # 检查是否已登录
        Write-Host "💡 提示：如果未登录，请先运行: vsce login sy-ai-commit" -ForegroundColor Yellow
        Write-Host ""
        
        $confirm = Read-Host "是否继续发布？(y/n)"
        if ($confirm -eq "y" -or $confirm -eq "Y") {
            # 编译
            Write-Host "📝 正在编译..." -ForegroundColor Cyan
            npm run compile
            
            # 发布
            Write-Host "📤 正在发布..." -ForegroundColor Cyan
            vsce publish
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✅ 发布成功！" -ForegroundColor Green
                Write-Host "🔗 查看地址：https://marketplace.visualstudio.com/items?itemName=sy-ai-commit.sy-ai-commit" -ForegroundColor Cyan
            } else {
                Write-Host ""
                Write-Host "❌ 发布失败，请检查错误信息" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ 已取消发布" -ForegroundColor Yellow
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "🚀 开始发布到 Open VSX Registry..." -ForegroundColor Green
        Write-Host ""
        
        # 检查 ovsx 是否安装
        $ovsxInstalled = Get-Command ovsx -ErrorAction SilentlyContinue
        if (-not $ovsxInstalled) {
            Write-Host "⚠️  未找到 ovsx 工具" -ForegroundColor Yellow
            Write-Host "正在安装 ovsx..." -ForegroundColor Cyan
            npm install -g ovsx
        }
        
        # 获取 Token
        $token = Read-Host "请输入 Open VSX Access Token（或按 Enter 使用环境变量 OVSX_PAT）"
        if ([string]::IsNullOrWhiteSpace($token)) {
            if ($env:OVSX_PAT) {
                $token = $env:OVSX_PAT
                Write-Host "✅ 使用环境变量中的 Token" -ForegroundColor Green
            } else {
                Write-Host "❌ 未找到 Token，请设置环境变量 OVSX_PAT 或手动输入" -ForegroundColor Red
                exit 1
            }
        }
        
        # 编译
        Write-Host "📝 正在编译..." -ForegroundColor Cyan
        npm run compile
        
        # 发布
        Write-Host "📤 正在发布..." -ForegroundColor Cyan
        ovsx publish -p $token
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ 发布成功！" -ForegroundColor Green
            Write-Host "🔗 查看地址：https://open-vsx.org/extension/sy-ai-commit/sy-ai-commit" -ForegroundColor Cyan
        } else {
            Write-Host ""
            Write-Host "❌ 发布失败，请检查错误信息" -ForegroundColor Red
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "🚀 开始发布到两个平台..." -ForegroundColor Green
        Write-Host ""
        
        # 编译
        Write-Host "📝 正在编译..." -ForegroundColor Cyan
        npm run compile
        
        # 发布到 VSCode Marketplace
        Write-Host ""
        Write-Host "📤 [1/2] 发布到 VSCode Marketplace..." -ForegroundColor Cyan
        vsce publish
        $vscodeSuccess = $LASTEXITCODE -eq 0
        
        # 发布到 Open VSX
        Write-Host ""
        Write-Host "📤 [2/2] 发布到 Open VSX..." -ForegroundColor Cyan
        
        if ($env:OVSX_PAT) {
            ovsx publish -p $env:OVSX_PAT
            $ovsxSuccess = $LASTEXITCODE -eq 0
        } else {
            Write-Host "⚠️  未设置 OVSX_PAT 环境变量，跳过 Open VSX 发布" -ForegroundColor Yellow
            $ovsxSuccess = $false
        }
        
        # 总结
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "发布结果：" -ForegroundColor Cyan
        if ($vscodeSuccess) {
            Write-Host "✅ VSCode Marketplace: 成功" -ForegroundColor Green
        } else {
            Write-Host "❌ VSCode Marketplace: 失败" -ForegroundColor Red
        }
        
        if ($ovsxSuccess) {
            Write-Host "✅ Open VSX: 成功" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Open VSX: 跳过或失败" -ForegroundColor Yellow
        }
        Write-Host "========================================" -ForegroundColor Cyan
    }
    
    "4" {
        Write-Host ""
        Write-Host "📦 正在打包..." -ForegroundColor Green
        Write-Host ""
        
        npm run package
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ 打包成功！" -ForegroundColor Green
            Write-Host "📦 文件位置：sy-ai-commit-$version.vsix" -ForegroundColor Cyan
        } else {
            Write-Host ""
            Write-Host "❌ 打包失败" -ForegroundColor Red
        }
    }
    
    default {
        Write-Host "❌ 无效的选项" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "完成！按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

