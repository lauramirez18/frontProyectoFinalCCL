<template>
  <div class="brand-bar-section">
    <h6>Las mejores marcas de la Industria</h6>

    <div v-if="brands.length > 0" class="brands-grid q-px-md">
      <div
        v-for="(brand, index) in brands"
        :key="brand._id || index"
        class="brand-card-wrapper"
        @click="goToBrandProducts(brand)"
        data-aos="fade-up"
        :data-aos-delay="index * 50"
        data-aos-offset="100"
        data-aos-once="true"
      >
        <q-card flat class="brand-card">
          <q-img
            :src="brand.logo"
            :alt="brand.nombre"
            class="brand-logo"
            fit="contain"
            :class="{ 'image-loading': !brand.loaded }"
            @load="brand.loaded = true"
          >
            <template v-slot:loading>
              <q-spinner-dots color="primary" size="md" />
            </template>
            <template v-slot:error>
              <div class="error-image flex flex-center">
                <span>No logo</span>
              </div>
            </template>
          </q-img>
          <div class="brand-name">{{ brand.nombre }}</div>
        </q-card>
      </div>
    </div>
    <div v-else class="loading-brands flex flex-center q-py-lg">
      <q-spinner-dots color="primary" size="xl" />
      <p class="q-ml-sm text-grey-7">Cargando marcas...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getData } from '../services/apiclient'
import { useRouter } from 'vue-router'

const router = useRouter()
const brands = ref([])

const getBrands = async () => {
  try {
    console.log('BrandsBar: Iniciando carga de marcas...');
    const res = await getData('marcas');
    console.log('BrandsBar: Respuesta de marcas:', res);

    if (Array.isArray(res)) {
      const marcasValidas = res.filter(brand =>
        brand.state === '1' &&
        brand.logo &&
        brand.nombre
      );

      console.log('BrandsBar: Marcas válidas encontradas:', marcasValidas.length);
      brands.value = marcasValidas.map(brand => ({
        ...brand,
        loaded: false,
        nombre: brand.nombre.trim(),
        _id: brand._id || `brand-${Math.random().toString(36).substring(7)}`
      }));
    } else {
      console.warn('BrandsBar: Formato de respuesta inesperado:', res);
      brands.value = [];
    }
  } catch (error) {
    console.error('BrandsBar: Error al obtener las marcas:', error);
    console.error('BrandsBar: Detalles del error:', error.response?.data);
    brands.value = [];
  }
}

const goToBrandProducts = (brand) => {
  if (!brand || !brand._id) {
    console.error('BrandsBar: Intento de navegación con marca inválida:', brand);
    return;
  }

  console.log('BrandsBar: Navegando a productos de marca:', brand.nombre);
  router.push({
    name: 'BrandProducts',
    params: { id: brand._id }
  });
}

onMounted(() => {
  getBrands();
});
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap'); // Nueva fuente para el nombre de la marca

.brand-bar-section {
  padding: 10px 20px 30px;
 
  margin: 40px auto;
  position: relative;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1); // Sombra más profunda
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: #f5f5f5; // Fondo gris claro
  
  
}

/* Fondo de patrón de circuito sutil (opcional, puedes activarlo) */
.brand-bar-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: 50px 50px;
  background-image: radial-gradient(circle, #0057b37a 1px, transparent 1px);
  z-index: 0;
}

h6 {
  font-size: 3em;
  font-weight: 800;
  text-align: center;
  margin-bottom: 50px;
  color: #0056b3; // Azul más oscuro y fuerte
  text-transform: uppercase;
  letter-spacing: 2px;
  position: relative;
  padding-bottom: 20px;
  font-family: 'Montserrat', sans-serif;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  z-index: 1; // Asegurar que el título esté sobre el fondo
}

h6::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 150px; // Línea más ancha
  height: 5px;
  background: linear-gradient(90deg, #068FFF, #0052a3);
  border-radius: 3px;
  animation: underlineGrow 1s ease-out forwards;
}

@keyframes underlineGrow {
  from { width: 0; opacity: 0; }
  to { width: 150px; opacity: 1; }
}

.brands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); // Mayor ancho para las nuevas cards
  gap: 20px; // Aumentar el gap entre las tarjetas
  width: 100%;
  padding: 0px 20px;
  margin: 0 auto;
  justify-items: center;
  align-self: center;
  align-items: center;
  justify-content: center;
}

.brand-card-wrapper {
  cursor: pointer;
  perspective: 1000px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 220px; // Ancho máximo del contenedor para las nuevas cards
}

.brand-card {
  /* Nuevo Diseño de Tarjeta */
  background: #2c3e504b; /* Fondo oscuro tipo placa */
  border-radius: 12px; /* Bordes suaves */
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3); /* Sombra más pronunciada */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px; /* Padding generoso */
  width: 90%;
  height: 80px; /* Altura más alta para el formato rectangular tipo placa */
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border: 2px solid transparent; /* Borde transparente por defecto */
  position: relative;
  overflow: hidden;
  will-change: transform, box-shadow, border-color; /* Optimización de rendimiento */
}

