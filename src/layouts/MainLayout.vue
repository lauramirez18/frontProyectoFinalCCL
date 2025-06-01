<template>
  <q-layout view="hHh Lpr fff">
    <q-header elevated class="text-white header q-py-sm">

      <q-toolbar class="row items-center justify-between q-col-gutter-sm">
        <q-btn flat dense round icon="menu" class="menu-toggle-btn q-mr-sm" @click="toggleSideMenu" />
        <router-link to="/" class="flex flex-center">
          <q-avatar square size="70px" class="cursor-pointer logo">
            <img src="/logo2.png" alt="Logo" />
          </q-avatar>
        </router-link>

        <div class="col-grow q-mx-md search-bar-wrapper">
          <div v-if="$q.screen.gt.sm" class="search-container">
            <q-input dense outlined color="primary" bg-color="white" placeholder="Buscar en tu tienda" v-model="search"
              class="search-input" @keyup.enter="performSearch">
              <template v-slot:append>
                <q-btn flat dense icon="search" color="secondary" class="search-btn" @click="performSearch" />
              </template>
            </q-input>
          </div>
          <q-toolbar v-else class="q-px-md q-py-sm bg-primary">
            <q-input dense outlined color="primary" bg-color="white" placeholder="Buscar en tu tienda" v-model="search"
              class="full-width search-input-mobile">
              <template v-slot:append>
                <q-btn flat dense icon="search" color="secondary" class="search-btn" @click="performSearch" />
              </template>
            </q-input>
          </q-toolbar>
          <div v-else class="q-ml-auto q-mr-sm">
            <q-btn flat round icon="search" @click="toggleSearchInput" color="white" />
          </div>
        </div>

        <q-section class="row items-center q-gutter-sm no-wrap flex action-icons">
          <q-btn flat no-caps icon-right="arrow_drop_down" class="text-weight-medium user-btn" style="font-size: 16px;"
            :label="authStore.userName ? `Hola, ${authStore.userName}` : 'Iniciar sesión'">
            <q-menu v-model="showMenu" transition-show="jump-down" transition-hide="jump-up" anchor="bottom middle"
              self="top middle" class="q-pa-none bg-transparent" :offset="[0, 8]" @mouseleave="hideMenuDelayed">
              <div class="menu-flecha bg-primary text-white shadow-10 q-pa-sm rounded-borders"
                style="min-width: 180px; font-size: 16px;" @mouseenter="keepMenuOpen" @mouseleave="hideMenuDelayed">
                <q-list separator class="text-secondary text-weight-medium">
                  <q-item clickable v-if="!authStore.user" @click="openLogin">
                    <q-item-section>Inicia sesión</q-item-section>
                  </q-item>

                  <q-item clickable v-if="!authStore.user" @click="goTo('/register')">
                    <q-item-section>Regístrate</q-item-section>
                  </q-item>

                  <q-item clickable v-if="authStore.user" @click="goTo('/account')">
                    <q-item-section>Mi cuenta</q-item-section>
                  </q-item>

                  <q-item clickable v-if="authStore.user" @click="logout">
                    <q-item-section>Cerrar sesión</q-item-section>
                  </q-item>
                </q-list>
              </div>
            </q-menu>
          </q-btn>

          <q-btn flat round icon="favorite_border" class="q-mr-xs" @click="goTo('/wishlist')" />
         <router-link to="/car">
          <q-btn flat round icon="shopping_cart" class="text-white">
            <q-badge floating color="secondary" text-color="white">{{ authStore.cartItems.length }}</q-badge>
          </q-btn>
         </router-link>
          
        </q-section>

      </q-toolbar>
      <q-toolbar v-if="showMobileSearchInput && $q.screen.lt.md" class="q-px-md q-py-sm bg-primary">
        <q-input dense outlined color="primary" bg-color="white" placeholder="Buscar en tu tienda" v-model="search"
          class="full-width search-input-mobile">
          <template v-slot:append>
            <q-btn flat dense icon="search" color="secondary" class="search-btn" @click="performSearch" />
          </template>
        </q-input>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="sideMenuOpen" side="left" overlay behavior="mobile" :width="320" class="bg-white">
      <div class="bg-primary text-white q-pa-md">
        <div class="row items-center">
          <div class="col">
            <div class="text-h6">Categorías</div>
          </div>
          <q-btn flat round dense icon="close" color="white" @click="closeSideMenu" />
        </div>
      </div>

      <q-list class="full-height">
        <div v-for="category in categories" :key="category.value" class="category-item">
          <q-item clickable @click="toggleCategory(category)" class="category-main-item"
            :class="{ 'active-category': expandedCategory === category.value }">
            <q-item-section avatar>
              <q-icon :name="category.icon || 'category'" color="primary" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-medium">{{ category.label }}</q-item-label>
            </q-item-section>

            <q-item-section side v-if="category.subcategories?.length">
              <q-icon :name="expandedCategory === category.value ? 'expand_less' : 'expand_more'" color="grey-6" />
            </q-item-section>
          </q-item>

          <q-slide-transition>
            <div v-show="expandedCategory === category.value" v-if="category.subcategories?.length">
              <q-list class="subcategories-list bg-grey-1">
                <q-item v-for="subcategory in category.subcategories" :key="subcategory.value" clickable
                  @click="selectSubcategory(category, subcategory)" class="subcategory-item">
                  <q-item-section avatar>
                    <q-icon name="subdirectory_arrow_right" color="grey-6" size="sm" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-grey-8">{{ subcategory.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-slide-transition>

          <q-separator v-if="category.value !== 'all'" />
        </div>

        <q-item clickable @click="goToAllCategories" class="q-mt-md bg-grey-2">
          <q-item-section avatar>
            <q-icon name="apps" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium text-primary">Ver todas las categorías</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="footer-dark">
      <div class="container q-py-lg">
        <div class="row justify-between items-start q-col-gutter">
          <div class="col-xs-12 col-sm-4 text-center text-sm-left">
            <router-link to="/">
              <q-avatar square size="80px" class="q-mb-md">
                <img src="/logo2.png" alt="Logo de Tu Tienda Online CCL" />
              </q-avatar>
            </router-link>
            <p class="text-grey-4 q-mt-md">Tu destino para productos de calidad. ¡Descubre lo que tenemos para ti!</p>
          </div>

          <div class="col-xs-12 col-sm-4 text-center text-sm-left">
            <div class="text-h6 text-white q-mb-md">Navegación Rápida</div>
            <q-list dense class="text-grey-4">
              <q-item clickable v-ripple @click="goTo('/')">
                <q-item-section>Inicio</q-item-section>
              </q-item>
              <q-item clickable v-ripple @click="goTo('/categories')">
                <q-item-section>Categorías</q-item-section>
              </q-item>
              <q-item clickable v-ripple @click="goTo('/about')">
                <q-item-section>Sobre Nosotros</q-item-section>
              </q-item>
              <q-item clickable v-ripple @click="goTo('/contact')">
                <q-item-section>Contacto</q-item-section>
              </q-item>
            </q-list>
          </div>

          <div class="col-xs-12 col-sm-4 text-center text-sm-left">
            <div class="text-h6 text-white q-mb-md">Contáctanos</div>
            <div class="q-mb-md">
              <div class="flex items-center q-mb-sm justify-center justify-sm-start">
                <q-icon name="location_on" color="white" size="sm" class="q-mr-sm" />
                <span class="contact-text text-white">Calle 25 #15-30, San Gil, 684031</span>
              </div>
              <div class="flex items-center q-mb-sm justify-center justify-sm-start">
                <q-icon name="phone" color="white" size="sm" class="q-mr-sm" />
                <a href="tel:+573209936856" class="contact-link">+57 320-9936-856</a>
              </div>
              <div class="flex items-center justify-center justify-sm-start">
                <q-icon name="email" color="white" size="sm" class="q-mr-sm" />
                <a href="mailto:info@ccl.com" class="contact-link">info@ccl.com</a>
              </div>
            </div>

            <div class="text-h6 text-white q-mt-lg q-mb-md">Síguenos</div>
            <div class="row justify-center justify-sm-start q-gutter-md social-icons">
              <q-btn
      round
      size="lg"
      flat
      icon="facebook"
      color="white"
      class="social-btn facebook"
     
      @click="openSocialLink('https://www.facebook.com/share/1ZM5Djhuo5/')"
    />

              <q-btn flat size="md" class="social-btn instagram" round @click="openSocialLink('https://www.instagram.com/laura_av0?igsh=d3NoNWFpZTVxMG91')" color="white">
  <img src="https://img.icons8.com/win10/512/FFFFFF/instagram-new.png" style="width: 44px; height: 44px;" />
