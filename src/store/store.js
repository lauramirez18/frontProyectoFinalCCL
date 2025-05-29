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
    if (!item || !item.id || !item.precio) {
      console.warn('Item inválido:', item)
      return
    }
  
    const existingItem = cartItems.value.find(i => i.id === item.id)
    if (existingItem) {
      existingItem.quantity++
    } else {
      cartItems.value.push({ 
        ...item,
        precio: item.precio,
        discountPrice: item.discountPrice || item.precio,
        quantity: 1 
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