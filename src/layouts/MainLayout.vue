<template>
  <q-layout view="hHh Lpr fff">
    <q-header elevated class="text-white header">
      <q-toolbar class=" row items-center justify-around q-col-gutter-sm">

        <!-- Logo -->
        <router-link to="/">
          <q-avatar square size="80px" class="cursor-pointer">
            <img src="/logo2.png" alt="Logo" />
          </q-avatar>
        </router-link>

        <!-- Buscador con botón de categorías -->
        <div class="col-grow q-mx-sm" style="max-width: 600px;">
          <div v-if="$q.screen.gt.xs" class="search-container">
            <!-- Botón de categorías -->
            <q-btn-dropdown
              no-caps
              class="categories-btn"
              color="secondary"
              :label="selectedCategory"
              dropdown-icon="arrow_drop_down"
            >
              <q-list separator class="text-secondary">
                <q-item 
                  clickable 
                  v-for="category in categories" 
                  :key="category.value"
                  @click="selectCategory(category)"
                  class="q-py-sm"
                  :class="{ 'bg-grey-2': selectedCategory === category.label }"
                  v-close-popup
                >
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ category.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>

            <!-- Input de búsqueda -->
            <q-input
              dense
              outlined
              color="primary"
              bg-color="white"
              placeholder="Buscar en tu tienda"
              v-model="search"
              class="search-input"
            >
              <template v-slot:append>
                <q-btn
                  flat
                  dense
                  icon="search"
                  color="secondary"
                  class="search-btn"
                  @click="performSearch"
                />
              </template>
            </q-input>
          </div>
        </div>

        <!-- Botones de acción -->
        <q-section class="row items-center q-gutter-sm no-wrap flex" style="justify-content: space-around;">
          
          <!-- Botón de usuario con menú hover -->
          <q-btn
            flat
            no-caps
         
            icon-right="arrow_drop_down"
            class="text-weight-medium user-btn "
            style="font-size: 16px;"
            :label="authStore.user ? `Hola, ${authStore.user}` : 'Hola, Iniciar sesión'"
            @mouseenter="showMenuOnHover"
            @mouseleave="hideMenuDelayed"
          >
            <q-menu
              v-model="showMenu"
              transition-show="jump-down"
              transition-hide="jump-up"
              anchor="bottom middle"
              self="top middle"
              class="q-pa-none bg-transparent"
              :offset="[0, 8]"
              @mouseleave="hideMenuDelayed"
            >
              <div 
                class="menu-flecha bg-primary text-white shadow-10 q-pa-sm rounded-borders" 
                style="min-width: 180px; font-size: 16px;"
                @mouseenter="keepMenuOpen"
                @mouseleave="hideMenuDelayed"
              >
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

          <q-btn flat round icon="favorite_border" />
          <q-btn flat round icon="shopping_cart">
            <q-badge floating color="secondary" text-color="white">0</q-badge>
          </q-btn>
        </q-section>

      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-primary text-white q-pt-md q-pb-lg">
      <div class="q-pa-md">
        <q-separator color="grey-7" spaced />

        <!-- Menú inferior de columnas -->
        <div class="row q-col-gutter-md q-mt-md">
          <div class="col-12 col-sm-6 col-md-3">
            <div class="text-h6 q-mb-sm">Nosotros</div>
            <ul class="q-pl-none" style="list-style: none;">
              <li><a href="#" class="text-white">Conócenos</a></li>
              <li><a href="#" class="text-white">Tiendas</a></li>
              <li><a href="#" class="text-white">Servicio al cliente</a></li>
              <li><a href="#" class="text-white">Trabaja con nosotros</a></li>
            </ul>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <div class="text-h6 q-mb-sm">Compras en Internet</div>
            <ul class="q-pl-none" style="list-style: none;">
              <li><a href="#" class="text-white">¿Cómo comprar?</a></li>
              <li><a href="#" class="text-white">Opciones de envío</a></li>
              <li><a href="#" class="text-white">Formas de pago</a></li>
            </ul>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <div class="text-h6 q-mb-sm">Nuestros servicios</div>
            <ul class="q-pl-none" style="list-style: none;">
              <li><a href="#" class="text-white">Instalaciones</a></li>
              <li><a href="#" class="text-white">Extiende tu garantía</a></li>
            </ul>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <div class="text-h6 q-mb-sm">Políticas</div>
            <ul class="q-pl-none" style="list-style: none;">
              <li><a href="#" class="text-white">Términos y condiciones</a></li>
              <li><a href="#" class="text-white">Política de privacidad</a></li>
              <li><a href="#" class="text-white">Cookies</a></li>
            </ul>
          </div>
        </div>
      </div>
    </q-footer>

  </q-layout>

  <!-- Login dialog -->
  <LoginDialog v-model="showLoginDialog" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../store/store.js';