</q-btn>

              <q-btn flat round size="md" class="social-btn whatsapp" @click="openLink('https://wa.me/573164110047')" color="white">
  <img src="https://img.icons8.com/ios11/512/FFFFFF/whatsapp.png" alt="WhatsApp" style="width: 34px; height: 34px;" />
</q-btn>
            </div>
          </div>
        </div>
      </div>

      <q-separator color="grey-7" />

      <div class="copyright-section q-py-md">
        <div class="container text-center text-grey-5 text-caption">
          © {{ new Date().getFullYear() }} Tu Tienda Online CCL. Todos los derechos reservados. | Desarrollo web por
          <a href="#" class="text-white text-bold text-decoration-none hover-underline">TusProgramadoresdeConfianza</a>
        </div>
      </div>
    </q-footer>

  </q-layout>

  <LoginDialog v-model="showLoginDialog" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../store/store.js';
import { useRouter } from 'vue-router';
import LoginDialog from '../components/LoginDialog.vue';
import { getData } from '../services/apiClient.js';


const authStore = useAuthStore();
const router = useRouter();
const search = ref('');
const showLoginDialog = ref(false);
const showMenu = ref(false);
const selectedCategory = ref('Todas las categorías');
const sideMenuOpen = ref(false);
const expandedCategory = ref(null);
const showMobileSearchInput = ref(false); // Nuevo estado para la barra de búsqueda móvil

