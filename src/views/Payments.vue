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
            @blur="validateField('firstName')"
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
            @blur="validateField('lastName')"
          />
          <p class="error" v-if="errors.lastName">{{ errors.lastName }}</p>
        </div>
      </div>

      <div class="form-group">
        <label for="phone">Teléfono *</label>
        <div class="phone-input-group">
          <select
            v-model="phonePrefix"
            class="phone-prefix"
            @change="validateField('phonePrefix')"
          >
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
            @blur="validateField('phone')"
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
          @blur="validateField('address')"
        />
        <p class="error" v-if="errors.address">{{ errors.address }}</p>
      </div>

      <div class="form-row">
        <div class="form-group half">
          <label for="country">País *</label>
          <select
            id="country"
            v-model="selectedCountry"
            @change="onCountryChange"
            @blur="validateField('country')"
          >
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
          <select
            id="state"
            v-model="selectedState"
            :disabled="!selectedCountry"
            @change="onStateChange"
            @blur="validateField('state')"
          >
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
          <select
            id="city"
            v-model="selectedCity"
            :disabled="!selectedState"
            @change="validateField('city')"
            @blur="validateField('city')"
          >
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
          <label for="postalCode">Código Postal</label>
          <input
            type="text"
            id="postalCode"
            v-model="postalCode"
            placeholder="Código postal"
            @blur="validateField('postalCode')"
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

      <button @click="attemptPayment" class="validate-button">
        Validar y Continuar al Pago
      </button>

      <div class="paypal-container" v-if="showPayPalButton">
        <div id="paypal-button-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from "vue";
import Swal from "sweetalert2";
import { useAuthStore } from "../store/store.js";
import { useRouter } from "vue-router";

// Importa tus archivos JSON
import countriesData from "../utils/countries.json";
import statesData from "../utils/states.json";
import citiesData from "../utils/cities.json";
import phoneCodesData from "../utils/CountryCodes.json"; // Importa el nuevo archivo

const router = useRouter();
const authStore = useAuthStore();

// Datos de envío
const firstName = ref("");
const lastName = ref("");
const phone = ref("");
const phonePrefix = ref("+57"); // Valor inicial para Colombia
const address = ref("");
const postalCode = ref("");
const deliveryNotes = ref("");

// Variables para almacenar las selecciones
const selectedCountry = ref(null);
const selectedState = ref(null);
const selectedCity = ref(null);

// Controlar la visibilidad del botón de PayPal
const showPayPalButton = ref(false);

// Variables para PayPal
const totalCOP = ref(0);
const totalUSD = ref(0);
const payerName = ref("");
const payerEmail = ref("");
const amountPaid = ref("");
const exchangeRate = ref(0); // Add exchangeRate ref

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
const phoneCodes = ref(phoneCodesData);

// Computed para obtener los estados disponibles según el país seleccionado
const availableStates = computed(() => {
  if (!selectedCountry.value) {
    return [];
  }
  return states.value.filter(
    (state) => state.id_country === selectedCountry.value
  );
});

// Computed para obtener las ciudades disponibles según el estado seleccionado
const availableCities = computed(() => {
  if (!selectedState.value) {
    return [];
  }
  return cities.value.filter((city) => city.id_state === selectedState.value);
});

// Función para obtener la etiqueta del campo de estado/departamento
const getStateLabel = () => {
  const countryObject = countries.value.find((c) => c.id === selectedCountry.value);
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
  selectedCity.value = null; // Resetear la selección de ciudad
  validateField("country"); // Validar país al cambiar

  // Establecer el prefijo telefónico basado en el país seleccionado
  const selectedCountryObject = countries.value.find(
    (c) => c.id === selectedCountry.value
  );
  if (selectedCountryObject) {
    const phoneCodeEntry = phoneCodes.value.find(
      (pc) => pc.name === selectedCountryObject.name
    );
    if (phoneCodeEntry) {
      phonePrefix.value = phoneCodeEntry.dial_code;
    } else {
      phonePrefix.value = ""; // O un valor por defecto si no se encuentra
    }
  } else {
    phonePrefix.value = ""; // O un valor por defecto si no hay país seleccionado
  }
};

// Función que se ejecuta cuando cambia el estado
const onStateChange = () => {
  selectedCity.value = null; // Resetear la selección de ciudad
  validateField("state"); // Validar estado al cambiar
};

// --- Validaciones y Lógica de Pago ---

