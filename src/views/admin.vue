<template>
  <!-- Añadir pestaña para gestión de ofertas -->
  <q-tabs
    v-model="activeTab"
    class="text-primary q-mb-md"
    indicator-color="primary"
    align="left"
  >
    <q-tab name="productos" label="Productos" icon="inventory_2" />
    <q-tab name="marcas" label="Marcas" icon="branding_watermark" />
    <q-tab name="ofertas" label="Ofertas" icon="local_offer" />
  </q-tabs>

  <!-- Contenido de pestañas -->
  <q-tab-panels v-model="activeTab" animated>
    <!-- Panel de productos -->
    <q-tab-panel name="productos">
      <div class="q-mb-md row justify-between items-center">
        <h5 class="q-my-none">Gestión de Productos</h5>
        <q-btn label="Nuevo Producto" color="primary" @click="abrirModalNuevoProducto" icon="add" />
      </div>
      
      <!-- Tabla de productos (mantener el código existente) -->
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
    </q-tab-panel>
    
    <!-- Panel de marcas -->
    <q-tab-panel name="marcas">
      <div class="q-mb-md row justify-between items-center">
        <h5 class="q-my-none">Gestión de Marcas</h5>
        <q-btn label="Nueva Marca" color="primary" @click="abrirModalNuevaMarca" icon="add" />
      </div>
      
      <q-table
        title="Marcas"
        :rows="listaMarcas"
        :columns="columnasMarcas"
        row-key="_id"
        :loading="cargandoTablaMarcas"
        :filter="filtroTablaMarcas"
      >
        <template v-slot:top-right>
          <q-input borderless dense debounce="300" v-model="filtroTablaMarcas" placeholder="Buscar">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
        
        <!-- Celda para el logo -->
        <template v-slot:body-cell-logo="props">
          <q-td :props="props">
            <q-img
              :src="props.row.logo || 'https://via.placeholder.com/50?text=NoLogo'"
              style="height: 40px; width: 80px; border-radius: 4px;"
              fit="contain"
            >
              <template v-slot:error>
                <div class="absolute-full flex flex-center bg-grey-3 text-grey-8" style="font-size: 0.7rem;">
                  <q-icon name="image_not_supported" size="xs" class="q-mr-xs" /> Sin logo
                </div>
              </template>
            </q-img>
          </q-td>
        </template>
        
        <!-- Celda para el estado -->
        <template v-slot:body-cell-state="props">
          <q-td :props="props">
            <q-badge :color="props.row.state === '1' ? 'positive' : 'negative'">
              {{ props.row.state === '1' ? 'Activo' : 'Inactivo' }}
            </q-badge>
          </q-td>
        </template>
        
        <!-- Celda para acciones -->
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn flat round dense icon="edit" @click="abrirModalEditarMarca(props.row)" class="q-mr-sm">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              :icon="props.row.state === '1' ? 'toggle_on' : 'toggle_off'"
              :color="props.row.state === '1' ? 'green' : 'grey'"
              @click="confirmarCambioEstadoMarca(props.row)"
            >
              <q-tooltip>{{ props.row.state === '1' ? 'Desactivar' : 'Activar' }}</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-tab-panel>
    
    <!-- Panel de ofertas -->
    <q-tab-panel name="ofertas">
      <div class="q-mb-md row justify-between items-center">
        <h5 class="q-my-none">Gestión de Ofertas</h5>
        <div>
          <q-btn label="Crear Oferta" color="primary" @click="abrirModalNuevaOferta" icon="add" class="q-mr-sm" />
          <q-btn label="Generar Ofertas Automáticas" color="secondary" @click="abrirModalOfertasAutomaticas" icon="auto_awesome" />
        </div>
      </div>
      
      <!-- Tabla de productos en oferta -->
      <q-table
        title="Productos en Oferta"
        :rows="listaProductosEnOferta"
        :columns="columnasOfertas"
        row-key="_id"
        :loading="cargandoTablaOfertas"
        :filter="filtroTablaOfertas"
      >
        <template v-slot:top-right>
          <q-input borderless dense debounce="300" v-model="filtroTablaOfertas" placeholder="Buscar">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
        
        <!-- Columna de imagen -->
        <template v-slot:body-cell-imagenes="props">
          <q-td :props="props">
            <q-img
              v-if="props.row.imagenes && props.row.imagenes.length > 0"
              :src="props.row.imagenes[0]"
              spinner-color="primary"
              style="height: 50px; width: 50px"
              fit="cover"
            />
            <q-icon v-else name="image_not_supported" size="50px" color="grey-5" />
          </q-td>
        </template>
        
        <!-- Columna de precio original -->
        <template v-slot:body-cell-precio="props">
          <q-td :props="props">
            <div class="text-line-through text-grey">
              ${{ Number(props.row.precio).toFixed(2) }}
            </div>
          </q-td>
        </template>
        
        <!-- Columna de precio oferta -->
        <template v-slot:body-cell-precioOferta="props">
          <q-td :props="props">
            <div class="text-weight-bold text-negative">
              ${{ Number(props.row.precioOferta).toFixed(2) }}
            </div>
          </q-td>
        </template>
        
        <!-- Columna de fechas -->
        <template v-slot:body-cell-fechas="props">
          <q-td :props="props">
            <div v-if="props.row.fechaInicioOferta || props.row.fechaFinOferta">
              <div v-if="props.row.fechaInicioOferta">
                Desde: {{ formatDate(props.row.fechaInicioOferta) }}
              </div>
              <div v-if="props.row.fechaFinOferta">
                Hasta: {{ formatDate(props.row.fechaFinOferta) }}
              </div>
            </div>
            <div v-else class="text-grey">Sin fechas definidas</div>
          </q-td>
        </template>
        
        <!-- Columna de acciones -->
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn flat round dense icon="edit" @click="editarOferta(props.row)" class="q-mr-sm">
              <q-tooltip>Editar Oferta</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="delete" color="negative" @click="confirmarEliminarOferta(props.row)">
              <q-tooltip>Eliminar Oferta</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-tab-panel>
  </q-tab-panels>

  <!-- Modal para crear/editar marca -->
  <q-dialog v-model="dialogoMarca" persistent @hide="resetearFormularioMarca">
    <q-card style="min-width: 500px; max-width: 80vw;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ modoEdicionMarca ? 'Editar Marca' : 'Crear Nueva Marca' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="scroll" style="max-height: 70vh;">
        <q-form ref="formMarcaRef" @submit.prevent="onSubmitMarca" class="q-gutter-md">
          <q-input
            filled
            v-model="formMarca.nombre"
            label="Nombre de la Marca *"
            lazy-rules
            :rules="[val => !!val || 'El nombre es requerido']"
          />
          
          <!-- Subida de logo -->
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-xs">Logo de la Marca:</div>
            
            <div v-if="formMarca.logo" class="q-mb-md">
              <div class="text-caption q-mb-xs">Logo actual:</div>
              <div class="row q-gutter-sm">
                <div class="col-auto" style="position: relative;">
                  <q-img :src="formMarca.logo" style="height: 100px; max-width: 200px; border-radius: 4px;" fit="contain" />
                  <q-btn
                    size="xs" round dense color="negative" icon="close"
                    class="absolute-top-right q-ma-xs" style="z-index: 1;"
                    @click="formMarca.logo = ''"
                  >
                    <q-tooltip>Eliminar logo</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>
            
            <q-file
              v-model="logoFile"
              label="Seleccionar logo"
              filled
              accept=".jpg,.jpeg,.png,.gif,.webp,.svg"
              max-file-size="2097152"
              @rejected="onLogoRejected"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
              <template v-slot:hint>
                Formatos: JPG, PNG, GIF, WEBP, SVG (máx. 2MB)
              </template>
            </q-file>
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Cancelar" color="negative" v-close-popup />
        <q-btn 
          label="Guardar" 
          color="primary" 
          :loading="guardandoMarca" 
          @click="onSubmitMarca" 
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

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
          <q-select
            filled
            v-model="formProducto.marca"
            :options="listaMarcas"
            option-value="_id"
            option-label="nombre"
            label="Marca *"
            emit-value
            map-options
            lazy-rules
            :rules="[val => !!val || 'La marca es requerida']"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar v-if="scope.opt.logo">
                  <q-img :src="scope.opt.logo" style="width: 30px; height: 20px" fit="contain" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
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
            <div class="text-subtitle1 q-mb-sm">Especificaciones</div>
            <div v-for="campo in camposDetallesDinamicos" :key="campo.key" class="q-mb-sm">
              <q-input
                v-if="campo.type === 'text' || campo.type === 'number'"
                filled
                v-model="formProducto.especificaciones[campo.key]"
                :label="campo.label + (campo.required ? ' *' : '')"
                :type="campo.type === 'number' ? 'number' : 'text'"
                :rules="campo.rules"
                :min="campo.min"
                :max="campo.max"
              />
              <q-checkbox
                v-else-if="campo.type === 'boolean'"
                v-model="formProducto.especificaciones[campo.key]"
                :label="campo.label + (campo.required ? ' *' : '')"
                :rules="campo.rules"
                checked-icon="check"
                unchecked-icon="clear"
              />
              <q-select
                v-else-if="campo.type === 'select' || campo.type === 'multiselect'"
                filled
                v-model="formProducto.especificaciones[campo.key]"
                :label="campo.label + (campo.required ? ' *' : '')"
                :options="campo.options"
                :multiple="campo.type === 'multiselect'"
                :rules="campo.rules"
                emit-value
                map-options
                option-value="value"
                option-label="label"
              />
              </div>
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
          
          <q-item v-if="productoSeleccionado.especificaciones && Object.keys(productoSeleccionado.especificaciones).length > 0">
            <q-item-section>
              <q-item-label overline>Especificaciones</q-item-label>
              <q-list dense>
                <q-item v-for="(valor, clave) in productoSeleccionado.especificaciones" :key="clave">
                  <q-item-section side style="min-width: 120px; font-weight: 500;">{{ capitalizarYEspaciar(clave) }}:</q-item-section>
                  <q-item-section>{{ Array.isArray(valor) ? valor.join(', ') : valor }}</q-item-section>
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

  <!-- Modal para crear/editar oferta -->
  <q-dialog v-model="dialogoOferta" persistent @hide="resetearFormularioOferta">
    <q-card style="min-width: 500px; max-width: 80vw;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ modoEdicionOferta ? 'Editar Oferta' : 'Crear Nueva Oferta' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="scroll" style="max-height: 70vh;">
        <q-form ref="formOfertaRef" @submit.prevent="onSubmitOferta" class="q-gutter-md">
          <!-- Selector de producto -->
          <q-select
            v-if="!modoEdicionOferta"
            filled
            v-model="formOferta.producto"
            :options="productosDisponiblesParaOferta"
            option-value="_id"
            option-label="nombre"
            label="Seleccionar Producto *"
            emit-value
            map-options
            use-input
            hide-selected
            fill-input
            input-debounce="300"
            @filter="filtrarProductos"
            lazy-rules
            :rules="[val => !!val || 'Debe seleccionar un producto']"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-img
                    v-if="scope.opt.imagenes && scope.opt.imagenes.length > 0"
                    :src="scope.opt.imagenes[0]"
                    style="width: 40px; height: 40px"
                    fit="cover"
                  />
                  <q-icon v-else name="image_not_supported" size="40px" color="grey-5" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                  <q-item-label caption>
                    ${{ Number(scope.opt.precio).toFixed(2) }} | 
                    {{ scope.opt.marca?.nombre || 'Sin marca' }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          
          <!-- Información del producto seleccionado (en modo edición) -->
          <div v-if="modoEdicionOferta && productoSeleccionado" class="q-mb-md">
            <div class="row items-center">
              <q-img
                v-if="productoSeleccionado.imagenes && productoSeleccionado.imagenes.length > 0"
                :src="productoSeleccionado.imagenes[0]"
                style="width: 60px; height: 60px"
                fit="cover"
                class="q-mr-md"
              />
              <div>
                <div class="text-h6">{{ productoSeleccionado.nombre }}</div>
                <div class="text-subtitle2">
                  Precio original: ${{ Number(productoSeleccionado.precio).toFixed(2) }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Porcentaje de descuento -->
          <q-input
            filled
            v-model.number="formOferta.porcentajeDescuento"
            type="number"
            label="Porcentaje de Descuento *"
            min="1"
            max="99"
            lazy-rules
            :rules="[
              val => val !== null && val !== undefined || 'El porcentaje es requerido',
              val => val > 0 && val < 100 || 'El porcentaje debe estar entre 1 y 99'
            ]"
          >
            <template v-slot:append>
              <q-icon name="percent" />
            </template>
          </q-input>
          
          <!-- Fechas de la oferta -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-input
                filled
                v-model="formOferta.fechaInicioOferta"
                label="Fecha de Inicio"
                mask="date"
                :rules="['date']"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="formOferta.fechaInicioOferta" mask="YYYY-MM-DD">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Cerrar" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                filled
                v-model="formOferta.fechaFinOferta"
                label="Fecha de Fin"
                mask="date"
                :rules="['date']"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="formOferta.fechaFinOferta" mask="YYYY-MM-DD">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Cerrar" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>
          
          <!-- Vista previa del precio con descuento -->
          <div v-if="precioConDescuento > 0" class="q-pa-md bg-grey-2 rounded-borders">
            <div class="text-subtitle1">Vista previa:</div>
            <div class="row items-center q-mt-sm">
              <div class="text-h6 text-negative">
                ${{ precioConDescuento.toFixed(2) }}
              </div>
              <div class="text-caption text-grey q-ml-sm text-line-through">
                ${{ precioOriginal.toFixed(2) }}
              </div>
              <q-badge color="negative" class="q-ml-md">
                {{ formOferta.porcentajeDescuento }}% OFF
              </q-badge>
            </div>
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Cancelar" color="negative" v-close-popup />
        <q-btn 
          label="Guardar" 
          color="primary" 
          :loading="guardandoOferta" 
          @click="onSubmitOferta" 
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  
  <!-- Modal para generar ofertas automáticas -->
  <q-dialog v-model="dialogoOfertasAutomaticas" persistent>
    <q-card style="min-width: 400px; max-width: 80vw;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Generar Ofertas Automáticas</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <q-form ref="formOfertasAutomaticasRef" @submit.prevent="generarOfertasAutomaticas" class="q-gutter-md">
          <p class="text-body1">
            Esta función generará ofertas automáticamente para productos con alto stock o que llevan mucho tiempo en inventario.
          </p>
          
          <q-input
            filled
            v-model.number="formOfertasAutomaticas.stockMinimo"
            type="number"
            label="Stock mínimo para considerar"
            min="1"
            lazy-rules
            :rules="[val => val > 0 || 'Debe ser mayor a 0']"
          />
          
          <q-input
            filled
            v-model.number="formOfertasAutomaticas.diasEnInventario"
            type="number"
            label="Días en inventario para considerar"
            min="1"
            lazy-rules
            :rules="[val => val > 0 || 'Debe ser mayor a 0']"
          />
          
          <q-input
            filled
            v-model.number="formOfertasAutomaticas.porcentajeDescuento"
            type="number"
            label="Porcentaje de descuento a aplicar"
            min="1"
            max="99"
            lazy-rules
            :rules="[
              val => val > 0 && val < 100 || 'El porcentaje debe estar entre 1 y 99'
            ]"
          >
            <template v-slot:append>
              <q-icon name="percent" />
            </template>
          </q-input>
          
          <q-input
            filled
            v-model.number="formOfertasAutomaticas.duracionOfertaDias"
            type="number"
            label="Duración de la oferta (días)"
            min="1"
            lazy-rules
            :rules="[val => val > 0 || 'Debe ser mayor a 0']"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Cancelar" color="negative" v-close-popup />
        <q-btn 
          label="Generar" 
          color="primary" 
          :loading="generandoOfertasAutomaticas" 
          @click="generarOfertasAutomaticas" 
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../plugins/axios.js';
import { useQuasar } from 'quasar';
import { showNotification } from '../utils/notifications';