let hideTimer = null;

const categories = ref([]);

onMounted(async () => {
  try {
    const response = await getData('categorias');
    categories.value = [
      {
        label: 'Todas las categorías',
        value: 'all',
        icon: 'apps'
      },
      ...response.map(c => ({
        label: c.name,
        value: c.codigo,
        subcategories: c.subcategories || []
      }))
    ];
  } catch (error) {
    console.error('Error al cargar categorías:', error);
  }
});

function toggleSideMenu() {
  sideMenuOpen.value = !sideMenuOpen.value;
}

function closeSideMenu() {
  sideMenuOpen.value = false;
  expandedCategory.value = null;
}

function toggleCategory(category) {
  if (category.subcategories?.length) {
    expandedCategory.value = expandedCategory.value === category.value ? null : category.value;
  } else {
    selectCategory(category);
  }
}

function selectCategory(category) {
  selectedCategory.value = category.label;
  router.push({
    path: '/search-results',
    query: { category: category.value }
  });
  closeSideMenu();
}

function selectSubcategory(category, subcategory) {
  router.push({
    path: '/search-results',
    query: {
      category: category.value,
      subcategory: subcategory.value
    }
  });
  closeSideMenu();
}

function goTo(route) {
  router.push(route);
  showMenu.value = false;
}

function logout() {
  authStore.logout();
  showMenu.value = false;
}

function openLogin() {
  showLoginDialog.value = true;
  showMenu.value = false;
}

function keepMenuOpen() {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
}

function hideMenuDelayed() {
  hideTimer = setTimeout(() => {
    showMenu.value = false;
  }, 1000);
}

function performSearch() {
  const queryParams = {
    search: search.value
  };

  

  router.push({ path: '/search-results', query: queryParams });
  showMobileSearchInput.value = false; // Oculta la barra de búsqueda móvil después de buscar
}

function toggleSearchInput() {
  showMobileSearchInput.value = !showMobileSearchInput.value;
}

// Función para abrir enlaces sociales
function openSocialLink(url) {
  window.open(url, '_blank');
}
</script>

