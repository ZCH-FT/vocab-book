import { onBeforeUnmount,onMounted,ref } from 'vue'

interface PullToRefreshOptions {
    // 返回 false 时临时禁用（弹窗打开、首屏加载中）
    enabled?: () => boolean
    // 触发刷新所需的下拉距离
    threshold?: number
    // 最大可下拉距离（阻尼之后）
    maxDistance?: number
}

/**
 * 下拉刷新。
 * 只在页面滚到顶部时接管手势，其余情况把滚动交还给浏览器。
 * 手势本身提供反馈，所以调用方的请求应当走 silent，不显示骨架屏。
 */
export function usePullToRefresh(onRefresh: () => Promise<unknown>, options: PullToRefreshOptions = {}) {
    const threshold = options.threshold ?? 64
    const maxDistance = options.maxDistance ?? 96

    const distance = ref(0)      // 已经阻尼过的下拉距离
    const pulling = ref(false)   // 手指是否正在下拉
    const refreshing = ref(false) // 松开后是否正在等待请求完成

    let startY = 0
    let active = false

    function isEnabled() {
        return options.enabled ? options.enabled() : true
    }

    function onTouchStart(e: TouchEvent) {
        if (!isEnabled() || refreshing.value) {
            return
        }
        // 不在顶部就不接管，避免抢走正常滚动
        if (window.scrollY > 0) {
            return
        }
        const target = e.target as HTMLElement | null
        // 输入框、下拉、弹窗内部的拖动不算下拉刷新
        if (target && target.closest('input, textarea, select, .el-select, .el-overlay, .el-dialog')) {
            return
        }
        startY = e.touches[0].clientY
        active = true
    }

    function onTouchMove(e: TouchEvent) {
        if (!active) {
            return
        }
        const dy = e.touches[0].clientY - startY
        if (dy <= 0) {
            distance.value = 0
            pulling.value = false
            return
        }
        // 阻尼：手指移动 2px，内容只下移 1px，越拉越沉
        distance.value = Math.min(dy * 0.5, maxDistance)
        pulling.value = true
        // 阻止浏览器自己的下拉刷新与回弹
        if (e.cancelable) {
            e.preventDefault()
        }
    }

    async function onTouchEnd() {
        if (!active) {
            return
        }
        active = false
        pulling.value = false
        if (distance.value >= threshold) {
            distance.value = threshold   // 停在阈值位置，露出转圈
            refreshing.value = true
            try {
                await onRefresh()
            } finally {
                refreshing.value = false
                distance.value = 0
            }
        } else {
            distance.value = 0
        }
    }

    onMounted(() => {
        window.addEventListener('touchstart', onTouchStart, { passive: true })
        // 需要 preventDefault，必须是非 passive
        window.addEventListener('touchmove', onTouchMove, { passive: false })
        window.addEventListener('touchend', onTouchEnd)
        window.addEventListener('touchcancel', onTouchEnd)
    })

    onBeforeUnmount(() => {
        window.removeEventListener('touchstart', onTouchStart)
        window.removeEventListener('touchmove', onTouchMove)
        window.removeEventListener('touchend', onTouchEnd)
        window.removeEventListener('touchcancel', onTouchEnd)
    })

    return {distance, pulling, refreshing, threshold}
}
