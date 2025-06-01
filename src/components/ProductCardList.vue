<template>
  <q-card class="product-list-card q-mb-sm" flat bordered>
    <div class="row items-center no-wrap">
      <!-- Imagen -->
      <div class="col-auto">
        <q-img
          :src="product.imagenes[0] || '/placeholder-product.png'"
          :ratio="1"
          width="120px"
          class="cursor-pointer"
          @click="$router.push(`/producto/${product._id}`)"
        />
      </div>
      
      <!-- Información del producto -->
      <div class="col q-px-md">
        <!-- Categoría y nombre -->
        <div class="text-caption text-grey-7">
          {{ product.category?.name }}
        </div>
        <div class="text-subtitle1 text-weight-bold">
          {{ product.nombre }}
        </div>
        
        <!-- Rating -->
        <div class="row items-center q-mt-xs">
          <RatingStars
            :rating="product.promedioCalificacion"
            :review-count="product.totalResenas"
            size="1em"
          />
        </div>
        
        <!-- Especificaciones -->
        <div class="q-mt-sm">
          <q-chip
            v-for="(spec, index) in highlightedSpecs"
            :key="index"
            dense
            size="sm"
            color="grey-2"
            text-color="dark"
            class="q-mr-xs q-mb-xs"
          >
            {{ spec }}
          </q-chip>
        </div>
      </div>
      
      <!-- Precio y acciones -->
      <div class="col-auto text-right q-px-md">
        <div v-if="product.precioAnterior" class="text-caption text-strike text-grey">
          ${{ formatPrice(product.precioAnterior) }}
        </div>
        <div class="text-h5 text-primary">
          
        </div>
        <div v-if="product.cuotas" class="text-caption text-green">
          {{ product.cuotas }}x ${{ formatPrice(product.precio / product.cuotas) }} sin interés
        </div>
        
        <div class="q-mt-md">
          <q-btn
            color="primary"
            label="Agregar al carrito"
            icon="shopping_cart"
            @click="addToCart"
          />
          <q-btn
            flat
            color="primary"
            label="Ver detalles"
            class="q-ml-sm"
            :to="`/producto/${product._id}`"
          />
        </div>
      </div>
    </div>
  </q-card>
</template>


<script setup>
import { computed } from 'vue'
import RatingStars from './RatingStars.vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const highlightedSpecs = computed(() => {
  const specs = []
  if (props.product.especificaciones?.almacenamiento) {
    specs.push(props.product.especificaciones.almacenamiento)
  }
  if (props.product.especificaciones?.ram) {
    specs.push(props.product.especificaciones.ram + ' RAM')
  }
  if (props.product.especificaciones?.sistemaOperativo) {
    specs.push(props.product.especificaciones.sistemaOperativo)
  }
  if (props.product.especificaciones?.marca) {
    specs.push(props.product.especificaciones.marca)
  }
  return specs
})

const addToCart = () => {

  console.log('Agregar al carrito:', props.product._id)
}
</script>

<style scoped>
.product-list-card {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.product-list-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
</style>