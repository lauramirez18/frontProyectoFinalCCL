<template>

    <q-layout view="hHh Lpr fff">
  <q-header elevated class="bg-primary text-white  q-py-sm z-top">
    <q-toolbar class="q-gutter-sm q-px-sm row items-center justify-between q-col-gutter-sm ">

<!-- Botón menú -->
<q-btn flat round icon="menu" @click="toggleDrawer"  />

<!-- Logo -->
<q-avatar square size="60px">
  <img src="/logo2.png" alt="Logo" />
</q-avatar>

<!-- Buscador -->
<div class="col-grow q-mx-sm" style="max-width: 600px;">
  <q-input
    v-if="$q.screen.gt.xs"
    dense
    outlined
    color="primary"
    bg-color="white"
    placeholder="Buscar en tu tienda"
    v-model="search"
    class="bg-white"
    
  >
    <template v-slot:append>
      <q-icon name="search" color="secondary" class="cursor-pointer" />
    </template>
  </q-input>
</div>

<!-- Botones de acción -->
<div class="row items-center q-gutter-sm no-wrap">
  <q-btn flat no-caps label="Hola, Inicia sesión" icon="person" class="text-weight-medium" />
  <q-btn flat round icon="favorite_border" />
  <q-btn flat round icon="shopping_cart">
    <q-badge floating color="secondary" text-color="white">0</q-badge>
  </q-btn>
</div>
</q-toolbar>
  </q-header>

  <q-drawer v-model="leftDrawerOpen" show-if-above
   side="left" behavior="mobile" bordered
   :mini="miniState"
          @mouseenter="miniState = false"
          @mouseleave="miniState = true"
          mini-to-overlay
          :width="200" 
          :breakpoint="500"
          :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'">
   <q-scroll-area class="fit"   :horizontal-thumb-style="{ opacity: 0 }">
            <q-list padding style="height: calc(100% - 150px); margin-top: 80px; border-right: 1px solid #ddd; font-size:11px; " >
              <q-item clickable v-ripple to="/home" active-class="my-menu-link" exact>
                <q-item-section avatar>
                  <q-icon name="home" />
                </q-item-section>
  
                <q-item-section>
                  Inicio
                </q-item-section>
              </q-item>
              <q-item clickable v-ripple to="/invoice" active-class="my-menu-link">
                <q-item-section avatar>
                  <q-icon name="receipt"  />
                </q-item-section>
  
                <q-item-section>
                  Facturas
                </q-item-section>
              </q-item>
  
              <q-item clickable v-ripple to="/customer" active-class="my-menu-link">
                <q-item-section avatar>
                  <q-icon name="groups" />
                </q-item-section>
  
                <q-item-section>
                  Clientes
                </q-item-section>
              </q-item>
  
              <q-item clickable v-ripple to="/product" active-class="my-menu-link">
                <q-item-section avatar>
                  <q-icon name="category" />
                </q-item-section>
  
                <q-item-section>
                  Productos
                </q-item-section>
              </q-item>
  
              <q-separator />

            </q-list>
          </q-scroll-area>
  </q-drawer>

  <q-page-container>
    <router-view />
  </q-page-container>



  <q-footer class="bg-primary text-white q-pt-md q-pb-lg">
  <div class="q-pa-md">
    <!-- Información superior (Contacto, Email, Teléfonos) -->
    

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

  
</template>

<script setup>
import { ref } from 'vue'

const search = ref('')
const leftDrawerOpen = ref(false)

const toggleDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
