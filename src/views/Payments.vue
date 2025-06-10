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
            v-model="firstName"
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
            v-model="lastName"
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
          v-model="address"
          @input="address = $event.target.value.toUpperCase()"
          required
          placeholder="Calle, número, apartamento, etc."
        />
        <p class="error" v-if="errors.address">{{ errors.address }}</p>
      </div>

      <div class="form-row">
        <div class="form-group half">
          <label for="country">País *</label>
          <select id="country" v-model="country" @change="onCountryChange" required>
            <option value="">Selecciona un país</option>
            <option value="CO">Colombia</option>
            <option value="ES">España</option>
            <option value="MX">México</option>
            <option value="AR">Argentina</option>
            <option value="CL">Chile</option>
          </select>
          <p class="error" v-if="errors.country">{{ errors.country }}</p>
        </div>
        <div class="form-group half">
          <label for="state">{{ getStateLabel() }} *</label>
          <select id="state" v-model="state" :disabled="!country" required>
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
          <p class="error" v-if="errors.state">{{ errors.state }}</p>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group half">
          <label for="city">Ciudad *</label>
          <input
            type="text"
            id="city"
            v-model="city"
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
          <p class="error" v-if="errors.postalCode">{{ errors.postalCode }}</p>
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
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();

// Datos de envío
const firstName = ref("");
const lastName = ref("");
const phone = ref("");
const phonePrefix = ref('+57');
const address = ref("");
const postalCode = ref("");
const city = ref("");
const country = ref("");
const state = ref("");
const deliveryNotes = ref("");

// Variables para PayPal
const totalCOP = ref(0);
const totalUSD = ref(0);
const exchangeRate = ref(4000); // Tasa de cambio por defecto (1 USD = 4000 COP)
const payerName = ref("");
const payerEmail = ref("");
const amountPaid = ref("");
const currentOrderId = ref(null);

const errors = reactive({
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: ""
});

