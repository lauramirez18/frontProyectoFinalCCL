<template>
  <!-- Eliminado breadcrumb local, ahora es global -->

  <div class="q-pa-md">
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
        
        <!-- Mostrar marca filtrada -->
        <div v-if="currentBrand" class="text-subtitle1 q-mt-sm">
          <q-chip color="primary" removable @remove="clearBrandFilter">
            <q-avatar>
              <q-img :src="currentBrand.logo" :alt="currentBrand.nombre" style="height: 24px; width: 24px;" />
            </q-avatar>
            {{ currentBrand.nombre }}
          </q-chip>
        </div>
      </div>
      <div class="col-auto">
        <span class="text-grey-7">{{ pagination.total }} productos</span>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-3">
        <q-card class="q-pa-md sticky-card" flat bordered>
          <!-- Sección de Marcas -->
          <div v-if="brands.length > 0" class="q-mb-lg">
            <div class="text-h6 q-mb-md">Marcas</div>
            <q-scroll-area style="height: 200px;">
              <q-list dense>
                <q-item 
                  v-for="brand in brands" 
                  :key="brand._id"
                  clickable
                  :active="currentBrand?._id === brand._id"
                  @click="toggleBrandFilter(brand)"
                  active-class="text-primary"
                >
                  <q-item-section avatar>
                    <q-avatar size="24px">
                      <q-img :src="brand.logo" :alt="brand.nombre" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ brand.nombre }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-scroll-area>
          </div>

          <!-- Filtros alfabéticos -->
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

          <!-- Filtros por especificación -->
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

          <!-- Rango de precios -->
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

          <!-- Filtro de ofertas -->
          <div class="q-mt-md">
            <q-item tag="label" v-ripple>
              <q-item-section avatar>
                <q-checkbox v-model="showOnlyOffers" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Ver solo ofertas</q-item-label>
              </q-item-section>
            </q-item>
          </div>

          <!-- Botón para limpiar filtros -->
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

      <!-- Listado de productos -->
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

        <!-- Estado de carga -->
        <div v-if="loading" class="row justify-center q-py-xl">
          <q-spinner color="primary" size="3em" />
          <div class="text-subtitle1 q-mt-md">Cargando productos...</div>
        </div>

        <!-- Sin resultados -->
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

        <!-- Vista de cuadrícula -->
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

        <!-- Vista de lista -->
        <div v-else class="column q-gutter-md">
          <product-card-list
            v-for="product in products"
            :key="product._id"
            :product="product"
            :show-specs="true"
          />
        </div>

        <!-- Paginación inferior -->
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
import { getData } from '../services/apiclient'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

// Datos reactivos
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
const currentBrand = ref(null)
const brands = ref([])
const showOnlyOffers = ref(false)

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

// Computed properties
const showAlphabeticFilters = computed(() => {
  return alphabeticFields.value.marca.letters.length > 0 ||
         alphabeticFields.value.modelo.letters.length > 0
})

const hasActiveFilters = computed(() => {
  for (const key in activeFilters.value) {
    if (activeFilters.value[key] && activeFilters.value[key].length > 0) return true
  }

  if (activeAlphaFilter.value.field) return true
  if (currentBrand.value) return true

  if (priceRange.value.min !== minPrice.value ||
      priceRange.value.max !== maxPrice.value) return true

  return false
})

// Obtener el slug de la marca de la URL
const brandSlug = computed(() => route.params.slug)

// Métodos
const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO').format(Math.round(price))
}

const getFilterLabel = (key) => {
  const labels = {
    color: 'Color',
    ram: 'Memoria RAM',
    almacenamiento: 'Almacenamiento',
    pantalla: 'Tamaño de pantalla',
    sistemaOperativo: 'Sistema operativo'
  }
  return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
}

const showError = (message, caption) => {
  $q.notify({
    type: 'negative',
    message: message,
    caption: caption || '',
    position: 'top'
  })
}

