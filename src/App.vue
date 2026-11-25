<script setup lang="ts">
import { onMounted,onBeforeUnmount } from 'vue'
import { useWordsStore } from './stores/words'
const wordsStore = useWordsStore()

// 首次加载放在入口，而不是 store 的 setup 里：
// 「什么时候取数」由入口决定，store 只负责「怎么取」。
// 这里同步调用，子组件渲染前 loading 已经是 true，列表不会先闪一下空态。
wordsStore.refresh()

function syncOnReturn() {
    if (document.visibilityState === 'visible') {
        wordsStore.refresh({ silent: true })
    }
}
function syncOnReconnect() {
    wordsStore.refresh({ silent: true })
}
onMounted(() => {
    document.addEventListener('visibilitychange', syncOnReturn)
    window.addEventListener('online', syncOnReconnect)
})
onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', syncOnReturn)
    window.removeEventListener('online', syncOnReconnect)
})
</script>

<template>
    <div class="page">
        <div class="nav-row">
        <RouterLink to="/">单词本</RouterLink>
        <RouterLink to="/quiz">单词测验</RouterLink>
        </div>
        <RouterView></RouterView>
    </div>
</template>
<style scoped>
.nav-row {
    display:flex;
    gap:var(--space-sm);
    margin-bottom:var(--space-lg);
}
.nav-row a {
    text-decoration:none;
    color:var(--color-text-muted);
    display:inline-block;
    padding: 6px 12px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
}
.nav-row a:hover {
    background:#f5f5f5;
}
.nav-row a:focus-visible {
    outline:none;
    border-color:var(--color-primary);
    box-shadow:0 0 0 3px var(--color-primary-soft);      
}
.nav-row a.router-link-active {
    background:var(--color-primary);
    border-color:var(--color-primary);
    color:#fff;
}
</style>