// Estados/departamentos por país
const statesData = {
  CO: {
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
      { code: "SAN", name: "Santander" },
      { code: "SUC", name: "Sucre" },
      { code: "TOL", name: "Tolima" },
      { code: "VAC", name: "Valle del Cauca" },
      { code: "VAU", name: "Vaupés" },
      { code: "VIC", name: "Vichada" }
    ]
  },
  ES: {
    label: "Provincia",
    states: [
      { code: "A", name: "Alicante" },
      { code: "AB", name: "Albacete" },
      { code: "AV", name: "Ávila" },
      { code: "B", name: "Barcelona" },
      { code: "BA", name: "Badajoz" },
      { code: "BI", name: "Vizcaya" },
      { code: "BU", name: "Burgos" },
      { code: "C", name: "La Coruña" },
      { code: "CA", name: "Cádiz" },
      { code: "CC", name: "Cáceres" },
      { code: "CE", name: "Ceuta" },
      { code: "CO", name: "Córdoba" },
      { code: "CR", name: "Ciudad Real" },
      { code: "CS", name: "Castellón" },
      { code: "CU", name: "Cuenca" },
      { code: "GC", name: "Las Palmas" },
      { code: "GI", name: "Girona" },
      { code: "GR", name: "Granada" },
      { code: "GU", name: "Guadalajara" },
      { code: "H", name: "Huelva" },
      { code: "HU", name: "Huesca" },
      { code: "J", name: "Jaén" },
      { code: "L", name: "Lleida" },
      { code: "LE", name: "León" },
      { code: "LO", name: "La Rioja" },
      { code: "LU", name: "Lugo" },
      { code: "M", name: "Madrid" },
      { code: "MA", name: "Málaga" },
      { code: "ML", name: "Melilla" },
      { code: "MU", name: "Murcia" },
      { code: "NA", name: "Navarra" },
      { code: "O", name: "Asturias" },
      { code: "OR", name: "Ourense" },
      { code: "P", name: "Palencia" },
      { code: "PM", name: "Baleares" },
      { code: "PO", name: "Pontevedra" },
      { code: "S", name: "Cantabria" },
      { code: "SA", name: "Salamanca" },
      { code: "SE", name: "Sevilla" },
      { code: "SG", name: "Segovia" },
      { code: "SO", name: "Soria" },
      { code: "SS", name: "Guipúzcoa" },
      { code: "T", name: "Tarragona" },
      { code: "TE", name: "Teruel" },
      { code: "TF", name: "Santa Cruz de Tenerife" },
      { code: "TO", name: "Toledo" },
      { code: "V", name: "Valencia" },
      { code: "VA", name: "Valladolid" },
      { code: "VI", name: "Álava" },
      { code: "Z", name: "Zaragoza" },
      { code: "ZA", name: "Zamora" }
    ]
  },
  MX: {
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
      { code: "DUR", name: "Durango" },
      { code: "GUA", name: "Guanajuato" },
      { code: "GRO", name: "Guerrero" },
      { code: "HID", name: "Hidalgo" },
      { code: "JAL", name: "Jalisco" },
      { code: "MEX", name: "México" },
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
      { code: "CMX", name: "Ciudad de México" }
    ]
  },
  AR: {
    label: "Provincia",
    states: [
      { code: "C", name: "Ciudad Autónoma de Buenos Aires" },
      { code: "B", name: "Buenos Aires" },
      { code: "K", name: "Catamarca" },
      { code: "H", name: "Chaco" },
      { code: "U", name: "Chubut" },
      { code: "X", name: "Córdoba" },
      { code: "W", name: "Corrientes" },
      { code: "E", name: "Entre Ríos" },
      { code: "P", name: "Formosa" },
      { code: "Y", name: "Jujuy" },
      { code: "L", name: "La Pampa" },
      { code: "F", name: "La Rioja" },
      { code: "M", name: "Mendoza" },
      { code: "N", name: "Misiones" },
      { code: "Q", name: "Neuquén" },
      { code: "R", name: "Río Negro" },
      { code: "A", name: "Salta" },
      { code: "J", name: "San Juan" },
      { code: "D", name: "San Luis" },
      { code: "Z", name: "Santa Cruz" },
      { code: "S", name: "Santa Fe" },
      { code: "G", name: "Santiago del Estero" },
      { code: "V", name: "Tierra del Fuego" },
      { code: "T", name: "Tucumán" }
    ]
  },
  CL: {
    label: "Región",
    states: [
      { code: "XV", name: "Arica y Parinacota" },
      { code: "I", name: "Tarapacá" },
      { code: "II", name: "Antofagasta" },
      { code: "III", name: "Atacama" },
      { code: "IV", name: "Coquimbo" },
      { code: "V", name: "Valparaíso" },
      { code: "RM", name: "Metropolitana de Santiago" },
      { code: "VI", name: "O'Higgins" },
      { code: "VII", name: "Maule" },
      { code: "XVI", name: "Ñuble" },
      { code: "VIII", name: "Biobío" },
      { code: "IX", name: "La Araucanía" },
      { code: "XIV", name: "Los Ríos" },
      { code: "X", name: "Los Lagos" },
      { code: "XI", name: "Aysén" },
      { code: "XII", name: "Magallanes y Antártica Chilena" }
    ]
  }
};

const availableStates = computed(() => {
  return country.value && statesData[country.value] 
    ? statesData[country.value].states 
    : [];
});

const getStateLabel = () => {
  return country.value && statesData[country.value]
    ? statesData[country.value].label
    : "Estado/Departamento";
};

const onCountryChange = () => {
  state.value = "";
  // Limpiar error de estado al cambiar país
  errors.state = "";
};

// Función de validación mejorada
const validateShippingData = () => {
  console.log('=== VALIDANDO DATOS DE ENVÍO ===');
  console.log('firstName:', firstName.value);
  console.log('lastName:', lastName.value);
  console.log('phone:', phone.value);
  console.log('address:', address.value);
  console.log('city:', city.value);
  console.log('country:', country.value);
  console.log('state:', state.value);

  // Limpiar errores previos
  Object.keys(errors).forEach(key => {
    errors[key] = "";
  });

  let isValid = true;

  // Validar campos requeridos
  if (!firstName.value || firstName.value.trim() === "") {
    errors.firstName = "Nombre es requerido";
    isValid = false;
  }

  if (!lastName.value || lastName.value.trim() === "") {
    errors.lastName = "Apellidos son requeridos";
    isValid = false;
  }

  if (!phone.value || phone.value.trim() === "") {
    errors.phone = "Teléfono es requerido";
    isValid = false;
  }

  if (!address.value || address.value.trim() === "") {
    errors.address = "Dirección es requerida";
    isValid = false;
  }

  if (!city.value || city.value.trim() === "") {
    errors.city = "Ciudad es requerida";
    isValid = false;
  }

  if (!country.value || country.value.trim() === "") {
    errors.country = "País es requerido";
    isValid = false;
  }

  if (!state.value || state.value.trim() === "") {
    errors.state = `${getStateLabel()} es requerido`;
    isValid = false;
  }

  console.log('Validación completada. Es válido:', isValid);
  console.log('Errores:', errors);

  return isValid;
};

