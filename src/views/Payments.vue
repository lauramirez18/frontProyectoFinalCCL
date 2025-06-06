<template>
  <div class="shipping-container">
    <h1 class="shipping-title">Datos de Envío</h1>
    <p class="shipping-subtitle">
      Completa la información para el envío de tu pedido
    </p>

    <!-- Shipping Address Form -->
    <div class="shipping-form">
      <div class="form-row">
        <div class="form-group half">
          <label for="firstName">Nombre *</label>
          <input
            type="text"
            id="firstName"
            :value="firstName"
            @input="firstName = $event.target.value.toUpperCase()"
            required
            placeholder="Tu nombre"
          />
          <p class="error" v-if="errors.firstName">{{ errors.firstName }}</p>
        </div>
        <div class="form-group half">
          <label for="lastName">Apellidos *</label>
          <input
            type="text"
            id="lastName"
            :value="lastName"
            @input="lastName = $event.target.value.toUpperCase()"
            required
            placeholder="Tus apellidos"
          />
          <p class="error" v-if="errors.lastName">{{ errors.lastName }}</p>
        </div>
      </div>

<div class="form-group">
  <label for="phone">Teléfono *</label>
  <div class="phone-input-group">
    <select v-model="phonePrefix" class="phone-prefix">
      <option value="+57">🇨🇴 +57</option>
      <option value="+34">🇪🇸 +34</option>
      <option value="+52">🇲🇽 +52</option>
      <option value="+54">🇦🇷 +54</option>
      <option value="+56">🇨🇱 +56</option>
    </select>
    <input
      type="tel"
      id="phone"
      v-model="phone"
      required
      placeholder="Ej: 320 123 4567"
      class="phone-input"
    />
  </div>
  <p class="error" v-if="errors.phone">{{ errors.phone }}</p>
</div>

      <div class="form-group">
        <label for="address">Dirección completa *</label>
        <input
          type="text"
          id="address"
          :value="address"
          @input="address = $event.target.value.toUpperCase()"
          required
          placeholder="Calle, número, apartamento, etc."
        />
        <p class="error" v-if="errors.address">{{ errors.address }}</p>
      </div>

      <div class="form-row">
        <div class="form-group half">
          <label for="country">País</label>
          <select id="country" v-model="country" @change="onCountryChange">
            <option value="">Selecciona un país</option>
            <option value="CO">Colombia</option>
            <option value="ES">España</option>
            <option value="MX">México</option>
            <option value="AR">Argentina</option>
            <option value="CL">Chile</option>
          </select>
        </div>
        <div class="form-group half">
          <label for="state">{{ getStateLabel() }}</label>
          <select id="state" v-model="state" :disabled="!country">
            <option value="">
              {{
                country
                  ? `Selecciona ${getStateLabel().toLowerCase()}`
                  : "Primero selecciona un país"
              }}
            </option>
            <option
              v-for="stateOption in availableStates"
              :key="stateOption.code"
              :value="stateOption.code"
            >
              {{ stateOption.name }}
            </option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group half">
          <label for="city">Ciudad *</label>
          <input
            type="text"
            id="city"
            :value="city"
            @input="city = $event.target.value.toUpperCase()"
            required
            placeholder="Tu ciudad"
          />
          <p class="error" v-if="errors.city">{{ errors.city }}</p>
        </div>
        <div class="form-group half">
          <label for="postalCode">Código Postal</label>
          <input
            type="text"
            id="postalCode"
            v-model="postalCode"
            placeholder="Código postal"
          />
          <p class="error" v-if="errors.firstName">{{ errors.postalCode }}</p>
        </div>
      </div>
      <div class="form-group">
        <label for="notes">Notas de entrega (opcional)</label>
        <textarea
          id="notes"
          v-model="deliveryNotes"
          rows="3"
          placeholder="Instrucciones especiales para la entrega, referencias del lugar, etc."
        ></textarea>
      </div>

      <!-- Order Summary -->
      <div class="order-summary">
        <h3 class="summary-title">Resumen de tu pedido</h3>
        <div class="total-section">
          <div class="total-row">
            <span class="total-label">Total en PESOS (COP):</span>
            <span class="total-amount primary">
              {{
                totalCOP.toLocaleString("es-CO", {
                  style: "currency",
                  currency: "COP",
                })
              }}
            </span>
          </div>
          <div class="total-row">
            <span class="total-label">Total en DÓLARES (USD):</span>
            <span class="total-amount secondary">
              {{
                Number(totalUSD).toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })
              }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- PayPal Button -->
    <div class="payment-section">
      <div class="payment-info">
        <div class="info-card">
          <div class="info-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="info-content">
            <h4>Pago seguro con PayPal</h4>
            <p>
              Serás redirigido a PayPal para completar tu pago de forma segura.
              Puedes pagar con tu cuenta PayPal o con tarjeta de crédito/débito.
            </p>
          </div>
        </div>
      </div>

      <div class="paypal-container">
        <div id="paypal-button-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from "vue";
