// Utilidades de diagnóstico para identificar problemas de DOM y Vue

export const runDiagnostics = () => {
  console.log('🔍 Iniciando diagnóstico de la aplicación...')
  
  // Verificar si el DOM está listo
  console.log('📋 Estado del DOM:')
  console.log('- document.readyState:', document.readyState)
  console.log('- document.body:', !!document.body)
  console.log('- #app element:', !!document.getElementById('app'))
  
  // Verificar Vue
  console.log('⚡ Estado de Vue:')
  console.log('- Vue version:', window.Vue?.version || 'No detectada')
  
  // Verificar Quasar
  console.log('🎨 Estado de Quasar:')
  console.log('- Quasar version:', window.Quasar?.version || 'No detectada')
  
  // Verificar localStorage
  console.log('💾 Estado de localStorage:')
  try {
    console.log('- auth:', localStorage.getItem('auth'))
    console.log('- productos:', localStorage.getItem('productos'))
  } catch (error) {
    console.error('- Error accediendo localStorage:', error)
  }
  
  // Verificar errores en consola
  console.log('🚨 Errores detectados:')
  const originalError = console.error
  const errors = []
  
  console.error = (...args) => {
    errors.push(args)
    originalError.apply(console, args)
  }
  
  // Verificar componentes montados
  console.log('🧩 Componentes montados:')
  const appElement = document.getElementById('app')
  if (appElement) {
    console.log('- Elementos hijos de #app:', appElement.children.length)
    Array.from(appElement.children).forEach((child, index) => {
      console.log(`  ${index}:`, child.tagName, child.className)
    })
  }
  
  return {
    domReady: document.readyState === 'complete',
    appElement: !!document.getElementById('app'),
    errors: errors
  }
}

export const checkComponentMounting = (componentName) => {
  console.log(`🔍 Verificando montaje del componente: ${componentName}`)
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const elements = document.querySelectorAll(`[data-component="${componentName}"]`)
      console.log(`- Elementos encontrados para ${componentName}:`, elements.length)
      resolve(elements.length > 0)
    }, 100)
  })
}

export const monitorDOMChanges = () => {
  console.log('👀 Monitoreando cambios en el DOM...')
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        console.log('🔄 Cambio en DOM:', {
          added: mutation.addedNodes.length,
          removed: mutation.removedNodes.length,
          target: mutation.target.tagName
        })
      }
    })
  })
  
  const appElement = document.getElementById('app')
  if (appElement) {
    observer.observe(appElement, {
      childList: true,
      subtree: true
    })
  }
  
  return observer
}

export const checkVueReactivity = () => {
  console.log('⚡ Verificando reactividad de Vue...')
  
  // Verificar si Vue está funcionando correctamente
  const testElement = document.createElement('div')
  testElement.innerHTML = '<div id="vue-test">{{ message }}</div>'
  document.body.appendChild(testElement)
  
  // Limpiar después de la prueba
  setTimeout(() => {
    document.body.removeChild(testElement)
  }, 1000)
}

export const logErrorDetails = (error) => {
  console.error('🚨 Error detallado:')
  console.error('- Mensaje:', error.message)
  console.error('- Stack:', error.stack)
  console.error('- Tipo:', error.constructor.name)
  
  if (error.config) {
    console.error('- Config:', error.config)
  }
  
  if (error.response) {
    console.error('- Response:', error.response)
  }
} 