const loadPayPalScript = () => {
  return new Promise((resolve, reject) => {
    if (window.paypal) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=AW4MvAt5Q003Hf0opseAiliz0s0HLJZwV-9ni8KiaaoIYCHsYsnRVU1BxpJ6LHqWtFipgKDZUFNrka5t&currency=USD`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load PayPal SDK"));
    document.head.appendChild(script);
  });
};

const fetchExchangeRate = async () => {
  try {
    const response = await fetch("https://v6.exchangerate-api.com/v6/ee2b23888520b147bcfb0c05/latest/COP");
    const data = await response.json();
    return data.conversion_rates?.USD || 0.00025;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return 0.00025;
  }
};

const mostrarFactura = () => {
  Swal.fire({
    title: "¡Gracias por tu compra!",
    html: `
      <div style="text-align: left;">
        <p><strong>Cliente:</strong> ${payerName.value}</p>
        <p><strong>Email:</strong> ${payerEmail.value}</p>
        <p><strong>Total:</strong> $${amountPaid.value} USD</p>
        <p><strong>ID de Orden:</strong> ${currentOrderId.value}</p>
      </div>
    `,
    icon: "success",
    confirmButtonText: "Aceptar"
  });
};

const createBackendOrder = async () => {
  try {
    console.log('=== CREANDO ORDEN EN BACKEND ===');
    
    // Validate auth and user
    if (!authStore.token) {
      throw new Error('No se encontró el token de autenticación. Por favor inicia sesión nuevamente.');
    }

    if (!authStore.user) {
      throw new Error('No se pudo obtener la información del usuario. Por favor recarga la página e inicia sesión nuevamente.');
    }

    const userId = authStore.user.id || authStore.user._id;
    if (!userId) {
      throw new Error('La información del usuario no es válida. Falta el ID del usuario.');
    }

    // Validate and format shipping info
    const shippingInfo = {
      firstName: String(firstName.value || '').trim(),
      lastName: String(lastName.value || '').trim(),
      phone: `${phonePrefix.value}${String(phone.value || '').trim()}`,
      address: String(address.value || '').trim(),
      city: String(city.value || '').trim(),
      state: String(state.value || '').trim(),
      country: String(country.value || '').trim(),
      postalCode: String(postalCode.value || '').trim(),
      notes: String(deliveryNotes.value || '').trim()
    };

    // Validar que los campos requeridos no estén vacíos
    const requiredFields = ['firstName', 'lastName', 'phone', 'address', 'city'];
    const missingFields = requiredFields.filter(field => !shippingInfo[field] || shippingInfo[field].length === 0);

    if (missingFields.length > 0) {
      throw new Error(`Los siguientes campos son requeridos: ${missingFields.join(', ')}`);
    }

    // Validate products
    if (!authStore.cartItems || authStore.cartItems.length === 0) {
      throw new Error('El carrito está vacío');
    }

    // Obtener la tasa de cambio actual o usar un valor por defecto
    const currentExchangeRate = exchangeRate.value || 4000;
    console.log('Tasa de cambio actual (COP/USD):', currentExchangeRate);

    // Procesar productos para la orden con cálculo correcto de descuentos
    const products = authStore.cartItems.map(item => {
      const productId = item.id || item._id;
      if (!productId) {
        throw new Error('Uno o más productos no tienen un ID válido');
      }
      
      // Obtener precios correctamente
      const originalPrice = Number(item.originalPrice || item.price || 0);
      const discountedPrice = item.discountedPrice ? Number(item.discountedPrice) : null;
      
      // Verificar si realmente hay descuento
      const hasDiscount = discountedPrice && discountedPrice > 0 && discountedPrice < originalPrice;
      
      // Precio a usar para el cálculo
      const priceToUse = hasDiscount ? discountedPrice : originalPrice;
      const quantity = parseInt(item.quantity) || 1;
      const subtotal = Math.round((priceToUse * quantity) * 100) / 100;
      const discountApplied = hasDiscount ? Math.round((originalPrice - discountedPrice) * 100) / 100 : 0;
      
      console.log(`=== PROCESANDO PRODUCTO: ${item.name || 'sin nombre'} ===`);
      console.log(`- ID: ${productId}`);
      console.log(`- Precio original: ${originalPrice} COP`);
      console.log(`- Precio con descuento: ${discountedPrice || 'N/A'} COP`);
      console.log(`- Tiene descuento: ${hasDiscount}`);
      console.log(`- Precio a usar: ${priceToUse} COP`);
      console.log(`- Cantidad: ${quantity}`);
      console.log(`- Subtotal: ${subtotal} COP`);
      console.log(`- Descuento aplicado: ${discountApplied} COP`);
      console.log('---');
      
      return {
        productId: productId,
        quantity: quantity,
        price: priceToUse, // Precio unitario final (con descuento si aplica)
        originalPrice: originalPrice, // Precio original sin descuento
        discountApplied: discountApplied, // Descuento aplicado por unidad
        subtotal: subtotal // Subtotal del producto
      };
    });

    // Calcular el total basado en precios originales (sin descuentos)
    const totalSinDescuento = products.reduce((sum, product) => {
      return sum + (product.originalPrice * product.quantity);
    }, 0);
    
    // Calcular el total con descuentos aplicados
    const totalConDescuento = products.reduce((sum, product) => {
      return sum + product.subtotal;
    }, 0);
    
    const descuentoTotal = totalSinDescuento - totalConDescuento;
    
    console.log('=== VALIDACIÓN DE TOTALES ===');
    console.log(`Total sin descuentos: ${totalSinDescuento} COP`);
    console.log(`Total con descuentos: ${totalConDescuento} COP`);
    console.log(`Descuento total aplicado: ${descuentoTotal} COP`);
    
    // Usar el total con descuentos
    const total = Math.round(totalConDescuento * 100) / 100;
    
    // Validar que no haya discrepancias en los cálculos
    const sumOfSubtotals = products.reduce((sum, product) => sum + product.subtotal, 0);
    if (Math.abs(sumOfSubtotals - total) > 0.01) {
      console.error(`ERROR: La suma de los subtotales (${sumOfSubtotals}) no coincide con el total (${total})`);
      console.error('Productos procesados:', products);
      throw new Error(`Error de cálculo: La suma de los subtotales (${sumOfSubtotals}) no coincide con el total (${total})`);
    }
    
    // Calcular el total en USD
    const totalUSDValue = currentExchangeRate > 0 ? Math.round((total / currentExchangeRate) * 100) / 100 : 0;
    
    // Actualizar las referencias reactivas
    totalCOP.value = total;
    totalUSD.value = totalUSDValue;
    
    console.log('=== RESUMEN FINAL ===');
    console.log(`Total en COP: ${total}`);
    console.log(`Total en USD: ${totalUSDValue}`);
    console.log(`Tasa de cambio: ${currentExchangeRate}`);
    console.log(`Número de productos: ${products.length}`);

    // Estructura de datos para enviar al backend
    const orderData = {
      usuarioId: userId,
      products: products.map(p => ({
        productId: p.productId,
        quantity: p.quantity,
        price: p.price, // Precio final con descuento aplicado
        originalPrice: p.originalPrice,
        discountApplied: p.discountApplied,
        subtotal: p.subtotal
      })),
      total: total,
      totalUSD: totalUSDValue,
      shippingInfo: shippingInfo,
      exchangeRate: currentExchangeRate,
      currency: 'COP',
      status: 'pending'
    };

    console.log('=== DATOS A ENVIAR AL BACKEND ===');
    console.log(JSON.stringify(orderData, null, 2));

    const response = await fetch('http://localhost:3000/api/ordenes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(orderData)
    });

    const responseText = await response.text();
    console.log('Server response status:', response.status);
    console.log('Server response text:', responseText);

    if (!response.ok) {
      let errorMessage = `Server error: ${response.status}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorMessage;
        if (errorData.errors) {
          errorMessage += ` - Errores: ${errorData.errors.join(', ')}`;
        }
      } catch (parseError) {
        errorMessage += ` - ${responseText}`;
      }
      throw new Error(errorMessage);
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error('Error in createBackendOrder:', error);
    throw error;
  }
};

