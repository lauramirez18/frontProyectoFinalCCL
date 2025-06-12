<template>
  <q-layout view="hHh Lpr fff" style="background: linear-gradient(180deg, #e8f2fa 0%, #ffffff 100%);">
    <q-header elevated class="header-main">
      <q-toolbar class="header-toolbar">
        <div class="header-left">
          <q-btn
            flat
            dense
            round
            icon="menu"
            class="menu-toggle-btn"
            @click="toggleSideMenu"
          >
            <q-tooltip>Menú de categorías</q-tooltip>
          </q-btn>
          <router-link to="/" class="logo-link">
            <q-avatar square size="50px" class="logo">
              <img src="/logo2.png" alt="Logo CCL" />
            </q-avatar>
          </router-link>
        </div>

        <div class="header-center" v-if="$q.screen.gt.sm">
          <div class="search-wrapper">
            <q-input
              v-model="search"
              dense
              outlined
              placeholder="¿Qué estás buscando?"
              class="search-input"
              bg-color="white"
              @keyup.enter="performSearch"
              @blur="setTimeout(() => showSuggestions = false, 200)"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="grey-7" />
              </template>
              <template v-slot:append>
                <q-btn
                  flat
                  dense
                  icon="arrow_forward"
                  color="primary"
                  class="search-btn"
                  @click="performSearch"
                >
                  <q-tooltip>Buscar</q-tooltip>
                </q-btn>
              </template>
            </q-input>
            <SearchSuggestions
              v-if="showSuggestions"
              :suggestions="searchSuggestions"
              @select="selectSuggestion"
            />
          </div>
        </div>

        <div class="header-right">
          <q-btn flat no-caps class="user-btn">
            <q-avatar
              v-if="authStore.userName"
              size="32px"
              color="primary"
              text-color="white"
              class="q-mr-sm"
            >
              {{ getUserInitials }}
            </q-avatar>
            <div class="user-info">
              <span class="user-greeting" v-if="authStore.userName">Hola,</span>
              <span class="user-name">{{ authStore.userName || 'Iniciar sesión' }}</span>
            </div>
            <q-icon name="arrow_drop_down" class="q-ml-xs" />

            <q-menu
              v-model="showMenu"
              transition-show="jump-down"
              transition-hide="jump-up"
              class="user-menu"
              :offset="[0, 10]"
              @mouseleave="hideMenuDelayed"
            >
              <div class="menu-content">
                <q-list separator>
                  <q-item clickable v-if="!authStore.user" @click="openLogin">
                    <q-item-section avatar>
                      <q-icon name="login" color="white" />
                    </q-item-section>
                    <q-item-section>Iniciar sesión</q-item-section>
                  </q-item>

                  <q-item clickable v-if="!authStore.user" @click="goTo('/register')">
                    <q-item-section avatar>
                      <q-icon name="person_add" color="white" />
                    </q-item-section>
                    <q-item-section>Regístrate</q-item-section>
                  </q-item>

                  <q-item clickable v-if="authStore.user" @click="goTo('/account')">
                    <q-item-section avatar>
                      <q-icon name="manage_accounts" color="white" />
                    </q-item-section>
                    <q-item-section>Mi cuenta</q-item-section>
                  </q-item>

                  <q-item clickable v-if="authStore.user" @click="logout">
                    <q-item-section avatar>
                      <q-icon name="logout" color="white" />
                    </q-item-section>
                    <q-item-section>Cerrar sesión</q-item-section>
                  </q-item>
                </q-list>
              </div>
            </q-menu>
          </q-btn>

          <q-btn
            flat
            round
            :icon="authStore.favorites.length > 0 ? 'favorite' : 'favorite_border'"
            class="action-btn favorite-btn"
            :class="{'has-items': authStore.favorites.length > 0}"
            @click="$router.push('/favorites')"
          >
            <q-badge
              v-if="authStore.favorites.length > 0"
              floating
              color="red"
              text-color="white"
            >
              {{ authStore.favorites.length }}
            </q-badge>
            <q-tooltip>Mis Favoritos</q-tooltip>
          </q-btn>

          <router-link to="/car" class="cart-link">
            <q-btn flat round icon="shopping_cart" class="action-btn cart-btn" color="white">
              <q-badge
                v-if="authStore.cartItems.length > 0"
                floating
                color="secondary"
                text-color="white"
              >
                {{ authStore.cartItems.length }}
              </q-badge>
              <q-tooltip>Carrito de compras</q-tooltip>
            </q-btn>
          </router-link>
        </div>
      </q-toolbar>

      <q-toolbar v-if="$q.screen.lt.md" class="mobile-search-toolbar">
        <div class="mobile-search-wrapper">
          <q-input
            v-model="search"
            dense
            outlined
            placeholder="¿Qué estás buscando?"
            class="mobile-search-input"
            bg-color="white"
            @keyup.enter="performSearch"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="grey-7" />
            </template>
            <template v-slot:append>
              <q-btn
                flat
                dense
                icon="arrow_forward"
                color="primary"
                class="search-btn"
                @click="performSearch"
              />
            </template>
          </q-input>
        </div>
      </q-toolbar>
    </q-header>

    <!-- Breadcrumbs -->
    <div v-if="showBreadcrumbs" class="breadcrumbs-container q-px-md" style="margin-top: 56px; background: linear-gradient(180deg, #e8f2fa 0%, #ffffff 100%);">
      <Breadcrumbs :custom-items="customBreadcrumbsInjected ? customBreadcrumbsInjected : undefined" />
    </div>

    <q-drawer v-model="sideMenuOpen" side="left" overlay behavior="mobile" :width="320" class="bg-white">
      <div class="drawer-header">
        <div class="row items-center justify-between">
          <div class="col">
            <div class="text-h6">Explorar Categorías</div>
          </div>
          <q-btn flat round dense icon="close" color="white" class="close-btn" @click="closeSideMenu" />
        </div>
      </div>

      <q-scroll-area style="height: calc(100vh - 120px);">
        <q-list padding>
          <div class="category-item">
            <q-item clickable @click="selectCategory({label: 'Todas las categorías', value: 'all'})" class="category-main-item">
              <q-item-section>
                <q-item-label>Todos los productos</q-item-label>
              </q-item-section>
            </q-item>
          </div>

          <div class="category-item">
            <q-item clickable @click="goTo('/ofertas')" class="category-main-item special-offer">
              <q-item-section>
                <q-item-label>Ofertas</q-item-label>
              </q-item-section>
            </q-item>
          </div>

          <q-separator class="q-my-md" />

          <div v-for="category in categories" :key="category.value" class="category-item">
            <q-item 
              clickable
              class="category-main-item"
              @click="selectCategory(category)"
            >
              <q-item-section>
                <q-item-label>{{ category.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </div>
        </q-list>
      </q-scroll-area>
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

              <q-btn flat round size="md" class="social-btn whatsapp" @click="openSocialLink('https://wa.me/573164110047')" color="white">
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

  <auth-dialog v-model="showAuth" />
</template>

<script setup>
import { ref, onMounted, computed, inject, watch } from 'vue';
import { useAuthStore } from '../store/store.js';
import { useRouter, useRoute } from 'vue-router';
import AuthDialog from '../components/AuthDialog.vue';
import { getData } from '../services/apiClient.js';
import Breadcrumbs from '../components/ui/Breadcrumbs.vue';
import SearchSuggestions from '../components/SearchSuggestions.vue';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const search = ref('');
const searchSuggestions = ref([]);
const showSuggestions = ref(false);
const searchTimeout = ref(null);

// Ocultar breadcrumbs en rutas específicas
const hideBreadcrumbsOn = ['login', 'register', 'home'];

const showBreadcrumbs = computed(() => {
  return !hideBreadcrumbsOn.includes(route.name);
});

const showMenu = ref(false);
const showAuth = ref(false);
const selectedCategory = ref('Todas las categorías');
const sideMenuOpen = ref(false);
const expandedCategory = ref(null);
const showMobileSearchInput = ref(false);

let hideTimer = null;

const categories = ref([]);
const loading = ref(false);

const customBreadcrumbsInjected = inject('customBreadcrumbs', null);

onMounted(async () => {
  loading.value = true;
  try {
    console.log('Iniciando carga de categorías...');
    const response = await getData('categorias');
    console.log('Respuesta del servidor categorías:', response);
    
    if (Array.isArray(response)) {
      categories.value = response.map(c => ({
        label: c.nombre || c.name,
        value: c._id
      }));
      console.log('Categorías cargadas:', categories.value);
    } else {
      console.error('La respuesta no es un array:', response);
      categories.value = [];
    }
  } catch (error) {
    console.error('Error al cargar categorías:', error);
    categories.value = [];
  } finally {
    loading.value = false;
  }
});

function toggleSideMenu() {
  sideMenuOpen.value = !sideMenuOpen.value;
}

function closeSideMenu() {
  sideMenuOpen.value = false;
}

function selectCategory(category) {
  console.log('Categoría seleccionada:', category);
  selectedCategory.value = category.label;

  // Si es "Todas las categorías", no enviamos parámetro de categoría
  if (category.value === 'all') {
    router.push({
      path: '/productos'
    });
  } else {
    router.push({
      path: '/search-results',
      query: { 
        category: category.value,
        categoryName: category.label
      }
    });
  }
  closeSideMenu();
}

function selectSubcategory(category, subcategory) {
  console.log('Subcategoría seleccionada:', { category, subcategory });
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
  router.replace('/home');
}

function openLogin() {
  showAuth.value = true;
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

// Función para obtener sugerencias de búsqueda
const getSearchSuggestions = async (query) => {
  if (!query || query.length < 2) {
    searchSuggestions.value = []
    return
  }

  try {
    const response = await getData('productos/sugerencias-busqueda', { query })
    searchSuggestions.value = response || []
  } catch (error) {
    console.error('Error al obtener sugerencias:', error)
    searchSuggestions.value = []
  }
}

// Observar cambios en el término de búsqueda
watch(search, (newValue) => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  if (newValue && newValue.length >= 2) {
    searchTimeout.value = setTimeout(() => {
      getSearchSuggestions(newValue)
      showSuggestions.value = true
    }, 300)
  } else {
    searchSuggestions.value = []
    showSuggestions.value = false
  }
})

// Función para realizar la búsqueda
const performSearch = () => {
  if (search.value.trim()) {
    router.push({
      name: 'SearchResults',
      query: { q: search.value.trim() }
    })
    showSuggestions.value = false
  }
}

// Función para seleccionar una sugerencia
const selectSuggestion = (suggestion) => {
  search.value = suggestion.nombre
  showSuggestions.value = false
}

// Función para abrir enlaces sociales
function openSocialLink(url) {
  window.open(url, '_blank');
}

const getUserInitials = computed(() => {
  if (authStore.userName) {
    return authStore.userName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return '';
});
</script>

<style>
/* Estilos del breadcrumbs */
.breadcrumbs-container {
  background: linear-gradient(180deg, #e8f2fa 0%, #ffffff 100%) !important;
}

.breadcrumbs-container .q-breadcrumbs {
  background: transparent;
  padding: 0;
  color: white;
}

.breadcrumbs-container .q-breadcrumbs .q-breadcrumbs__el {
  color: rgba(255, 255, 255, 0.8);
}

.breadcrumbs-container .q-breadcrumbs .q-breadcrumbs__el--disabled {
  color: white;
  font-weight: 500;
}

/* HEADER STYLES */
.header-main {
  background: linear-gradient(135deg, #068FFF, #0052a3);
  position: relative;
  color: white;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(to right,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%
    );
  }

  /* Shine effect for the header */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, 
      transparent 30%, 
      rgba(255, 255, 255, 0.1) 50%, 
      transparent 70%
    );
    pointer-events: none;
    animation: shine 3s infinite linear; /* Apply animation */
  }
}

.header-toolbar {
  
  margin: 0 auto;
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
  position: relative;
  z-index: 1;
  background: rgba(0, 0, 0, 0.4);
}

/* Mejoras visuales para elementos del header */
.menu-toggle-btn {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 40px;
  height: 40px;
  font-size: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(6, 143, 255, 0.2);
    border-color: rgba(6, 143, 255, 0.3);
    transform: rotate(90deg);
    box-shadow: 0 0 15px rgba(6, 143, 255, 0.2);
  }
}

.logo-link {
  text-decoration: none;
}

.logo {
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
}

.header-left{
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Sección central */
.header-center {
  flex-grow: 1;
  max-width: 700px;
  margin: 0 2rem;
}

.search-wrapper {
  position: relative;
  width: 100%;
  max-width: 600px;
}

.search-input {
  width: 100%;
  .q-field__control {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    height: 40px;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    backdrop-filter: blur(4px);
  }

  .q-field__control:hover {
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 0 15px rgba(6, 143, 255, 0.1);
  }

  &.q-field--focused .q-field__control {
    background: white;
    border-color: #068FFF;
    box-shadow: 0 0 0 4px rgba(6, 143, 255, 0.15);
  }

  .q-field__prepend {
    padding-left: 12px;
  }

  .q-icon {
    font-size: 1.2rem;
    transition: color 0.3s ease;
  }
}

.search-btn {
  margin-right: 4px;
  border-radius: 6px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #068FFF;
    color: white !important;
    transform: translateX(2px);
  }
}

/* Sección derecha */
.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-btn {
  padding: 4px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(6, 143, 255, 0.2);
    border-color: rgba(6, 143, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 0 15px rgba(6, 143, 255, 0.2);
  }

  .q-avatar {
    background: linear-gradient(135deg, #068FFF 0%, #0056b3 100%);
    border: 2px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 1.2;
  }

  .user-greeting {
    font-size: 0.7rem;
    opacity: 0.8;
  }

  .user-name {
    font-weight: 600;
    font-size: 0.95rem;
  }
}

/* Estilos para los breadcrumbs */
.breadcrumbs-container {
  background: linear-gradient(180deg, #e8f2fa 0%, #ffffff 100%);
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.breadcrumbs-container .q-breadcrumbs {
  background: transparent;
  padding: 0;
  color: white;
}

.breadcrumbs-container .q-breadcrumbs .q-breadcrumbs__el {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.breadcrumbs-container .q-breadcrumbs .q-breadcrumbs__el--disabled {
  color: white;
  font-weight: 500;
}

.breadcrumbs-container .q-breadcrumbs .q-breadcrumbs__separator {
  color: rgba(255, 255, 255, 0.5);
  margin: 0 4px;
}

.action-btn {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(6, 143, 255, 0.2);
    border-color: rgba(6, 143, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 0 15px rgba(6, 143, 255, 0.2);
  }

  &.has-items {
    color: #ff4081;
    background: rgba(255, 64, 129, 0.1);
    border-color: rgba(255, 64, 129, 0.2);

    &:hover {
      background: rgba(255, 64, 129, 0.2);
      border-color: rgba(255, 64, 129, 0.3);
    }
  }
}

.cart-link {
  text-decoration: none;
}

/* Menú de usuario */
.user-menu {
  margin-top: 5px;
}

.menu-content {
  background: #2b2b2b;
  border-radius: 8px;
  padding: 8px;
  min-width: 200px;

  .q-item {
    border-radius: 6px;
    color: white;
    min-height: 40px;
    transition: background-color 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .q-icon {
      font-size: 1.6rem;
    }
  }
}

/* Barra de búsqueda móvil */
.mobile-search-toolbar {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.mobile-search-wrapper {
  width: 100%;
}

.mobile-search-input {
  width: 100%;

  .q-field__control {
    background: rgba(255, 255, 255, 0.9);
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .header-center {
    max-width: 400px;
    margin: 0 1rem;
  }
}

@media (max-width: 768px) {
  .header-toolbar {
    height: 60px;
    padding: 0.5rem;
  }

  .logo {
    width: 40px;
    height: 40px;
  }

  .user-btn {
    padding: 4px 8px;

    .user-name {
      font-size: 0.85rem;
    }
  }

  .action-btn {
    width: 36px;
    height: 36px;
  }
}

/* FOOTER STYLES */
.footer-dark {
  background: linear-gradient(135deg, #068FFF, #0052a3);
  color: white;
  padding-top: 40px;
  padding-bottom: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(to right,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%
    );
  }

  /* Shine effect for the footer */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, 
      transparent 30%, 
      rgba(255, 255, 255, 0.08) 50%, 
      transparent 70%
    ); /* Slightly less opaque for footer */
    pointer-events: none;
    animation: shine 3s infinite linear; /* Apply animation */
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

/* Social Icons */
.social-icons .q-btn {
  font-size: 28px;
  width: 55px;
  height: 55px;
  border-radius: 50%;
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.social-icons .q-btn:hover {
  transform: translateY(-5px) scale(1.1);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 255, 255, 0.4);
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
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.contact-link:hover {
  color: white;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  transform: translateX(5px);
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.contact-item .q-icon {
  margin-right: 12px;
  font-size: 1.2em;
}

/* Copyright Section */
.copyright-section {
  background: rgba(0, 0, 0, 0.2);
  padding: 20px 0;
  margin-top: 30px;
  position: relative;
  backdrop-filter: blur(5px);
}

.copyright-section .text-caption {
  font-size: 0.9rem;
  opacity: 0.9;
}

.hover-underline {
  position: relative;
  text-decoration: none !important;
  color: white !important;
  font-weight: 600;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: white;
    transition: width 0.3s ease;
  }
  
  &:hover::after {
    width: 100%;
  }
}

/* Estilos para el botón de usuario */
.user-btn {
  padding: 4px 12px;
  border-radius: 8px;
  min-width: 150px;
  transition: all 0.3s ease;
}

.user-btn .q-avatar {
  background: linear-gradient(135deg, #068FFF 0%, #056ee0 100%);
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.user-btn .text-caption {
  font-size: 0.7rem;
  opacity: 0.8;
  line-height: 1;
}

.user-btn .text-subtitle2 {
  line-height: 1.2;
  white-space: nowrap;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Estilos del menú de categorías */
.q-drawer {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-right: 1px solid rgba(0, 0, 0, 0.1);
}

.category-item {
  margin-bottom: 4px;
}

.category-main-item {
  border-radius: 8px;
  margin: 4px 8px;
  padding: 8px 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(6, 143, 255, 0.1);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateX(4px);
    
    &::before {
      opacity: 1;
    }
  }

  &.active-category {
    background: rgba(6, 143, 255, 0.15);
  }

  &.special-offer {
    &:hover::before {
      background: rgba(255, 64, 129, 0.1);
    }

    &.active-category {
      background: rgba(255, 64, 129, 0.15);
    }
  }

  .q-item__label {
    font-size: 1rem;
    font-weight: 500;
    color: #2c3e50;
  }
}

.subcategories-list {
  margin-left: 24px;
  border-left: 2px solid rgba(6, 143, 255, 0.2);
  background: transparent !important;
}

.subcategory-item {
  border-radius: 6px;
  margin: 2px 8px;
  padding: 8px 16px;
  min-height: 40px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: rgba(6, 143, 255, 0.08);
    transform: translateX(4px);
  }

  .q-item__label {
    font-size: 0.95rem;
    color: #445668;
  }
}

/* Encabezado del menú de categorías */
.drawer-header {
  background: linear-gradient(135deg, #068FFF 0%, #0056b3 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
    animation: shine 3s infinite linear;
  }

  .text-h6 {
    color: white;
    font-weight: 600;
    margin: 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .close-btn {
    opacity: 0.9;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      opacity: 1;
      transform: rotate(90deg);
    }
  }
}

/* Keyframes for the shine animation (reused for header, footer, and drawer) */
@keyframes shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Estilos adicionales para el drawer */
.drawer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding: 12px;
}

.search-input {
  .q-field__control {
    background: white;
    border-radius: 8px;
    height: 40px;
    transition: all 0.3s ease;
    border: 1px solid rgba(0, 0, 0, 0.1);

    &:hover {
      border-color: rgba(6, 143, 255, 0.3);
      box-shadow: 0 2px 8px rgba(6, 143, 255, 0.1);
    }
  }

  &.q-field--focused .q-field__control {
    border-color: #068FFF;
    box-shadow: 0 0 0 3px rgba(6, 143, 255, 0.15);
  }
}
</style>