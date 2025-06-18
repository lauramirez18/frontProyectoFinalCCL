<template>
  <div class="shipping-container">
    <h1 class="shipping-title">Datos de Envío</h1>
    <p class="shipping-subtitle">
      Completa la información para el envío de tu pedido
    </p>

    <div class="shipping-form">
      <div class="form-row">
        <div class="form-group half">
          <label for="firstName">Nombre *</label>
          <input
            type="text"
            id="firstName"
            v-model="firstName"
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
            <option
              v-for="prefixOption in phoneCodes"
              :key="prefixOption.code"
              :value="prefixOption.dial_code"
            >
              {{ prefixOption.code }} {{ prefixOption.dial_code }}
            </option>
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
          required
          placeholder="Calle, número, apartamento, etc."
        />
        <p class="error" v-if="errors.address">{{ errors.address }}</p>
      </div>

      <div class="form-row">
        <div class="form-group half">
          <label for="country">País *</label>
          <select id="country" v-model="selectedCountry" @change="onCountryChange">
            <option value="">Selecciona un país</option>
            <option
              v-for="countryOption in countries"
              :key="countryOption.id"
              :value="countryOption.id"
            >
              {{ countryOption.name }}
            </option>
          </select>
          <p class="error" v-if="errors.country">{{ errors.country }}</p>
        </div>
        <div class="form-group half">
          <label for="state">{{ getStateLabel() }} *</label>
          <select id="state" v-model="selectedState" :disabled="!selectedCountry" @change="onStateChange">
            <option value="">
              {{
                selectedCountry
                  ? `Selecciona ${getStateLabel().toLowerCase()}`
                  : "Primero selecciona un país"
              }}
            </option>
            <option
              v-for="stateOption in availableStates"
              :key="stateOption.id"
              :value="stateOption.id"
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
          <select id="city" v-model="selectedCity" :disabled="!selectedState">
            <option value="">
              {{
                selectedState
                  ? "Selecciona una ciudad"
                  : "Primero selecciona un estado/departamento"
              }}
            </option>
            <option
              v-for="cityOption in availableCities"
              :key="cityOption.id"
              :value="cityOption.id"
            >
              {{ cityOption.name }}
            </option>
          </select>
          <p class="error" v-if="errors.city">{{ errors.city }}</p>
        </div>
        <div class="form-group half">
          <label for="postalCode">Código Postal *</label>
          <input
            type="text"
            id="postalCode"
            v-model="postalCode"
            required
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

// Importa tus archivos JSON
import countriesData from '../utils/countries.json';
import statesData from '../utils/states.json';
import citiesData from '../utils/cities.json';
import phoneCodesData from '../utils/CountryCodes.json'; // Importa el nuevo archivo

const router = useRouter();
const authStore = useAuthStore();

// Datos de envío
const firstName = ref("");
const lastName = ref("");
const phone = ref("");
const phonePrefix = ref('+57'); // Valor inicial para Colombia
const address = ref("");
const postalCode = ref("");
const deliveryNotes = ref("");

// Variables para almacenar las selecciones
const selectedCountry = ref(null);
const selectedState = ref(null);
const selectedCity = ref(null);

// Variables para PayPal
const totalCOP = ref(0);
const totalUSD = ref(0);
// No necesitas exchangeRate como ref si lo vas a buscar cada vez en onMounted
const exchangeRate = ref(4000); 
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
  country: "",
  state: "",
  postalCode: "",
});

// Referencias a los datos cargados
const countries = ref(countriesData.countries);
const states = ref(statesData.states);
const cities = ref(citiesData.cities);
// Asegúrate de que tu JSON de prefijos tenga una clave 'countries' o ajusta esta línea
const phoneCodes = ref(phoneCodesData);

// Computed para obtener los estados disponibles según el país seleccionado
const availableStates = computed(() => {
  if (!selectedCountry.value) {
    return [];
  }
  return states.value.filter(state => state.id_country === selectedCountry.value);
});

