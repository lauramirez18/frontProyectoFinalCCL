import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import { Quasar, Notify, Dialog } from 'quasar'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'
import App from './App.vue'
import './style.css'
import 'quasar/src/css/index.sass'
import 'material-icons/iconfont/material-icons.css'
import './css/variables.css'
import './styles/global.css'
import { runDiagnostics, monitorDOMChanges } from './utils/diagnostics'

const pinia = createPinia()
const app = createApp(App)

// Configuración de Quasar
app.use(Quasar, {
  plugins: {
    Notify,
    Dialog
  },
  config: {
    brand: {
      primary: '#068FFF',
      secondary: '#26A69A',
      accent: '#9C27B0',
      dark: '#1d1d1d',
      darkPage: '#121212',
      positive: '#21BA45',
      negative: '#C10015',
      info: '#31CCEC',
      warning: '#F2C037'
    }
  }
})

// Configurar Pinia
pinia.use(piniaPluginPersistedState)
app.use(router)
app.use(pinia)

// Manejo global de errores
app.config.errorHandler = (err, vm, info) => {
  console.error('Error global de Vue:', err)
  console.error('Componente:', vm)
  console.error('Info:', info)
  
  // Evitar que el error se propague
  return false
}

// Manejo de advertencias
app.config.warnHandler = (msg, vm, trace) => {
  console.warn('Advertencia de Vue:', msg)
  console.warn('Componente:', vm)
  console.warn('Trace:', trace)
}

// Ejecutar diagnóstico antes de montar
console.log('🚀 Iniciando aplicación...')
runDiagnostics()

// Montar la aplicación
app.mount('#app')

// Ejecutar diagnóstico después de montar
setTimeout(() => {
  console.log('✅ Aplicación montada, ejecutando diagnóstico post-mount...')
  runDiagnostics()
  
  // Iniciar monitoreo de cambios en DOM
  const domObserver = monitorDOMChanges()
  
  // Limpiar observer después de 30 segundos
  setTimeout(() => {
    domObserver.disconnect()
    console.log('🔍 Monitoreo de DOM detenido')
  }, 30000)
}, 1000)











/* 
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import { Quasar, Notify, Dialog } from 'quasar'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'
import App from './App.vue'
import './style.css'
import 'quasar/src/css/index.sass'
import 'material-icons/iconfont/material-icons.css'
import './css/variables.css'
import './styles/global.css'
import { runDiagnostics, monitorDOMChanges } from './utils/diagnostics'

// 🔇 Silenciar consola en desarrollo
if (import.meta.env.DEV) {
  console.log = () => {}
  console.warn = () => {}
  console.error = () => {}
}

const pinia = createPinia()
const app = createApp(App)

// Configuración de Quasar
app.use(Quasar, {
  plugins: {
    Notify,
    Dialog
  },
  config: {
    brand: {
      primary: '#068FFF',
      secondary: '#26A69A',
      accent: '#9C27B0',
      dark: '#1d1d1d',
      darkPage: '#121212',
      positive: '#21BA45',
      negative: '#C10015',
      info: '#31CCEC',
      warning: '#F2C037'
    }
  }
})

// Configurar Pinia
pinia.use(piniaPluginPersistedState)
app.use(router)
app.use(pinia)

// Manejo global de errores
app.config.errorHandler = (err, vm, info) => {
  console.error('Error global de Vue:', err)
  console.error('Componente:', vm)
  console.error('Info:', info)
  return false
}

// Manejo de advertencias
app.config.warnHandler = (msg, vm, trace) => {
  console.warn('Advertencia de Vue:', msg)
  console.warn('Componente:', vm)
  console.warn('Trace:', trace)
}

// Ejecutar diagnóstico antes de montar
console.log('🚀 Iniciando aplicación...')
runDiagnostics()

// Montar la aplicación
app.mount('#app')

// Ejecutar diagnóstico después de montar
setTimeout(() => {
  console.log('✅ Aplicación montada, ejecutando diagnóstico post-mount...')
  runDiagnostics()

  const domObserver = monitorDOMChanges()

  setTimeout(() => {
    domObserver.disconnect()
    console.log('🔍 Monitoreo de DOM detenido')
  }, 30000)
}, 1000)
 */