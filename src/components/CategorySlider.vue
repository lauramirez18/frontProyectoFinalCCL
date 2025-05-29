<template>
  <div class="q-pa-md bg-white">
    <h6>Categorías</h6>

    <div class="carousel-container">
      <!-- Flecha izquierda -->
      <q-btn
        round
        dense
        flat
        icon="chevron_left"
        class="nav-arrow left"
        @click="scrollLeft"
      />

      <!-- Carrusel -->
      <div
        class="carousel-wrapper"
        ref="carousel"
      >
        <div
          :class="['carousel-track', { animated: isAutoScroll }]"
        >
          <div
            v-for="(category, index) in duplicatedCategories"
            :key="`${category._id}-${index}`"
            class="category-card"
            @click="goToCategoryProducts(category)"
          >
            <q-img
              :src="category.img"
              :alt="category.name"
              fit="cover"
              class="category-img"
            />
            <div class="text-center text-subtitle2 text-bold">
              {{ category.name }}
            </div>
            <span class="text-caption text-grey text-center">{{ category.description }}</span>
          </div>
        </div>
      </div>

      <!-- Flecha derecha -->
      <q-btn
        round
        dense
        flat
        icon="chevron_right"
        class="nav-arrow right"
        @click="scrollRight"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getData } from '../services/apiclient'

const categories = ref([])
const router = useRouter() 
const isAutoScroll = ref(true)
const carousel = ref(null)
let autoScrollTimeout = null

const fetchCategories = async () => {
  try {
    const res = await getData('categorias')
    categories.value = res
  } catch (err) {
    console.error('Error fetching categories:', err)
  }
}

// Duplicamos para simular loop infinito
const duplicatedCategories = computed(() => [
  ...categories.value,
  ...categories.value,
])

const goToCategoryProducts = (category) => {
  router.push({
    name: 'CategoryProducts',
    params: { categoryId: category._id },
    query: { categoryName: category.name }
  })
}


const resetAutoScroll = () => {
  isAutoScroll.value = false
  clearTimeout(autoScrollTimeout)
  autoScrollTimeout = setTimeout(() => {
    isAutoScroll.value = true
  }, 10000) // 10 segundos sin interacción
}

const scrollLeft = () => {
  carousel.value.scrollBy({ left: -300, behavior: 'smooth' })
  resetAutoScroll()
}

const scrollRight = () => {
  carousel.value.scrollBy({ left: 300, behavior: 'smooth' })
  resetAutoScroll()
}

onMounted(fetchCategories)
</script>

<style scoped>
* {
  font-family: 'Montserrat', sans-serif;
}

h6 {
  font-size: 24px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 20px;
}

.carousel-container {
  position: relative;
  display: flex;
  align-items: center;
}

.carousel-wrapper {
  overflow: hidden;
  width: 100%;
  max-width: 100%;
}

.carousel-track {
  display: flex;
  gap: 24px;
  padding: 8px 0;
  transition: transform 0.5s ease;
}

.carousel-track.animated {
  animation: scroll-left 25s linear infinite;
}

@keyframes scroll-left {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.category-card {
  flex: 0 0 auto;
  width: 200px;
  height: 260px;
  cursor: pointer;
  transition: transform 0.2s ease;
  box-shadow: #ccc 0px 3px 8px;
  border-radius: 16px;
  background-color:white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 20px;
  
  
}

.category-card:hover {
  transform: scale(1.05);
}

.category-img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  background-position: center;

 
}

.text-center {
  margin-top: 8px;
  min-height: 30px;
  text-align: center;
}

.nav-arrow {
  position: absolute;
  z-index: 2;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
}

.nav-arrow.left {
  left: -8px;
}

.nav-arrow.right {
  right: -8px;
}


</style>
