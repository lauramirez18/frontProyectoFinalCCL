import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const routeMappings = {
  'admin': { label: 'Administración', icon: 'admin_panel_settings' },
  'products': { label: 'Productos', icon: 'inventory_2' },
  'categories': { label: 'Categorías', icon: 'category' },
  'users': { label: 'Usuarios', icon: 'people' },
  'brands': { label: 'Marcas', icon: 'branding_watermark' },
  'offers': { label: 'Ofertas', icon: 'local_offer' },
  'product': { label: 'Producto', icon: 'inventory_2' },
  'category': { label: 'Categoría', icon: 'category' },
  'user': { label: 'Usuario', icon: 'person' },
  'brand': { label: 'Marca', icon: 'branding_watermark' },
  'offer': { label: 'Oferta', icon: 'local_offer' },
  'detail': { label: 'Detalle', icon: 'info' },
  'edit': { label: 'Editar', icon: 'edit' },
  'create': { label: 'Crear', icon: 'add' },
  'search': { label: 'Búsqueda', icon: 'search' },
  'car': { label: 'Carrito', icon: 'shopping_cart' },
  'favorites': { label: 'Favoritos', icon: 'favorite' },
  'profile': { label: 'Perfil', icon: 'person' },
  'login': { label: 'Iniciar sesión', icon: 'login' },
  'register': { label: 'Registrarse', icon: 'person_add' },
  'checkout': { label: 'Pago', icon: 'shopping_bag' },
  'orders': { label: 'Pedidos', icon: 'receipt_long' },
  'settings': { label: 'Configuración', icon: 'settings' },
  'history': { label: 'Historial', icon: 'history' },
  'dashboard': { label: 'Panel', icon: 'dashboard' },
  'account': { label: 'Cuenta', icon: 'account_circle' },
  'password': { label: 'Contraseña', icon: 'lock' },
  'address': { label: 'Dirección', icon: 'location_on' },
  'payment': { label: 'Pago', icon: 'credit_card' },
  'notifications': { label: 'Notificaciones', icon: 'notifications' },
  'messages': { label: 'Mensajes', icon: 'email' },
  'help': { label: 'Ayuda', icon: 'help' },
  'about': { label: 'Acerca de', icon: 'info' },
  'contact': { label: 'Contacto', icon: 'email' },
  'privacy': { label: 'Privacidad', icon: 'privacy_tip' },
  'terms': { label: 'Términos', icon: 'gavel' },
  'shipping': { label: 'Envío', icon: 'local_shipping' },
  'returns': { label: 'Devoluciones', icon: 'assignment_return' },
  'faq': { label: 'Preguntas frecuentes', icon: 'help_outline' },
  'blog': { label: 'Blog', icon: 'article' },
  'news': { label: 'Noticias', icon: 'newspaper' },
  'events': { label: 'Eventos', icon: 'event' },
  'gallery': { label: 'Galería', icon: 'collections' },
  'testimonials': { label: 'Testimonios', icon: 'format_quote' },
  'team': { label: 'Equipo', icon: 'people' },
  'careers': { label: 'Carreras', icon: 'work' },
  'press': { label: 'Prensa', icon: 'record_voice_over' },
  'investors': { label: 'Inversionistas', icon: 'trending_up' },
  'sustainability': { label: 'Sostenibilidad', icon: 'eco' },
  'sitemap': { label: 'Mapa del sitio', icon: 'map' },
  'accessibility': { label: 'Accesibilidad', icon: 'accessibility' },
  'cookies': { label: 'Cookies', icon: 'cookie' },
  'sitemap': { label: 'Mapa del sitio', icon: 'map' }
};

const formatLabel = (segment) => {
  // Convertir guiones a espacios y capitalizar cada palabra
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function useBreadcrumbs() {
  const route = useRoute();
  const router = useRouter();

  const breadcrumbs = computed(() => {
    const pathArray = route.path.split('/').filter(Boolean);
    const crumbs = [];
    // Home siempre primero
    crumbs.push({
      label: 'Inicio',
      to: '/',
      icon: 'home',
      disabled: pathArray.length === 0
    });
    let path = '';
    pathArray.forEach((segment, index) => {
      path = `/${pathArray.slice(0, index + 1).join('/')}`;
      const isLast = index === pathArray.length - 1;
      const routeInfo = routeMappings[segment] || {
        label: formatLabel(segment),
        icon: 'label_important'
      };
      crumbs.push({
        label: routeInfo.label,
        to: isLast ? null : path,
        icon: routeInfo.icon,
        disabled: isLast
      });
    });
    return crumbs;
  });

  function navigateTo(path) {
    if (path) {
      router.push(path);
    }
  }

  return {
    breadcrumbs,
    navigateTo
  };
}
