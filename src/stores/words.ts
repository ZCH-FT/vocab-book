import {ref} from 'vue'
export interface Word {
    id:number
    en:string
    zh:string
    mastered:boolean
}
export const words = ref<Word[]>([])

// 从后端（MySQL）加载单词列表
async function loadwords() {
    try {
        const res = await fetch('http://localhost:8080/word/list')
        words.value = await res.json()
    } catch {
        console.error('加载单词失败：后端启动了吗？')
    }
}

loadwords()