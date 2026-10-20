import {ref} from 'vue'
import {defineStore} from 'pinia'
export interface Word {
    id:number
    en:string
    zh:string
    mastered:boolean
}
const API = import.meta.env.DEV ? 'http://localhost:8080':'https://1ce10716.r30.cpolar.top'
export const useWordsStore = defineStore('words',()=>{
    const words = ref<Word[]>([])
    async function loadwords() {
        try{
            const res = await fetch(`${API}/word/list`)
            const result = await res.json()
            words.value = result.data
        } catch {
            console.error('加载单词失败：后端启动了吗？')
        }
    }
    async function addword(en: string, zh: string) {
        const res = await fetch(`${API}/word/add`,{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({en: en,zh: zh}),
        })
        const result = await res.json()
        words.value.push(result.data)
    }
    async function removeword(id: number) {
        await fetch(`${API}/word/${id}`,{
            method: 'DELETE',
        })
        words.value = words.value.filter((t)=>t.id !== id)
    }
    async function editword(id: number,en: string,zh: string) {
        await fetch(`${API}/word/${id}`,{
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
        await fetch(`${API}/word/mastered/${id}?value=${value}`,{
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