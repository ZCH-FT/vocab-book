import {createRouter,createWebHashHistory} from 'vue-router'
import WordBookView from '../views/WordBookView.vue'
import QuizView from '../views/QuizView.vue'
const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {path: '/',component:WordBookView},
        {path:'/quiz',component:QuizView}
    ]
})
export default router