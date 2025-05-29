<template>
  <div class="q-pa-md">
    <q-breadcrumbs class="q-mb-md" v-if="category">
      <q-breadcrumbs-el icon="home" to="/" />
      <q-breadcrumbs-el :label="category.name" />
      <q-breadcrumbs-el v-if="subcategory" :label="subcategory.name" />
    </q-breadcrumbs>

    <div class="row items-center q-mb-md">
      <div class="col">
        <h4 v-if="category" class="text-h4 text-weight-bold">
          {{ category.name }}
          <span v-if="subcategory" class="text-grey-7">/ {{ subcategory.name }}</span>
        </h4>
        <h4 v-else-if="searchQuery" class="text-h4 text-weight-bold">
          Resultados para: "{{ searchQuery }}"
        </h4>
        <h4 v-else class="text-h4 text-weight-bold">Todos los productos</h4>
      </div>
      <div class="col-auto">
        <span class="text-grey-7">{{ pagination.total }} productos</span>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-3">
        <q-card class="q-pa-md sticky-card" flat bordered>
          <div v-if="showAlphabeticFilters" class="q-mb-lg">
            <div class="text-h6 q-mb-md">Filtrar por letra</div>

            <template v-for="(field, fieldName) in alphabeticFields" :key="fieldName">
              <div v-if="field.letters.length > 0" class="q-mb-sm">
                <div class="text-subtitle2 q-mb-xs">{{ field.label }}</div>
                <div class="flex flex-wrap q-gutter-xs">
                  <q-btn
                    v-for="letter in field.letters"
                    :key="letter"
                    :color="activeAlphaFilter.field === fieldName && activeAlphaFilter.letter === letter ? 'primary' : 'grey-3'"
                    :text-color="activeAlphaFilter.field === fieldName && activeAlphaFilter.letter === letter ? 'white' : 'dark'"
                    dense
                    size="sm"
                    class="letter-btn"
                    @click="applyAlphaFilter(fieldName, letter)"
                  >
                    {{ letter }}
                  </q-btn>
                </div>
              </div>
            </template>

            <q-btn
              v-if="activeAlphaFilter.field"
              flat
              color="negative"
              label="Limpiar filtro"
              class="q-mt-sm full-width"
              @click="clearAlphaFilter"
              size="sm"
            />
          </div>

          <div v-if="category" class="q-mb-md">
            <div class="text-h6 q-mb-md">Filtros por especificación</div>

            <template v-for="(filterGroup, key) in availableFilters" :key="key">
              <q-expansion-item
                :label="getFilterLabel(key)"
                class="q-mt-md"
                dense-toggle
                expand-separator
                header-class="text-subtitle1"
              >
                <q-option-group
                  v-model="activeFilters[key]"
                  :options="filterGroup.map(opt => ({...opt}))"
                  type="checkbox"
                  color="primary"
                  dense
                  @update:model-value="applyFilters"
                />
              </q-expansion-item>
            </template>
          </div>

          <q-expansion-item
            label="Rango de precios"
            class="q-mt-md"
            dense-toggle
            expand-separator
            header-class="text-subtitle1"
          >
            <div class="q-pa-sm">
              <q-range
                v-model="priceRange"
                :min="minPrice"
                :max="maxPrice"
                :step="1000"
                label-always
                color="primary"
                @change="applyPriceFilter"
              />
              <div class="row justify-between q-mt-sm text-caption">
                <span>${{ formatPrice(priceRange.min) }}</span>
                <span>${{ formatPrice(priceRange.max) }}</span>
              </div>
            </div>
          </q-expansion-item>

          <q-btn
            color="primary"
            label="Limpiar todos los filtros"
            class="q-mt-lg full-width"
            @click="resetAllFilters"
            outline
            v-if="hasActiveFilters"
          />
        </q-card>
      </div>

      <div class="col-12 col-md-9">
        <div class="row items-center q-mb-md">
          <div class="col-md-4 col-12 q-pr-md">
            <q-select
              v-model="sortOption"
              :options="sortOptions"
              label="Ordenar por"
              outlined
              dense
              emit-value
              map-options
              @update:model-value="applySorting"
            />
          </div>
          <div class="col-md-4 col-12">
            <q-toggle
              v-model="gridView"
              label="Vista de cuadrícula"
              left-label
              color="primary"
            />
          </div>
          <div class="col-md-4 col-12 text-right">
            <q-pagination
              v-model="currentPage"
              :max="pagination.totalPages"
              :max-pages="6"
              direction-links
              boundary-links
              @update:model-value="fetchProducts"
              input
              color="primary"
            />
          </div>
        </div>

        <div v-if="loading" class="row justify-center q-py-xl">
          <q-spinner color="primary" size="3em" />
          <div class="text-subtitle1 q-mt-md">Cargando productos...</div>
        </div>

        <div v-else-if="products.length === 0" class="row justify-center q-py-xl">
          <q-icon name="search_off" size="3em" color="grey-7" />
          <div class="text-subtitle1 q-mt-md col-12 text-center">
            No se encontraron productos con los filtros seleccionados
          </div>
          <q-btn
            color="primary"
            label="Limpiar filtros"
            class="q-mt-md"
            @click="resetAllFilters"
          />
        </div>

        <div v-else-if="gridView" class="row q-col-gutter-lg">
          <div
            v-for="product in products"
            :key="product._id"
            class="col-12 col-sm-6 col-md-4 col-lg-3"
            :class="{'col-xl-2': products.length > 5}"
          >
            <product-card :product="product" />
          </div>
        </div>

        <div v-else class="column q-gutter-md">
          <product-card-list
            v-for="product in products"
            :key="product._id"
            :product="product"
            :show-specs="true"
          />
        </div>

        <div class="row justify-center q-mt-lg" v-if="pagination.totalPages > 1 && products.length > 0">
          <q-pagination
            v-model="currentPage"
            :max="pagination.totalPages"
            :max-pages="6"
            direction-links
            boundary-links
            @update:model-value="fetchProducts"
            input
            color="primary"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import api from '../plugins/axios'