// Función corregida para PayPal createOrder
const createOrderPayPal = async (data, actions) => {
  try {
    console.log('=== INICIANDO CREATEORDER PAYPAL ===');
    
    if (!authStore.token || !authStore.user) {
      throw new Error("Debes iniciar sesión para realizar el pago");
    }

    console.log('Validando datos de envío...');
    if (!validateShippingData()) {
      throw new Error("Por favor completa todos los campos requeridos del formulario de envío");
    }

    if (!authStore.cartItems?.length) {
      throw new Error("El carrito está vacío");
    }

    console.log('Validaciones pasadas, creando orden...');

    // 1. Crear orden en el backend
    const orderData = await createBackendOrder();
    currentOrderId.value = orderData._id;

    console.log('Orden backend creada:', orderData);
    
    // Obtener la tasa de cambio actual
    const currentExchangeRate = exchangeRate.value || 4000;
    
    // Usar el total ya calculado correctamente
    const paypalTotal = Math.round((totalCOP.value / currentExchangeRate) * 100) / 100;
    
    // Preparar ítems para PayPal con cálculo correcto
    const paypalItems = [];
    let paypalItemsTotal = 0;
    
    authStore.cartItems.forEach(item => {
      // Obtener el precio correcto (con descuento si aplica)
      const originalPrice = Number(item.originalPrice || item.price || 0);
      const discountedPrice = item.discountedPrice ? Number(item.discountedPrice) : null;
      const hasDiscount = discountedPrice && discountedPrice > 0 && discountedPrice < originalPrice;
      const unitAmountCOP = hasDiscount ? discountedPrice : originalPrice;
      
      // Convertir a USD
      const unitAmountUSD = Math.round((unitAmountCOP / currentExchangeRate) * 100) / 100;
      
      const quantity = parseInt(item.quantity) || 1;
      const itemTotal = Math.round((unitAmountUSD * quantity) * 100) / 100;
      
      paypalItemsTotal = Math.round((paypalItemsTotal + itemTotal) * 100) / 100;
      
      console.log(`PayPal Item: ${item.name}`);
      console.log(`- Precio COP: ${unitAmountCOP}`);
      console.log(`- Precio USD: ${unitAmountUSD}`);
      console.log(`- Cantidad: ${quantity}`);
      console.log(`- Total item USD: ${itemTotal}`);
      
      paypalItems.push({
        name: String(item.name || 'Producto').substring(0, 127),
        description: String(item.description || '').substring(0, 126) || undefined,
        quantity: quantity,
        unit_amount: {
          currency_code: 'USD',
          value: unitAmountUSD.toFixed(2)
        }
      });
    });
    
    console.log('=== VALIDACIÓN FINAL PAYPAL ===');
    console.log(`Total PayPal: ${paypalTotal} USD`);
    console.log(`Suma items PayPal: ${paypalItemsTotal} USD`);
    console.log(`Diferencia: ${Math.abs(paypalTotal - paypalItemsTotal)}`);
    
    // Validar que los totales coincidan
    if (Math.abs(paypalTotal - paypalItemsTotal) > 0.01) {
      throw new Error(`La suma de los ítems PayPal (${paypalItemsTotal} USD) no coincide con el total (${paypalTotal} USD)`);
    }
    
    // Crear orden en PayPal
    const paypalOrder = await actions.order.create({
      purchase_units: [{
        amount: {
          value: paypalTotal.toFixed(2),
          currency_code: "USD",
          breakdown: {
            item_total: {
              value: paypalItemsTotal.toFixed(2),
              currency_code: "USD"
            }
          }
        },
        items: paypalItems,
        reference_id: orderData._id,
        description: `Compra de ${authStore.cartItems.length} producto(s)`
      }]
    });

    console.log('Orden PayPal creada exitosamente:', paypalOrder);
    return paypalOrder;

  } catch (error) {
    console.error("Error completo en createOrder:", error);
    Swal.fire({
      title: "Error",
      text: error.message,
      icon: "error",
      confirmButtonText: "Aceptar"
    });
    throw error;
  }
};