// Computed para obtener las ciudades disponibles según el estado seleccionado
const availableCities = computed(() => {
  if (!selectedState.value) {
    return [];
  }
  return cities.value.filter(city => city.id_state === selectedState.value);
});

// Función para obtener la etiqueta del campo de estado/departamento
const getStateLabel = () => {
  const countryObject = countries.value.find(c => c.id === selectedCountry.value);
  if (countryObject && countryObject.name === "Colombia") {
    return "Departamento";
  }
  if (countryObject && countryObject.name === "España") {
    return "Comunidad Autónoma";
  }
  if (countryObject && countryObject.name === "México") {
    return "Estado";
  }
  if (countryObject && countryObject.name === "Argentina") {
    return "Provincia";
  }
  if (countryObject && countryObject.name === "Chile") {
    return "Región";
  }
  return "Estado/Departamento";
};

// Función que se ejecuta cuando cambia el país
const onCountryChange = () => {
  selectedState.value = null; // Resetear la selección de estado
  selectedCity.value = null;  // Resetear la selección de ciudad

  // Establecer el prefijo telefónico basado en el país seleccionado
  const selectedCountryObject = countries.value.find(c => c.id === selectedCountry.value);
  if (selectedCountryObject) {
    // Busca el prefijo por el nombre del país para que coincida con tus datos de países
    const phoneCodeEntry = phoneCodes.value.find(pc => pc.name === selectedCountryObject.name);
    if (phoneCodeEntry) {
      phonePrefix.value = phoneCodeEntry.dial_code;
    } else {
      phonePrefix.value = ''; // O un valor por defecto si no se encuentra
    }
  } else {
    phonePrefix.value = ''; // O un valor por defecto si no hay país seleccionado
  }
};

// Función que se ejecuta cuando cambia el estado
const onStateChange = () => {
  selectedCity.value = null; // Resetear la selección de ciudad
};

// --- Validaciones y Lógica de Pago ---

// **ÚNICA** Función de validación de datos de envío
const validateShippingData = () => {
  // Limpiar errores previos
  Object.keys(errors).forEach((key) => (errors[key] = ""));

  let isValid = true;

  if (!firstName.value || firstName.value.trim() === "") {
    errors.firstName = "El nombre es obligatorio.";
    isValid = false;
  }
  if (!lastName.value || lastName.value.trim() === "") {
    errors.lastName = "Los apellidos son obligatorios.";
    isValid = false;
  }
  // Combina prefijo y número para validar el teléfono completo
  if (!phone.value || !/^\d{7,15}$/.test(phone.value)) { // Ajusta el regex si necesitas el prefijo incluido
    errors.phone = "Número de teléfono inválido (7-15 dígitos).";
    isValid = false;
  }
  if (!phonePrefix.value) {
    errors.phone = "El prefijo telefónico es obligatorio.";
    isValid = false;
  }
  if (!address.value || address.value.trim() === "") {
    errors.address = "La dirección es obligatoria.";
    isValid = false;
  }
  if (!selectedCountry.value) {
    errors.country = "El país es obligatorio.";
    isValid = false;
  }
  if (!selectedState.value) {
    errors.state = `El ${getStateLabel().toLowerCase()} es obligatorio.`;
    isValid = false;
  }
  if (!selectedCity.value) {
    errors.city = "La ciudad es obligatoria.";
    isValid = false;
  }
  // Validación del código postal
  if (!postalCode.value || postalCode.value.trim() === "") {
    errors.postalCode = "El código postal es obligatorio.";
    isValid = false;
  }

  return isValid;
};

