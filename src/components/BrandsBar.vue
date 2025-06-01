<template>
  <div class="bg-black full-width banner-brand">
    <h6>Las mejores marcas de la Industria</h6>

    <div class="q-gutter-sm row items-center justify-center">
      <div
        v-for="(brand, index) in brands"
        :key="index"
        class="col-6 col-sm-3 col-md-2 col-lg-2 q-ma-sm"
        @click="goToBrandProducts(brand)"
      >
        <q-card flat bordered class="q-pa-sm flex flex-center brand-card">
          <q-img
            :src="brand.logo"
            :alt="brand.name"
            style="height: 60px; max-width: 80px;"
            fit="contain"
            :class="{ 'image-loading': !brand.loaded }"
            @load="brand.loaded = true"
          >
            <template v-slot:loading>
              <q-spinner-dots color="primary" />
            </template>
          </q-img>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getData } from '../services/apiclient'
import { useRouter } from 'vue-router'

const router = useRouter()
const brands = ref([])

const getBrands = async () => {
  try {
    const res = await getData('marcas');
    brands.value = res.map(brand => ({ ...brand, loaded: false }));
  } catch (error) {
    console.error('Error al obtener las marcas:', error);
    brands.value = [];
  }
}

const goToBrandProducts = (brand) => {
  router.push({
    name: 'AllProducts',
    query: { marca: brand.nombre }
  })
}

onMounted(() => {
  getBrands();
});
</script>

<style scoped>
.banner-brand {
  background-color: black;
  color: white;
  padding: 20px 0; /* Aumentar el padding vertical */
  text-align: center; /* Centrar el título */
}

.q-gutter-sm {
  margin-top: 20px; /* Espacio entre el título y las marcas */
}

.brand-card {
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), translate 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  opacity: 1; /* Asegurar que las tarjetas sean visibles inicialmente */
}

.brand-card:hover {
  transform: scale(1.1) translateY(-5px); /* Escala ligeramente más y eleva */
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2); /* Sombra más pronunciada */
}

h6 {
  font-size: 2.5em; /* Título más grande */
  font-weight: 700; /* Ligeramente más delgado que 800 para un look moderno */
  margin-bottom: 30px;
  color: white;
  font-family: 'Montserrat', sans-serif;
  text-transform: uppercase; /* Opcional: poner el título en mayúsculas */
  letter-spacing: 0.5px; /* Un pequeño espaciado entre letras */
}

.q-img {
  transition: opacity 0.5s ease-in-out; /* Transición para el efecto de desvanecimiento */
  opacity: 1;
}

.image-loading {
  opacity: 0; /* Inicialmente transparente hasta que la imagen carga */
}

/* Responsive adjustments for the title */
@media (max-width: 768px) {
  h6 {
    font-size: 2em;
    margin-bottom: 20px;
  }
}

@media (max-width: 576px) {
  h6 {
    font-size: 1.5em;
    margin-bottom: 15px;
  }
}
</style>