import Swal from "sweetalert2";
import { useAuthStore } from "../store/store.js";
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore();
const totalCOP = ref(0);
const totalUSD = ref(0);

// Datos de envío
const firstName = ref("");
const lastName = ref("");
const phone = ref("");
const phonePrefix = ref('+57')
const address = ref("");
const postalCode = ref("");
const city = ref("");
const country = ref("");
const state = ref("");
const notes = ref("");

// Variables para mostrar en el modal de factura
const payerName = ref("");
const payerEmail = ref("");
const amountPaid = ref("");


const errors = reactive({
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
  city: "",

  state: "",
});

// Datos de estados/departamentos por país
const statesData = {
  CO: {
    // Colombia
    label: "Departamento",
    states: [
      { code: "AMA", name: "Amazonas" },
      { code: "ANT", name: "Antioquia" },
      { code: "ARA", name: "Arauca" },
      { code: "ATL", name: "Atlántico" },
      { code: "BOL", name: "Bolívar" },
      { code: "BOY", name: "Boyacá" },
      { code: "CAL", name: "Caldas" },
      { code: "CAQ", name: "Caquetá" },
      { code: "CAS", name: "Casanare" },
      { code: "CAU", name: "Cauca" },
      { code: "CES", name: "Cesar" },
      { code: "CHO", name: "Chocó" },
      { code: "COR", name: "Córdoba" },
      { code: "CUN", name: "Cundinamarca" },
      { code: "GUA", name: "Guainía" },
      { code: "GUV", name: "Guaviare" },
      { code: "HUI", name: "Huila" },
      { code: "LAG", name: "La Guajira" },
      { code: "MAG", name: "Magdalena" },
      { code: "MET", name: "Meta" },
      { code: "NAR", name: "Nariño" },
      { code: "NSA", name: "Norte de Santander" },
      { code: "PUT", name: "Putumayo" },
      { code: "QUI", name: "Quindío" },
      { code: "RIS", name: "Risaralda" },
      { code: "SAP", name: "San Andrés y Providencia" },
      { code: "SAN", name: "Santander" },
      { code: "SUC", name: "Sucre" },
      { code: "TOL", name: "Tolima" },
      { code: "VAC", name: "Valle del Cauca" },
      { code: "VAU", name: "Vaupés" },
      { code: "VIC", name: "Vichada" },
    ],
  },
  ES: {
    // España
    label: "Comunidad Autónoma",
    states: [
      { code: "AN", name: "Andalucía" },
      { code: "AR", name: "Aragón" },
      { code: "AS", name: "Asturias" },
      { code: "IB", name: "Islas Baleares" },
      { code: "CN", name: "Canarias" },
      { code: "CB", name: "Cantabria" },
      { code: "CM", name: "Castilla-La Mancha" },
      { code: "CL", name: "Castilla y León" },
      { code: "CT", name: "Cataluña" },
      { code: "EX", name: "Extremadura" },
      { code: "GA", name: "Galicia" },
      { code: "MD", name: "Madrid" },
      { code: "MC", name: "Murcia" },
      { code: "NC", name: "Navarra" },
      { code: "PV", name: "País Vasco" },
      { code: "RI", name: "La Rioja" },
      { code: "VC", name: "Valencia" },
      { code: "CE", name: "Ceuta" },
      { code: "ML", name: "Melilla" },
    ],
  },
  MX: {
    // México
    label: "Estado",
    states: [
      { code: "AGU", name: "Aguascalientes" },
      { code: "BCN", name: "Baja California" },
      { code: "BCS", name: "Baja California Sur" },
      { code: "CAM", name: "Campeche" },
      { code: "CHP", name: "Chiapas" },
      { code: "CHH", name: "Chihuahua" },
      { code: "COA", name: "Coahuila" },
      { code: "COL", name: "Colima" },
      { code: "DIF", name: "Ciudad de México" },
      { code: "DUR", name: "Durango" },
      { code: "GUA", name: "Guanajuato" },
      { code: "GRO", name: "Guerrero" },
      { code: "HID", name: "Hidalgo" },
      { code: "JAL", name: "Jalisco" },
      { code: "MEX", name: "Estado de México" },
      { code: "MIC", name: "Michoacán" },
      { code: "MOR", name: "Morelos" },
      { code: "NAY", name: "Nayarit" },
      { code: "NLE", name: "Nuevo León" },
      { code: "OAX", name: "Oaxaca" },
      { code: "PUE", name: "Puebla" },
      { code: "QUE", name: "Querétaro" },
      { code: "ROO", name: "Quintana Roo" },
      { code: "SLP", name: "San Luis Potosí" },
      { code: "SIN", name: "Sinaloa" },
      { code: "SON", name: "Sonora" },
      { code: "TAB", name: "Tabasco" },
      { code: "TAM", name: "Tamaulipas" },
      { code: "TLA", name: "Tlaxcala" },
      { code: "VER", name: "Veracruz" },
      { code: "YUC", name: "Yucatán" },
      { code: "ZAC", name: "Zacatecas" },
    ],
  },
  AR: {
    // Argentina
    label: "Provincia",
    states: [
      { code: "BA", name: "Buenos Aires" },
      { code: "CA", name: "Catamarca" },
      { code: "CH", name: "Chaco" },
      { code: "CU", name: "Chubut" },
      { code: "CB", name: "Córdoba" },
      { code: "CR", name: "Corrientes" },
      { code: "ER", name: "Entre Ríos" },
      { code: "FO", name: "Formosa" },
      { code: "JU", name: "Jujuy" },
      { code: "LP", name: "La Pampa" },
      { code: "LR", name: "La Rioja" },
      { code: "MZ", name: "Mendoza" },
      { code: "MI", name: "Misiones" },
      { code: "NQ", name: "Neuquén" },
      { code: "RN", name: "Río Negro" },
      { code: "SA", name: "Salta" },
      { code: "SJ", name: "San Juan" },
      { code: "SL", name: "San Luis" },
      { code: "SC", name: "Santa Cruz" },
      { code: "SF", name: "Santa Fe" },
      { code: "SE", name: "Santiago del Estero" },
      { code: "TF", name: "Tierra del Fuego" },
      { code: "TU", name: "Tucumán" },
      { code: "CABA", name: "Ciudad Autónoma de Buenos Aires" },
    ],
  },
  CL: {
    // Chile
    label: "Región",
    states: [
      { code: "AI", name: "Arica y Parinacota" },
      { code: "TA", name: "Tarapacá" },
      { code: "AN", name: "Antofagasta" },
      { code: "AT", name: "Atacama" },
      { code: "CO", name: "Coquimbo" },
      { code: "VS", name: "Valparaíso" },
      { code: "RM", name: "Metropolitana de Santiago" },
      { code: "LI", name: "Libertador Gral. Bernardo O'Higgins" },
      { code: "ML", name: "Maule" },
      { code: "NB", name: "Ñuble" },
      { code: "BI", name: "Biobío" },
      { code: "AR", name: "La Araucanía" },
      { code: "LR", name: "Los Ríos" },
      { code: "LL", name: "Los Lagos" },
      { code: "AY", name: "Aysén del Gral. Carlos Ibáñez del Campo" },
      { code: "MA", name: "Magallanes y de la Antártica Chilena" },
    ],
  },
};