// PayPal buttons corregidos
const renderPayPalButtons = () => {
  if (!window.paypal) {
    console.error('PayPal SDK no está cargado');
    return;
  }

  console.log('Renderizando botones de PayPal...');

  window.paypal.Buttons({
    createOrder: async (data, actions) => {
      try {
        console.log('=== INICIANDO CREATEORDER ===');
        
        if (!authStore.token || !authStore.user) {
          throw new Error("Debes iniciar sesión para realizar el pago");
        }

        console.log('Validando datos de envío...');
        if (!validateShippingData()) {
          throw new Error("Por favor completa todos los campos requeridos del formulario de envío");
        }

        if (!authStore.cartItems?.length) {
          throw new Error("El carrito está vacío");
        }

        console.log('Validaciones pasadas, creando orden...');

        // 1. Crear orden en el backend
        const orderData = await createBackendOrder();
        currentOrderId.value = orderData._id;

        console.log('Orden backend creada:', orderData);
        
        // Obtener la tasa de cambio actual (usando el valor del ref)
        const currentExchangeRate = exchangeRate.value || 4000; // Usar 4000 como valor por defecto si no hay tasa
        
        // Calcular total en USD con exactitud
        const paypalTotal = Math.round((getCartTotalInCOP() / currentExchangeRate) * 100) / 100;
        
        // Preparar ítems para PayPal
        const paypalItems = [];
        let paypalItemsTotal = 0;
        
        authStore.cartItems.forEach(item => {
          // Convertir el precio unitario de COP a USD
          const unitAmountCOP = Number(item.discountedPrice || item.price);
          const unitAmountUSD = Math.round((unitAmountCOP / currentExchangeRate) * 100) / 100;
          
          const quantity = parseInt(item.quantity) || 1;
          const itemTotal = Math.round((unitAmountUSD * quantity) * 100) / 100;
          
          paypalItemsTotal = Math.round((paypalItemsTotal + itemTotal) * 100) / 100;
          
          paypalItems.push({
            name: String(item.name || 'Producto').substring(0, 127),
            description: String(item.description || '').substring(0, 126) || undefined,
            quantity: quantity,
            unit_amount: {
              currency_code: 'USD',
              value: unitAmountUSD.toFixed(2)
            }
          });
        });
        
        // Asegurar que los totales coincidan exactamente
        const paypalTotalRounded = Math.round(paypalTotal * 100) / 100;
        const paypalItemsTotalRounded = Math.round(paypalItemsTotal * 100) / 100;
        
        console.log('=== VALIDACIÓN DE TOTALES PAYPAL ===');
        console.log('Total USD calculado:', paypalTotalRounded);
        console.log('Suma de ítems USD:', paypalItemsTotalRounded);
        
        if (Math.abs(paypalTotalRounded - paypalItemsTotalRounded) > 0.01) {
          throw new Error(`La suma de los ítems (${paypalItemsTotalRounded} USD) no coincide con el total de la orden (${paypalTotalRounded} USD)`);
        }
        
        // Crear orden en PayPal
        const paypalOrder = await actions.order.create({
          purchase_units: [{
            amount: {
              value: paypalTotalRounded.toFixed(2),
              currency_code: "USD",
              breakdown: {
                item_total: {
                  value: paypalItemsTotalRounded.toFixed(2),
                  currency_code: "USD"
                }
              }
            },
            items: paypalItems,
            reference_id: orderData._id,
            description: `Compra de ${authStore.cartItems.length} producto(s)`
          }]
        });

        console.log('Orden PayPal creada:', paypalOrder);
        return paypalOrder;

      } catch (error) {
        console.error("Error completo en createOrder:", error);
        Swal.fire({
          title: "Error",
          text: error.message,
          icon: "error",
          confirmButtonText: "Aceptar"
        });
        throw error;
      }
    },

    onApprove: async (data, actions) => {
      try {
        console.log('=== INICIANDO ONAPPROVE ===');
        console.log('Data recibida:', data);
        
        // 1. Primero capturamos el pago en PayPal
        const details = await actions.order.capture();
        console.log('Detalles del pago capturado:', details);
        
        // Guardar datos del pago
        payerName.value = `${details.payer.name.given_name} ${details.payer.name.surname}`;
        payerEmail.value = details.payer.email_address;
        amountPaid.value = details.purchase_units[0].amount.value;
        
        console.log('Confirmando pago en backend...');
        
        // 2. Luego confirmamos en nuestro backend
        const response = await fetch('http://localhost:3000/api/payments/paypal/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify({
            orderId: currentOrderId.value,
            paymentDetails: details
          })
        });

        if (!response.ok) {
          let errorMessage = 'Error al procesar el pago';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            const errorText = await response.text();
            console.error('Error en confirmación:', errorText);
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const confirmationResult = await response.json();
        console.log('Pago confirmado exitosamente:', confirmationResult);
        
        // 3. Limpiar carrito
        authStore.clearCart();
        
        // 4. Mostrar factura
        mostrarFactura();
        
        // 5. Mostrar mensaje de éxito al usuario
        await Swal.fire({
          icon: 'success',
          title: '¡Pago exitoso!',
          text: 'Tu pago ha sido procesado correctamente.',
          confirmButtonText: 'Entendido'
        });
        
        // 6. Redirigir a la página de confirmación
        router.push('/order-confirmation');
        
        // 7. Retornar los detalles de PayPal para cerrar el diálogo
        return details;
        
      } catch (error) {
        console.error('Error en la confirmación del pago:', error);
        
        // Mostrar mensaje de error al usuario
        let errorMessage = 'No se pudo completar el pago. Por favor intente nuevamente.';
        if (error.message) {
          errorMessage = error.message;
        }
        
        // Si es un error de conexión, mostrar mensaje más específico
        if (error.message && error.message.includes('Failed to fetch')) {
          errorMessage = 'No se pudo conectar con el servidor. Por favor verifica que el servidor esté en ejecución y tu conexión a internet.';
        }
        
        await Swal.fire({
          icon: 'error',
          title: 'Error en el pago',
          text: errorMessage,
          confirmButtonText: 'Entendido'
        });
        
        // Re-lanzar el error para que PayPal lo maneje
        throw error;
      }
    },

    onError: (err) => {
      console.error("Error completo en PayPal:", err);
      Swal.fire({
        title: "Error de PayPal",
        text: "Hubo un problema al procesar tu pago. Por favor intenta nuevamente.",
        icon: "error",
        confirmButtonText: "Aceptar"
      });
    },

    onCancel: (data) => {
      console.log("Pago cancelado:", data);
      Swal.fire({
        title: "Pago Cancelado",
        text: "Has cancelado el proceso de pago",
        icon: "info",
        confirmButtonText: "Aceptar"
      });
    }
  }).render("#paypal-button-container");
};