const $q = useQuasar();

const CLOUDINARY_CLOUD_NAME = 'dwlsakic6';
const CLOUDINARY_UPLOAD_PRESET = 'ml_default';
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// Inicialización de datos
const listaProductos = ref([]);
const cargandoTabla = ref(false);
const filtroTabla = ref('');

// Columnas de la tabla
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

// Estado para modales
const dialogoProducto = ref(false);
const dialogoVerDetalles = ref(false);
const modoEdicion = ref(false);
const formProductoRef = ref(null);
const guardandoProducto = ref(false);

// Formulario de producto
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
  especificaciones: {}, 
  stock: null,
});
const formProducto = ref(formProductoInicial());

// Selects y campos dinámicos
const opcionesCategorias = ref([]);
const opcionesSubcategoriasFiltradas = ref([]);
const camposDetallesDinamicos = ref([]); // Estos son los campos para el formulario
const cargandoSubcategorias = ref(false);
const cargandoEspecificaciones = ref(false);

// Detalles de producto
const productoSeleccionado = ref(null);
const slideImagenDetalle = ref(0);

// Funciones de utilidad
function capitalizarYEspaciar(str) {
  if (typeof str !== 'string') return str || '';
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim();
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
  showNotification('error', `Algunos archivos fueron rechazados. Asegúrate que sean imágenes válidas (jpg, png, gif, webp) y menores de 5MB.`)
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

// Carga de datos
async function cargarProductos() {
  cargandoTabla.value = true;
  try {
    const response = await api.get('productos');
    listaProductos.value = Array.isArray(response?.data) ? response.data : [];
  } catch (error) {
    console.error("Error al cargar productos:", error);
    listaProductos.value = [];
    showNotification('error', 'Error al cargar la lista de productos.')
  } finally {
    cargandoTabla.value = false;
  }
}

async function cargarCategorias() {
  try {
    const response = await api.get('categorias');
    opcionesCategorias.value = response.data
      ?.filter(cat => cat.state === '1')
      ?.map(cat => ({
        label: cat.name,
        value: cat._id,
        codigo: cat.codigo
      })) || [];
  } catch (error) {
    console.error("Error al cargar categorías:", error);
    opcionesCategorias.value = [];
  
  }
}

// --- CAMBIO SIGNIFICATIVO EN manejarCambioCategoria ---
async function manejarCambioCategoria(idCategoriaSeleccionada) {
  if (!idCategoriaSeleccionada) {
    opcionesSubcategoriasFiltradas.value = [];
    camposDetallesDinamicos.value = [];
    formProducto.value.subcategory = null;
    formProducto.value.especificaciones = {}; // <--- CAMBIO: Asegúrate de limpiar especificaciones
    return;
  }

  const categoriaSeleccionada = opcionesCategorias.value.find(cat => cat.value === idCategoriaSeleccionada);
  if (!categoriaSeleccionada) {
    // Esto no debería ocurrir si idCategoriaSeleccionada viene de opcionesCategorias
    console.error('Categoría seleccionada no encontrada en las opciones.');
    return;
  }

  const categoriaCodigo = categoriaSeleccionada.codigo;

  formProducto.value.subcategory = null;
  formProducto.value.especificaciones = {}; // <--- CAMBIO: Asegúrate de limpiar especificaciones al cambiar de categoría

  cargandoSubcategorias.value = true;
  cargandoEspecificaciones.value = true;

  try {
    // Cargar subcategorías
    const resSubcat = await api.get(`subcategorias/${categoriaCodigo}`);
    opcionesSubcategoriasFiltradas.value = (resSubcat.data?.data || [])
      .filter(sub => sub.state === '1')
      .map(subcat => ({
        label: subcat.name,
        value: subcat._id
      }));

    // Cargar especificaciones
    const resEspec = await api.get(`categorias/${categoriaCodigo}/especificaciones`);

    if (!resEspec.data || !resEspec.data.especificaciones) {
      console.warn('No se encontraron especificaciones para esta categoría o la respuesta no es válida:', resEspec.data);
      camposDetallesDinamicos.value = [];
    } else {
      camposDetallesDinamicos.value = resEspec.data.especificaciones.map(campoBe => {
        const reglasCampo = [];

        // Reglas de requerimiento
        if (campoBe.required) {
          if (campoBe.uiType === 'boolean') {
            // No se requiere regla de "valor o nulo" para booleanos, Quasar los maneja bien.
          } else if (campoBe.uiType === 'multiselect') {
            reglasCampo.push(val => (Array.isArray(val) && val.length > 0) || `${campoBe.label} es requerido.`);
          } else if (campoBe.uiType === 'number') {
            reglasCampo.push(val => (val !== null && val !== undefined) || `${campoBe.label} es requerido.`);
          } else { // text, select, etc.
            reglasCampo.push(val => (val !== null && val !== undefined && String(val).trim() !== '') || `${campoBe.label} es requerido.`);
          }
        }

        // Reglas específicas de tipo
        if (campoBe.uiType === 'number') {
          if (campoBe.rules?.min !== undefined) reglasCampo.push(val => val === null || val === undefined || val >= campoBe.rules.min || `Debe ser >= ${campoBe.rules.min}`);
          if (campoBe.rules?.max !== undefined) reglasCampo.push(val => val === null || val === undefined || val <= campoBe.rules.max || `Debe ser <= ${campoBe.rules.max}`);
        }

        if (campoBe.uiType === 'text' && campoBe.rules?.pattern) {
          try {
            const regexParts = campoBe.rules.pattern.match(/^\/(.*)\/([gimyus]*)$/);
            const regex = regexParts ? new RegExp(regexParts[1], regexParts[2]) : new RegExp(campoBe.rules.pattern);
            reglasCampo.push(val => !val || regex.test(val) || `Formato inválido para ${campoBe.label}.`);
          } catch (e) {
            console.error("Error creando RegExp desde backend:", campoBe.rules.pattern, e);
          }
        }

        return {
          key: campoBe.key,
          label: campoBe.label,
          type: campoBe.uiType, // uiType es el tipo de componente Quasar a usar
          options: campoBe.options || [], // Opciones para select/multiselect
          required: campoBe.required,
          rules: reglasCampo,
          min: campoBe.rules?.min,
          max: campoBe.rules?.max,
          originalJoiType: campoBe.type // El tipo de Joi (string, number, boolean, array)
        };
      });
    }

    // Inicializar formProducto.especificaciones con valores existentes o vacíos/default
    const nuevasEspecificaciones = {};
    camposDetallesDinamicos.value.forEach(campo => {
      // Usar valor existente si estamos en modo edición y el valor existe
      if (modoEdicion.value && formProducto.value.especificaciones[campo.key] !== undefined) {
        nuevasEspecificaciones[campo.key] = formProducto.value.especificaciones[campo.key];
      } else {
        // Inicializar por defecto según el tipo de campo
        if (campo.type === 'boolean') {
          nuevasEspecificaciones[campo.key] = false; // Valor por defecto para booleanos
        } else if (campo.type === 'multiselect') {
          nuevasEspecificaciones[campo.key] = []; // Array vacío para multiselect
        } else if (campo.type === 'number') {
          nuevasEspecificaciones[campo.key] = null; // null para números
        } else {
          nuevasEspecificaciones[campo.key] = ''; // Cadena vacía para texto, select
        }
      }
    });
    formProducto.value.especificaciones = nuevasEspecificaciones;

  } catch (error) {
    console.error("Error al cargar datos dependientes de categoría:", error);
    opcionesSubcategoriasFiltradas.value = [];
    camposDetallesDinamicos.value = [];
    showNotification('error', 'Error al cargar especificaciones de categoría o subcategorías.')
  } finally {
    cargandoSubcategorias.value = false;
    cargandoEspecificaciones.value = false;
  }
}
// --- FIN CAMBIO SIGNIFICATIVO EN manejarCambioCategoria ---


// Funciones del formulario
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

// --- CAMBIO SIGNIFICATIVO EN abrirModalEditarProducto ---
async function abrirModalEditarProducto(producto) {
  modoEdicion.value = true;
  resetearFormulario(); // Reset primero para asegurar un estado limpio

  const productoEditable = JSON.parse(JSON.stringify(producto)); // Copia profunda

  formProducto.value = {
    _id: productoEditable._id,
    nombre: productoEditable.nombre,
    descripcion: productoEditable.descripcion,
    precio: productoEditable.precio,
    // Si marca es un objeto con _id, usar ese _id, de lo contrario usar marca directamente
    marca: productoEditable.marca?._id || productoEditable.marca,
    imagenes: productoEditable.imagenes ? [...productoEditable.imagenes] : [],
    archivosImagenes: [],
    category: productoEditable.category?._id || null,
    subcategory: null, // Se establecerá después de cargar las opciones
    especificaciones: productoEditable.especificaciones ? { ...productoEditable.especificaciones } : {},
    stock: productoEditable.stock,
  };
  
  dialogoProducto.value = true;
  
  if (formProducto.value.category) {
    await manejarCambioCategoria(formProducto.value.category);
    
    // Quasar a veces necesita un pequeño retraso para que las opciones se carguen completamente
    // y el v-model pueda seleccionar la subcategoría correctamente.
    // Aunque un setTimeout(0) suele ser suficiente, a veces 100ms es más seguro.
    await new Promise(resolve => setTimeout(resolve, 100));

    formProducto.value.subcategory = productoEditable.subcategory?._id || null;

    // Después de cargar el esquema de especificaciones, rellenar los valores
    // Asegurarse de que los valores de formProducto.especificaciones estén correctamente mapeados
    const especificacionesOriginales = productoEditable.especificaciones || {};
    const especificacionesForm = {};
    camposDetallesDinamicos.value.forEach(campo => {
      // Aquí usamos el valor que ya está en formProducto.value.especificaciones
      // que se copió de productoEditable.especificaciones al inicio.
      // Esto es crucial para que los campos se pre-rellenen.
      especificacionesForm[campo.key] = especificacionesOriginales[campo.key] !== undefined 
        ? especificacionesOriginales[campo.key] 
        : (campo.type === 'boolean' ? false : (campo.type === 'multiselect' ? [] : (campo.type === 'number' ? null : '')));
    });
    formProducto.value.especificaciones = especificacionesForm;
  }
}
// --- FIN CAMBIO SIGNIFICATIVO EN abrirModalEditarProducto ---


// --- CAMBIO EN onSubmitProducto ---
async function onSubmitProducto() {
  guardandoProducto.value = true;
  try {
    const formData = new FormData();
    formData.append('nombre', formProducto.value.nombre);
    formData.append('descripcion', formProducto.value.descripcion);
    formData.append('precio', formProducto.value.precio);
    formData.append('marca', formProducto.value.marca);
    formData.append('stock', formProducto.value.stock);
    formData.append('category', formProducto.value.category);
    formData.append('subcategory', formProducto.value.subcategory);
    
    // --- CAMBIO: Ahora enviamos 'especificaciones' en lugar de 'detalles' ---
    formData.append('especificaciones', JSON.stringify(formProducto.value.especificaciones));
    // --- FIN CAMBIO ---

    const campoArchivos = modoEdicion.value ? 'nuevasImagenes' : 'imagenes';
    if (formProducto.value.archivosImagenes?.length > 0) {

      formProducto.value.archivosImagenes.forEach(file => {
        formData.append(campoArchivos, file);
      });
    }
    // Si estás en modo edición y no hay nuevas imágenes, pero se eliminaron algunas existentes,
    // o quieres asegurarte de que el backend sepa cuáles imágenes persistir:
    if (modoEdicion.value) {
      formData.append('imagenesExistentes', JSON.stringify(formProducto.value.imagenes));
    }

    const endpoint = modoEdicion.value 
      ? `/productos/${formProducto.value._id}` 
      : '/productos';
    const method = modoEdicion.value ? 'put' : 'post';

    await api[method](endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    dialogoProducto.value = false;
    await cargarProductos();
    showNotification('success', `Producto ${modoEdicion.value ? 'actualizado' : 'creado'} exitosamente.`)
  } catch (error) {
    console.error("Error al guardar producto:", error);
    showNotification('error', `Error al ${modoEdicion.value ? 'actualizar' : 'crear'} el producto.`, error.message || 'Error desconocido')
  } finally {
    guardandoProducto.value = false;
  }
}
// --- FIN CAMBIO EN onSubmitProducto ---


// Acciones de la tabla
function verDetallesProducto(producto) {
  productoSeleccionado.value = producto;
  slideImagenDetalle.value = (producto.imagenes && producto.imagenes.length > 0) ? 0 : null;
  dialogoVerDetalles.value = true;
}

function confirmarCambioEstado(producto) {
  const accion = producto.state === '1' ? 'desactivar' : 'activar';
  $q.dialog({
    title: 'Confirmar Acción',
    message: `¿Está seguro de que desea ${accion} el producto "${producto.nombre}"?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    cambiarEstadoProducto(producto);
  });
}

async function cambiarEstadoProducto(producto) {
  try {
    await api.put(`/productos/estado/${producto._id}`);
    await cargarProductos();
    showNotification('success', `Estado de "${producto.nombre}" cambiado exitosamente.`)
  } catch (error) {
    console.error(`Error al cambiar estado del producto:`, error);
    showNotification('error', `Error al cambiar el estado del producto: ${error.message || 'Error desconocido'}.`)
  }
}

// Inicialización
onMounted(() => {
  cargarProductos();
  cargarCategorias();
});

// Añadir estas variables al script
const activeTab = ref('productos');

// Variables para gestión de marcas
const listaMarcas = ref([]);
const cargandoTablaMarcas = ref(false);
const filtroTablaMarcas = ref('');
const dialogoMarca = ref(false);
const modoEdicionMarca = ref(false);
const formMarcaRef = ref(null);
const guardandoMarca = ref(false);
const logoFile = ref(null);

// Formulario de marca
const formMarcaInicial = () => ({
  _id: null,
  nombre: '',
  logo: '',
});

const formMarca = ref(formMarcaInicial());

// Columnas para la tabla de marcas
const columnasMarcas = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'logo', label: 'Logo', field: 'logo', align: 'center', sortable: false },
  { name: 'state', label: 'Estado', field: 'state', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center', sortable: false }
];

// Cargar marcas
async function cargarMarcas() {
  cargandoTablaMarcas.value = true;
  try {
    const response = await api.get('marcas');
    listaMarcas.value = Array.isArray(response?.data) ? response.data : [];
  } catch (error) {
    console.error("Error al cargar marcas:", error);
    listaMarcas.value = [];
    showNotification('error', 'Error al cargar la lista de marcas.')
  } finally {
    cargandoTablaMarcas.value = false;
  }
}

// Abrir modal para nueva marca
function abrirModalNuevaMarca() {
  modoEdicionMarca.value = false;
  formMarca.value = formMarcaInicial();
  logoFile.value = null;
  dialogoMarca.value = true;
}

// Abrir modal para editar marca
function abrirModalEditarMarca(marca) {
  modoEdicionMarca.value = true;
  formMarca.value = { ...marca };
  logoFile.value = null;
  dialogoMarca.value = true;
}

// Resetear formulario de marca
function resetearFormularioMarca() {
  formMarca.value = formMarcaInicial();
  logoFile.value = null;
}

// Manejar rechazo de archivo de logo
function onLogoRejected(rejectedEntries) {
  console.log('Archivos rechazados:', rejectedEntries);
  showNotification('error', `El archivo fue rechazado. Asegúrate que sea una imagen válida (jpg, png, gif, webp, svg) y menor de 2MB.`)
}

// Guardar marca
async function onSubmitMarca() {
  guardandoMarca.value = true;
  try {
    // Si hay un nuevo logo, subirlo a Cloudinary
    if (logoFile.value) {
      const formData = new FormData();
      formData.append('file', logoFile.value);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      
      const cloudinaryResponse = await fetch(CLOUDINARY_API_URL, {
        method: 'POST',
        body: formData
      });
      
      const cloudinaryData = await cloudinaryResponse.json();
      if (cloudinaryData.secure_url) {
        formMarca.value.logo = cloudinaryData.secure_url;
      }
    }
    
    const endpoint = modoEdicionMarca.value 
      ? `/marcas/${formMarca.value._id}` 
      : '/marcas';
    const method = modoEdicionMarca.value ? 'put' : 'post';
    
    await api[method](endpoint, formMarca.value);
    
    dialogoMarca.value = false;
    await cargarMarcas();
    showNotification('success', `Marca ${modoEdicionMarca.value ? 'actualizada' : 'creada'} exitosamente.`)
  } catch (error) {
    console.error("Error al guardar marca:", error);
    showNotification('error', `Error al ${modoEdicionMarca.value ? 'actualizar' : 'crear'} la marca.`, error.message || 'Error desconocido')
  } finally {
    guardandoMarca.value = false;
  }
}

// Confirmar cambio de estado de marca
function confirmarCambioEstadoMarca(marca) {
  const accion = marca.state === '1' ? 'desactivar' : 'activar';
  $q.dialog({
    title: 'Confirmar Acción',
    message: `¿Está seguro de que desea ${accion} la marca "${marca.nombre}"?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    cambiarEstadoMarca(marca);
  });
}

// Cambiar estado de marca
async function cambiarEstadoMarca(marca) {
  try {
    await api.put(`/marcas/estado/${marca._id}`);
    await cargarMarcas();
    showNotification('success', `Estado de "${marca.nombre}" cambiado exitosamente.`)
  } catch (error) {
    console.error(`Error al cambiar estado de la marca:`, error);
    showNotification('error', `Error al cambiar el estado de la marca: ${error.message || 'Error desconocido'}.`)
  }
}

// Cargar marcas al montar el componente
onMounted(() => {
  cargarProductos();
  cargarMarcas();
});

// Variables para gestión de ofertas
const listaProductosEnOferta = ref([]);
const cargandoTablaOfertas = ref(false);
const filtroTablaOfertas = ref('');
const dialogoOferta = ref(false);
const modoEdicionOferta = ref(false);
const formOfertaRef = ref(null);
const guardandoOferta = ref(false);
const productosDisponiblesParaOferta = ref([]);
const productosFiltrados = ref([]);
const productoOfertaSeleccionado = ref(null);
const dialogoOfertasAutomaticas = ref(false);
const formOfertasAutomaticasRef = ref(null);
const generandoOfertasAutomaticas = ref(false);

// Formulario de oferta
const formOfertaInicial = () => ({
  producto: null,
  porcentajeDescuento: 10,
  fechaInicioOferta: '',
  fechaFinOferta: ''
});

const formOferta = ref(formOfertaInicial());

// Formulario de ofertas automáticas
const formOfertasAutomaticas = ref({
  stockMinimo: 20,
  diasEnInventario: 30,
  porcentajeDescuento: 15,
  duracionOfertaDias: 7
});

// Columnas para la tabla de ofertas
const columnasOfertas = [
  { name: 'imagenes', label: 'Imagen', field: 'imagenes', align: 'center', sortable: false },
  { name: 'nombre', label: 'Producto', field: 'nombre', align: 'left', sortable: true },
  { name: 'porcentajeDescuento', label: 'Descuento', field: 'porcentajeDescuento', align: 'center', sortable: true, format: val => `${val}%` },
  { name: 'precio', label: 'Precio Original', field: 'precio', align: 'right', sortable: true },
  { name: 'precioOferta', label: 'Precio Oferta', field: 'precioOferta', align: 'right', sortable: true },
  { name: 'fechas', label: 'Vigencia', field: 'fechaFinOferta', align: 'left', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center', sortable: false }
];

// Computed properties para la vista previa
const precioOriginal = computed(() => {
  if (modoEdicionOferta.value && productoOfertaSeleccionado.value) {
    return productoOfertaSeleccionado.value.precio || 0;
  } else if (!modoEdicionOferta.value && formOferta.value.producto) {
    const producto = productosDisponiblesParaOferta.value.find(p => p._id === formOferta.value.producto);
    return producto ? producto.precio : 0;
  }
  return 0;
});

const precioConDescuento = computed(() => {
  if (formOferta.value.porcentajeDescuento > 0) {
    return precioOriginal.value * (1 - formOferta.value.porcentajeDescuento / 100);
  }
  return 0;
});

// Cargar productos en oferta
async function cargarProductosEnOferta() {
  cargandoTablaOfertas.value = true;
  try {
    const response = await api.get('/productos/ofertas', { params: { limit: 100 } });
    listaProductosEnOferta.value = response.data.productos || [];
  } catch (error) {
    console.error("Error al cargar productos en oferta:", error);
    listaProductosEnOferta.value = [];
    showNotification('error', 'Error al cargar la lista de productos en oferta.');
  } finally {
    cargandoTablaOfertas.value = false;
  }
}

// Cargar productos disponibles para ofertas
async function cargarProductosDisponibles() {
  try {
    const response = await api.get('/productos', { 
      params: { limit: 100, state: '1' } 
    });
    productosDisponiblesParaOferta.value = response.data.productos || [];
  } catch (error) {
    console.error("Error al cargar productos disponibles para ofertas:", error);
    productosDisponiblesParaOferta.value = [];
    showNotification('error', 'Error al cargar productos disponibles para ofertas.');
  }
}

// Funciones para gestión de ofertas
function abrirModalNuevaOferta() {
  modoEdicionOferta.value = false;
  formOferta.value = formOfertaInicial();
  productoOfertaSeleccionado.value = null;
  dialogoOferta.value = true;
}

function abrirModalOfertasAutomaticas() {
  dialogoOfertasAutomaticas.value = true;
}

function resetearFormularioOferta() {
  formOferta.value = formOfertaInicial();
  productoOfertaSeleccionado.value = null;
}

function abrirModalEditarOferta(oferta) {
  modoEdicionOferta.value = true;
  formOferta.value = {
    producto: oferta.producto._id,
    porcentajeDescuento: oferta.porcentajeDescuento,
    fechaInicioOferta: oferta.fechaInicioOferta,
    fechaFinOferta: oferta.fechaFinOferta
  };
  productoOfertaSeleccionado.value = oferta.producto;
  dialogoOferta.value = true;
}

function confirmarEliminarOferta(oferta) {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Está seguro de que desea eliminar la oferta para "${oferta.producto.nombre}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/productos/ofertas/${oferta._id}`);
      await cargarProductosEnOferta();
      showNotification('success', 'Oferta eliminada exitosamente.');
    } catch (error) {
      console.error("Error al eliminar oferta:", error);
      showNotification('error', 'Error al eliminar la oferta.');
    }
  });
}

