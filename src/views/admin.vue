<template>

    <div class="q-mb-md row justify-between items-center">
      <h5 class="q-my-none">Gestión de Productos</h5>
      <q-btn label="Nuevo Producto" color="primary" @click="abrirModalNuevoProducto" icon="add" />
    </div>

    <q-table
      title="Productos"
      :rows="listaProductos"
      :columns="columnasProductos"
      row-key="_id"
      :loading="cargandoTabla"
      :filter="filtroTabla"
    >
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filtroTabla" placeholder="Buscar">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <template v-slot:body-cell-imagenes="props">
        <q-td :props="props">
          <q-img
            :src="props.row.imagenes && props.row.imagenes.length > 0 ? props.row.imagenes[0] : 'https://via.placeholder.com/50?text=NoImg'"
            style="height: 50px; width: 50px; border-radius: 4px;"
            fit="cover"
          >
            <q-badge
              v-if="props.row.imagenes && props.row.imagenes.length > 1"
              color="primary"
              floating
              transparent
              style="padding: 1px 3px; font-size: 0.7em;"
            >
              +{{ props.row.imagenes.length - 1 }}
            </q-badge>
            <template v-slot:error>
              <div class="absolute-full flex flex-center bg-grey-3 text-grey-8" style="font-size: 0.7rem;">
                <q-icon name="image_not_supported" size="xs" class="q-mr-xs" /> Error
              </div>
            </template>
          </q-img>
        </q-td>
      </template>

      <template v-slot:body-cell-category="props">
        <q-td :props="props">
          {{ props.row.category?.name || 'N/A' }}
        </q-td>
      </template>

      <template v-slot:body-cell-subcategory="props">
        <q-td :props="props">
          {{ props.row.subcategory?.name || 'N/A' }}
        </q-td>
      </template>

      <template v-slot:body-cell-state="props">
        <q-td :props="props">
          <q-badge :color="props.row.state === '1' ? 'positive' : 'negative'">
            {{ props.row.state === '1' ? 'Activo' : 'Inactivo' }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-acciones="props">
        <q-td :props="props">
          <q-btn flat round dense icon="visibility" @click="verDetallesProducto(props.row)" class="q-mr-sm">
            <q-tooltip>Ver Detalles</q-tooltip>
          </q-btn>
          <q-btn flat round dense icon="edit" @click="abrirModalEditarProducto(props.row)" class="q-mr-sm">
            <q-tooltip>Editar</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            dense
            :icon="props.row.state === '1' ? 'toggle_on' : 'toggle_off'"
            :color="props.row.state === '1' ? 'green' : 'grey'"
            @click="confirmarCambioEstado(props.row)"
          >
            <q-tooltip>{{ props.row.state === '1' ? 'Desactivar' : 'Activar' }}</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialogoProducto" persistent @hide="resetearFormulario">
      <q-card style="min-width: 700px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ modoEdicion ? 'Editar Producto' : 'Crear Nuevo Producto' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="scroll" style="max-height: 70vh;">
          <q-form ref="formProductoRef" @submit.prevent="onSubmitProducto" class="q-gutter-md">
            <q-input
              filled
              v-model="formProducto.nombre"
              label="Nombre del Producto *"
              lazy-rules
              :rules="[val => !!val || 'El nombre es requerido']"
            />
            <q-input
              filled
              v-model="formProducto.descripcion"
              label="Descripción *"
              type="textarea"
              lazy-rules
              :rules="[val => !!val || 'La descripción es requerida']"
            />
            <q-input
              filled
              v-model="formProducto.marca"
              label="Marca *"
              lazy-rules
              :rules="[val => !!val || 'La marca es requerida']"
            />
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  filled
                  v-model.number="formProducto.precio"
                  label="Precio *"
                  type="number"
                  min="0"
                  step="0.01"
                  lazy-rules
                  :rules="[
                    val => val !== null && val !== undefined && val >= 0 || 'El precio es requerido y debe ser >= 0'
                  ]"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  filled
                  v-model.number="formProducto.stock"
                  label="Stock *"
                  type="number"
                  min="0"
                  lazy-rules
                  :rules="[
                    val => val !== null && val !== undefined && val >= 0 || 'El stock es requerido y debe ser >= 0'
                  ]"
                />
              </div>
            </div>

            <!-- SECCIÓN DE IMÁGENES (MANTENIENDO TU ESTILO) -->
            <div v-if="modoEdicion && formProducto.imagenes && formProducto.imagenes.length > 0" class="q-mb-md">
              <div class="text-subtitle2 q-mb-xs">Imágenes Actuales:</div>
              <div class="row q-gutter-sm">
                <div v-for="(imgUrl, index) in formProducto.imagenes" :key="`existente-${index}`" class="col-auto" style="position: relative;">
                  <q-img :src="imgUrl" style="height: 100px; width: 100px; border-radius: 4px;" fit="cover" />
                  <q-btn
                    size="xs" round dense color="negative" icon="close"
                    class="absolute-top-right q-ma-xs" style="z-index: 1;"
                    @click="removerImagenExistente(index)"
                  >
                    <q-tooltip>Eliminar esta imagen (se aplicará al guardar)</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>

            <q-file
              filled
              v-model="formProducto.archivosImagenes"
              label="Añadir Nuevas Imágenes"
              multiple
              accept=".jpg, .jpeg, .png, .gif, .webp"
              max-file-size="5242880" 
              @rejected="onFileRejected"
              counter
              clearable
              :display-value="formProducto.archivosImagenes ? `${formProducto.archivosImagenes.length} archivo(s) seleccionado(s)` : ''"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>

              <template v-slot:after>
                <div v-if="formProducto.archivosImagenes && formProducto.archivosImagenes.length > 0" class="row q-gutter-sm q-mt-sm q-mb-sm">
                  <div v-for="(file, index) in formProducto.archivosImagenes" :key="`nuevo-${index}`" class="col-auto" style="position: relative;">
                    <q-img
                      :src="getObjectURL(file)"
                      style="height: 80px; width: 80px; border-radius: 4px;"
                      fit="cover"
                    />
                    <q-btn
                      size="xs" round dense color="negative" icon="close"
                      class="absolute-top-right q-ma-xs" style="z-index: 1;"
                      @click="removerArchivoImagenSeleccionado(index)"
                    />
                  </div>
                </div>
              </template>
            </q-file>

            <q-select
              filled
              v-model="formProducto.category"
              :options="opcionesCategorias"
              label="Categoría *"
              emit-value
              map-options
              option-value="value"
              option-label="label"
              lazy-rules
              :rules="[val => !!val || 'Debe seleccionar una categoría']"
              @update:model-value="manejarCambioCategoria"
            />

            <q-select
              filled
              v-model="formProducto.subcategory"
              :options="opcionesSubcategoriasFiltradas"
              label="Subcategoría *"
              emit-value
              map-options
              option-value="value"
              option-label="label"
              :disable="!formProducto.category || cargandoSubcategorias"
              :loading="cargandoSubcategorias"
              lazy-rules
              :rules="[val => !!val || 'Debe seleccionar una subcategoría']"
            />

            <div v-if="camposDetallesDinamicos.length > 0" class="q-mt-lg">
              <div class="text-subtitle1 q-mb-sm">Detalles Específicos</div>
              <q-input
                v-for="campo in camposDetallesDinamicos"
                :key="campo.key"
                filled
                v-model="formProducto.detalles[campo.key]"
                :label="campo.label + (campo.required ? ' *' : '')"
                class="q-mb-sm"
                lazy-rules
                :rules="campo.rules"
              />
            </div>
            <div v-else-if="formProducto.category && !cargandoEspecificaciones && !camposDetallesDinamicos.length && !cargandoSubcategorias">
              <q-banner dense inline-actions class="text-white bg-blue-grey-5 q-mt-md">
                No hay especificaciones adicionales para esta categoría.
              </q-banner>
            </div>
            <q-inner-loading :showing="cargandoEspecificaciones || cargandoSubcategorias">
              <q-spinner-gears size="50px" color="primary" />
            </q-inner-loading>

            <q-card-actions align="right" class="q-pt-md">
              <q-btn label="Cancelar" flat v-close-popup />
              <q-btn :label="modoEdicion ? 'Actualizar' : 'Crear'" type="submit" color="primary" :loading="guardandoProducto" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoVerDetalles">
      <q-card style="min-width: 500px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Detalles del Producto</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section v-if="productoSeleccionado" class="scroll" style="max-height: 70vh;">
          <q-list bordered separator>
            <q-item><q-item-section><q-item-label overline>Nombre</q-item-label><q-item-label>{{ productoSeleccionado.nombre }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label overline>Descripción</q-item-label><q-item-label caption style="white-space: pre-wrap;">{{ productoSeleccionado.descripcion }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label overline>Marca</q-item-label><q-item-label>{{ productoSeleccionado.marca }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label overline>Precio</q-item-label><q-item-label>${{ productoSeleccionado.precio }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label overline>Stock</q-item-label><q-item-label>{{ productoSeleccionado.stock }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label overline>Categoría</q-item-label><q-item-label>{{ productoSeleccionado.category?.name }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label overline>Subcategoría</q-item-label><q-item-label>{{ productoSeleccionado.subcategory?.name }}</q-item-label></q-item-section></q-item>
            
            <q-item>
              <q-item-section>
                <q-item-label overline>Imágenes</q-item-label>
                <div v-if="productoSeleccionado.imagenes && productoSeleccionado.imagenes.length > 0" class="q-mt-sm">
                  <q-carousel
                    v-if="productoSeleccionado.imagenes.length > 1"
                    v-model="slideImagenDetalle"
                    animated
                    arrows
                    navigation
                    infinite
                    control-color="primary"
                    height="250px"
                    class="bg-grey-2 rounded-borders"
                  >
                    <q-carousel-slide
                      v-for="(img, index) in productoSeleccionado.imagenes"
                      :key="`detalle-${index}`"
                      :name="index"
                      :img-src="img"
                      style="background-size: contain; background-repeat: no-repeat;"
                    />
                  </q-carousel>
                  <q-img
                    v-else
                    :src="productoSeleccionado.imagenes[0]"
                    style="max-height: 250px; border-radius: 4px;" fit="contain"
                    class="bg-grey-2"
                  />
                </div>
                <q-item-label v-else caption class="q-mt-sm">No hay imágenes disponibles.</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item v-if="productoSeleccionado.detalles && Object.keys(productoSeleccionado.detalles).length > 0">
              <q-item-section>
                <q-item-label overline>Detalles Específicos</q-item-label>
                <q-list dense>
                  <q-item v-for="(valor, clave) in productoSeleccionado.detalles" :key="clave">
                    <q-item-section side style="min-width: 120px; font-weight: 500;">{{ capitalizarYEspaciar(clave) }}:</q-item-section>
                    <q-item-section>{{ valor }}</q-item-section>
                  </q-item>
                </q-list>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right" class="q-pt-md">
          <q-btn label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../plugins/axios.js';


const CLOUDINARY_CLOUD_NAME = 'dwlsakic6'; 
const CLOUDINARY_UPLOAD_PRESET = 'ml_default'; 
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


const listaProductos = ref([]);
const cargandoTabla = ref(false);
const filtroTabla = ref('');
const columnasProductos = [
  { name: 'imagenes', label: 'Imagen', field: 'imagenes', align: 'center', classes: 'q-table--col-auto-width' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'category', label: 'Categoría', field: row => row.category?.name, align: 'left', sortable: true },
  { name: 'subcategory', label: 'Subcategoría', field: row => row.subcategory?.name, align: 'left', sortable: true },
  { name: 'precio', label: 'Precio', field: 'precio', align: 'right', sortable: true, format: val => `$${Number(val).toFixed(2)}` },
  { name: 'stock', label: 'Stock', field: 'stock', align: 'center', sortable: true },
  { name: 'state', label: 'Estado', field: 'state', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center', sortable: false }
];

// --- Estado para el Modal y Formulario ---
const dialogoProducto = ref(false);
const modoEdicion = ref(false);
const formProductoRef = ref(null);
const guardandoProducto = ref(false);

const formProductoInicial = () => ({
  _id: null,
  nombre: '',
  descripcion: '',
  precio: null,
  marca: '',
  imagenes: [],
  archivosImagenes: [],
  category: null,
  subcategory: null,
  detalles: {},
  stock: null,
});
const formProducto = ref(formProductoInicial());

// --- Estado para Selects y Campos Dinámicos ---
const opcionesCategorias = ref([]);
const opcionesSubcategoriasFiltradas = ref([]);
const camposDetallesDinamicos = ref([]);
const cargandoSubcategorias = ref(false);
const cargandoEspecificaciones = ref(false);

// --- Estado para Modal de Ver Detalles ---
const dialogoVerDetalles = ref(false);
const productoSeleccionado = ref(null);
const slideImagenDetalle = ref(0);

// --- Funciones de Utilidad ---
function capitalizarYEspaciar(str) {
  if (!str) return '';
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase());
}

function getObjectURL(file) {
  if (file instanceof File) {
    return URL.createObjectURL(file);
  }
  return '';
}

function removerArchivoImagenSeleccionado(index) {
  if (formProducto.value.archivosImagenes) {
    formProducto.value.archivosImagenes.splice(index, 1);
  }
}

function removerImagenExistente(index) {
  if (formProducto.value.imagenes) {
    formProducto.value.imagenes.splice(index, 1);
  }
}

function onFileRejected(rejectedEntries) {
  console.log('Archivos rechazados:', rejectedEntries);
}

async function subirArchivoACloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(CLOUDINARY_API_URL, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error al subir a Cloudinary');
    }
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error(`Error subiendo imagen a Cloudinary:`, error);
    throw error;
  }
}

// --- Lógica de Carga de Datos ---
async function cargarProductos() {
  cargandoTabla.value = true;
  try {
    const response = await api.get('productos');
    listaProductos.value = response.data;
  } catch (error) {
    console.error("Error al cargar productos:", error);
  } finally {
    cargandoTabla.value = false;
  }
}

async function cargarCategorias() {
  try {
    const response = await api.get('categorias');
    opcionesCategorias.value = response.data
      .filter(cat => cat.state === '1')
      .map(cat => ({
        label: cat.name,
        value: cat._id,
        codigo: cat.codigo
      }));
  } catch (error) {
    console.error("Error al cargar categorías:", error);
  }
}

async function manejarCambioCategoria(idCategoriaSeleccionada) {
  if (!idCategoriaSeleccionada) {
    opcionesSubcategoriasFiltradas.value = [];
    camposDetallesDinamicos.value = [];
    formProducto.value.subcategory = null;
    formProducto.value.detalles = {};
    return;
  }

  const categoriaSeleccionada = opcionesCategorias.value.find(cat => cat.value === idCategoriaSeleccionada);
  if (!categoriaSeleccionada) return;

  if (formProducto.value.subcategory || Object.keys(formProducto.value.detalles).length > 0) {
    formProducto.value.subcategory = null;
    formProducto.value.detalles = {};
  }

  cargandoSubcategorias.value = true;
  cargandoEspecificaciones.value = true;

  try {
    const resSubcat = await api.get(`subcategorias/${categoriaSeleccionada.codigo}`);
    opcionesSubcategoriasFiltradas.value = (resSubcat.data.data || [])
      .filter(sub => sub.state === '1')
      .map(subcat => ({
        label: subcat.name,
        value: subcat._id
      }));

    const resEspec = await api.get(`categorias/${categoriaSeleccionada.codigo}/especificaciones`);
    const nombresCampos = resEspec.data.campos || [];
    
    camposDetallesDinamicos.value = nombresCampos.map(nombreCampo => {
      const esRequerido = inferirRequerido(nombreCampo);
      return {
        key: nombreCampo,
        label: capitalizarYEspaciar(nombreCampo),
        required: esRequerido,
        rules: esRequerido ? [val => !!val || `${capitalizarYEspaciar(nombreCampo)} es requerido`] : []
      };
    });
    
    const nuevosDetalles = {};
    camposDetallesDinamicos.value.forEach(campo => {
      nuevosDetalles[campo.key] = formProducto.value.detalles[campo.key] || '';
    });
    formProducto.value.detalles = nuevosDetalles;

  } catch (error) {
    console.error("Error al cargar datos dependientes de categoría:", error);
    opcionesSubcategoriasFiltradas.value = [];
    camposDetallesDinamicos.value = [];
  } finally {
    cargandoSubcategorias.value = false;
    cargandoEspecificaciones.value = false;
  }
}

function inferirRequerido(nombreCampo) {
  const camposOpcionalesConocidos = [
    'bateria', 'modeloProcesador', 'marcaGrafica', 'fuentePoder', 'refrigeracion',
    'camaraPrincipal', 'pantalla', 'conectividadOpcional', 'microfono',
    'botonesProgramables', 'retroiluminacion', 'compatibilidadAdicional'
  ];
  if (camposOpcionalesConocidos.includes(nombreCampo)) {
    return false;
  }
  return true;
}

// --- Lógica del Modal y Formulario ---
function resetearFormulario() {
  formProducto.value = formProductoInicial();
  opcionesSubcategoriasFiltradas.value = [];
  camposDetallesDinamicos.value = [];
  if (formProductoRef.value) {
    formProductoRef.value.resetValidation();
  }
}

function abrirModalNuevoProducto() {
  modoEdicion.value = false;
  resetearFormulario();
  dialogoProducto.value = true;
}

async function abrirModalEditarProducto(producto) {
  modoEdicion.value = true;
  resetearFormulario();

  const productoEditable = JSON.parse(JSON.stringify(producto));

  formProducto.value = {
    _id: productoEditable._id,
    nombre: productoEditable.nombre,
    descripcion: productoEditable.descripcion,
    precio: productoEditable.precio,
    marca: productoEditable.marca,
    imagenes: productoEditable.imagenes ? [...productoEditable.imagenes] : [],
    archivosImagenes: [],
    category: productoEditable.category?._id || null,
    subcategory: null,
    detalles: productoEditable.detalles ? { ...productoEditable.detalles } : {},
    stock: productoEditable.stock,
  };
  
  dialogoProducto.value = true;
  
  if (formProducto.value.category) {
    await manejarCambioCategoria(formProducto.value.category);
    await new Promise(resolve => setTimeout(resolve, 100));
    formProducto.value.subcategory = productoEditable.subcategory?._id || null;

    const detallesOriginales = productoEditable.detalles || {};
    const detallesForm = {};
    camposDetallesDinamicos.value.forEach(campo => {
      detallesForm[campo.key] = detallesOriginales[campo.key] !== undefined ? detallesOriginales[campo.key] : '';
    });
    formProducto.value.detalles = detallesForm;
  }
}

async function onSubmitProducto() {
  try {
    const formData = new FormData();

    // Campos básicos (igual que antes)
    formData.append('nombre', formProducto.value.nombre);
    formData.append('descripcion', formProducto.value.descripcion);
    formData.append('precio', formProducto.value.precio);
    formData.append('marca', formProducto.value.marca);
    formData.append('stock', formProducto.value.stock);
    formData.append('category', formProducto.value.category);
    formData.append('subcategory', formProducto.value.subcategory);
    formData.append('detalles', JSON.stringify(formProducto.value.detalles));

    // Cambia esto: usa 'imagenes' para crear y 'nuevasImagenes' para actualizar
    const campoArchivos = modoEdicion.value ? 'nuevasImagenes' : 'imagenes';

    if (formProducto.value.archivosImagenes?.length > 0) {
      formProducto.value.archivosImagenes.forEach(file => {
        formData.append(campoArchivos, file); // Campo dinámico según la acción
      });
    }

    // Envía la petición
    const endpoint = modoEdicion.value 
      ? `/productos/${formProducto.value._id}` 
      : '/productos';
    const method = modoEdicion.value ? 'put' : 'post';

    await api[method](endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    dialogoProducto.value = false;
    cargarProductos();
  } catch (error) {
    console.error("Error al guardar:", error);
  }
}
// --- Acciones de la Tabla ---
function verDetallesProducto(producto) {
  productoSeleccionado.value = producto;
  slideImagenDetalle.value = (producto.imagenes && producto.imagenes.length > 0) ? 0 : null;
  dialogoVerDetalles.value = true;
}

function confirmarCambioEstado(producto) {
  const accion = producto.state === '1' ? 'desactivar' : 'activar';
  if (confirm(`¿Está seguro de que desea ${accion} el producto "${producto.nombre}"?`)) {
    cambiarEstadoProducto(producto);
  }
}

async function cambiarEstadoProducto(producto) {
  try {
    await api.put(`/productos/estado/${producto._id}`);
    cargarProductos();
  } catch (error) {
    console.error(`Error al cambiar estado del producto:`, error);
  }
}

// --- Ciclo de Vida ---
onMounted(() => {
  cargarProductos();
  cargarCategorias();
});
</script>

<style scoped>
.q-table th {
  font-weight: bold;
}
.q-table--col-auto-width {
  width: 1px;
}
.scroll {
  overflow-y: auto;
}
</style>