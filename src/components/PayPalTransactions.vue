<template>
  <q-card class="transactions-card">
    <q-card-section class="card-header">
      <div class="text-h5 card-title">Transacciones PayPal</div>
      <q-icon name="payments" class="card-icon" />
    </q-card-section>
    <q-separator inset />
    <q-card-section>
      <div v-if="loading" class="loading-container">
        <q-spinner color="primary" size="3em" />
        <p class="loading-text">Cargando transacciones...</p>
      </div>
      
      <div v-else-if="transactions.length === 0" class="no-transactions">
        <q-icon name="receipt_long" size="4em" color="grey-7" />
        <p>No hay transacciones para mostrar</p>
      </div>

      <q-list v-else class="transactions-list">
        <q-item v-for="transaction in transactions" :key="transaction._id" class="transaction-item">
          <q-item-section avatar>
            <q-avatar :color="getStatusColor(transaction.status)" text-color="white">
              <q-icon :name="getStatusIcon(transaction.status)" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="transaction-title">
              Orden #{{ transaction.orderId }}
            </q-item-label>
            <q-item-label caption class="transaction-date">
              {{ formatDate(transaction.createdAt) }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="transaction-amount">
              <span class="currency">$</span>
              <span class="amount">{{ formatAmount(transaction.amount) }}</span>
              <span class="currency-type">USD</span>
            </div>
            <q-chip
              :color="getStatusColor(transaction.status)"
              text-color="white"
              size="sm"
              class="status-chip"
            >
              {{ getStatusText(transaction.status) }}
            </q-chip>
          </q-item-section>

          <q-item-section side>
            <q-btn
              flat
              round
              color="primary"
              icon="visibility"
              @click="showTransactionDetails(transaction)"
            >
              <q-tooltip>Ver detalles</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <!-- Transaction Details Dialog -->
    <q-dialog v-model="showDetailsDialog" class="transaction-dialog">
      <q-card class="dialog-card">
        <q-card-section class="dialog-header">
          <div class="text-h5">Detalles de la Transacción</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pt-md">
          <div v-if="selectedTransaction" class="transaction-details">
            <div class="detail-row">
              <span class="detail-label">ID de Orden:</span>
              <span class="detail-value">{{ selectedTransaction.orderId }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Fecha:</span>
              <span class="detail-value">{{ formatDate(selectedTransaction.createdAt) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Monto:</span>
              <span class="detail-value">${{ formatAmount(selectedTransaction.amount) }} USD</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Estado:</span>
              <q-chip
                :color="getStatusColor(selectedTransaction.status)"
                text-color="white"
                size="sm"
              >
                {{ getStatusText(selectedTransaction.status) }}
              </q-chip>
            </div>
            <div class="detail-row">
              <span class="detail-label">Método de Pago:</span>
              <span class="detail-value">{{ selectedTransaction.paymentMethod || 'PayPal' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email del Comprador:</span>
              <span class="detail-value">{{ selectedTransaction.payerEmail }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Nombre del Comprador:</span>
              <span class="detail-value">{{ selectedTransaction.payerName }}</span>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { getData } from '../services/apiClient';

const $q = useQuasar();
const loading = ref(true);
const transactions = ref([]);
const showDetailsDialog = ref(false);
const selectedTransaction = ref(null);

// Fetch transactions on component mount
onMounted(async () => {
  try {
    const response = await getData('ordenes/paypal/orders');
    transactions.value = response;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las transacciones',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
});

// Format date to local string
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format amount to 2 decimal places
const formatAmount = (amount) => {
  return Number(amount).toFixed(2);
};

// Get status color based on transaction status
const getStatusColor = (status) => {
  const colors = {
    'COMPLETED': 'positive',
    'PENDING': 'warning',
    'FAILED': 'negative',
    'CANCELLED': 'grey-7'
  };
  return colors[status] || 'grey-7';
};

// Get status icon based on transaction status
const getStatusIcon = (status) => {
  const icons = {
    'COMPLETED': 'check_circle',
    'PENDING': 'pending',
    'FAILED': 'error',
    'CANCELLED': 'cancel'
  };
  return icons[status] || 'help';
};

// Get status text in Spanish
const getStatusText = (status) => {
  const texts = {
    'COMPLETED': 'Completado',
    'PENDING': 'Pendiente',
    'FAILED': 'Fallido',
    'CANCELLED': 'Cancelado'
  };
  return texts[status] || status;
};

// Show transaction details in dialog
const showTransactionDetails = (transaction) => {
  selectedTransaction.value = transaction;
  showDetailsDialog.value = true;
};
</script>

<style scoped>
.transactions-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 25px;
  background: var(--q-color-neutral-light);
  border-bottom: 1px solid var(--q-color-neutral-border);
}

.card-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 1.8em;
  font-weight: 700;
  color: var(--q-color-dark-blue);
  letter-spacing: -0.5px;
}

.card-icon {
  font-size: 2.2em;
  color: var(--q-color-primary-blue);
  opacity: 0.8;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.loading-text {
  margin-top: 16px;
  color: var(--q-color-text-grey);
  font-size: 1.1em;
}

.no-transactions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--q-color-text-grey);
}

.no-transactions p {
  margin-top: 16px;
  font-size: 1.1em;
}

.transactions-list {
  background: var(--q-color-list-bg);
  border-radius: 10px;
  overflow: hidden;
}

.transaction-item {
  padding: 16px;
  border-bottom: 1px solid var(--q-color-neutral-border);
  transition: background-color 0.3s ease;
}

.transaction-item:hover {
  background-color: var(--q-color-list-hover-bg);
}

.transaction-title {
  font-weight: 600;
  color: var(--q-color-text-dark);
  font-size: 1.1em;
}

.transaction-date {
  color: var(--q-color-text-grey);
  font-size: 0.9em;
}

.transaction-amount {
  text-align: right;
  font-weight: 700;
  color: var(--q-color-text-dark);
}

.currency {
  font-size: 0.9em;
  margin-right: 2px;
}

.amount {
  font-size: 1.2em;
}

.currency-type {
  font-size: 0.8em;
  color: var(--q-color-text-grey);
  margin-left: 4px;
}

.status-chip {
  margin-top: 8px;
}

/* Transaction Details Dialog */
.transaction-dialog .dialog-card {
  min-width: 400px;
  max-width: 90vw;
  border-radius: 15px;
}

.transaction-dialog .dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 25px;
  background: var(--q-color-neutral-light);
}

.transaction-details {
  padding: 20px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--q-color-neutral-border);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: var(--q-color-text-grey);
}

.detail-value {
  color: var(--q-color-text-dark);
}

/* Responsive Design */
@media (max-width: 768px) {
  .transactions-card {
    margin: 15px;
  }

  .card-header {
    padding: 15px 20px;
  }

  .card-title {
    font-size: 1.5em;
  }

  .transaction-item {
    padding: 12px;
  }

  .transaction-title {
    font-size: 1em;
  }

  .transaction-amount {
    font-size: 0.9em;
  }

  .transaction-dialog .dialog-card {
    min-width: unset;
    width: 95vw;
  }
}

@media (max-width: 480px) {
  .card-header {
    padding: 12px 15px;
  }

  .card-title {
    font-size: 1.3em;
  }

  .transaction-item {
    padding: 10px;
  }

  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .detail-value {
    margin-left: 0;
  }
}
</style> 