// Cargar PayPal SDK
const loadPayPalScript = () => {
  return new Promise((resolve, reject) => {
    if (document.getElementById("paypal-sdk") || window.paypal) { // Check both global window and existing script
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src =
      "https://www.paypal.com/sdk/js?client-id=AXTeuO5867KsNBOGZ30IHq1U6aK0v3DDfFTd5p9Po4EZGdABEkk17SLAHVXRERVnbM350rUqmg8sbtR5&currency=USD";
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

    if (data && data.conversion_rates && data.conversion_rates.USD) {
      return data.conversion_rates.USD;
    } else {
      console.warn("No se encontró la tasa USD en la respuesta:", data);
      return 0.00025; // Tasa de respaldo
    }
  } catch (error) {
    console.error("Error al obtener la tasa de cambio:", error);
    return 0.00025; // Tasa de respaldo en caso de error de red
  }
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
  const selectedCountryObject = countries.value.find(c => c.id === selectedCountry.value);
  const selectedCountryName = selectedCountryObject ? selectedCountryObject.name : "";
  const selectedStateName = states.value.find(s => s.id === selectedState.value)?.name || "";
  const selectedCityName = cities.value.find(c => c.id === selectedCity.value)?.name || "";

  Swal.fire({
    title: "Factura de pago",
    html: `
      <div style="text-align: left; padding: 10px;">
        <p><strong>Nombre:</strong> ${payerName.value}</p>
        <p><strong>Email:</strong> ${payerEmail.value}</p>
        <p><strong>Teléfono:</strong> ${phonePrefix.value} ${phone.value}</p>
        <p><strong>Dirección:</strong> ${address.value}</p>
        <p><strong>Ciudad:</strong> ${selectedCityName}</p>
        <p><strong>${getStateLabel()}:</strong> ${selectedStateName}</p>
        <p><strong>Código Postal:</strong> ${postalCode.value}</p>
        <p><strong>País:</strong> ${selectedCountryName}</p>
        ${deliveryNotes.value ? `<p><strong>Notas:</strong> ${deliveryNotes.value}</p>` : ""}
        <hr style="margin: 15px 0;">
        <p style="font-size: 18px;"><strong>Total Pagado:</strong> $${amountPaid.value}</p>
      </div>
    `,
    icon: "success",
    confirmButtonText: "Aceptar",
    confirmButtonColor: "#068FFF",
    width: "500px",
  });
};

const createBackendOrder = async () => {
  try {
    console.log('=== CREANDO ORDEN EN BACKEND ===');
    
    if (!authStore.token || !authStore.user) {
      throw new Error('No se encontró el token de autenticación. Por favor inicia sesión nuevamente.');
    }

    const userId = authStore.user.id || authStore.user._id;
    if (!userId) {
      throw new Error('La información del usuario no es válida. Falta el ID del usuario.');
    }

    // --- CORRECCIÓN DE BUG ADICIONAL ---
    // Estabas usando `city.value`, `state.value`, etc., pero tus refs se llaman `selectedCity`, `selectedState`.
    // Además, el backend probablemente espera los nombres, no los IDs.
    const selectedCountryName = countries.value.find(c => c.id === selectedCountry.value)?.name || "";
    const selectedStateName = states.value.find(s => s.id === selectedState.value)?.name || "";
    const selectedCityName = cities.value.find(c => c.id === selectedCity.value)?.name || "";

    const shippingInfo = {
      firstName: String(firstName.value || '').trim(),
      lastName: String(lastName.value || '').trim(),
      phone: `${phonePrefix.value}${String(phone.value || '').trim()}`,
      address: String(address.value || '').trim(),
      // CORRECCIÓN: Usar los nombres de las ubicaciones, no los IDs.
      city: selectedCityName,
      state: selectedStateName,
      country: selectedCountryName,
      postalCode: String(postalCode.value || '').trim(),
      notes: String(deliveryNotes.value || '').trim()
    };

    if (!authStore.cartItems || authStore.cartItems.length === 0) {
      throw new Error('El carrito está vacío');
    }

    // 1. CONSTRUIR LA LISTA DE PRODUCTOS CON PRECIOS FINALES (CON DESCUENTO)
    const products = authStore.cartItems.map(item => {
      const productId = item.id || item._id;
      if (!productId) {
        throw new Error('Uno o más productos no tienen un ID válido');
      }
      
      // Usar el precio con descuento si existe y es válido
      const originalPrice = Number(item.price || 0);
      const discountedPrice = Number(item.discountedPrice);
      const price = (discountedPrice > 0 && discountedPrice < originalPrice) ? discountedPrice : originalPrice;
      
      const quantity = parseInt(item.quantity) || 1;
      const discountApplied = originalPrice > price ? Math.round((originalPrice - price) * 100) / 100 : 0;
      // El subtotal debe basarse en el precio final (con descuento)
      const subtotal = Math.round((price * quantity) * 100) / 100;
      
      return {
        productId: productId,
        quantity: quantity,
        price: price, // El precio unitario final
        originalPrice: originalPrice,
        discountApplied: discountApplied,
        subtotal: subtotal // El subtotal de la línea
      };
    });

    // 2. CAMBIO CLAVE: CALCULAR EL TOTAL SUMANDO LOS SUBTOTALES DEL ARRAY QUE ACABAMOS DE CREAR.
    // Esto GARANTIZA que el total coincida siempre con la suma de los productos.
    const total = products.reduce((sum, product) => sum + product.subtotal, 0);

    // Es buena práctica redondear al final para evitar errores de punto flotante acumulados.
    const finalTotalCOP = Math.round(total * 100) / 100;
    
    const currentExchangeRate = exchangeRate.value || 4000;
    
    // 3. ACTUALIZAR LOS VALORES GLOBALES Y LA ORDEN CON EL TOTAL CORRECTO
    totalCOP.value = finalTotalCOP;
    totalUSD.value = Math.round((finalTotalCOP / currentExchangeRate) * 100) / 100;
    
    console.log('=== DETALLES DE LA ORDEN CORREGIDOS ===');
    console.log('Productos procesados:', JSON.stringify(products, null, 2));
    console.log('Total calculado (COP):', finalTotalCOP);
    console.log('Total calculado (USD):', totalUSD.value);

    const orderData = {
      usuarioId: userId,
      products: products, // El array con precios de descuento
      total: finalTotalCOP, // El total que coincide con la suma de los productos
      totalUSD: totalUSD.value,
      shippingInfo: shippingInfo,
      exchangeRate: currentExchangeRate,
      currency: 'COP',
      status: 'pendiente'
    };

    // Esta validación ahora siempre debería pasar
    const calculatedTotal = orderData.products.reduce((sum, p) => sum + p.subtotal, 0);
    if (Math.abs(calculatedTotal - finalTotalCOP) > 0.01) {
      throw new Error(`Error de consistencia interna. La suma de los subtotales (${calculatedTotal}) no coincide con el total (${finalTotalCOP})`);
    }

    console.log('Order data to send:', JSON.stringify(orderData, null, 2));

    const response = await fetch('http://localhost:3000/api/ordenes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(orderData)
    });

    // ... el resto de tu lógica para manejar la respuesta ...
    const responseText = await response.text();
    console.log('Server response status:', response.status);
    console.log('Server response text:', responseText);

    if (!response.ok) {
      let errorMessage = `Server error: ${response.status}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        errorMessage += ` - ${responseText}`;
      }
      throw new Error(errorMessage);
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
      console.log('Parsed response:', parsedResponse);
      
      if (!parsedResponse.orden || !parsedResponse.orden._id) {
        console.error('Response missing orden._id:', parsedResponse);
        throw new Error('La respuesta del servidor no incluye el ID de la orden');
      }
      
      // Return the entire orden object since it contains all the order details
      return parsedResponse.orden;
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      console.error('Raw response text:', responseText);
      throw new Error('Error al procesar la respuesta del servidor');
    }
  } catch (error) {
    console.error('Error in createBackendOrder:', error);
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

        // 1. Asegurarse de que tenemos la tasa de cambio
        if (!exchangeRate.value) {
          console.log('Obteniendo tasa de cambio...');
          await fetchExchangeRate();
        }
        
        // Usar la tasa de cambio o un valor por defecto si no está disponible
        const currentExchangeRate = exchangeRate.value || 4000;
        console.log('Tasa de cambio a utilizar:', currentExchangeRate);

        // 2. Crear orden en el backend
        const orderData = await createBackendOrder();
        console.log('Orden backend creada:', orderData);
        
        // Asegurarnos de que tenemos el ID de la orden
        if (!orderData._id) {
          throw new Error('No se recibió el ID de la orden del backend');
        }
        
        currentOrderId.value = orderData._id;
        console.log('ID de orden actual:', currentOrderId.value);

        // Crear la orden de PayPal
        const paypalOrder = await actions.order.create({
          purchase_units: [{
            amount: {
              value: totalUSD.value,
              currency_code: "USD"
            },
            reference_id: orderData._id
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
        console.log('=== DATOS DE PAYPAL ===');
        console.log('Detalles del pago:', data);
        console.log('ID de PayPal:', data.orderID);
        console.log('ID de la orden actual:', currentOrderId.value);

        if (!currentOrderId.value) {
            throw new Error('No se encontró el ID de la orden. Por favor intente nuevamente.');
        }

        if (!authStore.token) {
            throw new Error('No se encontró el token de autenticación. Por favor inicia sesión nuevamente.');
        }

        const payload = {
            orderId: currentOrderId.value,
            paypalOrderId: data.orderID
        };

        console.log('=== DATOS ENVIADOS AL BACKEND ===');
        console.log('URL:', 'http://localhost:3000/api/ordenes/confirmar-pago');
        console.log('Payload:', payload);

        const response = await fetch('http://localhost:3000/api/ordenes/confirmar-pago', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`
            },
            body: JSON.stringify(payload)
        });

        const responseText = await response.text();
        console.log('Respuesta del servidor (texto):', responseText);

        if (!response.ok) {
            let errorMessage;
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.message || 'Error al confirmar el pago';
            } catch (parseError) {
                errorMessage = responseText || 'Error al confirmar el pago';
            }
            throw new Error(errorMessage);
        }

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Error al parsear la respuesta:', parseError);
            throw new Error('Error al procesar la respuesta del servidor');
        }

        console.log('Respuesta del servidor (parseada):', result);

        if (!result.success) {
            throw new Error(result.message || 'Error al confirmar el pago');
        }

        // Limpiar carrito
        authStore.clearCart();
        
        // Mostrar factura
        mostrarFactura();
        
        // Mostrar mensaje de éxito al usuario
        await Swal.fire({
            icon: 'success',
            title: '¡Pago exitoso!',
            text: 'Tu pago ha sido procesado correctamente.',
            confirmButtonText: 'Entendido'
        });
        
        // Redirigir a la página de confirmación
        router.push('/order-confirmation');

    } catch (error) {
        console.error('Error en la confirmación del pago:', error);
        
        // Mensaje de error más específico basado en el tipo de error
        let errorMessage = 'Error al procesar el pago';
        if (error.message.includes('Failed to fetch')) {
            errorMessage = 'No se pudo conectar con el servidor. Por favor, verifica que el servidor esté en ejecución.';
        } else if (error.message) {
            errorMessage = error.message;
        }

        Swal.fire({
            icon: 'error',
            title: 'Error en el pago',
            text: errorMessage,
            confirmButtonText: 'Entendido'
        });
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


onMounted(async () => {
  if (!authStore.token || !authStore.user) {
    Swal.fire("Advertencia", "Debes iniciar sesión para realizar el pago", "warning");
    router.push('/login');
    return;
  }

  try {
    await loadPayPalScript();
    totalCOP.value = getCartTotalInCOP();
    const exchangeRate = await fetchExchangeRate();
    totalUSD.value = (totalCOP.value * exchangeRate).toFixed(2);
    renderPayPalButtons();
  } catch (error) {
    console.error("Error inicializando PayPal:", error);
    Swal.fire("Error", "No se pudo cargar el sistema de pagos", "error");
  }
});
</script>

<style scoped>
/* Tu estilo CSS se mantiene igual */
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