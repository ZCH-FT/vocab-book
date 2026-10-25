import {ref} from 'vue'
import {defineStore} from 'pinia'
export interface Word {
    id:number
    en:string
    zh:string
    mastered:boolean
}
import {request, ApiError} from '../api/http'
export const useWordsStore = defineStore('words',()=>{
    const words = ref<Word[]>([])
    const loading = ref(false)
    const loadError = ref<string | null>(null)
    async function loadwords() {    
        if(loading.value) {
            return
        }
        loading.value = true
        loadError.value = null
        try {
            words.value = await request<Word[]>('/word/list')
        } catch (e) {
            loadError.value = e instanceof ApiError ? e.message : '加载失败'
        } finally {
            loading.value = false
        }
    }
    async function addword(en: string, zh: string) {
        const created = await request<Word>('/word/add',{
            method: 'POST',
            body: JSON.stringify({ en, zh})
        })
        words.value.push(created)
    }
    async function removeword(id: number) {
        await request<void>(`/word/${id}`, {
            method: 'DELETE'
        })
        words.value = words.value.filter((t)=>t.id !== id)
    }
    async function editword(id: number,en: string,zh: string) {
        await request<void>(`/word/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ en, zh }),
        })
        const target = words.value.find((t)=>t.id === id)
        if(target){
            target.en = en
            target.zh = zh
        }
    }
    async function setmastered(id: number,value: boolean) {
        await request<void>(`/word/mastered/${id}?value=${value}`, { method: 'PUT' })
        const target = words.value.find((t)=>t.id === id)
        if(target) {
            target.mastered = value
        }
    }
    loadwords()

    return {words,loadwords,addword,removeword,editword,setmastered,loading,loadError}
})