// Computed para obtener los estados disponibles según el país seleccionado
const availableStates = computed(() => {
  return country.value && statesData[country.value]
    ? statesData[country.value].states
    : [];
});

// Función para obtener la etiqueta del campo de estado/departamento
const getStateLabel = () => {
  return country.value && statesData[country.value]
    ? statesData[country.value].label
    : "Estado/Departamento";
};

// Función que se ejecuta cuando cambia el país
const onCountryChange = () => {
  // Resetear la selección de estado cuando cambia el país
  state.value = "";
};

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
      "https://www.paypal.com/sdk/js?client-id=AW4MvAt5Q003Hf0opseAiliz0s0HLJZwV-9ni8KiaaoIYCHsYsnRVU1BxpJ6LHqWtFipgKDZUFNrka5t&currency=USD";
    script.onload = () => resolve();
    script.onerror = () => reject("Error al cargar el SDK de PayPal");
    document.head.appendChild(script);
  });
};

const fetchExchangeRate = async () => {
  try {
    const res = await fetch(
      "https://v6.exchangerate-api.com/v6/ee2b23888520b147bcfb0c05/latest/COP"
    );
    const data = await res.json();
    console.log("Respuesta de la API:", data);

    if (data && data.conversion_rates && data.conversion_rates.USD) {
      return data.conversion_rates.USD;
    } else {
      console.warn("No se encontró la tasa USD en la respuesta:", data);
      return 0.00025;
    }
  } catch (error) {
    console.error("Error al obtener la tasa de cambio:", error);
    return 0.00025;
  }
};