// Obtener productos
const fetchProducts = async () => {
  loading.value = true

  try {
    const params = {
      page: currentPage.value,
      limit: pagination.value.limit,
      sort: sortOption.value
    }

    let response;
    
    // Si estamos en la ruta de marca, usar el endpoint específico
    if (route.params.id) {
      console.log('Products: Obteniendo productos de marca:', route.params.id);
      response = await api.get(`/marcas/${route.params.id}`);
      console.log('Products: Respuesta de marca:', response);
      
      // Transformar la respuesta al formato esperado
      if (response.data && response.data.productos) {
        products.value = response.data.productos;
        pagination.value = {
          total: response.data.productos.length,
          page: 1,
          limit: response.data.productos.length,
          totalPages: 1
        };
      } else {
        products.value = [];
        pagination.value = {
          total: 0,
          page: 1,
          limit: pagination.value.limit,
          totalPages: 0
        };
      }
    } else {
      // Para otras rutas, mantener el comportamiento original
      if (route.params.categoryId) params.category = route.params.categoryId;
      if (subcategory.value) params.subcategory = subcategory.value._id;
      if (searchQuery.value) params.search = searchQuery.value;

      if (priceRange.value.min > minPrice.value) params.minPrice = priceRange.value.min;
      if (priceRange.value.max < maxPrice.value) params.maxPrice = priceRange.value.max;

      // Filtros por especificación
      for (const key in activeFilters.value) {
        if (activeFilters.value[key] && activeFilters.value[key].length > 0) {
          // Obtener los valores seleccionados y filtrar valores undefined o null
          const selectedValues = activeFilters.value[key]
            .map(opt => {
              // Si opt es un string, usarlo directamente
              if (typeof opt === 'string') return opt;
              // Si opt es un objeto, usar la propiedad value o label
              return opt.value || opt.label || opt;
            })
            .filter(value => value !== undefined && value !== null && value !== 'undefined');

          if (selectedValues.length > 0) {
            // Si solo hay un valor seleccionado, enviarlo directamente
            if (selectedValues.length === 1) {
              params[`especificaciones.${key}`] = selectedValues[0];
            } else {
              // Si hay múltiples valores, enviar cada uno como un parámetro separado
              selectedValues.forEach((value, index) => {
                params[`especificaciones.${key}[${index}]`] = value;
              });
            }
          }
        }
      }

      // Filtro alfabético
      if (activeAlphaFilter.value.field && activeAlphaFilter.value.letter) {
        params[`especificaciones.${activeAlphaFilter.value.field}`] = activeAlphaFilter.value.letter;
      }

      // Filtro de ofertas
      if (showOnlyOffers.value || route.query.ofertas === 'true') {
        params.ofertas = true;
        showOnlyOffers.value = true;
      }

      // Construir la URL con los parámetros
      const queryString = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== 'undefined')
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return value.map((v, i) => `${key}[${i}]=${encodeURIComponent(v)}`).join('&');
          }
          return `${key}=${encodeURIComponent(value)}`;
        })
        .join('&');

      console.log('URL de búsqueda:', `/productos?${queryString}`);
      response = await api.get(`/productos?${queryString}`);

      products.value = response.data.productos || [];
      pagination.value = response.data.pagination || {
        total: products.value.length,
        page: currentPage.value,
        limit: pagination.value.limit,
        totalPages: 1
      };
    }

  } catch (error) {
    console.error('Products: Error al cargar productos:', error);
    showError('Error al cargar productos', error.message);
    products.value = [];
  } finally {
    loading.value = false;
  }
}

