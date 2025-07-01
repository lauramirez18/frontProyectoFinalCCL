<template>
  <q-card class="product-card q-hoverable modern-card" flat bordered>
    <!-- Badges y etiquetas -->
    <div class="absolute-top-right q-pa-xs">
      <q-badge v-if="product.enOferta && (!product.fechaFinOferta || new Date(product.fechaFinOferta) >= new Date())" class="offer-badge-premium">
        <q-icon name="local_offer" size="20px" class="q-mr-xs" />
        {{ product.porcentajeDescuento }}% OFF
      </q-badge>
      <q-badge v-if="product.envioGratis" color="green" class="envio-badge-premium">
        <q-icon name="local_shipping" size="16px" class="q-mr-xs" />
        Envío gratis
      </q-badge>
    </div>
    
    <!-- Imagen del producto -->
    <q-img
      :src="mainImage"
      :ratio="1"
      class="product-image-premium"
      @click="$router.push(`/Details/${product.slug}`)"
    >
      <template v-slot:error>
        <div class="absolute-full flex flex-center bg-grey-3 text-grey-8">
          <q-icon name="image_not_supported" size="3em" />
        </div>
      </template>
    </q-img>

    <!-- Contenido de la tarjeta -->
    <q-card-section class="premium-section">
      <!-- Categoría -->
      <div class="text-caption text-grey-7 category-label-premium">
        {{ product.category?.name }}
      </div>
      
      <!-- Nombre del producto -->
      <div class="text-subtitle2 ellipsis-2-lines product-title-premium">
        {{ product.nombre }}
      </div>
      
      <!-- Rating -->
      <div class="row items-center q-mt-xs">
        <q-rating
          :model-value="typeof product.rating === 'number' ? product.rating : 0"
          size="1.3em"
          color="amber"
          icon="star_border"
          icon-selected="star"
          readonly
        />

        <span class="text-caption text-grey-7 q-ml-xs">
          ({{ product.reviewsCount || 0 }})
        </span>
      </div>
      
      <!-- Precios -->
      <div class="q-mt-sm price-area-premium">
        <div v-if="product.precioAnterior" class="text-caption text-strike text-grey">
          ${{ formatPrice(product.precioAnterior) }}
        </div>
        <div class="modern-price-premium">
          <div v-if="product.enOferta && (!product.fechaFinOferta || new Date(product.fechaFinOferta) >= new Date())" class="row items-center">
            <div class="text-h5 text-negative offer-price-main-premium">
              {{ formatPrice(product.precioOferta) }}
            </div>
            <div class="text-caption text-grey q-ml-sm text-line-through">
              {{ formatPrice(product.precio) }}
            </div>
          </div>
          <div v-else class="text-h5 text-primary">
            {{ formatPrice(product.precio) }}
          </div>
        </div>
        <div v-if="product.cuotas" class="text-caption text-green cuotas-label-premium">
          {{ product.cuotas }}x ${{ formatPrice(product.precio / product.cuotas) }} sin interés
        </div>
      </div>
      
      <!-- Especificaciones destacadas -->
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
    </q-card-section>

    <!-- Acciones -->
    <q-card-actions class="q-px-none q-pb-md card-actions-premium">
      <q-btn
        color="primary"
        label="Agregar"
        icon="shopping_cart"
        class="add-cart-btn-premium"
        @click="addToCart"
        unelevated
        size="md"
      />
      <FavoriteButton
        :product="product"
        class="favorite-btn-premium"
        flat
        round
        color="pink-5"
        icon="favorite_border"
      />
    </q-card-actions>
    <LoginDialog v-model="showLoginDialog" />
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar, Dialog } from 'quasar'
import { useAuthStore } from '../store/store.js'
import { showNotification } from '../utils/notifications'
import FavoriteButton from './FavoriteButton.vue'
import RatingStars from './RatingStars.vue'
import LoginDialog from './LoginDialog.vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

console.log('PRODUCTO EN CARD:', props.product)

const router = useRouter()
const $q = useQuasar()
const currentImage = ref(0)
const loading = ref(false)
const showLoginDialog = ref(false)

const mainImage = computed(() => {
  return Array.isArray(props.product.imagenes) && props.product.imagenes.length > 0
    ? props.product.imagenes[currentImage.value]
    : '/placeholder-product.png'
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
  return specs
})

const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) return '$0'
  return price.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

