import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {router} from './router/routes'
import { Quasar } from 'quasar'
import  piniaPluginPersistedState  from 'pinia-plugin-persistedstate'
import App from './App.vue'
import './style.css'
import 'quasar/src/css/index.sass'
import 'material-icons/iconfont/material-icons.css'





const pinia = createPinia()
const app = createApp(App)
app.use(Quasar, {
    plugins: {}, 
  })
  
  pinia.use(piniaPluginPersistedState)
app.use(router)
app.use(pinia)
app.mount('#app')
