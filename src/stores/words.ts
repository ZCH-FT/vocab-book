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
    const adding = ref(false)
    const pendingIds = ref(new Set<number>())
    function isPending(id: number) {
        return pendingIds.value.has(id)
    }   
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
    async function addword(en: string, zh: string): Promise<boolean> {
        if(adding.value) {
            return false
        }
        adding.value = true
        try {
            const created = await request<Word>('/word/add',{
                method: 'POST',
                body: JSON.stringify({ en, zh})
            })
            words.value.push(created)
        } finally {
            adding.value = false    
        }
        return true
    }
    async function removeword(id: number): Promise<boolean> {
        if(isPending(id)) {
            return false
        }
        pendingIds.value.add(id)
        try{
            await request<void>(`/word/${id}`, {
                method: 'DELETE'
            })
            words.value = words.value.filter((t)=>t.id !== id)
        } finally {
            pendingIds.value.delete(id)
        }
        return true
    }
    async function editword(id: number,en: string,zh: string): Promise<boolean> {
        if(isPending(id)) {
            return false
        }
        pendingIds.value.add(id)
        try{
            await request<void>(`/word/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ en, zh }),
            })
            const target = words.value.find((t)=>t.id === id)
            if(target){
                target.en = en
                target.zh = zh
            }
        } finally {
            pendingIds.value.delete(id)
        }
        return true
    }
    async function setmastered(id: number,value: boolean): Promise<boolean> {
        if(isPending(id)) {
            return false
        }
        const target = words.value.find((t)=>t.id === id)
        if(!target) {
            return false
        }
        const prev = target.mastered
        pendingIds.value.add(id)
        target.mastered = value
        try {
            await request<void>(`/word/mastered/${id}?value=${value}`, { method: 'PUT' })
        } catch (e){
            target.mastered = prev
            throw e
        } finally {
            pendingIds.value.delete(id)
        }
        return true
    }
    loadwords()

    return {words,loadwords,addword,removeword,editword,setmastered,loading,loadError,adding,isPending}
})