import ProductCard from '../components/ProductCard.vue'
import ProductCardList from '../components/ProductCardList.vue'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

// Data
const products = ref([])
const loading = ref(false)
const category = ref(null)
const subcategory = ref(null)
const searchQuery = ref('')
const gridView = ref(true)
const currentPage = ref(1)
const sortOption = ref('newest')
const priceRange = ref({ min: 0, max: 1000000 })
const minPrice = ref(0)
const maxPrice = ref(1000000)
const availableFilters = ref({}) 
const activeFilters = ref({})   
const activeAlphaFilter = ref({ field: null, letter: null })

const pagination = ref({
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 1
})

const alphabeticFields = ref({
  marca: { label: 'Marca', letters: [] },
  modelo: { label: 'Modelo', letters: [] }
})

const sortOptions = [
  { label: 'Más recientes', value: 'newest' },
  { label: 'Menor precio', value: 'price_asc' },
  { label: 'Mayor precio', value: 'price_desc' },
  { label: 'Más populares', value: 'popular' },
  { label: 'Mejor valorados', value: 'rating' },
  { label: 'A-Z', value: 'az' },
  { label: 'Z-A', value: 'za' }
]


const filterLabels = {
  
}


const showAlphabeticFilters = computed(() => {
  return alphabeticFields.value.marca.letters.length > 0 ||
           alphabeticFields.value.modelo.letters.length > 0
})

const hasActiveFilters = computed(() => {
  for (const key in activeFilters.value) {
    if (activeFilters.value[key] && activeFilters.value[key].length > 0) return true
  }

  if (activeAlphaFilter.value.field) return true

  if (priceRange.value.min !== minPrice.value ||
      priceRange.value.max !== maxPrice.value) return true

  return false
})


const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO').format(Math.round(price))
}

const getFilterLabel = (key) => {

  return filterLabels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
}

const showError = (message, caption) => {
  if (typeof $q.notify !== 'function') {
    console.error('Error:', message, caption)
    alert(`Error: ${message}\n${caption || ''}`)
    return
  }

  $q.notify({
    type: 'negative',
    message: message,
    caption: caption
  })
}

const fetchProducts = async () => {
  loading.value = true

  try {
    const params = {
      page: currentPage.value,
      limit: pagination.value.limit,
      sort: sortOption.value
    }

    if (route.params.categoryId) params.category = route.params.categoryId
    if (subcategory.value) params.subcategory = subcategory.value._id
    if (searchQuery.value) params.search = searchQuery.value

    if (priceRange.value.min > minPrice.value) params.minPrice = priceRange.value.min
    if (priceRange.value.max < maxPrice.value) params.maxPrice = priceRange.value.max


    for (const key in activeFilters.value) {
      if (activeFilters.value[key] && activeFilters.value[key].length > 0) {
       
        params[key] = activeFilters.value[key].map(opt => opt.value);
      }
    }

    if (activeAlphaFilter.value.field && activeAlphaFilter.value.letter) {
      
      params[`especificaciones.${activeAlphaFilter.value.field}`] = activeAlphaFilter.value.letter;
  
    }

    const response = await api.get('/productos', { params })

    products.value = response.data.productos || []
    pagination.value = response.data.pagination || {
      total: products.value.length,
      page: currentPage.value,
      limit: pagination.value.limit,
      totalPages: 1
    }

  } catch (error) {
    showError('Error al cargar productos', error.message)
    products.value = []
  } finally {
    loading.value = false
  }
}