// Función de validación individual de campos
const validateField = (field) => {
  errors[field] = ""; // Limpiar error previo para el campo específico

  switch (field) {
    case "firstName":
      if (!firstName.value || firstName.value.trim() === "") {
        errors.firstName = "El nombre es obligatorio.";
      }
      break;
    case "lastName":
      if (!lastName.value || lastName.value.trim() === "") {
        errors.lastName = "Los apellidos son obligatorios.";
      }
      break;
    case "phone":
      if (!phone.value || !/^\d{7,15}$/.test(phone.value)) {
        errors.phone = "Número de teléfono inválido (7-15 dígitos).";
      }
      break;
    case "phonePrefix":
      if (!phonePrefix.value) {
        errors.phone = "El prefijo telefónico es obligatorio.";
      }
      break;
    case "address":
      if (!address.value || address.value.trim() === "") {
        errors.address = "La dirección es obligatoria.";
      }
      break;
    case "country":
      if (!selectedCountry.value) {
        errors.country = "El país es obligatorio.";
      }
      break;
    case "state":
      if (!selectedState.value) {
        errors.state = `El ${getStateLabel().toLowerCase()} es obligatorio.`;
      }
      break;
    case "city":
      if (!selectedCity.value) {
        errors.city = "La ciudad es obligatoria.";
      }
      break;
    case "postalCode":
      // Puedes añadir validación para postalCode si es requerido o tiene un formato específico
      // if (postalCode.value && !/^\d{5}$/.test(postalCode.value)) {
      //   errors.postalCode = "Código postal inválido.";
      // }
      break;
    default:
      break;
  }
};

// Función para validar todos los datos de envío
const validateShippingData = () => {
  let isValid = true;
  const fieldsToValidate = [
    "firstName",
    "lastName",
    "phone",
    "phonePrefix",
    "address",
    "country",
    "state",
    "city",
    // "postalCode" // Descomentar si es obligatorio
  ];

  fieldsToValidate.forEach((field) => {
    validateField(field);
    if (errors[field]) {
      isValid = false;
    }
  });

  return isValid;
};

// New function to handle the validation button click
const attemptPayment = async () => {
  if (validateShippingData()) {
    showPayPalButton.value = true;
    await loadPayPalScript();
    renderPayPalButtons();
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error de validación',
      text: 'Por favor, completa todos los campos obligatorios para continuar.',
    });
  }
};

