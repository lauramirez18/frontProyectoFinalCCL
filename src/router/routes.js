import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Car from '../views/Car.vue'
import Details from '../views/Details.vue'
import Admin from '../views/admin.vue'
import Register from '../views/Register.vue'
import Products from '../views/Products.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/admin',
    name: 'admin',
    component: Admin
   
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: Home,
        meta: { requiresAuth: true } 
      },
      {
        path: 'products',
        name: 'products',
        component: Products,
        meta: { requiresAuth: true }
      },
      {
        path: 'Car',
        name: 'Car',
        component: Car,
        meta: { requiresAuth: true } 
      },
      
      {
        path: 'Details/:id',
        name: 'Details',
        component: Details,
        meta: { requiresAuth: true }
      }
     
    ]
  },
  
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

