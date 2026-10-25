<template>
    <h1>单词测验</h1>
    <template v-if="wordsStore.loading">
        <el-skeleton :rows="3" animated />
    </template>
    <template v-else-if="wordsStore.loadError">
        <div class="state-block">
            <p class="state-title">加载失败</p>
            <p class="state-sub">{{ wordsStore.loadError }}</p>
            <el-button type="primary" @click="wordsStore.loadwords()">重试</el-button>
        </div>
    </template>
    <template v-else-if="wordsStore.words.length === 0">
        <div class="empty-state">
            <p class="empty-title">还没有可测验的单词</p>
            <p class="empty-sub">先去单词本添加几个单词吧</p>
            <el-button type="primary" @click="router.push('/')">去添加单词</el-button>
        </div>
    </template>
    <template v-else>
        <p class="quiz-sub" v-if="wordsStore.words.length !== 0 && !random_en">随机抽取词表里的单词，检验你的掌握程度</p>
        <el-button type="primary" v-if="wordsStore.words.length !== 0" @click="get_testword">开始测试</el-button>
        <div v-if="random_en">
            <p class="quiz-word">{{ random_en }}</p>
            <div class="input-row">
            <el-input
            v-model="match_zh"
            placeholder="请输入对应的中文"
            @keyup.enter="match_testword"
            />
            <el-button type="primary" @click="match_testword">核对</el-button>
            <el-button @click="get_testword">下一个</el-button>
            </div>
            <div v-if="match_ed">
                <p :class="match_foolean ? 'ok' : 'bad'">{{ match_foolean ? '正确' : '错误，请重试' }}</p>
            </div>
        </div>
    </template>
</template>
<script setup lang="ts">
import {useRouter} from 'vue-router'
import {useWordsStore} from '../stores/words'
import {ApiError} from '../api/http'
import {ref} from 'vue'
const router = useRouter()
const wordsStore = useWordsStore()
const random_idex = ref(-1)
const random_en = ref('')
const match_zh = ref('')
const match_ed =ref(false)
const match_foolean = ref(false)
function showerror(e: unknown, fallback: string) {
    ElMessage.error(e instanceof ApiError ? e.message : fallback)
}
function get_testword() {
    if (wordsStore.words.length === 0) return
    random_idex.value = Math.floor(Math.random()*wordsStore.words.length)
    random_en.value = wordsStore.words[random_idex.value].en
    match_ed.value = false
    match_foolean.value = false 
    match_zh.value = ''
}
async function match_testword() {
    if(wordsStore.words[random_idex.value].zh === match_zh.value) {
        match_foolean.value = true
    } else {
        match_foolean.value = false
    }
    if(match_foolean.value === true && wordsStore.words[random_idex.value].mastered === false) {
        try {
            await wordsStore.setmastered(wordsStore.words[random_idex.value].id, true)
        } catch (e) {
            showerror(e, '更新失败')
        }
    }
    if(match_foolean.value === false && wordsStore.words[random_idex.value].mastered === true) {
        try {
            await wordsStore.setmastered(wordsStore.words[random_idex.value].id, false)
        } catch (e) {
            showerror(e, '更新失败')
        }
    }
    match_zh.value = ''
    match_ed.value = true
}
</script>
<style scoped>
.quiz-word {
    font-size:32px;
    font-weight:600;
    text-align:center;
}
.ok {
    color:var(--color-success);
}
.bad {
    color:var(--color-danger);
}
.input-row {
    display:flex;
    gap:var(--space-sm);
    margin-bottom:var(--space-md);
}
.input-row .el-input {
    flex:1;
}
h1 {
    margin-bottom:var(--space-sm);
}
.quiz-sub {
    color:var(--color-text-muted);
    font-size:14px;
    margin-bottom:var(--space-lg);
}
.empty-state {
    text-align:center;
    padding: var(--space-lg) 0;
}
.empty-state .empty-title {
    font-size:18px;
    margin-bottom:var(--space-sm);
}
.empty-state .empty-sub {
    color:var(--color-text-muted);
    font-size:14px;
    margin-bottom:var(--space-lg);
}
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