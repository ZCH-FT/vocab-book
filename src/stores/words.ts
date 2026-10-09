import {ref,watch} from 'vue'
export interface Word {
    id:number
    en:string
    zh:string
    mastered:boolean
}
const local_words = localStorage.getItem('words')
export const words = ref<Word[]>(local_words ? JSON.parse(local_words) :
[
        {id: 1, en: 'pen', zh: '钢笔', mastered: true},
        {id: 2, en: 'car', zh: '车', mastered: true},
        {id: 3, en: 'ball', zh: '球', mastered: true},
        {id: 4, en: 'abandon', zh: '放弃', mastered: false},
        {id: 5, en: 'water', zh: '水', mastered: false},
])
watch(words,(newVal)=>{
    localStorage.setItem('words',JSON.stringify(newVal))
},{deep: true})
