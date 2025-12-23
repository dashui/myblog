import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { pinia } from './stores'
import { supabase } from './supabase'

const app = createApp(App)

app.use(router)
app.use(pinia)

// Check auth on app load
app.mount('#app')