// Cargar PayPal SDK
const loadPayPalScript = () => {
  return new Promise((resolve, reject) => {
    if (document.getElementById("paypal-sdk") || window.paypal) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = "paypal-sdk";
    // Modified client-id to include 'disable-funding=credit,card'
    script.src =
      "https://www.paypal.com/sdk/js?client-id=AXTeuO5867KsNBOGZ30IHq1U6aK0v3DDfFTd5p9Po4EZGdABEkk17SLAHVXRERVnbM350rUqmg8sbtR5&currency=USD&disable-funding=credit,card";
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
      exchangeRate.value = data.conversion_rates.USD; // Store exchange rate
      return data.conversion_rates.USD;
    } else {
      console.warn("No se encontró la tasa USD en la respuesta:", data);
      exchangeRate.value = 0.00025; // Fallback
      return 0.00025; // Tasa de respaldo
    }
  } catch (error) {
    console.error("Error al obtener la tasa de cambio:", error);
    exchangeRate.value = 0.00025; // Fallback
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
  const selectedCountryObject = countries.value.find(
    (c) => c.id === selectedCountry.value
  );
  const selectedCountryName = selectedCountryObject
    ? selectedCountryObject.name
    : "";
  const selectedStateName =
    states.value.find((s) => s.id === selectedState.value)?.name || "";
  const selectedCityName =
    cities.value.find((c) => c.id === selectedCity.value)?.name || "";

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

const createBackendOrder = async (paypalOrderId) => {
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
    // Ensure selectedCity, selectedState, selectedCountry are names, not IDs
    const currentCityName = cities.value.find(c => c.id === selectedCity.value)?.name;
    const currentStateName = states.value.find(s => s.id === selectedState.value)?.name;
    const currentCountryName = countries.value.find(c => c.id === selectedCountry.value)?.name;

    const shippingInfo = {
      firstName: String(firstName.value || '').trim(),
      lastName: String(lastName.value || '').trim(),
      phone: `${phonePrefix.value}${String(phone.value || '').trim()}`,
      address: String(address.value || '').trim(),
      city: currentCityName, // Use the name here
      state: currentStateName, // Use the name here
      country: currentCountryName, // Use the name here
      postalCode: String(postalCode.value || '').trim(),
      notes: String(deliveryNotes.value || '').trim()
    };

    // Validar que los campos requeridos no estén vacíos
    const requiredFields = ['firstName', 'lastName', 'phone', 'address', 'city', 'state', 'country'];
    const missingFields = requiredFields.filter(field => !shippingInfo[field] || shippingInfo[field].length === 0);

    if (missingFields.length > 0) {
      throw new Error(`Los siguientes campos de envío son requeridos: ${missingFields.join(', ')}`);
    }

    // Validate products
    if (!authStore.cartItems || authStore.cartItems.length === 0) {
      throw new Error('El carrito está vacío');
    }

    // Calcular total real basado en precios con descuento
    const products = authStore.cartItems.map(item => {
      const productId = item.id || item._id;
      if (!productId) {
        throw new Error('Uno o más productos no tienen un ID válido');
      }
      
      const price = Math.round(Number(item.discountedPrice || item.price || 0) * 100) / 100;
      const originalPrice = Math.round(Number(item.price || 0) * 100) / 100;
      const quantity = parseInt(item.quantity) || 1;
      const discountApplied = originalPrice > price ? Math.round((originalPrice - price) * 100) / 100 : 0;
      const subtotal = Math.round((price * quantity) * 100) / 100;
      
      return {
        productId: productId,
        quantity: quantity,
        price: price,
        originalPrice: originalPrice,
        discountApplied: discountApplied,
        subtotal: subtotal
      };
    });

    const total = Math.round(products.reduce((sum, product) => {
      return sum + (product.price * product.quantity);
    }, 0) * 100) / 100;

    const currentExchangeRate = exchangeRate.value || 4000;
    
    totalCOP.value = total;
    totalUSD.value = Math.round((total / currentExchangeRate) * 100) / 100;
    
    const orderData = {
      usuarioId: userId,
      products: products,
      total: total,
      totalUSD: totalUSD.value,
      shippingInfo: shippingInfo,
      exchangeRate: currentExchangeRate,
      currency: 'COP',
      status: 'completed', // Assuming PayPal success means completed
      paymentId: paypalOrderId, // Store PayPal order ID
      paymentMethod: 'PayPal'
    };
    
    const calculatedTotal = orderData.products.reduce((sum, p) => sum + p.subtotal, 0);
    if (Math.abs(calculatedTotal - total) > 0.01) {
      console.warn(`La suma de los subtotales (${calculatedTotal}) no coincide con el total (${total}). Esto puede indicar un problema de redondeo.`);
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

    const responseText = await response.text();
    console.log('Server response status:', response.status);
    console.log('Server response text:', responseText);

    if (!response.ok) {
      let errorMessage = `Server error: ${response.status}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorMessage;
        if (errorData.errors) {
          errorMessage += ` - Errores: ${errorData.errors.map(e => e.msg || e.message || e.param).join(', ')}`;
        }
      } catch (parseError) {
        errorMessage += ` - ${responseText}`;
      }
      throw new Error(errorMessage);
    }
    authStore.clearCart(); // Clear the cart after successful order creation
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Error in createBackendOrder:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error al crear la orden',
      text: error.message || 'Hubo un problema al registrar tu pedido en el sistema. Por favor contacta a soporte.'
    });
    throw error;
  }
};


// PayPal buttons corregidos
const renderPayPalButtons = () => {
  if (window.paypal) {
    // Clear existing buttons to prevent duplicates if rendered multiple times
    const paypalButtonContainer = document.getElementById("paypal-button-container");
    if (paypalButtonContainer) {
      paypalButtonContainer.innerHTML = '';
    }

    window.paypal
      .Buttons({
        // Set funding source to PayPal only, disabling credit/debit cards
        fundingSource: window.paypal.FUNDING.PAYPAL,
        createOrder: (data, actions) => {
          // Validation is already done by attemptPayment before showing the button
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
            
            // Call backend order creation
            createBackendOrder(details.id) // Pass PayPal order ID
              .then(() => {
                mostrarFactura();
                console.log("Datos del pago:", data);
              })
              .catch((error) => {
                console.error("Error al guardar la orden en el backend:", error);
                import("../utils/notifications").then(({ showNotification }) => {
                  showNotification(
                    "error",
                    "Error al guardar la orden",
                    "Tu pago con PayPal fue exitoso, pero hubo un problema al registrar la orden. Por favor, contacta a soporte con tu ID de pago de PayPal: " + details.id
                  );
                });
              });
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
  // Use discountedPrice if available, otherwise use price
  const totalConDescuento = authStore.cartItems.reduce((sum, item) => {
    const priceToUse = Number(item.discountedPrice) > 0 && Number(item.discountedPrice) < Number(item.price)
      ? Number(item.discountedPrice)
      : Number(item.price || 0);
    const quantity = parseInt(item.quantity) || 1;
    return sum + (priceToUse * quantity);
  }, 0);
  
  return Math.round(totalConDescuento * 100) / 100;
};


onMounted(async () => {
  totalCOP.value = getCartTotalInCOP();
  const exchangeRateValue = await fetchExchangeRate();
  totalUSD.value = (totalCOP.value * exchangeRateValue).toFixed(2);
});
</script>

<style scoped>
/* Your existing CSS styles go here */
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
  margin-top: 20px; /* Add some space above the PayPal button */
}

#paypal-button-container {
  min-height: 50px;
}

.error {
  color: #dc3545;
  font-size: 12px;
  margin-top: 5px;
}

.validate-button {
  display: block;
  width: 100%;
  padding: 15px 25px;
  background-color: #068fff;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  margin-top: 20px;
  box-shadow: 0 4px 15px rgba(6, 143, 255, 0.3);
}

.validate-button:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
}

.validate-button:active {
  transform: translateY(0);
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

  .validate-button {
    font-size: 16px;
    padding: 12px 20px;
  }
}
</style>