// Validar datos de envío
const validateShippingData = () => {
  const requiredFields = [
    { field: firstName.value, name: "Nombre" },
    { field: lastName.value, name: "Apellidos" },
    { field: phone.value, name: "Teléfono" },
    { field: address.value, name: "Dirección" },
    { field: city.value, name: "Ciudad" },
    { field: country.value, name: "País" },
    { field: state.value, name: getStateLabel() },
  ];

  for (const { field, name } of requiredFields) {
    if (!field || field.trim() === "") {
      return false;
    }
  }
  return true;
};

// Mostrar alerta de agradecimiento con el botón "Ver factura"
const mostrarFactura = () => {
  import("../utils/notifications").then(({ showNotification }) => {
    showNotification(
      "success",
      "¡Gracias por tu compra!",
      "Haz clic en el botón para ver tu factura."
    );
    mostrarFacturaModal();
    
  });
  
};

// Mostrar el modal con la información de la factura
const mostrarFacturaModal = () => {
  const selectedCountryName = country.value
    ? document.querySelector(`#country option[value="${country.value}"]`)
        .textContent
    : "";
  const selectedStateName =
    state.value && availableStates.value.length > 0
      ? availableStates.value.find((s) => s.code === state.value)?.name || ""
      : "";

  Swal.fire({
    title: "Factura de pago",
    html: `
      <div style="text-align: left; padding: 10px;">
        <p><strong>Nombre:</strong> ${payerName.value}</p>
        <p><strong>Email:</strong> ${payerEmail.value}</p>
        <p><strong>Teléfono:</strong> ${phone.value}</p>
        <p><strong>Dirección:</strong> ${address.value}</p>
        <p><strong>Ciudad:</strong> ${city.value}</p>
        <p><strong>${getStateLabel()}:</strong> ${selectedStateName}</p>
        <p><strong>Código Postal:</strong> ${postalCode.value}</p>
        <p><strong>País:</strong> ${selectedCountryName}</p>
        ${notes.value ? `<p><strong>Notas:</strong> ${notes.value}</p>` : ""}
        <hr style="margin: 15px 0;">
        <p style="font-size: 18px;"><strong>Total Pagado:</strong> $${
          amountPaid.value
        }</p>
      </div>
    `,
    icon: "success",
    confirmButtonText: "Aceptar",
    confirmButtonColor: "#068FFF",
    width: "500px",
  });
};

