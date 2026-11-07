<template>
    <h1>单词测验</h1>
    <AsyncState :loading="wordsStore.loading" :error="wordsStore.loadError" @retry="wordsStore.loadwords()">
    <template v-if="wordsStore.words.length === 0">
        <div class="empty-state">
            <p class="empty-title">还没有可测验的单词</p>
            <p class="empty-sub">先去单词本添加几个单词吧</p>
            <el-button type="primary" @click="router.push('/')">去添加单词</el-button>
        </div>
    </template>
    <template v-else>
        <p class="quiz-sub" v-if="!currentWord">随机抽取词表里的单词，检验你的掌握程度</p>
        <el-button type="primary" v-if="!currentWord" @click="pickWord">开始测试</el-button>
        <div v-if="currentWord">
            <p class="quiz-word">{{ currentWord.en }}</p>
            <div class="input-row">
            <el-input
            v-model="answer"
            placeholder="请输入对应的中文"
            @keyup.enter="checkAnswer"
            />
            <el-button type="primary" @click="checkAnswer">核对</el-button>
            <el-button @click="pickWord">下一个</el-button>
            </div>
            <div v-if="checked">
                <p :class="isCorrect ? 'ok' : 'bad'">{{ isCorrect ? '正确' : '错误，请重试' }}</p>
            </div>
        </div>
    </template>
    </AsyncState>
</template>
<script setup lang="ts">
import {useRouter} from 'vue-router'
import {useWordsStore} from '../stores/words'
import {showError} from '../utils/error'
import {ref,computed} from 'vue'
import AsyncState from '../components/AsyncState.vue'
const router = useRouter()
const wordsStore = useWordsStore()
const currentId = ref<number | null>(null)
const answer = ref('')
const checked = ref(false)
const isCorrect = ref(false)
const currentWord = computed(()=>
    wordsStore.words.find(w=>w.id === currentId.value) ?? null
)
function pickWord() {
    const list = wordsStore.words
    if(list.length === 0) {
        return;
    }
    const next = list[Math.floor(Math.random() * list.length)]
    currentId.value = next.id
    answer.value = ''
    checked.value = false
    isCorrect.value = false
}
async function checkAnswer() {
    const word = currentWord.value
    if(!word) {
        ElMessage.warning('这个单词已经不在词表里了')
        currentId.value = null
        return
    }
    isCorrect.value = word.zh === answer.value.trim()
    checked.value = true
    if(isCorrect.value === true && word.mastered === false) {
        try {
            await wordsStore.setmastered(word.id, true)
        } catch (e) {
            showError(e, '更新失败')
        }
    }
    if(isCorrect.value === false && word.mastered === true) {
        try {
            await wordsStore.setmastered(word.id, false)
        } catch (e) {
            showError(e, '更新失败')
        }
    }
    if(isCorrect.value) {
        answer.value = ''
    }
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

</style>