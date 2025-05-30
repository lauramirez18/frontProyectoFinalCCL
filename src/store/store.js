import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  const user = ref()
  const cartItems = ref([])
  const favorites = ref([]) // Add favorites array

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
    logout
  }
}, {
  persist: true
})