import { useRouter } from 'vue-router'
import LoginDialog from '../components/LoginDialog.vue'
import {getData} from '../services/apiClient.js'

const authStore = useAuthStore();
const router = useRouter()
const search = ref('')
const showLoginDialog = ref(false)
const showMenu = ref(false)
const selectedCategory = ref('Todas las categorías')
let hideTimer = null



// Categorías disponibles
const categories = ref([])

// Carga de categorías
onMounted(async () => {
  try {
    const response = await getData('categorias') // Ajusta la URL
    categories.value = [
      { label: 'Todas las categorías', value: 'all' },
      ...response.map(c => ({
        label: c.name,
        value: c.codigo
      }))
    ]
  } catch (error) {
    console.error('Error al cargar categorías:', error)
  }
})

function goTo(route) {
  router.push(route)
  showMenu.value = false // Cerrar menú al navegar
}

function logout() {
  authStore.logout()
  showMenu.value = false // Cerrar menú al hacer logout
}

function openLogin() {
  showLoginDialog.value = true
  showMenu.value = false // Cerrar menú al abrir login
}

// Funciones para controlar el hover del menú de usuario
function keepMenuOpen() {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

function hideMenuDelayed() {
  hideTimer = setTimeout(() => {
    showMenu.value = false
  }, 1000) // 1000ms de delay antes de cerrar
}

function showMenuOnHover() {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
  showMenu.value = true
}

// Función para controlar el clic del menú de categorías
function toggleCategories() {
  showCategories.value = !showCategories.value
}

function selectCategory(category) {
  selectedCategory.value = category.label
  showCategories.value = false
  // Aquí puedes agregar lógica para filtrar productos por categoría
  console.log('Categoría seleccionada:', category)
}

function performSearch() {
  // Lógica de búsqueda
  console.log('Buscando:', search.value, 'en categoría:', selectedCategory.value)
}
</script>

<style>

/* Para activar el menú con hover del botón */
.user-btn {
  transition: all 0.2s ease;
}

.user-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}


.search-container {
  display: flex;
  align-items: stretch;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0,0,0,0.15);
}

.categories-btn {
  
  color: #333;
  border: none;
  border-radius: 4px 0 0 4px;
  padding: 0 12px;
  font-size: 13px;
  min-width: 140px;
  height: 40px;
  text-transform: none;
  border-right: 1px solid #ddd;
}

.categories-btn:hover {
  background-color: #e7e7e7;
}

.search-input {
  flex: 1;
  border-radius: 0;
}

.search-input .q-field__control {
  border-radius: 0;
  height: 40px;
}

.search-input .q-field__native {
  padding-left: 12px;
}

.search-btn {

  border-radius: 0 4px 4px 0;
  width: 45px;
  height: 40px;
}



.categories-menu {
  border: 1px solid #ddd;
  border-radius: 4px;
}

.categories-menu .q-item {
  padding: 8px 16px;
  font-size: 13px;
}


/* Responsive adjustments */
@media (max-width: 768px) {
  .categories-btn {
    min-width: 120px;
    font-size: 12px;
  }
}
</style>