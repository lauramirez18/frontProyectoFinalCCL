// src/services/resenias.js

import { getData } from './apiclient'

export const reviewsService = {
  async getProductRatings(productId) {
    try {
      console.log(`[resenias.js] Attempting to fetch ratings for productId: ${productId} from path: /resenas/producto/${productId}/valoraciones`);
      // Corrected URL: Changed '/resenas/productos/' to '/resenas/producto/'
      const response = await getData(`/resenas/producto/${productId}/valoraciones`) 
      
      console.log(`[resenias.js] Raw response for ratings for ${productId}:`, response);

      // Procesamos las reseñas para obtener la distribución
      if (response && Array.isArray(response)) {
        const distribucion = {
          5: 0, 4: 0, 3: 0, 2: 0, 1: 0
        }
        
        let totalCalificacion = 0
        response.forEach(resena => {
          const calificacion = Math.round(resena.calificacion)
          if (calificacion >= 1 && calificacion <= 5) {
            distribucion[calificacion]++
            totalCalificacion += resena.calificacion
          }
        })

        const calculatedRatings = {
          promedioTotal: response.length > 0 ? totalCalificacion / response.length : 0,
          totalReseñas: response.length,
          distribucion
        };
        console.log(`[resenias.js] Processed ratings for ${productId}:`, calculatedRatings);
        return calculatedRatings;
      }
      
      console.log(`[resenias.js] No valid response for ratings for ${productId}. Returning default values.`);
      return {
        promedioTotal: 0,
        totalReseñas: 0,
        distribucion: {
          5: 0, 4: 0, 3: 0, 2: 0, 1: 0
        }
      }
    } catch (error) {
      console.error(`[resenias.js] Error al obtener valoraciones para producto ${productId}:`, error);
      return {
        promedioTotal: 0,
        totalReseñas: 0,
        distribucion: {
          5: 0, 4: 0, 3: 0, 2: 0, 1: 0
        }
      }
    }
  }
}