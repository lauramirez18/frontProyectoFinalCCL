import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import Login from '../views/Login.vue';
import Home from '../views/Home.vue';
import Car from '../views/Car.vue';
import Details from '../views/Details.vue';
import Admin from '../views/admin.vue';
import Register from '../views/Register.vue';
import Products from '../views/Products.vue'; // Asumo que este es para /products/:categoryId
import Category from '../views/Category.vue'; // Asumo que este es para /category/:id
import Payments from '../views/Payments.vue';
import SearchResultsPage from '../components/search.vue'; // Componente que mostrará los resultados de búsqueda

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
        path: '/products/:categoryId', // Ruta para productos por categoría
        name: 'CategoryProducts',
        component: Products,
        meta: { requiresAuth: true }
      },
      {
        path: '/payments',
        name: 'Payments',
        component: Payments,
        meta: { requiresAuth: true }
      },
      {
        path: 'category/:id', // Ruta para una categoría específica (puede ser redundante con CategoryProducts dependiendo de tu lógica)
        name: 'category',
        component: Category,
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
      },
      {
        // ¡Esta es la ruta clave para los resultados de búsqueda!
        path: 'search-results',
        name: 'SearchResults',
        component: SearchResultsPage,
        // Decide si esta página requiere autenticación o es pública
        meta: { requiresAuth: true } // Puedes cambiar a 'false' si quieres que sea pública
      }
    ]
  },
  {
    // Ruta catch-all para cualquier URL no definida, redirige al inicio
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});