import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  const user = ref(null)
  const userName = ref('')
  const cartItems = ref([])
  const favorites = ref([])

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
      // Si newUser es un string, asumimos que es el nombre
      if (typeof newUser === 'string') {
        userName.value = newUser
        user.value = { nombre: newUser }
      } 
      // Si es un objeto, extraemos el nombre
      else if (typeof newUser === 'object') {
        user.value = newUser
        userName.value = newUser.nombre || newUser.name || newUser.email?.split('@')[0] || 'Usuario'
      }
    } else {
      console.log('No está llegando el usuario')
      userName.value = ''
      user.value = null
    }
  }

  function addToCart(item) {
    if (!item || !item.id) {
      console.warn('Item inválido:', item)
      return
    }
    
    const existingItem = cartItems.value.find(i => i.id === item.id)
    if (existingItem) {
      existingItem.quantity++
    } else {
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

  function getUserName() {
    return userName.value
  }

  function logout() {
    token.value = ''
    user.value = null
    userName.value = ''
  }

  function addToFavorites(product) {
    if (!product || !product.id) {
      console.warn('Item inválido:', product)
      return
    }
    
    const existingItem = favorites.value.find(i => i.id === product.id)
    if (!existingItem) {
      favorites.value.push({ 
        id: product.id,
        name: product.name || 'Producto',
        price: product.price || 0,
        image: product.image || '',
        seller: product.seller || 'Vendedor'
      })
    }
  }

  function removeFromFavorites(productId) {
    const index = favorites.value.findIndex(item => item.id === productId)
    if (index !== -1) {
      favorites.value.splice(index, 1)
    }
  }

  function isFavorite(productId) {
    return favorites.value.some(item => item.id === productId)
  }

  return {
    token,
    user,
    userName,
    cartItems,
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    addToCart,
    setToken,
    getToken,
    setUser,
    getUser,
    getUserName,
    logout
  }
}, {
  persist: true
})
