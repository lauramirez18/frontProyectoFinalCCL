<template>
  <q-page class="q-pa-md">
    <div class="dashboard-container">
      <!-- Header Section -->
      <div class="dashboard-header q-mb-lg">
        <h2 class="text-h4 q-mb-none">Mi Panel de Control</h2>
        <p class="text-subtitle1 text-grey-7">Bienvenido a tu espacio personal</p>
      </div>

      <!-- Stats Cards -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-md-4">
          <q-card class="stats-card">
            <q-card-section>
              <div class="text-h6">Pedidos Totales</div>
              <div class="text-h3">{{ totalOrders }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card class="stats-card">
            <q-card-section>
              <div class="text-h6">Pedidos Pendientes</div>
              <div class="text-h3">{{ pendingOrders }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card class="stats-card">
            <q-card-section>
              <div class="text-h6">Total Gastado</div>
              <div class="text-h3">${{ formatPrice(totalSpent) }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Orders Section -->
      <div class="orders-section">
        <div class="text-h6 q-mb-md">Mis Pedidos</div>
        
        <div class="row q-col-gutter-md">
          <div v-for="order in orders" :key="order._id" class="col-12 col-md-6 col-lg-4">
            <q-card class="order-card">
              <q-card-section>
                <div class="row items-center justify-between">
                  <div class="text-h6">Pedido #{{ order._id }}</div>
                  <q-chip
                    :color="getStatusColor(order.status)"
                    text-color="white"
                    dense
                  >
                    {{ order.status }}
                  </q-chip>
                </div>
                
                <div class="q-mt-md">
                  <div class="text-subtitle2">Fecha</div>
                  <div>{{ formatDate(order.fecha) }}</div>
                </div>

                <div class="q-mt-sm">
                  <div class="text-subtitle2">Total</div>
                  <div class="text-h6">${{ formatPrice(order.total) }}</div>
                </div>

                <div class="q-mt-sm">
                  <div class="text-subtitle2">Método de Pago</div>
                  <div class="row items-center">
                    <q-icon :name="getPaymentIcon(order.paymentMethod)" size="24px" class="q-mr-sm" />
                    {{ order.paymentMethod }}
                  </div>
                </div>

                <div class="q-mt-md">
                  <div class="text-subtitle2">Productos</div>
                  <q-list dense>
                    <q-item v-for="producto in order.productos" :key="producto._id">
                      <q-item-section avatar>
                        <q-avatar>
                          <img :src="producto.imagen" :alt="producto.nombre">
                        </q-avatar>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ producto.nombre }}</q-item-label>
                        <q-item-label caption>
                          Cantidad: {{ producto.cantidad }} - ${{ formatPrice(producto.precio) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>

                <div class="row q-mt-md justify-end">
                  <q-btn
                    flat
                    color="primary"
                    icon="receipt"
                    label="Ver Factura"
                    @click="viewInvoice(order)"
                  />
                  <q-btn
                    flat
                    color="primary"
                    icon="download"
                    label="Descargar"
                    @click="downloadInvoice(order)"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Invoice Dialog -->
      <q-dialog v-model="invoiceDialog" maximized>
        <q-card>
          <q-card-section class="row items-center">
            <div class="text-h6">Factura</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section v-if="selectedOrder" class="invoice-content">
            <div class="invoice-header">
              <div class="row justify-between items-center">
                <div>
                  <h4 class="q-mb-none">Factura #{{ selectedOrder._id }}</h4>
                  <p class="q-mt-sm">Fecha: {{ formatDate(selectedOrder.fecha) }}</p>
                </div>
                <q-avatar square size="100px">
                  <img src="/logo2.png" alt="Logo" />
                </q-avatar>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <div class="invoice-details">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <h6>Información del Cliente</h6>
                  <p>Nombre: {{ selectedOrder.shippingInfo?.nombre || 'No especificado' }}</p>
                  <p>Email: {{ selectedOrder.shippingInfo?.email || 'No especificado' }}</p>
                  <p>Dirección: {{ selectedOrder.shippingInfo?.direccion || 'No especificada' }}</p>
                </div>
                <div class="col-12 col-md-6">
                  <h6>Detalles de Pago</h6>
                  <p>Método: {{ selectedOrder.paymentMethod }}</p>
                  <p>Estado: {{ selectedOrder.status }}</p>
                </div>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <div class="invoice-items">
              <h6>Productos</h6>
              <q-table
                :rows="selectedOrder.productos"
                :columns="invoiceColumns"
                row-key="_id"
                flat
                bordered
              >
                <template v-slot:body-cell-imagen="props">
                  <q-td :props="props">
                    <q-avatar size="50px">
                      <img :src="props.row.imagen" :alt="props.row.nombre">
                    </q-avatar>
                  </q-td>
                </template>
              </q-table>
            </div>

            <div class="invoice-total text-right q-mt-lg">
              <h5>Total: ${{ formatPrice(selectedOrder.total) }}</h5>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              color="primary"
              icon="print"
              label="Imprimir"
              @click="printInvoice"
            />
            <q-btn
              flat
              color="primary"
              icon="download"
              label="Descargar PDF"
              @click="downloadInvoice(selectedOrder)"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../store/store'
import apiClient from '../plugins/axios'
import { useQuasar } from 'quasar'
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const $q = useQuasar()
const authStore = useAuthStore()

const orders = ref([])
const loading = ref(false)
const totalOrders = ref(0)
const pendingOrders = ref(0)
const totalSpent = ref(0)
const invoiceDialog = ref(false)
const selectedOrder = ref(null)

const invoiceColumns = [
  { name: 'imagen', label: 'Imagen', field: 'imagen', align: 'center' },
  { name: 'nombre', label: 'Producto', field: 'nombre', align: 'left' },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'center' },
  { name: 'precio', label: 'Precio', field: 'precio', align: 'right', format: (val) => formatPrice(val) },
  { name: 'subtotal', label: 'Subtotal', field: 'subtotal', align: 'right', format: (val) => formatPrice(val) }
]

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusColor = (status) => {
  const colors = {
    pendiente: 'orange',
    pagado: 'green',
    cancelado: 'red',
    procesando: 'blue'
  }
  return colors[status] || 'grey'
}

const getPaymentIcon = (method) => {
  const icons = {
    paypal: 'payments',
    credit_card: 'credit_card',
    bank_transfer: 'account_balance'
  }
  return icons[method] || 'payments'
}

const fetchOrders = async () => {
  loading.value = true
  try {
    // Primero verificamos que el usuario esté autenticado
    if (!authStore.user || !authStore.user.id) {
      throw new Error('Usuario no autenticado')
    }

    // Construimos la URL correctamente con 'ordenes'
    const response = await apiClient.get(`/ordenes/usuario/${authStore.user.id}`)
    
    if (!response.data) {
      throw new Error('No se recibieron datos del servidor')
    }

    // Actualizamos los datos según la estructura de la respuesta
    const { todasLasOrdenes, ordenesPorEstado, totalOrdenes } = response.data

    // Asignamos todas las órdenes
    orders.value = todasLasOrdenes || []
    
    // Actualizamos los contadores
    totalOrders.value = totalOrdenes || 0
    pendingOrders.value = ordenesPorEstado?.pendiente?.length || 0
    totalSpent.value = orders.value.reduce((acc, order) => acc + (order.total || 0), 0)

    // Si no hay órdenes, mostramos un mensaje
    if (orders.value.length === 0) {
      $q.notify({
        type: 'info',
        message: 'No tienes órdenes registradas',
        position: 'top'
      })
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
    
    // Mensaje de error más específico
    let errorMessage = 'Error al cargar los pedidos'
    if (error.response) {
      switch (error.response.status) {
        case 404:
          errorMessage = 'No se encontraron órdenes para este usuario'
          break
        case 401:
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente'
          break
        case 403:
          errorMessage = 'No tienes permiso para ver estas órdenes'
          break
        default:
          errorMessage = `Error del servidor: ${error.response.status}`
      }
    } else if (error.message === 'Usuario no autenticado') {
      errorMessage = 'Debes iniciar sesión para ver tus órdenes'
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      timeout: 5000
    })

    // Limpiamos los datos en caso de error
    orders.value = []
    totalOrders.value = 0
    pendingOrders.value = 0
    totalSpent.value = 0
  } finally {
    loading.value = false
  }
}

const viewInvoice = (order) => {
  selectedOrder.value = order
  invoiceDialog.value = true
}

const downloadInvoice = async (order) => {
  try {
    // Crear nuevo documento PDF
    const doc = new jsPDF();
    
    // Configurar fuente y tamaño
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    
    // Título
    doc.text('FACTURA', 105, 20, { align: 'center' });
    
    // Información de la empresa
    doc.setFontSize(12);
    doc.text('Tu Empresa', 20, 30);
    doc.text('Dirección de la empresa', 20, 35);
    doc.text('Ciudad, País', 20, 40);
    doc.text('Tel: (123) 456-7890', 20, 45);
    
    // Información de la factura
    doc.setFontSize(10);
    doc.text(`Factura #: ${order._id}`, 20, 60);
    doc.text(`Fecha: ${formatDate(order.fecha)}`, 20, 65);
    
    // Información del cliente
    doc.text('Información del Cliente:', 20, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${order.shippingInfo?.nombre || 'No especificado'}`, 20, 85);
    doc.text(`Email: ${order.shippingInfo?.email || 'No especificado'}`, 20, 90);
    doc.text(`Dirección: ${order.shippingInfo?.direccion || 'No especificada'}`, 20, 95);
    
    // Tabla de productos
    const tableColumn = ['Producto', 'Cantidad', 'Precio', 'Subtotal'];
    const tableRows = order.productos.map(producto => [
      producto.nombre,
      producto.cantidad,
      `$${formatPrice(producto.precio)}`,
      `$${formatPrice(producto.precio * producto.cantidad)}`
    ]);
    
    // Agregar tabla usando autoTable
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 110,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold'
      }
    });
    
    // Total
    const finalY = doc.lastAutoTable.finalY || 150;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: $${formatPrice(order.total)}`, 20, finalY + 10);
    
    // Estado del pago
    doc.text(`Estado: ${order.status}`, 20, finalY + 20);
    doc.text(`Método de Pago: ${order.paymentMethod}`, 20, finalY + 25);
    
    // Guardar el PDF
    doc.save(`factura-${order._id}.pdf`);
    
    $q.notify({
      type: 'positive',
      message: 'Factura descargada exitosamente'
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al generar la factura'
    });
  }
};

const printInvoice = () => {
  window.print()
}

onMounted(() => {
  fetchOrders()
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  padding: 20px 0;
}

.stats-card {
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-5px);
  }
}

.order-card {
  height: 100%;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-5px);
  }
}

.invoice-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

@media print {
  .q-page-container {
    padding: 0;
  }
  
  .q-header,
  .q-footer,
  .q-drawer {
    display: none !important;
  }
  
  .invoice-content {
    padding: 0;
  }
}
</style> 