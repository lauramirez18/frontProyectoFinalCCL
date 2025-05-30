<template>
  <div class="payment-container">
    <h1 class="payment-title">Información de Pago</h1>

    <!-- Shipping Address Form -->
    <div class="shipping-form">
      <div class="form-row">
        <div class="form-group half">
          <label for="firstName">Nombre</label>
          <input type="text" id="firstName" v-model="firstName" />
        </div>
        <div class="form-group half">
          <label for="lastName">Apellidos</label>
          <input type="text" id="lastName" v-model="lastName" />
        </div>
      </div>
      <div class="form-group">
        <label for="address">Dirección</label>
        <input type="text" id="address" v-model="address" />
      </div>
      <div class="form-row">
        <div class="form-group half">
          <label for="postalCode">Código Postal</label>
          <input type="text" id="postalCode" v-model="postalCode" />
        </div>
        <div class="form-group half">
          <label for="city">Ciudad</label>
          <input type="text" id="city" v-model="city" />
        </div>
      </div>
      <div class="form-group">
        <label for="country">País</label>
        <select id="country" v-model="country">
          <option value="">Selecciona un país</option>
          <option value="ES">España</option>
          <option value="MX">México</option>
          <option value="CO">Colombia</option>
          <option value="AR">Argentina</option>
          <option value="CL">Chile</option>
        </select>
      </div>
      <div class="q-mb-md">
        <h5>Total de la compra:</h5>
        <p>
          <strong>PESOS (COP):</strong>
          {{
            totalCOP.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
            })
          }}
        </p>
        <p>
          <strong>DÓLARES (USD):</strong>
          {{
            Number(totalUSD).toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })
          }}
        </p>
      </div>
    </div>

    <div class="divider"></div>

    <!-- PayPal Button -->
    <div class="payment-form">
      <p class="info-text">Serás redirigido a PayPal para completar tu pago.</p>
      <div id="paypal-button-container"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Swal from "sweetalert2";
import { useAuthStore } from "../store/store.js";
const authStore = useAuthStore();
const totalCOP = ref(0);
const totalUSD = ref(0);
// Dirección
const firstName = ref("");
const lastName = ref("");
const address = ref("");
const postalCode = ref("");
const city = ref("");
const country = ref("");

// Variables para mostrar en el modal de factura
const payerName = ref("");
const payerEmail = ref("");
const amountPaid = ref("");

// Cargar PayPal SDK
const loadPayPalScript = () => {
  return new Promise((resolve, reject) => {
    if (document.getElementById("paypal-sdk")) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src =
      "https://www.paypal.com/sdk/js?client-id=AW4MvAt5Q003Hf0opseAiliz0s0HLJZwV-9ni8KiaaoIYCHsYsnRVU1BxpJ6LHqWtFipgKDZUFNrka5t&currency=USD"; // ← Usa tu client-id real
    script.onload = () => resolve();
    script.onerror = () => reject("Error al cargar el SDK de PayPal");
    document.head.appendChild(script);
  });
};

const fetchExchangeRate = async () => {
  try {
    const res = await fetch("https://v6.exchangerate-api.com/v6/ee2b23888520b147bcfb0c05/latest/COP");
    const data = await res.json();
    console.log("Respuesta de la API:", data);

    if (data && data.conversion_rates && data.conversion_rates.USD) {
      return data.conversion_rates.USD; // COP a USD
    } else {
      console.warn("No se encontró la tasa USD en la respuesta:", data);
      return 0.00025; // valor por defecto
    }
  } catch (error) {
    console.error("Error al obtener la tasa de cambio:", error);
    return 0.00025;
  }
};

// Mostrar alerta de agradecimiento con el botón "Ver factura"
const mostrarFactura = () => {
  import('../utils/notifications').then(({ showNotification }) => {
    showNotification('success', '¡Gracias por tu compra!', 'Haz clic en el botón para ver tu factura.')
    mostrarFacturaModal()
  })
};

// Mostrar el modal con la información de la factura
const mostrarFacturaModal = () => {
  Swal.fire({
    title: "Factura de pago",
    html: `
      <p><strong>Nombre:</strong> ${payerName.value}</p>
      <p><strong>Email:</strong> ${payerEmail.value}</p>
      <p><strong>Dirección:</strong> ${address.value}</p>
      <p><strong>Código Postal:</strong> ${postalCode.value}</p>
      <p><strong>Ciudad:</strong> ${city.value}</p>
      <p><strong>País:</strong> ${country.value}</p>
      <p><strong>Total Pagado:</strong> $${amountPaid.value}</p>
    `,
    icon: "info",
    confirmButtonText: "Aceptar",
  });
};

// Renderizar el botón de PayPal
const renderPayPalButtons = () => {
  if (window.paypal) {
    window.paypal
      .Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: { value: totalUSD.value }, // ← Aquí puedes poner el total real
              },
            ],
          });
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then((details) => {
            payerName.value = `${details.payer.name.given_name} ${details.payer.name.surname}`;
            payerEmail.value = details.payer.email_address;
            amountPaid.value = details.purchase_units[0].amount.value;
            mostrarFactura();
            console.log("data" + data);
          });
        },
        onError: (err) => {
          import('../utils/notifications').then(({ showNotification }) => {
            showNotification('error', 'Algo salió mal', 'Error en el proceso de pago')
          })
        },
      })
      .render("#paypal-button-container");
  }
};

const getCartTotalInCOP = () => {
  return authStore.cartItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
};

onMounted(async () => {
  await loadPayPalScript();
  renderPayPalButtons();
  totalCOP.value = getCartTotalInCOP();
  const exchangeRate = await fetchExchangeRate();
  totalUSD.value = (totalCOP.value * exchangeRate).toFixed(2);
});
</script> 

<style scoped>
.payment-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  color: #333;
}

.payment-title {
  font-size: 24px;
  color: #14213d;
  margin-bottom: 8px;
}

.section-title {
  font-size: 20px;
  color: #14213d;
  margin: 32px 0 8px 0;
}

.divider {
  height: 1px;
  background-color: #e5e5e5;
  margin-bottom: 24px;
}

.payment-methods {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  justify-content: center;
  align-items: center;
}

.payment-method {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 33%;
  text-align: center;
}

.payment-method img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  margin-bottom: 8px;
}

.payment-method.active {
  border-color: #14213d;
  background-color: #f8f9fa;
}

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group.half {
  width: 50%;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #14213d;
}

input,
select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

input:focus,
select:focus {
  outline: none;
  border-color: #14213d;
}

.info-text {
  margin-bottom: 16px;
}

.bank-details {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid #e5e5e5;
}

.bank-details p {
  margin: 8px 0;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
}

.btn-primary,
.btn-secondary,
.btn-paypal {
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #14213d;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #0d1526;
}

.btn-secondary {
  background-color: white;
  color: #14213d;
  border: 1px solid #14213d;
}

.btn-secondary:hover {
  background-color: #f8f9fa;
}

.btn-paypal {
  background-color: #0070ba;
  color: white;
  border: none;
  width: 100%;
  margin-top: 16px;
}

.btn-paypal:hover {
  background-color: #005ea6;
}
</style>
