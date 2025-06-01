import { Router } from 'express';
import httpUsers from '../controllers/usuarioc.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

// Rutas públicas
router.post('/registro', httpUsers.postRegistrarUsuario);
router.post('/login', httpUsers.postLogin);

// Rutas de usuarios (protegidas)
router.get('/users', verifyToken, httpUsers.getlistUser);
router.put('/users/:id', verifyToken, httpUsers.putModifyUser);

// Rutas de favoritos (protegidas)
// Primero las rutas más específicas
router.post('/users/:userId/favorites/:productId', verifyToken, httpUsers.addToFavorites);
router.delete('/users/:userId/favorites/:productId', verifyToken, httpUsers.removeFromFavorites);
// Después las rutas más generales
router.get('/users/:userId/favorites', verifyToken, httpUsers.getFavorites);

// Middleware para manejar rutas no encontradas
router.use((req, res) => {
  console.log('Ruta no encontrada:', req.method, req.url);
  res.status(404).json({ error: 'Ruta no encontrada' });
});

export default router; 