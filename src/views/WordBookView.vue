<template>
    <h1>我的单词本</h1>
    <WordForm v-model="addForm" :loading="wordsStore.adding" submit-text="添加" @submit="addword" />
    <template v-if="!wordsStore.loading && !wordsStore.loadError">
        <p class="computed-count">
            共<strong>{{total}}</strong> 个 ·
            已掌握<strong>{{medCount}}</strong> 个 ·
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
    </template>
    <AsyncState :loading="wordsStore.loading" :error="wordsStore.loadError" @retry="wordsStore.loadwords()">
        <p v-if="sortedwords.length === 0">
            {{ total === 0 ? '没有单词，先添加一个' : '没有符合条件的单词' }}
        </p>
        <TransitionGroup v-else name="list" tag="ul">
            <wordItem v-for="word in sortedwords" :key="word.id" :word="word" :pending="wordsStore.isPending(word.id)" @toggle="toggleword" @remove="removeword" @edit="openedit"/>
        </TransitionGroup>
    </AsyncState>
    <el-dialog v-model="editVisible" title="编辑单词" width="400px">
        <WordForm
        v-model="editForm"
        :loading="wordsStore.isPending(editId)"
        layout="column"
        submit-text="保存"
        @submit="saveedit"
    />
    </el-dialog> 
</template>
<script setup lang="ts">
import { ref,computed } from 'vue'
import wordItem from '../components/wordItem.vue'
import AsyncState from '../components/AsyncState.vue'
import {useWordsStore} from '../stores/words'
import {showError} from '../utils/error'
import WordForm from '../components/WordForm.vue'
const wordsStore = useWordsStore()
const addForm = ref({ en: '', zh: ''})
const editForm = ref({en:'',zh:''})
const editId = ref(0)
const editVisible = ref(false)
async function addword() {
    try{
        const created = await wordsStore.addword(addForm.value.en, addForm.value.zh)
        if(!created) {
            return
        }
        addForm.value = { en: '', zh: '' }
        ElMessage.success('已添加')
    } catch(e) {            
        showError(e, '添加失败')                
    }
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
    try {
        await ElMessageBox.confirm('确定要删除这个单词吗？', '提示',{
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning',
            confirmButtonClass: 'el-button--danger'
        })
    } catch {
        return
    }
    try {
        const ok = await wordsStore.removeword(id)
        if(!ok) {
            return
        }
        ElMessage.success('已删除')
    } catch (e) {
        showError(e, '删除失败')
    }
}
function openedit(id: number) {
    const target = wordsStore.words.find((t)=>t.id === id)
    if(!target){
        return
    }
    editId.value = target.id
    editForm.value = {en: target.en,zh: target.zh}
    editVisible.value = true
}
async function saveedit() {
    try{
        const ok = await wordsStore.editword(editId.value, editForm.value.en.trim(), editForm.value.zh.trim())
        if(!ok) {
            return
        }
        editVisible.value = false
        ElMessage.success('已保存')
    } catch (e) {
        showError(e, '保存失败')
    }
}
async function toggleword(id: number) {
    const target = wordsStore.words.find((t)=>t.id === id)
    if(target){
        const newvalue = !target.mastered
        try {
            await wordsStore.setmastered(id, newvalue)
        } catch (e) {
            showError(e, '更新失败')
        }
    } 
}
</script>
<style scoped>
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
h1 {
    margin-bottom:var(--space-lg);
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
@media (max-width: 600px) {
}
</style>