<style>
/* HEADER STYLES */
.q-header {
  background: linear-gradient(to top, black 90%, #068FFF 100%);
  color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.logo {
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.menu-toggle-btn,
.user-btn,
.action-icons .q-btn {
  transition: all 0.2s ease;
  border-radius: 4px;
}

.menu-toggle-btn:hover,
.user-btn:hover,
.action-icons .q-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.search-container {
  display: flex;
  align-items: stretch;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 100%;
}

.search-input .q-field__control {
  border-radius: 0;
  height: 44px;
  
  /* Slightly taller for better feel */
}

.search-input .q-field__native {
  padding-left: 12px;
}

.search-btn {
  border-radius: 0 4px 4px 0;
  width: 50px;
  /* Wider search button */
  height: 44px;
  background-color: #068FFF;
  /* Primary color for search button */
  color: white;
}

.search-btn:hover {
  background-color: #056ee0;
  /* Darker on hover */
}

/* Dropdown menu for user */
.menu-flecha {
  position: relative;
  /* Adjust background for a cleaner look */
  background: #2b2b2b !important;
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.menu-flecha .q-list {
  background: transparent;
}

.menu-flecha .q-item {
  color: white;
  /* Make items white */
  transition: background-color 0.2s ease;
}

.menu-flecha .q-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Lateral menu styles (kept mostly same as they are good) */
.category-item {
  border-bottom: 1px solid #e0e0e0;
}




.q-drawer {
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
}


/* FOOTER STYLES */
.footer-dark {
  background: linear-gradient(to bottom, black 90%, #068FFF 100%);
  color: white;
  padding-top: 30px;
  padding-bottom: 10px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Social Icons */
.social-icons .q-btn {
  font-size: 28px;
  /* Slightly larger icons */
  width: 55px;
  height: 55px;
  
  border-radius: 50%;
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  color: white;
  /* Default color */
}

.social-icons .q-btn:hover {
  transform: translateY(-5px) scale(1.1);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

.social-icons .q-btn.facebook:hover {
  background-color: #3b5998;
  border-color: #3b5998;
}

.social-icons .q-btn.instagram:hover {
  background: radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%);
  border-color: #d6249f;
}

.social-icons .q-btn.whatsapp:hover {
  background-color: #25D366;
  border-color: #25D366;
}

/* Contact Info */
.contact-link,
.contact-text {
  color: #068FFF;
  /* Use the primary blue color for links */
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease, text-decoration 0.3s ease;
  display: flex;
  align-items: center;
}

.contact-link:hover {
  color: #056ee0;
  /* Darker blue on hover */
  text-decoration: underline;
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  /* Space between items */
}

.contact-item .q-icon {
  margin-right: 10px;
}

/* Copyright Section */
.copyright-section {
  background: rgba(0, 0, 0, 0.4);
  /* Slightly darker background */
  padding: 15px 0;
}

.copyright-section .text-caption {
  font-size: 0.85rem;
}

.hover-underline:hover {
  text-decoration: underline !important;
}


/* RESPONSIVENESS */
@media (max-width: 1024px) {
  .search-bar-wrapper {
    max-width: 400px;
    /* Adjust search bar width */
  }
}

@media (max-width: 768px) {
  .q-toolbar {
    flex-wrap: wrap;
    justify-content: center;
  }

  .search-bar-wrapper {
    order: 3;
    /* Move search icon/input to the bottom in mobile */
    flex-basis: 100%;
    /* Take full width */
    margin-top: 10px;
    text-align: center;
  }

  .search-container {
    display: none;
    /* Hide desktop search bar */
  }

  .action-icons {
    order: 2;
    /* Keep action icons next to logo/menu */
    width: auto;
  }

  .user-btn {
    font-size: 14px !important;
    /* Smaller font for user button */
    padding: 0 8px;
  }

  .logo {
    margin: 0 10px;
    /* Adjust logo margin */
  }

  .footer-dark .container {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .footer-dark .q-col-gutter-lg {
    gap: 40px 0;
    /* Increase vertical gap between columns */
  }

  .footer-dark .col-sm-4 {
    text-align: center;
    /* Center text in mobile */
    width: 100%;
  }

  .contact-item {
    justify-content: center;
    /* Center contact items */
  }

  .social-icons {
    justify-content: center;
    /* Center social icons */
  }
}

@media (max-width: 480px) {
  .q-avatar {
    size: 60px !important;
    /* Smaller logo on very small screens */
  }

  .menu-toggle-btn {
    font-size: 20px;
    padding: 6px;
  }

  .action-icons .q-btn {
    font-size: 20px;
    padding: 6px;
  }

  .user-btn {
    padding: 0 5px;
    min-width: unset;
  }
}
</style>