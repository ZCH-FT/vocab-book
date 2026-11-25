import {ref} from 'vue'
import {defineStore} from 'pinia'
import type {Word} from '../types'
import {request, ApiError} from '../api/http'

// 静默对齐的最小间隔：切标签页可能很频繁，别每切一次就打一次接口
const SILENT_MIN_INTERVAL = 15_000

export const useWordsStore = defineStore('words',()=>{
    const words = ref<Word[]>([])
    // loading：首次加载，决定要不要显示骨架屏
    const loading = ref(false)
    // refreshing：静默对齐，不阻塞界面、不清空列表
    const refreshing = ref(false)
    const loadError = ref<string | null>(null)
    const lastSyncedAt = ref<number | null>(null)
    const adding = ref(false)
    const pendingIds = ref(new Set<number>())

    // 同一个请求只允许在飞一次，后来的调用复用同一个 Promise
    let inflight: Promise<void> | null = null

    function isPending(id: number) {
        return pendingIds.value.has(id)
    }

    /**
     * 从服务端对齐一次数据。
     * - 首次调用（本地还没有数据）：走 loading，失败写 loadError，界面显示骨架/错误页
     * - silent: true：不显示骨架、不清空列表；失败就静默放弃，保留旧数据
     * - force: true：绕过 15 秒节流（用户主动下拉刷新时用），但仍受「有写操作在飞」约束
     */
    function refresh(opts: {silent?: boolean; force?: boolean} = {}): Promise<void> {
        if (inflight) {
            return inflight
        }
        const silent = opts.silent === true
        if (silent) {
            // 有写操作在飞的时候不对齐，否则会把正在删/改的词又拉回来
            if (pendingIds.value.size > 0) {
                return Promise.resolve()
            }
            if (!opts.force && lastSyncedAt.value !== null && Date.now() - lastSyncedAt.value < SILENT_MIN_INTERVAL) {
                return Promise.resolve()
            }
        }
        const firstLoad = words.value.length === 0 && lastSyncedAt.value === null
        if (firstLoad) {
            loading.value = true
            loadError.value = null
        } else if (silent) {
            refreshing.value = true
        }

        inflight = (async () => {
            try {
                words.value = await request<Word[]>('/word/list')
                lastSyncedAt.value = Date.now()
                loadError.value = null
            } catch (e) {
                const message = e instanceof ApiError ? e.message : '加载失败'
                if (firstLoad) {
                    loadError.value = message
                }
                // 静默对齐失败：什么都不做，用户手上的数据还在
            } finally {
                loading.value = false
                refreshing.value = false
                inflight = null
            }
        })()
        return inflight
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
        const index = words.value.findIndex(t => t.id === id)
        if(index === -1) {
            return false
        }
        const removed = words.value.splice(index, 1)[0]
        pendingIds.value.add(id)
        try{
            await request<void>(`/word/${id}`, {
                method: 'DELETE'
            })
        } catch (e) {
            words.value.splice(index, 0 , removed)
            throw e
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

    return {words,refresh,addword,removeword,editword,setmastered,loading,refreshing,loadError,lastSyncedAt,adding,isPending}
})