const addToCart = async () => {
  if (!authStore.token) {
    $q.dialog({
      title: 'Iniciar sesión',
      message: '¿Deseas iniciar sesión para agregar productos al carrito?',
      cancel: true,
      persistent: true,
      ok: {
        label: 'Sí, iniciar sesión',
        color: 'primary'
      },
      cancel: {
        label: 'No, continuar sin sesión',
        color: 'grey'
      }
    }).onOk(() => {
      showLoginDialog.value = true;
    });
    return;
  }

  try {
    loading.value = true
    const cartItem = {
      id: props.product._id,
      name: props.product.nombre,
      price: props.product.enOferta ? props.product.precioOferta : props.product.precio,
      image: props.product.imagenes && props.product.imagenes.length > 0 ? props.product.imagenes[0] : '/placeholder-product.png',
      quantity: 1,
      seller: typeof props.product.marca === 'object' ? props.product.marca.nombre : (props.product.marca || 'Vendedor oficial')
    }
    await authStore.addToCart(cartItem)
    showNotification('success', 'Producto agregado al carrito')
  } catch (error) {
    console.error('Error al agregar al carrito:', error)
    showNotification('error', 'Error al agregar al carrito')
  } finally {
    loading.value = false
  }
}

const authStore = useAuthStore()
</script>

<style scoped>
.product-card.modern-card {
  border-radius: 22px;
  box-shadow: 0 8px 32px 0 rgba(0, 60, 120, 0.13), 0 2px 8px 0 rgba(0,0,0,0.08);
  background: linear-gradient(135deg, #fafdff 60%, #e3f0ff 100%);
  transition: box-shadow 0.22s, transform 0.15s;
  min-height: 480px;
  max-width: 270px;
  margin: 18px auto;
  padding: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  height: 480px;
  justify-content: space-between;
}
.product-card.modern-card:hover {
  box-shadow: 0 16px 40px 0 rgba(0, 60, 120, 0.18), 0 4px 16px 0 rgba(0,0,0,0.13);
  transform: translateY(-8px) scale(1.035);
  border: 2px solid #1976d2;
}
.product-image-premium {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  margin: 0;
  background: #fff;
  border-radius: 22px 22px 0 0;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 18px;
}
.offer-badge-premium {
  background: linear-gradient(90deg, #ff512f 0%, #dd2476 100%);
  color: #fff;
  font-weight: bold;
  font-size: 1.15em;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(255,81,47,0.18);
  padding: 8px 20px;
  display: flex;
  align-items: center;
  letter-spacing: 0.7px;
  margin-top: 8px;
}
.envio-badge-premium {
  background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
  color: #fff;
  font-weight: 500;
  border-radius: 8px;
  margin-top: 10px;
  font-size: 1em;
  padding: 6px 14px;
  display: flex;
  align-items: center;
}
.premium-section {
  padding: 18px 18px 0 18px;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.category-label-premium {
  font-size: 1em;
  font-weight: 500;
  letter-spacing: 0.5px;
  margin-bottom: 3px;
}
.product-title-premium {
  font-size: 1.22em;
  font-weight: 800;
  color: #1a237e;
  margin-bottom: 4px;
  min-height: 2.5em;
  max-height: 2.5em;
  overflow: hidden;
}
.price-area-premium {
  margin-top: 10px;
}
.modern-price-premium {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.offer-price-main-premium {
  font-size: 1.45em;
  font-weight: 900;
  color: #ff1744;
  letter-spacing: 0.7px;
}
.cuotas-label-premium {
  margin-top: 4px;
  font-size: 1.05em;
}
.card-actions-premium {
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  justify-content: center;
  flex-shrink: 0;
}
.add-cart-btn-premium {
  font-size: 1em;
  font-weight: 700;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.10);
  padding: 0 24px;
  min-height: 42px;
  max-width: 80%;
  background: linear-gradient(90deg, #2196f3 0%, #21cbf3 100%);
  color: #fff;
  letter-spacing: 0.5px;
  transition: background 0.18s, box-shadow 0.18s, transform 0.13s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.add-cart-btn-premium .q-icon {
  font-size: 1.2em;
  margin-right: 8px;
}
.add-cart-btn-premium:hover {
  background: linear-gradient(90deg, #1976d2 0%, #21cbf3 100%);
  color: #fff;
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.18);
  transform: translateY(-2px) scale(1.04);
}
.favorite-btn-premium {
  margin-left: 0;
  font-size: 1.2em;
  color: #ff4081 !important;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(255,64,129,0.10);
  transition: box-shadow 0.2s;
}
.favorite-btn-premium:hover {
  box-shadow: 0 2px 8px rgba(255,64,129,0.18);
  background: #ffe4ec;
}
.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
