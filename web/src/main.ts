import '@unocss/reset/normalize.css'
import 'virtual:uno.css'
import 'vant/lib/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router/auto'

import App from './App.vue'

const pinia = createPinia()
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
})

// redirect '/' -> '/camera'
router.addRoute({
  path: '/',
  redirect: '/camera',
})

const app = createApp(App)

app.use(pinia)
app.use(router)

// init EdgerOS token before app mount
initToken().then(() => {
  app.mount('#app')
})