const fetchCategoryData = async () => {
  if (route.params.categoryId) {
    try {
      const catResponse = await api.get(`/categorias/${route.params.categoryId}`)
      if (!catResponse.data) {
        throw new Error('Categoría no encontrada')
      }

      category.value = catResponse.data

      try {
        const alphaResponse = await api.get(`/productos/filtros-alfabeticos/${route.params.categoryId}`)
        if (alphaResponse.data && alphaResponse.data.filtrosAlfabeticos) {
          alphabeticFields.value.marca.letters = alphaResponse.data.filtrosAlfabeticos.marca || []
          alphabeticFields.value.modelo.letters = alphaResponse.data.filtrosAlfabeticos.modelo || []
        }
      } catch (alphaError) {
        console.warn('No se pudieron cargar los filtros alfabéticos:', alphaError)
      }

      if (route.params.subcategoryId) {
        try {
          const subcatResponse = await api.get(`/subcategorias/${route.params.subcategoryId}`)
          subcategory.value = subcatResponse.data
        } catch (subcatError) {
          console.warn('No se pudo cargar la subcategoría:', subcatError)
          subcategory.value = null
        }
      }

      await fetchAvailableFilters() 

      try {
        const pricesResponse = await api.get(`/productos/rango-precios/${route.params.categoryId}`)
        minPrice.value = pricesResponse.data.min || 0
        maxPrice.value = pricesResponse.data.max || 1000000
        priceRange.value = { min: minPrice.value, max: maxPrice.value }
      } catch (pricesError) {
        console.warn('No se pudo cargar el rango de precios:', pricesError)
        minPrice.value = 0
        maxPrice.value = 1000000
        priceRange.value = { min: 0, max: 1000000 }
      }

      
     

    } catch (error) {
      console.error('Error al cargar datos de categoría:', error)
      showError('Error al cargar datos de categoría', error.message)

      if (error.response && error.response.status === 404) {
        router.push('/')
      }
    }
  } else if (route.query.search) {
    searchQuery.value = route.query.search
  }
}

const fetchAvailableFilters = async () => {
  if (!route.params.categoryId) return

  try {
    const filtersResponse = await api.get(`/productos/filtros-disponibles/${route.params.categoryId}`)
    availableFilters.value = filtersResponse.data.filters || {}

   
    for (const key in availableFilters.value) {
      if (!activeFilters.value[key]) {
        activeFilters.value[key] = []
      }
    }
  } catch (error) {
    console.warn('Error al cargar filtros disponibles:', error)
    availableFilters.value = {}
  }
}

const applyFilters = () => {
  currentPage.value = 1
  fetchProducts()
}

const applyPriceFilter = () => {
  currentPage.value = 1
  fetchProducts()
}

const applySorting = () => {
  currentPage.value = 1
  fetchProducts()
}

const applyAlphaFilter = (field, letter) => {
  if (activeAlphaFilter.value.field === field && activeAlphaFilter.value.letter === letter) {
    clearAlphaFilter()
    return
  }

  activeAlphaFilter.value = { field, letter }
  currentPage.value = 1
  fetchProducts()
}

const clearAlphaFilter = () => {
  activeAlphaFilter.value = { field: null, letter: null }
  currentPage.value = 1
  fetchProducts()
}

const resetAllFilters = () => {
 
  for (const key in activeFilters.value) {
    activeFilters.value[key] = []
  }

  clearAlphaFilter()

  priceRange.value = { min: minPrice.value, max: maxPrice.value }

  sortOption.value = 'newest'

  currentPage.value = 1
  fetchProducts()
}

const initializeFromRoute = async () => {
  await fetchCategoryData()
  fetchProducts()
}


watch(() => route.params, () => {
  currentPage.value = 1
  initializeFromRoute()
}, { immediate: true })

watch(() => route.query, (newQuery) => {
  if (newQuery.search !== searchQuery.value) {
    searchQuery.value = newQuery.search || ''
    currentPage.value = 1
    fetchProducts()
  }
}, { immediate: true })


onMounted(() => {
  
  for (const key in filterLabels) {
    if (!activeFilters.value[key]) {
      activeFilters.value[key] = []
    }
  }
})
</script>

<style scoped lang="scss">
.sticky-card {
  position: sticky;
  top: 20px;
  z-index: 1;
}

.letter-btn {
  min-width: 30px;
  min-height: 30px;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
}

.q-expansion-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  &:last-child {
    border-bottom: none;
  }
}

.q-option-group {
  :deep(.q-option-inner) {
    padding: 4px 8px;
  }
}

@media (max-width: $breakpoint-sm-max) {
  .sticky-card {
    position: static;
    margin-bottom: 20px;
  }
}
</style>