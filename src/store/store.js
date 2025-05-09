import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  const user = ref(null)

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
    setToken,
    getToken,
    setUser,
    getUser,
    logout
  }
}, {
  persist: true
})