/* Efecto de borde degradado dinámico */
.brand-card::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 14px; /* Un poco más grande que el border-radius de la tarjeta */
  background: linear-gradient(4deg, #068FFF, #fffffffb, #068fffc2);
  background-size: 200% 200%;
  z-index: 0;
  opacity: 0; /* Oculto por defecto */
  transition: opacity 0.4s ease, transform 0.4s ease;
  filter: blur(8px); /* Efecto de resplandor */
  transform: scale(0.95);
 
}

.brand-card:hover::before {
  opacity: 1;
  transform: scale(1);
  animation: gradientShift 2s ease infinite alternate;
  
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}

/* Efecto de brillo interior para el logo */
.brand-card::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 150%;
  height: 150%;
  background: radial-gradient(circle at center, rgb(255, 255, 255) 20%, rgba(42, 104, 167, 0.329) 70%);
  transform: translate(-50%, -50%) scale(0);
  border-radius: 50%;
  opacity: 0;
  transition: transform 0.5s ease-out, opacity 0.5s ease-out;
  z-index: 1;
}

.brand-card:hover::after {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
}

.brand-card:hover {
  transform: translateY(-8px) scale(1.03); /* Elevación y escala sutil */
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4); /* Sombra más profunda y extendida */
  border-color: rgba(6, 143, 255, 0.5); /* Borde sutil al hacer hover */
  z-index: 2;
}

.brand-logo {
  height: 40px !important; /* Altura del logo un poco más grande */
  max-width: 80% !important; /* El logo ocupa la mayor parte del ancho */
  object-fit: contain;
  filter: drop-shadow(0px 2px 3px rgba(255, 255, 255, 0.911)); /* Sombra para el logo sobre fondo oscuro */
  opacity: 1;
  transition: transform 0.3s ease, filter 0.3s ease;
  z-index: 3; /* Asegurar que el logo esté por encima de todo */
  margin-bottom: 8px; /* Espacio entre logo y nombre */
}

.brand-card:hover .brand-logo {
  transform: scale(1.08); /* Zoom sutil al logo */
  filter: drop-shadow(0px 4px 0px rgba(255, 255, 255, 0.6)); /* Sombra más intensa al logo */
}

.image-loading {
  opacity: 0.5;
}

.error-image {
  background: #f0f0f0;
  color: #888;
  font-size: 0.8em;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 5px;
  z-index: 3;
}

.brand-name {
  display: none;
  font-size: 0.95em; /* Tamaño un poco más grande */
  font-weight: 700; /* Negrita */
  color: #636363; /* Color claro para contrastar con el fondo oscuro */
  margin-top: 0; /* Ajustado por el margin-bottom del logo */
  text-align: center;
  text-transform: uppercase; /* Mayúsculas */
  letter-spacing: 0.5px; /* Espaciado entre letras */
  font-family: 'Roboto Mono', monospace; /* Fuente de estilo "código" */
;
  transition: color 0.3s ease, opacity 0.3s ease;
  z-index: 3;
}

.brand-card:hover .brand-name {
  display: block;
  font-size: 0.95em; /* Tamaño un poco más grande */
  font-weight: 700; /* Negrita */
  transition: color 0.3s ease, opacity 0.3s ease;
  color: #05365e; /* Azul claro al hover */
  opacity: 1;
}

.loading-brands {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 150px;
  font-size: 1.1em;
  color: #666;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .brand-bar-section {
    padding: 40px 15px;
  }
  h6 {
    font-size: 2.8em;
  }
  .brands-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 25px;
  }
  .brand-card-wrapper {
    max-width: 200px;
  }
  .brand-card {
    height: 130px;
    padding: 18px;
  }
  .brand-logo {
    height: 55px !important;
  }
  .brand-name {
    font-size: 0.9em;
  }
}

@media (max-width: 768px) {
  .brand-bar-section {
    padding: 30px 10px;
    margin: 30px auto;
  }
  h6 {
    font-size: 2.2em;
    margin-bottom: 40px;
  }
  .brands-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 20px;
  }
  .brand-card-wrapper {
    max-width: 170px;
  }
  .brand-card {
    height: 120px;
    padding: 15px;
    border-radius: 10px;
  }
  .brand-logo {
    height: 50px !important;
  }
  .brand-name {
    font-size: 0.85em;
  }
}

@media (max-width: 576px) {
  .brand-bar-section {
    padding: 20px 5px;
    margin: 20px auto;
  }
  h6 {
    font-size: 1.8em;
    margin-bottom: 30px;
  }
  .brands-grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 15px;
  }
  .brand-card-wrapper {
    max-width: 140px;
  }
  .brand-card {
    height: 100px;
    padding: 12px;
    border-radius: 8px;
  }
  .brand-logo {
    height: 40px !important;
  }
  .brand-name {
    font-size: 0.75em;
  }
}

@media (max-width: 400px) {
  .brand-bar-section {
    padding: 15px 0px;
  }
  h6 {
    font-size: 1.5em;
    margin-bottom: 25px;
  }
  .brands-grid {
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 10px;
    padding: 0 5px;
  }
  .brand-card-wrapper {
    max-width: 120px;
  }
  .brand-card {
    height: 85px;
    padding: 8px;
  }
  .brand-logo {
    height: 35px !important;
  }
  .brand-name {
    font-size: 0.65em;
  }
}
</style>