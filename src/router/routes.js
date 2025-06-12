import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import Home from '../views/Home.vue';
import Register from '../views/Register.vue';
import Admin from '../views/admin.vue';
import AdminLogin from '../views/Login.vue';
import Login from '../views/Login.vue';
import Car from '../views/Car.vue';
import Details from '../views/Details.vue';
import Products from '../views/Products.vue'; 
import Category from '../views/Category.vue';
import Payments from '../views/Payments.vue';
import SearchResultsPage from '../components/search.vue';
import Favorites from '../views/Favorites.vue';
import Account from '../views/Account.vue';
import Ofertas from '../views/Ofertas.vue';

const routes = [
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin,
    meta: { requiresAuth: false }
  },
  {
    path: '/admin',
    name: 'admin',
    component: Admin,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: Home
      },
      {
        path: 'register',
        name: 'Register',
        component: Register
      },
      {
        path: '/account',
        name: 'Account',
        component: Account,
        meta: { requiresAuth: true }
      },
      {
        path: '/productos', 
        name: 'AllProducts', 
        component: Products
      },
      {
        path: '/productos/categoria/:categoryId', 
        name: 'CategoryProducts',
        component: Products
      },
      {
        path: '/marcas/:slug', 
        name: 'BrandProducts',
        component: Products
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
        component: Category
      },
      {
        path: 'Car',
        name: 'Car',
        component: Car,
        meta: { requiresAuth: true }
      },
      {
        path: 'Details/:slug',
        name: 'Details',
        component: Details
      },
      {
        path: 'search-results',
        name: 'SearchResults',
        component: SearchResultsPage
      },
      {
        path: 'favorites',
        name: 'Favorites',
        component: Favorites,
        meta: { requiresAuth: true }
      },
      {
        path: 'ofertas',
        name: 'Ofertas',
        component: Ofertas
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  }
});

export { router };
