import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import Login from '../views/Login.vue';
import Home from '../views/Home.vue';
import Car from '../views/Car.vue';
import Details from '../views/Details.vue';
import Admin from '../views/admin.vue';
import Register from '../views/Register.vue';
import Products from '../views/Products.vue'; // Assuming this is your productos.vue
import Category from '../views/Category.vue';
import Payments from '../views/Payments.vue';
import SearchResultsPage from '../components/search.vue';
import Favorites from '../views/Favorites.vue';

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
      // NEW ROUTE FOR ALL PRODUCTS AND BRAND FILTERING
      {
        path: '/productos', // This path will now handle /productos and /productos?brand=...
        name: 'AllProducts', // A new name for this generic products view
        component: Products, // Pointing to your Products.vue component
        meta: { requiresAuth: true }
      },
      {
        path: '/products/:categoryId', // Keep your existing category-specific route
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
        path: 'category/:id',
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
        path: 'search-results',
        name: 'SearchResults',
        component: SearchResultsPage,
        meta: { requiresAuth: true }
      },
      {
        path: 'favorites',
        name: 'Favorites',
        component: Favorites,
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});
