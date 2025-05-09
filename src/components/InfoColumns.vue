<template>
  <div class="q-pa-xl bg-white">
    <div class="row q-col-gutter-lg items-start justify-center text-center">
      <div
        v-for="(feature, index) in features"
        :key="index"
        class=" feature-card col-12 col-sm-6 col-md-4 q-mb-lg"
      >
        <q-icon
          :name="feature.icon"
          size="64px"
          color="primary"
          class="q-mb-md"
        />
        <div class="text-h6 q-mb-sm">{{ feature.title }}</div>
        <div class="text-body2 q-mb-sm">{{ feature.description }}</div>
        <a :href="feature.link" class="text-primary text-weight-medium">
          {{ feature.linkText }}
        </a>
      </div>
    </div>
  </div>
</template>
  
  <script setup>
  const features = [
    {
      icon: 'credit_card',
      title: 'Paga con tarjeta o en efectivo',
      description:
        'Con CCL, paga en cuotas y aprovecha la comodidad de financiación que te da tu banco, o hazlo con efectivo en puntos de pago. ¡Y siempre es seguro!',
      link: '#',
      linkText: 'Cómo pagar con CCL',
    },
    {
      icon: 'local_shipping',
      title: 'Envío gratis desde $200.000',
      description:
        'Con solo estar registrado en CCL, tienes envíos gratis en miles de productos seleccionados.',
      link: '#',
      linkText: 'Conoce los envíos gratis',
    },
    {
      icon: 'verified_user',
      title: 'Seguridad, de principio a fin',
      description:
        '¿No te gusta? ¡Devuélvelo! En CCL, no hay nada que no puedas hacer, porque estás siempre protegido.',
      link: '#',
      linkText: 'Cómo te protegemos',
    },
  ];
  </script>
  <style scoped>
  .feature-card {
    padding: 24px;
    border-radius: 12px;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
    height: 300px;
  }
  
  .feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
  </style>
  
  