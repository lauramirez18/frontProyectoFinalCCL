import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {router} from './router/routes'
import { Quasar, Notify } from 'quasar'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'
import App from './App.vue'
import './style.css'
import 'quasar/src/css/index.sass'
import 'material-icons/iconfont/material-icons.css'
import './css/variables.css'


const pinia = createPinia()
const app = createApp(App)
app.use(Quasar, {
    plugins: {
      Notify
    },
  })
  
pinia.use(piniaPluginPersistedState)
app.use(router)
app.use(pinia)
app.mount('#app')


