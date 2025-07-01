import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'


const API_URL= 'http://localhost:3000/api'


axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(null)
  const userName = ref('')
  const cartItems = ref([])
  const favorites = ref([])
  const userId = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  function setToken(newToken) {
    if (newToken) {
      token.value = newToken
      localStorage.setItem('token', newToken)
    } else {
      console.log('No está llegando el token')
    }
  }

  function getToken() {
    return token.value
  }

  async function setUser(newUser) {
    console.log('Setting user:', newUser)
    if (newUser) {
     
      if (typeof newUser === 'string') {
        userName.value = newUser
        user.value = { nombre: newUser }
      } 
     
      else if (typeof newUser === 'object') {
        user.value = newUser
        userName.value = newUser.name || newUser.email?.split('@')[0] || 'Usuario'
        userId.value = newUser.id || newUser._id

        console.log('User ID set to:', userId.value)
        console.log('Initial favorites:', newUser.favoritos)

      
        if (newUser.favoritos) {
          favorites.value = newUser.favoritos
        } else {
          await syncFavorites()
        }
      }
    } else {
      console.log('No está llegando el usuario')
      userName.value = ''
      user.value = null
      userId.value = null
      favorites.value = []
    }
  }

  async function syncFavorites() {
    if (!token.value || !userId.value) {
      console.log('No hay token o usuario para sincronizar favoritos')
      return
    }

    try {
      const response = await axios.get(`${API_URL}/usuarios/favoritos`, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      
      if (response.data.favoritos) {
        favorites.value = response.data.favoritos
      }
    } catch (error) {
      console.error('Error al sincronizar favoritos:', error)
      throw error
    }
  }

  async function getFavorites() {
    if (!token.value || !userId.value) {
      error.value = 'Usuario no autenticado'
      return []
    }

    try {
      isLoading.value = true
      error.value = null
      
      const response = await axios.get(`${API_URL}/usuarios/favoritos`, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      
      if (response.data.favoritos) {
        favorites.value = response.data.favoritos
      }
      return favorites.value
    } catch (err) {
      console.error('Error al obtener favoritos:', err)
      error.value = err.response?.data?.error || 'Error al obtener favoritos'
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function addToFavorites(productId) {
    if (!token.value || !userId.value) {
      error.value = 'Usuario no autenticado'
      return false
    }

    if (!productId) {
      error.value = 'ID de producto inválido'
      return false
    }
    
    try {
      isLoading.value = true
      error.value = null
      
      const response = await axios.post(`${API_URL}/usuarios/favoritos/${productId}`, {}, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      
      if (response.data.favoritos) {
        favorites.value = response.data.favoritos
      }
      return true
    } catch (err) {
      console.error('Error al agregar a favoritos:', err)
      error.value = err.response?.data?.error || 'Error al añadir a favoritos'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function removeFromFavorites(productId) {
    if (!token.value || !userId.value) {
      error.value = 'Usuario no autenticado'
      return false
    }

    try {
      isLoading.value = true
      error.value = null
      
      const response = await axios.delete(`${API_URL}/usuarios/favoritos/${productId}`, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      
      if (response.data.favoritos) {
        favorites.value = response.data.favoritos
      }
      return true
    } catch (err) {
      console.error('Error al eliminar de favoritos:', err)
      error.value = err.response?.data?.error || 'Error al eliminar de favoritos'
      return false
    } finally {
      isLoading.value = false
    }
  }

  function isFavorite(productId) {
    console.log('Checking if product is favorite:', productId)
    console.log('Current favorites:', favorites.value)
    
  
    const result = favorites.value.some(item => {
    
      if (typeof item === 'string') {
        return item === productId
      }
    
      if (item._id) {
        return item._id === productId
      }
     
      if (item.producto && item.producto._id) {
        return item.producto._id === productId
      }
      return false
    })
    
    console.log('Is favorite result:', result)
    return result
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

  function clearCart() {
    cartItems.value = []
  }

  function getUser() {
    return user.value
  }

  function getUserName() {
    return userName.value
  }

  function isAdmin() {
    return user.value && (user.value.rol === 'admin' || user.value.role === 'admin')
  }

  function logout() {
    token.value = ''
    user.value = null
    userName.value = ''
    userId.value = null
    favorites.value = []
    cartItems.value = []
    localStorage.removeItem('token')
  }

  async function login(email, password) {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await axios.post(`${API_URL}/usuarios/login`, {
        email,
        password
      })

      const { token: newToken, user: userData } = response.data
      
      setToken(newToken)
      user.value = userData
      favorites.value = userData.favoritos || []
      
      return true
    } catch (err) {
      console.error('Error en login:', err)
      error.value = err.response?.data?.error || 'Error al iniciar sesión'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function register(userData) {
    try {
      isLoading.value = true
      error.value = null
      
      await axios.post(`${API_URL}/usuarios/registro`, userData)
      return true
    } catch (err) {
      console.error('Error en registro:', err)
      error.value = err.response?.data?.error || 'Error al registrar usuario'
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    token,
    user,
    userName,
    userId,
    cartItems,
    favorites,
    isLoading,
    error,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    addToCart,
    clearCart,
    setToken,
    getToken,
    setUser,
    getUser,
    getUserName,
    logout,
    syncFavorites,
    getFavorites,
    login,
    register,
    isAdmin
  }
}, {
  persist: true
})

export const useProductosStore = defineStore('productos', () => {
  const productos = ref([])
  const categorias = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function cargarTodo() {
    loading.value = true
    error.value = null
    try {
      console.log('ProductosStore: Iniciando carga de productos y categorías...')
      
      // Peticiones en paralelo
      const [prodRes, catRes] = await Promise.all([
        axios.get(`${API_URL}/productos`),
        axios.get(`${API_URL}/categorias`)
      ])
      
      console.log('ProductosStore: Respuesta de productos:', prodRes.data)
      console.log('ProductosStore: Respuesta de categorías:', catRes.data)
      
      // Manejo mejorado de la respuesta de productos
      if (prodRes.data && prodRes.data.productos && Array.isArray(prodRes.data.productos)) {
        productos.value = prodRes.data.productos
        console.log('ProductosStore: Productos cargados correctamente:', productos.value.length)
      } else if (Array.isArray(prodRes.data)) {
        productos.value = prodRes.data
        console.log('ProductosStore: Productos cargados como array directo:', productos.value.length)
      } else {
        console.warn('ProductosStore: Formato de respuesta inesperado para productos:', prodRes.data)
        productos.value = []
      }
      
      // Manejo mejorado de la respuesta de categorías
      if (catRes.data && Array.isArray(catRes.data)) {
        categorias.value = catRes.data
        console.log('ProductosStore: Categorías cargadas correctamente:', categorias.value.length)
      } else if (catRes.data && catRes.data.categorias && Array.isArray(catRes.data.categorias)) {
        categorias.value = catRes.data.categorias
        console.log('ProductosStore: Categorías cargadas desde data.categorias:', categorias.value.length)
      } else {
        console.warn('ProductosStore: Formato de respuesta inesperado para categorías:', catRes.data)
        categorias.value = []
      }
      
    } catch (err) {
      console.error('ProductosStore: Error al cargar datos:', err)
      console.error('ProductosStore: Detalles del error:', err.response?.data)
      error.value = err.response?.data?.error || err.message || 'Error desconocido al cargar productos'
      productos.value = []
      categorias.value = []
    } finally {
      loading.value = false
      console.log('ProductosStore: Carga completada. Productos:', productos.value.length, 'Categorías:', categorias.value.length)
    }
  }

  // Ejemplo de POST y PUT
  async function crearProducto(data) {
    return axios.post(`${API_URL}/productos`, data)
  }
  async function actualizarProducto(id, data) {
    return axios.put(`${API_URL}/productos/${id}`, data)
  }

  return {
    productos,
    categorias,
    loading,
    error,
    cargarTodo,
    crearProducto,
    actualizarProducto
  }
})