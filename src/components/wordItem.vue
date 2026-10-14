<script setup lang="ts">
defineProps<{
    word: {id: number; en: string;zh: string;mastered: boolean}
}>()
const emit = defineEmits<{
    (e:'remove',id:number):void
    (e:'toggle',id:number):void
    (e:'edit',id:number):void
}>()
</script>
<template>
    <li class="word-item" :class="{ mastered: word.mastered}">
        <el-checkbox :model-value="word.mastered" @change="emit('toggle',word.id)"/>
        <div class="text">
          <span class="en">{{ word.en }}</span>
          <span class="zh">{{ word.zh }}</span>
        </div>
        <el-button text @click="emit('edit',word.id)">编辑</el-button>
        <el-button text type="danger" @click="emit('remove',word.id)">删除</el-button>
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
.word-item :hover {
  border-color: var(--color-border);
}
.word-item .text {
  flex:1;
  display:flex;
  gap:var(--space-sm);
}
.word-item .text .en {
  font-size:16px;
}
.word-item .text .zh {
  color:var(--color-text-muted);
  font-size:14px;
}
.word-item.mastered .text {
  text-decoration: line-through;
  color: var(--color-text-muted);
}
</style>