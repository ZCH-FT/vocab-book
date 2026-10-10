<template>
    <h1>我的单词本</h1>
    <div class="input-row">
        <el-input 
        v-model="newen"
        placeholder="输入英文"
        @keyup.enter = "addword"
        />
        <el-input
        v-model="newzh"
        placeholder="输入中文，点回车或添加"
        @keyup.enter = "addword"
        />
        <el-button type="primary" @click="addword">添加</el-button>
    </div>
    <p class="computed-count">
        共<strong>{{total}}</strong> 个 |
        已掌握<strong>{{medCount}}</strong> 个 |
        未掌握<strong>{{unmedCount}}</strong> 个
    </p>
    <div class="filter-row">
        <el-radio-group v-model="filterType">
            <el-radio-button value="all">全部</el-radio-button>
            <el-radio-button value="mastered">已掌握</el-radio-button>
            <el-radio-button value="unmastered">未掌握</el-radio-button>
        </el-radio-group>
    </div>
    <p v-if="filteredwords.length === 0">{{ total === 0 ? '没有单词，先添加一个' : '没有符合条件的单词'}}</p>
    <ul v-else>
        <wordItem v-for="word in filteredwords" :key="word.id" :word="word" @toggle="toggleword" @remove="removeword"/>
    </ul>
</template>
<script setup lang="ts">
import {ElMessage, ElMessageBox} from 'element-plus'
import { ref,computed } from 'vue'
import wordItem from '../components/wordItem.vue'
import {words} from '../stores/words'
const newen = ref('')
const newzh = ref('')
function addword() {
    const en = newen.value.trim()
    const zh = newzh.value.trim()
    if(!en || !zh) {
        ElMessage.warning('英文和中文都不能为空')
        if(!en) {
            newen.value = ''
        }
        if(!zh) {
            newzh.value = ''           
        }
        return
    }
    const nextId = words.value.length ? Math.max(...words.value.map((t)=>t.id)) + 1 : 1
    words.value.push({ id: nextId, en: en, zh: zh, mastered: false})
    newen.value = ''
    newzh.value = ''
    ElMessage.success('已添加')
}
const total = computed(()=>words.value.length)
const medCount = computed(()=>words.value.filter((t)=>t.mastered).length)
const unmedCount = computed(()=>total.value - medCount.value)
const filterType = ref('all')
const filteredwords = computed(()=>{
    if(filterType.value ==='all') {
        return words.value
    } else if(filterType.value === 'mastered') {
        return words.value.filter((t)=>t.mastered)
    } else {
        return words.value.filter((t)=>!t.mastered)
    }
})
async function removeword(id: number) {
    try{
        await ElMessageBox.confirm('确定要删除这个单词吗？', '提示',{
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning',
            confirmButtonClass: 'el-button-danger'
        })
        words.value = words.value.filter((t)=>t.id !==id)
        ElMessage.success('已删除')
    } catch {

    }
}
function toggleword(id: number) {
    const target = words.value.find((t)=>t.id === id)
    if(target){
        target.mastered = !target.mastered
    }
}
</script>
<style scoped>
.input-row {
    display:flex;
    gap:var(--space-sm);
    margin-bottom:var(--space-md);
}
.input-row .el-input {
    flex:1;
}
.filter-row {
    display:flex;
    gap:var(--space-sm);
    margin-bottom:var(--space-md);
}
ul {
    list-style:none;
    padding-left:0;
}
.computed-count {
    margin-bottom: var(--space-md);
    font-size:14px;
    color: var(--color-text-muted);
}
.header {
    margin-bottom:var(--space-lg);
}
h1 {
    margin-bottom:var(--space-lg);
}
</style>