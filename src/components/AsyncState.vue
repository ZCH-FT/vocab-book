<script setup lang="ts">
defineProps<{loading: boolean; error: string | null}>()
const emit = defineEmits<{(e: 'retry'): void}>()
</script>
<template>
    <div v-if="loading" class="state-block">
        <el-skeleton :rows="3" animated />
    </div>
    <div v-else-if="error" class="state-block">
        <p class="state-title">加载失败</p>     
        <p class="state-sub">{{ error }}</p>
        <el-button type="primary" @click="emit('retry')">重试</el-button>
    </div>
    <slot v-else />
</template>
<style scoped>
.state-block {
    padding: var(--space-lg) 0;
    text-align: center;
}
.state-title {
    font-size: 16px;
    margin-bottom: var(--space-sm);
}
.state-sub {
    font-size: 14px;
    color: var(--color-text-muted);
    margin-bottom: var(--space-md);
}

</style>