// Renderizar el botón de PayPal
const renderPayPalButtons = () => {
  if (window.paypal) {
    window.paypal
      .Buttons({
        createOrder: (data, actions) => {
          // Validar datos antes de crear la orden
          if (!validateShippingData()) {
            return Promise.reject("Datos de envío incompletos");
          }

          return actions.order.create({
            purchase_units: [
              {
                amount: { value: totalUSD.value },
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
            console.log("Datos del pago:", data);
          });
        },
        onError: (err) => {
          import("../utils/notifications").then(({ showNotification }) => {
            showNotification(
              "error",
              "Error en el pago",
              "Hubo un problema al procesar tu pago. Por favor intenta nuevamente."
            );
          });
          console.error("Error en PayPal:", err);
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

function validateForm() {
  let isValid = true;

  // Resetear errores
  Object.keys(errors).forEach((key) => (errors[key] = ""));

  if (!firstName.value) {
    errors.firstName = "El nombre es obligatorio.";
    isValid = false;
  }
  if (!lastName.value) {
    errors.lastName = "Los apellidos son obligatorios.";
    isValid = false;
  }
  if (!phone.value || !/^\+?\d{7,15}$/.test(phone.value)) {
    errors.phone = "Teléfono inválido.";
    isValid = false;
  }
  if (!address.value) {
    errors.address = "La dirección es obligatoria.";
    isValid = false;
  }
  if (!city.value) {
    errors.city = "La ciudad es obligatoria.";
    isValid = false;
  }
  if (!country.value) {
    errors.country = "El país es obligatorio.";
    isValid = false;
  }
  if (!state.value) {
    errors.state = "La región es obligatoria.";
    isValid = false;
  }

  return isValid;
}

onMounted(async () => {
  await loadPayPalScript();
  renderPayPalButtons();
  totalCOP.value = getCartTotalInCOP();
  const exchangeRate = await fetchExchangeRate();
  totalUSD.value = (totalCOP.value * exchangeRate).toFixed(2);
});
</script>


<style scoped>
.shipping-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100vh;
}

.shipping-title {
  font-size: 32px;
  font-weight: 700;
  color: #068fff;
  margin-bottom: 8px;
  text-align: center;
  background: linear-gradient(135deg, #068fff 0%, #0056b3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.shipping-subtitle {
  font-size: 16px;
  color: #6c757d;
  text-align: center;
  margin-bottom: 32px;
}
.phone-input-group {
  display: flex;
  gap: 8px;
}

.phone-prefix {
  width: 100px;
  padding: 0.5em;
}

.phone-input {
  flex: 1;
  padding: 0.5em;
}
.shipping-form {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(6, 143, 255, 0.1);
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group.half {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

input,
select,
textarea {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #f8f9fa;
  box-sizing: border-box;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #068fff;
  background: white;
  box-shadow: 0 0 0 4px rgba(6, 143, 255, 0.15);
  transform: translateY(-2px);
}

input::placeholder,
textarea::placeholder {
  color: #adb5bd;
  font-style: italic;
}

textarea {
  resize: vertical;
  min-height: 80px;
}

.order-summary {
  background: linear-gradient(135deg, #068fff 0%, #0056b3 100%);
  border-radius: 12px;
  padding: 24px;
  margin-top: 32px;
  color: white;
  position: relative;
  overflow: hidden;
}

.order-summary::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 70%
  );
  animation: shine 3s infinite linear;
}

.summary-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

.total-section {
  position: relative;
  z-index: 1;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
}

.total-row:last-child {
  margin-bottom: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 16px;
}

.total-label {
  font-size: 14px;
  opacity: 0.9;
}

.total-amount {
  font-size: 18px;
  font-weight: 700;
}

.total-amount.primary {
  color: #fff;
}

.total-amount.secondary {
  color: #e3f2fd;
}

.divider {
  height: 2px;
  background: linear-gradient(
    to right,
    transparent 0%,
    #068fff 50%,
    transparent 100%
  );
  margin: 40px 0;
}

.payment-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(6, 143, 255, 0.1);
}

.payment-info {
  margin-bottom: 24px;
}

.info-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%);
  border-radius: 12px;
  border-left: 4px solid #068fff;
}

.info-icon {
  color: #068fff;
  flex-shrink: 0;
  margin-top: 4px;
}

.info-content h4 {
  color: #068fff;
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.info-content p {
  color: #6c757d;
  margin: 0;
  line-height: 1.5;
  font-size: 14px;
}

.paypal-container {
  border-radius: 12px;
  overflow: hidden;
  background: #f8f9fa;
  padding: 20px;
}

#paypal-button-container {
  min-height: 50px;
}

@keyframes shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .shipping-container {
    padding: 16px;
  }

  .shipping-title {
    font-size: 24px;
  }

  .shipping-form,
  .payment-section {
    padding: 20px;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .form-group.half {
    margin-bottom: 20px;
  }

  .total-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .info-card {
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .shipping-title {
    font-size: 20px;
  }

  .shipping-form,
  .payment-section {
    padding: 16px;
  }

  input,
  select,
  textarea {
    padding: 12px;
    font-size: 14px;
  }
}
</style>