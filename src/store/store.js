import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  const user = ref()
const cartItems = ref([])
  function setToken(newToken) {
    if (newToken) {
      token.value = newToken
    } else {
      console.log('No está llegando el token')
    }
  }

  function getToken() {
    return token.value
  }

  function setUser(newUser) {
    if (newUser) {
      user.value = newUser
    } else {
      console.log('No está llegando el usuario')
    }
  }
  

  function addToCart(item) {
    // Verificación mejorada del item
    if (!item || !item.id) {
      console.warn('Item inválido:', item)
      return
    }
    
    const existingItem = cartItems.value.find(i => i.id === item.id)
    if (existingItem) {
      existingItem.quantity++
    } else {
      // Aseguramos que todos los campos necesarios estén presentes
      cartItems.value.push({ 
        id: item.id,
        name: item.name || 'Producto',
        price: item.price || 0,
        image: item.image || '',
        quantity: 1,
        seller: item.seller || 'Vendedor'
      })
    }
  }
  

  function getUser() {
    return user.value
  }

  function logout() {
    token.value = ''
    user.value = null
  }

  return {
    token,
    user,
    cartItems,
    addToCart,
    setToken,
    getToken,
    setUser,
    getUser,
    logout
  }
}, {
  persist: true
})
