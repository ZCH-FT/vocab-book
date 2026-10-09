<template>
    <h1>单词测验</h1>
    <el-button type="primary" v-if="words.length !== 0" @click="get_testword">开始测试</el-button>
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
    <p v-if="words.length === 0">无可测验单词，请返回添加</p>
</template>
<script setup lang="ts">
import {words} from '../stores/words'
import {ref} from 'vue'
const random_idex = ref(-1)
const random_en = ref('')
const match_zh = ref('')
const match_ed =ref(false)
const match_foolean = ref(false)
function get_testword() {
    random_idex.value = Math.floor(Math.random()*words.value.length)
    random_en.value = words.value[random_idex.value].en
    match_ed.value = false
    match_foolean.value = false 
    match_zh.value = ''
}
function match_testword() {
    if(words.value[random_idex.value].zh === match_zh.value) {
        match_foolean.value = true
    } else {
        match_foolean.value = false
    }
    if(match_foolean.value === true && words.value[random_idex.value].mastered === false) {
        words.value[random_idex.value].mastered = true
    }
    if(match_foolean.value === false && words.value[random_idex.value].mastered === true) {
        words.value[random_idex.value].mastered = false
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
    margin-bottom:var(--space-lg);
}
</style>