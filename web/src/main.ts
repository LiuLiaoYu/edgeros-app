import '@unocss/reset/normalize.css'
import 'virtual:uno.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import { createRouter, createWebHashHistory } from 'vue-router'
import routes from 'virtual:generated-pages'

import App from './App.vue'

const pinia = createPinia()
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})
const app = createApp(App)

app.use(pinia)
app.use(router)

; (async () => {
  // await initEdgerToken()
  app.mount('#app')
})()
