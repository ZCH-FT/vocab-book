<script setup lang="ts">
defineProps<{
    word: {id: number; en: string;zh: string;mastered: boolean}
}>()
const emit = defineEmits<{
    (e:'remove',id:number):void
    (e:'toggle',id:number):void
}>()
</script>
<template>
    <li class="word-item" :class="{ mastered: word.mastered}">
        <input type="checkbox" :checked="word.mastered" @change="emit('toggle',word.id)"/>
        <span class="text">{{ word.en }}|{{ word.zh }}</span>
        <el-button type="danger" @click="emit('remove',word.id)">删除</el-button>
    </li>
</template>
<style scoped>
.word-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 10px 12px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-md);
}
.word-item .text {
  flex: 1;
  font-size: 16px;
}
.word-item.mastered .text {
  text-decoration: line-through;
  color: var(--color-text-muted);
}
</style>