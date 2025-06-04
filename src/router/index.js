import { router } from './routes'
import { useAuthStore } from '../store/store'

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = !!authStore.token
  const user = authStore.user

  
  if (!to.meta.requiresAuth) {
    next()
    return
  }

  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

 
  if (to.meta.requiresAdmin && !authStore.isAdmin()) {
    next('/')
    return
  }

  next()
})

export default router 