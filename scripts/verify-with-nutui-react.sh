#!/bin/bash
set -e

ICONS_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REACT_DIR="$(cd "$ICONS_DIR/../nutui-react" 2>/dev/null && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_step() { echo -e "\n${GREEN}=== $1 ===${NC}"; }
log_warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_ok() { echo -e "${GREEN}✅ $1${NC}"; }

if [ ! -d "$REACT_DIR" ]; then
    log_error "nutui-react 项目不存在: $ICONS_DIR/../nutui-react"
    echo "请确保 nutui-react 与 nutui-icons 在同一目录下"
    exit 1
fi

log_step "1/6 构建 icons-react"
cd "$ICONS_DIR/packages/icons-react"
pnpm build
log_ok "icons-react 构建成功"

log_step "2/6 构建 icons-react-taro"
cd "$ICONS_DIR/packages/icons-react-taro"
pnpm build
log_ok "icons-react-taro 构建成功"

log_step "3/6 Link 本地 icons 到 nutui-react"
cd "$REACT_DIR"
pnpm link "$ICONS_DIR/packages/icons-react"
pnpm link "$ICONS_DIR/packages/icons-react-taro"
log_ok "Link 完成"

VERIFY_FAILED=0

log_step "4/6 TypeScript 类型检查 (H5)"
if pnpm run checked; then
    log_ok "H5 类型检查通过"
else
    log_error "H5 类型检查失败"
    VERIFY_FAILED=1
fi

log_step "5/6 TypeScript 类型检查 (Taro)"
if pnpm run checked:taro; then
    log_ok "Taro 类型检查通过"
else
    log_error "Taro 类型检查失败"
    VERIFY_FAILED=1
fi

log_step "6/6 运行单元测试"
if pnpm test -- --run; then
    log_ok "单元测试通过"
else
    log_error "单元测试失败"
    VERIFY_FAILED=1
fi

log_step "清理: 取消 link"
cd "$REACT_DIR"
pnpm unlink "@nutui/icons-react" 2>/dev/null || true
pnpm unlink "@nutui/icons-react-taro" 2>/dev/null || true
pnpm install
log_ok "Link 已清理"

echo ""
if [ $VERIFY_FAILED -eq 0 ]; then
    log_ok "联动验证全部通过！Icons 升级安全。"
else
    log_error "联动验证存在失败项，请检查上方日志。"
    exit 1
fi