// Obtener datos de categoría y marcas
const fetchCategoryData = async () => {
  // Si estamos en la ruta de marca, cargar los datos de la marca
  if (route.params.id) {
    try {
      console.log('Products: Iniciando carga de marca...');
      const brandResponse = await api.get(`/marcas/${route.params.id}`);
      console.log('Products: Respuesta de marca:', brandResponse);
      
      if (brandResponse.data && brandResponse.data.marca) {
        currentBrand.value = brandResponse.data.marca;
        console.log('Products: Marca cargada:', currentBrand.value.nombre);
      }
    } catch (error) {
      console.error('Products: Error al cargar marca:', error);
      showError('Error al cargar marca', error.message);
      router.push('/');
      return;
    }
  }

  if (route.params.categoryId) {
    try {
      // Cargar categoría
      const catResponse = await api.get(`/categorias/${route.params.categoryId}`)
      if (!catResponse.data) {
        throw new Error('Categoría no encontrada')
      }
      category.value = catResponse.data

      // Cargar marcas
      try {
        console.log('Products: Iniciando carga de marcas...');
        const brandsResponse = await api.get('/marcas');
        console.log('Products: Respuesta completa de marcas:', brandsResponse);
        
        if (brandsResponse.data) {
          console.log('Products: Datos de marcas recibidos:', brandsResponse.data);
          
          // Verificar que la respuesta sea un array
          if (Array.isArray(brandsResponse.data)) {
            // Filtrar solo marcas activas y con logo
            brands.value = brandsResponse.data.filter(brand => 
              brand.state === '1' && 
              brand.logo && 
              brand.nombre
            );
            console.log('Products: Marcas válidas encontradas:', brands.value.length);
          } else {
            console.warn('Products: Formato de respuesta de marcas inesperado:', brandsResponse.data);
            brands.value = [];
          }
        } else {
          console.warn('Products: No se recibieron datos de marcas');
          brands.value = [];
        }
      } catch (brandsError) {
        console.error('Products: Error al cargar marcas:', brandsError);
        console.error('Products: Detalles del error:', brandsError.response?.data);
        console.error('Products: URL de la petición:', brandsError.config?.url);
        brands.value = [];
      }

      // Cargar subcategoría si existe
      if (route.params.subcategoryId) {
        try {
          const subcatResponse = await api.get(`/subcategorias/${route.params.subcategoryId}`)
          subcategory.value = subcatResponse.data
        } catch (subcatError) {
          console.warn('No se pudo cargar la subcategoría:', subcatError)
          subcategory.value = null
        }
      }

      // Cargar filtros disponibles
      await fetchAvailableFilters()

      // Cargar rango de precios
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

      // Cargar filtros alfabéticos
      try {
        const alphaResponse = await api.get(`/productos/filtros-alfabeticos/${route.params.categoryId}`)
        if (alphaResponse.data && alphaResponse.data.filtrosAlfabeticos) {
          alphabeticFields.value.marca.letters = alphaResponse.data.filtrosAlfabeticos.marca || []
          alphabeticFields.value.modelo.letters = alphaResponse.data.filtrosAlfabeticos.modelo || []
        }
      } catch (alphaError) {
        console.warn('No se pudieron cargar los filtros alfabéticos:', alphaError)
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

// Obtener filtros disponibles
const fetchAvailableFilters = async () => {
  if (!route.params.categoryId) return

  try {
    const filtersResponse = await api.get(`/productos/filtros-disponibles/${route.params.categoryId}`)
    console.log('Filtros disponibles recibidos:', filtersResponse.data)
    
    // Procesar los filtros recibidos
    const processedFilters = {}
    for (const key in filtersResponse.data.filters) {
      const filterValues = filtersResponse.data.filters[key]
      processedFilters[key] = filterValues.map(value => ({
        label: value.label || value,
        value: value.value || value
      }))
    }
    
    availableFilters.value = processedFilters

    // Inicializar filtros activos
    for (const key in availableFilters.value) {
      if (!activeFilters.value[key]) {
        activeFilters.value[key] = []
      }
    }
    
    console.log('Filtros procesados:', availableFilters.value)
  } catch (error) {
    console.warn('Error al cargar filtros disponibles:', error)
    availableFilters.value = {}
  }
}

// Manejo de filtros
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

// Manejo de filtro por marca
const toggleBrandFilter = (brand) => {
  if (currentBrand.value?._id === brand._id) {
    clearBrandFilter()
  } else {
    setBrandFilter(brand)
  }
}

const setBrandFilter = (brand) => {
  currentBrand.value = brand
  currentPage.value = 1
  
  // Navegar a la ruta de marca
  router.push({ 
    name: 'BrandProducts',
    params: { id: brand._id }
  })
}

const clearBrandFilter = () => {
  currentBrand.value = null
  currentPage.value = 1
  
  // Volver a la ruta de productos
  router.push({ name: 'AllProducts' })
}

// Limpiar todos los filtros
const resetAllFilters = () => {
  // Limpiar filtros de especificación
  for (const key in activeFilters.value) {
    activeFilters.value[key] = []
  }

  // Limpiar filtro alfabético
  clearAlphaFilter()

  // Limpiar filtro de marca
  clearBrandFilter()

  // Resetear rango de precios
  priceRange.value = { min: minPrice.value, max: maxPrice.value }

  // Resetear ordenamiento
  sortOption.value = 'newest'

  // Volver a la primera página
  currentPage.value = 1
  
  // Recargar productos
  fetchProducts()
}

// Inicialización
const initializeFromRoute = async () => {
  await fetchCategoryData()
  fetchProducts()
}

// Watchers
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
  
  // Si hay un cambio en el parámetro brand
  if (newQuery.brand) {
    const brand = brands.value.find(b => b._id === newQuery.brand)
    if (brand) {
      currentBrand.value = brand
      currentPage.value = 1
      fetchProducts()
    }
  } else if (currentBrand.value) {
    // Si se eliminó el parámetro brand pero tenemos una marca seleccionada
    currentBrand.value = null
    currentPage.value = 1
    fetchProducts()
  }
}, { immediate: true })

watch(showOnlyOffers, () => {
  currentPage.value = 1
  fetchProducts()
})

// Cargar la marca por slug
const loadBrandBySlug = async () => {
  if (brandSlug.value) {
    try {
      const response = await getData(`marcas/slug/${brandSlug.value}`)
      if (response) {
        currentBrand.value = response
        // Aplicar el filtro de marca
        activeFilters.value.marca = [response._id]
        await fetchProducts()
      }
    } catch (error) {
      console.error('Error al cargar la marca:', error)
    }
  }
}

// Observar cambios en el slug de la marca
watch(brandSlug, () => {
  loadBrandBySlug()
})

// Cargar la marca al montar el componente
onMounted(() => {
  loadBrandBySlug()
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

.q-scroll-area {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.q-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  min-height: 40px;

  &:last-child {
    border-bottom: none;
  }

  &.active-item {
    background-color: rgba(25, 118, 210, 0.08);
  }
}

@media (max-width: $breakpoint-sm-max) {
  .sticky-card {
    position: static;
    margin-bottom: 20px;
  }
}
</style>
