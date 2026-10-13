import {ref} from 'vue'
import {defineStore} from 'pinia'
export interface Word {
    id:number
    en:string
    zh:string
    mastered:boolean
}
export const useWordsStore = defineStore('words',()=>{
    const words = ref<Word[]>([])
    async function loadwords() {
        try{
            const res = await fetch('http://localhost:8080/word/list')
            words.value = await res.json()
        } catch {
            console.error('加载单词失败：后端启动了吗？')
        }
    }
    async function addword(en: string, zh: string) {
        const res = await fetch('http://localhost:8080/word/add',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({en: en,zh: zh}),
        })
        const newword = await res.json()
        words.value.push(newword)
    }
    async function removeword(id: number) {
        await fetch(`http://localhost:8080/word/${id}`,{
            method: 'DELETE',
        })
        words.value = words.value.filter((t)=>t.id !== id)
    }
    async function editword(id: number,en: string,zh: string) {
        await fetch(`http://localhost:8080/word/${id}`,{
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({en: en,zh: zh}),
        })
        const target = words.value.find((t)=>t.id === id)
        if(target){
            target.en = en
            target.zh = zh
        }
    }
    async function setmastered(id: number,value: boolean) {
        await fetch(`http://localhost:8080/word/mastered/${id}?value=${value}`,{
            method: 'PUT',
        })
        const target = words.value.find((t)=>t.id === id)
        if(target) {
            target.mastered = value
        }
    }
    loadwords()

    return {words,loadwords,addword,removeword,editword,setmastered}
})