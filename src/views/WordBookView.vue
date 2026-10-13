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
    <div class="tools-row">
        <el-input v-model="searchText" placeholder="搜索英文或中文" clearable />
        <el-select v-model="sortType">
            <el-option label="默认排序" value="default"></el-option>
            <el-option label="英文 A → Z" value="en-asc"></el-option>
            <el-option label="英文 Z → A" value="en-desc"></el-option>
        </el-select>
    </div>
    <div class="filter-row">
        <el-radio-group v-model="filterType">
            <el-radio-button value="all">全部</el-radio-button>
            <el-radio-button value="mastered">已掌握</el-radio-button>
            <el-radio-button value="unmastered">未掌握</el-radio-button>
        </el-radio-group>
    </div>
    <p v-if="sortedwords.length === 0">{{ total === 0 ? '没有单词，先添加一个' : '没有符合条件的单词'}}</p>
    <TransitionGroup v-else name="list" tag="ul">
        <wordItem v-for="word in sortedwords" :key="word.id" :word="word" @toggle="toggleword" @remove="removeword" @edit="openedit"/>
    </TransitionGroup>
    <el-dialog v-model="editVisible" title="编辑单词" width="400px">
        <div class="edit-form">
            <el-input v-model="editForm.en" placeholder="英文" />
            <el-input v-model="editForm.zh" placeholder="中文" />
        </div>
        <template #footer>
            <el-button @click="editVisible = false">取消</el-button>
            <el-button type="primary" @click="saveedit">保存</el-button>
        </template>
    </el-dialog> 
</template>
<script setup lang="ts">
import { ref,computed } from 'vue'
import wordItem from '../components/wordItem.vue'
import {useWordsStore} from '../stores/words'
const wordsStore = useWordsStore()
const newen = ref('')
const newzh = ref('')
const editVisible = ref(false)
const editForm = ref({id: 0,en:'',zh:''}) 
async function addword() {
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
    await wordsStore.addword(en, zh)
    newen.value = ''
    newzh.value = ''
    ElMessage.success('已添加')
}
const total = computed(()=>wordsStore.words.length)
const medCount = computed(()=>wordsStore.words.filter((t)=>t.mastered).length)
const unmedCount = computed(()=>total.value - medCount.value)
const filterType = ref('all')
const filteredwords = computed(()=>{
    if(filterType.value ==='all') {
        return wordsStore.words
    } else if(filterType.value === 'mastered') {
        return wordsStore.words.filter((t)=>t.mastered)
    } else {
        return wordsStore.words.filter((t)=>!t.mastered)
    }
})
const searchText = ref('')
const searchedwords = computed(()=>{
    const kw = searchText.value.trim().toLowerCase()
    if(!kw) {
        return filteredwords.value
    }
    return filteredwords.value.filter((t)=>t.en.toLowerCase().includes(kw) || t.zh.includes(kw))
})
const sortType = ref('default')
const sortedwords = computed(()=>{
    const list = [...searchedwords.value]
    if(sortType.value === 'en-asc') {
        list.sort((a,b)=>a.en.localeCompare(b.en))
    } else if(sortType.value === 'en-desc') {
        list.sort((a,b)=>b.en.localeCompare(a.en))
    }
    return list
})
async function removeword(id: number) {
    try{
        await ElMessageBox.confirm('确定要删除这个单词吗？', '提示',{
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning',
            confirmButtonClass: 'el-button--danger'
        })
        await wordsStore.removeword(id)
        ElMessage.success('已删除')
    } catch {

    }
}
function openedit(id: number) {
    const target = wordsStore.words.find((t)=>t.id === id)
    if(!target){
        return
    }
    editForm.value = {id: target.id,en: target.en,zh: target.zh}
    editVisible.value = true
}
async function saveedit() {
    const target = wordsStore.words.find((t)=>t.id === editForm.value.id)
    if(!target){
        return
    }
    if(!editForm.value.en.trim()|| !editForm.value.zh.trim()) {
        ElMessage.warning('英文和中文都不能为空')
        if(!editForm.value.en.trim()) {
            editForm.value.en = ''
        }
        if(!editForm.value.zh.trim()) {
            editForm.value.zh = ''
        }
        return
    }
    await wordsStore.editword(editForm.value.id, editForm.value.en.trim(), editForm.value.zh.trim())
    editVisible.value = false
    ElMessage.success('已保存')
}
async function toggleword(id: number) {
    const target = wordsStore.words.find((t)=>t.id === id)
    if(target){
        const newvalue = !target.mastered
        await wordsStore.setmastered(id, newvalue)
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
    position:relative;
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
.edit-form {
    display:flex;
    flex-direction:column;
    gap:var(--space-sm);
}
.tools-row {
    display:flex;
    margin-bottom:var(--space-md);
    gap:var(--space-sm);
}
.tools-row .el-input {
    flex:1;
}
.tools-row .el-select {
    width:150px;
}
.list-enter-from {
    opacity:0;
    transform:translateX(-24px);
}
.list-enter-active {
    transition:all 0.25s ease;
}
.list-leave-to {
    opacity:0;
    transform:translateX(24px);
}
.list-leave-active {
    position:absolute;
    width:100%;
    transition:all 0.25s ease;
}
.list-move {
    transition:transform 0.25s ease;
}
</style>