async function onSubmitOferta() {
  guardandoOferta.value = true;
  try {
    const formData = new FormData();
    formData.append('producto', formOferta.value.producto);
    formData.append('porcentajeDescuento', formOferta.value.porcentajeDescuento);
    formData.append('fechaInicioOferta', formOferta.value.fechaInicioOferta);
    formData.append('fechaFinOferta', formOferta.value.fechaFinOferta);

    const endpoint = modoEdicionOferta.value
      ? `/productos/ofertas/${formOferta.value.producto}`
      : '/productos/ofertas';
    const method = modoEdicionOferta.value ? 'put' : 'post';

    await api[method](endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    dialogoOferta.value = false;
    await cargarProductosEnOferta();
    showNotification('success', `Oferta ${modoEdicionOferta.value ? 'actualizada' : 'creada'} exitosamente.`);
  } catch (error) {
    console.error("Error al guardar oferta:", error);
    showNotification('error', `Error al ${modoEdicionOferta.value ? 'actualizar' : 'crear'} la oferta.`);
  } finally {
    guardandoOferta.value = false;
  }
}

async function generarOfertasAutomaticas() {
  generandoOfertasAutomaticas.value = true;
  try {
    const response = await api.post('/productos/generar', formOfertasAutomaticas.value);
    await cargarProductosEnOferta();
    showNotification('success', 'Ofertas generadas exitosamente.');
  } catch (error) {
    console.error("Error al generar ofertas automáticas:", error);
    showNotification('error', 'Error al generar ofertas automáticas.');
  } finally {
    generandoOfertasAutomaticas.value = false;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function filtrarProductos(val, update, abort) {
  if (val === '') {
    update(() => {
      productosFiltrados.value = productosDisponiblesParaOferta.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    productosFiltrados.value = productosDisponiblesParaOferta.value.filter(v => {
      return v.nombre.toLowerCase().indexOf(needle) > -1;
    });
  });
}

// Cargar productos disponibles al montar el componente
onMounted(() => {
  cargarProductos();
  cargarMarcas();
  cargarProductosEnOferta();
  cargarProductosDisponibles();
});
</script>

<style scoped>
/* Tus estilos CSS permanecen IGUAL */
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
