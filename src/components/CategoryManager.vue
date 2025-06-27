<template>
  <!-- Eliminado breadcrumb local, ahora es global -->
  <div>
    <div class="q-mb-md row justify-between items-center">
      <h5 class="q-my-none text-primary">
        <q-icon name="category" size="md" class="q-mr-sm" />
        Gestión de Categorías
      </h5>
      <q-btn 
        label="Nueva Categoría" 
        color="primary" 
        @click="abrirModalNuevaCategoria" 
        icon="add" 
        no-caps
      />
    </div>

    <!-- Tabla de categorías -->
    <q-table
      title="Categorías"
      :rows="listaCategorias"
      :columns="columnasCategorias"
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

      <template v-slot:body-cell-state="props">
        <q-td :props="props">
          <q-badge :color="props.row.state === '1' ? 'positive' : 'negative'">
            {{ props.row.state === '1' ? 'Activo' : 'Inactivo' }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-acciones="props">
        <q-td :props="props">
          <q-btn flat round dense icon="edit" @click="abrirModalEditarCategoria(props.row)" class="q-mr-sm">
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

    <!-- Modal para crear/editar categoría -->
    <q-dialog v-model="dialogoCategoria" persistent @hide="resetearFormulario">
      <q-card style="min-width: 700px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ modoEdicion ? 'Editar Categoría' : 'Crear Nueva Categoría' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="scroll" style="max-height: 70vh;">
          <q-form ref="formCategoriaRef" @submit.prevent="onSubmitCategoria" class="q-gutter-md">
            <!-- Información básica de la categoría -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  filled
                  v-model="formCategoria.name"
                  label="Nombre de la Categoría *"
                  lazy-rules
                  :rules="[val => !!val || 'El nombre es requerido']"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  filled
                  v-model="formCategoria.codigo"
                  label="Código *"
                  lazy-rules
                  :rules="[val => !!val || 'El código es requerido']"
                />
              </div>
            </div>

            <!-- Add description field -->
            <div class="row q-col-gutter-md q-mt-md">
              <div class="col-12">
                <q-input
                  filled
                  v-model="formCategoria.description"
                  label="Descripción *"
                  type="textarea"
                  lazy-rules
                  :rules="[val => !!val || 'La descripción es requerida']"
                />
              </div>
            </div>

            <!-- Subcategorías -->
            <div class="q-mt-lg">
              <div class="text-subtitle1 q-mb-sm">Subcategorías</div>
              <div v-for="(subcat, index) in formCategoria.subcategorias" :key="index" class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-sm-5">
                  <q-input
                    filled
                    v-model="subcat.name"
                    label="Nombre de la Subcategoría *"
                    lazy-rules
                    :rules="[val => !!val || 'El nombre es requerido']"
                  />
                </div>
                <div class="col-12 col-sm-5">
                  <q-input
                    filled
                    v-model="subcat.codigo"
                    label="Código *"
                    lazy-rules
                    :rules="[val => !!val || 'El código es requerido']"
                  />
                </div>
                <div class="col-12 col-sm-2 flex items-center">
                  <q-btn
                    flat
                    round
                    dense
                    color="negative"
                    icon="delete"
                    @click="eliminarSubcategoria(index)"
                  >
                    <q-tooltip>Eliminar subcategoría</q-tooltip>
                  </q-btn>
                </div>
              </div>
              <q-btn
                outline
                color="primary"
                icon="add"
                label="Añadir Subcategoría"
                @click="agregarSubcategoria"
                class="q-mt-sm"
              />
            </div>

            <!-- Especificaciones -->
            <div class="q-mt-lg">
              <div class="text-subtitle1 q-mb-sm">Especificaciones</div>
              <div v-for="(espec, index) in formCategoria.especificaciones" :key="index" class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-sm-3">
                  <q-input
                    filled
                    v-model="espec.key"
                    label="Clave *"
                    lazy-rules
                    :rules="[val => !!val || 'La clave es requerida']"
                  />
                </div>
                <div class="col-12 col-sm-3">
                  <q-input
                    filled
                    v-model="espec.label"
                    label="Etiqueta *"
                    lazy-rules
                    :rules="[val => !!val || 'La etiqueta es requerida']"
                  />
                </div>
                <div class="col-12 col-sm-2">
                  <q-select
                    filled
                    v-model="espec.type"
                    :options="tiposEspecificacion"
                    label="Tipo *"
                    emit-value
                    map-options
                    lazy-rules
                    :rules="[val => !!val || 'El tipo es requerido']"
                  />
                </div>
                <div class="col-12 col-sm-3">
                  <q-checkbox
                    v-model="espec.required"
                    label="Requerido"
                  />
                </div>
                <div class="col-12 col-sm-1 flex items-center">
                  <q-btn
                    flat
                    round
                    dense
                    color="negative"
                    icon="delete"
                    @click="eliminarEspecificacion(index)"
                  >
                    <q-tooltip>Eliminar especificación</q-tooltip>
                  </q-btn>
                </div>
              </div>
              <q-btn
                outline
                color="primary"
                icon="add"
                label="Añadir Especificación"
                @click="agregarEspecificacion"
                class="q-mt-sm"
              />
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cancelar" color="negative" v-close-popup />
          <q-btn
            label="Guardar"
            color="primary"
            :loading="guardandoCategoria"
            @click="onSubmitCategoria"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

import api from '../plugins/axios';
import { showNotification } from '../utils/notifications';

const router = useRouter();
const $q = useQuasar();

// Estado
const listaCategorias = ref([]);
const cargandoTabla = ref(false);
const filtroTabla = ref('');
const dialogoCategoria = ref(false);
const modoEdicion = ref(false);
const formCategoriaRef = ref(null);
const guardandoCategoria = ref(false);

// Columnas de la tabla
const columnasCategorias = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  { name: 'state', label: 'Estado', field: 'state', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center', sortable: false }
];

// Tipos de especificación disponibles
const tiposEspecificacion = [
  { label: 'Texto', value: 'text' },
  { label: 'Número', value: 'number' },
  { label: 'Booleano', value: 'boolean' },
  { label: 'Select', value: 'select' },
  { label: 'Multiselect', value: 'multiselect' }
];

// Formulario inicial
const formCategoriaInicial = () => ({
  _id: null,
  name: '',
  codigo: '',
  description: '',
  subcategorias: [],
  especificaciones: []
});

const formCategoria = ref(formCategoriaInicial());

// Cargar categorías
async function cargarCategorias() {
  cargandoTabla.value = true;
  try {
    const response = await api.get('categorias');
    listaCategorias.value = Array.isArray(response?.data) ? response.data : [];
  } catch (error) {
    console.error("Error al cargar categorías:", error);
    listaCategorias.value = [];
    showNotification('error', 'Error al cargar la lista de categorías.')
  } finally {
    cargandoTabla.value = false;
  }
}

// Funciones del formulario
function resetearFormulario() {
  formCategoria.value = formCategoriaInicial();
  if (formCategoriaRef.value) {
    formCategoriaRef.value.resetValidation();
  }
}

function abrirModalNuevaCategoria() {
  modoEdicion.value = false;
  resetearFormulario();
  dialogoCategoria.value = true;
}

function abrirModalEditarCategoria(categoria) {
  modoEdicion.value = true;
  formCategoria.value = {
    _id: categoria._id,
    name: categoria.name,
    codigo: categoria.codigo,
    description: categoria.description,
    subcategorias: categoria.subcategorias || [],
    especificaciones: categoria.especificaciones || []
  };
  dialogoCategoria.value = true;
}

function agregarSubcategoria() {
  formCategoria.value.subcategorias.push({
    name: '',
    codigo: ''
  });
}

function eliminarSubcategoria(index) {
  formCategoria.value.subcategorias.splice(index, 1);
}

function agregarEspecificacion() {
  formCategoria.value.especificaciones.push({
    key: '',
    label: '',
    type: 'text',
    required: false,
    options: []
  });
}

function eliminarEspecificacion(index) {
  formCategoria.value.especificaciones.splice(index, 1);
}

// Guardar categoría
async function onSubmitCategoria() {
  guardandoCategoria.value = true;
  try {
    const endpoint = modoEdicion.value 
      ? `/categorias/${formCategoria.value._id}` 
      : '/categorias';
    const method = modoEdicion.value ? 'put' : 'post';

    await api[method](endpoint, formCategoria.value);
    
    dialogoCategoria.value = false;
    await cargarCategorias();
    showNotification('success', `Categoría ${modoEdicion.value ? 'actualizada' : 'creada'} exitosamente.`)
  } catch (error) {
    console.error("Error al guardar categoría:", error);
    showNotification('error', `Error al ${modoEdicion.value ? 'actualizar' : 'crear'} la categoría.`)
  } finally {
    guardandoCategoria.value = false;
  }
}

// Cambiar estado
function confirmarCambioEstado(categoria) {
  const accion = categoria.state === '1' ? 'desactivar' : 'activar';
  $q.dialog({
    title: 'Confirmar Acción',
    message: `¿Está seguro de que desea ${accion} la categoría "${categoria.name}"?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    cambiarEstadoCategoria(categoria);
  });
}

async function cambiarEstadoCategoria(categoria) {
  try {
    await api.put(`/categorias/estado/${categoria._id}`);
    await cargarCategorias();
    showNotification('success', `Estado de "${categoria.name}" cambiado exitosamente.`)
  } catch (error) {
    console.error(`Error al cambiar estado de la categoría:`, error);
    showNotification('error', `Error al cambiar el estado de la categoría: ${error.message || 'Error desconocido'}.`)
  }
}

// Inicialización
onMounted(() => {
  cargarCategorias();
});
</script>

<style scoped>
.q-table th {
  font-weight: bold;
}
.scroll {
  overflow-y: auto;
}
</style> 