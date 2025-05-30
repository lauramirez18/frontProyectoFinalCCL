<template>
  <div class=" bg-black full-width banner-brand ">
    <h6>Las mejores marcas de la Industria</h6>
    
    <div class="q-gutter-sm row items-center justify-center">
      <div
        v-for="(brand, index) in brands"
        :key="index"
        class="col-4 col-sm-2 col-md-2 col-lg-2"
      >
        <q-card 
          flat 
          bordered 
          class="q-pa-sm flex flex-center brand-card"
          @click="navigateToBrandProducts(brand._id)"
        >
          <q-img
            :src="brand.logo"
            :alt="brand.name"
            style="height: 55px; max-width: 70px;"
            fit="contain"
          />
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getData } from '../services/apiclient'
import { useRouter } from 'vue-router' // Import useRouter

const router = useRouter() // Initialize router
const brands = ref([])

const getBrands = async () => {
  try {
    const res = await getData('marcas')
    brands.value = res
  } catch (error) {
    console.error('Error al obtener las marcas:', error)
    brands.value = []
  }
}

// Add the navigation function
const navigateToBrandProducts = (brandId) => {
  router.push({
    path: '/productos', // Use the new generic products path
    query: { brand: brandId }
  })
}

onMounted(() => {
  getBrands()
})
</script>

<style scoped>

.banner-brand {
  background-color: black;
  color: white;
  padding: 8px 0px;
}

.brand-card {
  transition: transform 0.3s ease;
  cursor: pointer;

}
.brand-card:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h6 {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 20px;
  color: white;
  font-family: 'Montserrat', sans-serif;
}
</style>