const getCartTotalInCOP = () => {
  console.log('=== CALCULANDO TOTAL DEL CARRITO ===');
  
  // Primero calcular el total sin descuentos
  const totalSinDescuento = authStore.cartItems.reduce((sum, item) => {
    const originalPrice = Number(item.originalPrice || item.price || 0);
    const quantity = parseInt(item.quantity) || 1;
    return sum + (originalPrice * quantity);
  }, 0);
  
  // Luego calcular el total con descuentos
  const totalConDescuento = authStore.cartItems.reduce((sum, item) => {
    const originalPrice = Number(item.originalPrice || item.price || 0);
    const hasDiscount = item.discountedPrice && 
                       Number(item.discountedPrice) > 0 && 
                       Number(item.discountedPrice) < originalPrice;
    
    const priceToUse = hasDiscount ? Number(item.discountedPrice) : originalPrice;
    const quantity = parseInt(item.quantity) || 1;
    
    console.log(`Producto: ${item.name || 'sin nombre'}`);
    console.log(`- Precio original: ${originalPrice}`);
    console.log(`- Precio con descuento: ${hasDiscount ? item.discountedPrice : 'N/A'}`);
    console.log(`- Precio a usar: ${priceToUse}`);
    console.log(`- Cantidad: ${quantity}`);
    console.log(`- Subtotal: ${priceToUse * quantity}`);
    console.log('---');
    
    return sum + (priceToUse * quantity);
  }, 0);
  
  console.log('=== RESUMEN DE TOTALES ===');
  console.log('Total sin descuentos:', totalSinDescuento);
  console.log('Total con descuentos:', totalConDescuento);
  console.log('Ahorro total:', totalSinDescuento - totalConDescuento);
  
  return Math.round(totalConDescuento * 100) / 100;
};


// Lifecycle Hooks
onMounted(async () => {
  if (!authStore.token || !authStore.user) {
    Swal.fire("Advertencia", "Debes iniciar sesión para realizar el pago", "warning");
    router.push('/login');
    return;
  }

  try {
    await loadPayPalScript();
    // Usar la función corregida que considera descuentos
    totalCOP.value = getCartTotalInCOP();
    const currentExchangeRate = await fetchExchangeRate();
    exchangeRate.value = currentExchangeRate;
    totalUSD.value = Math.round((totalCOP.value * currentExchangeRate) * 100) / 100;
    renderPayPalButtons();
  } catch (error) {
    console.error("Error inicializando PayPal:", error);
    Swal.fire("Error", "No se pudo cargar el sistema de pagos", "error");
  }
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