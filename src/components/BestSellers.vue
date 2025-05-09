<template>
  <div class="bestsellers-wrapper q-px-md q-mt-lg">
    <h6>Lo más vendido</h6>
    <div class="q-gutter-md row items-stretch justify-around">
      <router-link
        v-for="product in bestSellers"
        :key="product._id"
        :to="`/Details/${product._id}`"
        class="product-card col-6 col-sm-4 col-md-2 col-lg-2"
        style="text-decoration: none; color: inherit;"
      >
        <q-card flat>
          <div class="img-wrapper">
            <q-img :src="product.imagenes[0]" :alt="product.nombre" ratio="1" class="q-mb-sm" />
            <q-btn
              round
              dense
              flat
              icon="favorite_border"
              class="favorite-btn"
              color="red"
            />
          </div>

          <div class="q-pa-xs">
            <div class="row items-center justify-between">
              <div class="text-caption text-grey-7">{{ product.brand }}</div>
              <q-btn
                flat
                dense
                icon="shopping_cart"
                size="sm"
                color="primary"
                class="cart-btn"
              />
            </div>
            <q-rating
              size="14px"
              v-model="ratingValue"
              :max="5"
              color="amber"
              readonly
              class="q-mb-xs"
            />
            <div class="product-title ellipsis-2-lines">{{ product.nombre }}</div>
            <div class="text-caption text-grey-6">Descripción del producto</div>
            <div class="text-grey-5 text-strike">$20.000</div>
            <div class="text-negative text-subtitle2"><b>$10.000</b> Hoy</div>
          </div>
        </q-card>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getData } from '../services/apiclient'

const bestSellers = ref([])
const ratingValue = ref(5)

const fetchBestSellers = async () => {
  try {
    const res = await getData('productos')
    bestSellers.value = res
  } catch (error) {
    console.error('Error al obtener productos más vendidos:', error)
  }
}

onMounted(() => {
  fetchBestSellers()
})
</script>

<style scoped>
.product-card {
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.749);
  background-color: #fff;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  position: relative;
  padding: 5px 10px;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.img-wrapper {
  position: relative;
  object-fit: contain;
}

.favorite-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 2;
  background: white;
}

.cart-btn {
  margin-left: auto;
}

.product-title {
  font-size: 13px;
  font-weight: 600;
  margin: 4px 0;
  color: #222;
  line-height: 1.2;
}

h6 {
  font-size: 24px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 20px;
  font-family: 'Montserrat', sans-serif;
}
</style>
