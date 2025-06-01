import { Router } from 'express';
import httpUsers from '../controllers/usuarioc.js';
import { validarJWT } from '../middleware/validar-jwt.js';

const router = Router();

router.post('/registro', [
], httpUsers.postRegistrarUsuario);

router.post('/login', [
], httpUsers.postLogin);

router.get('/verify-token', validarJWT, async (req, res) => {
  try {
    // El middleware validarJWT ya verificó el token
    // y agregó el usuario al request
    const user = await User.findById(req.usuario.id).populate('favoritos');
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        favoritos: user.favoritos || []
      }
    });
  } catch (error) {
    console.error('Error al verificar token:', error);
    res.status(500).json({ error: 'Error al verificar token' });
  }
});

router.get('/users', [
], httpUsers.getlistUser);

router.put('/users/:id', [
], httpUsers.putModifyUser);

// Favorites routes
router.post('/users/:userId/favorites/:productId', validarJWT, httpUsers.addToFavorites);
router.delete('/users/:userId/favorites/:productId', validarJWT, httpUsers.removeFromFavorites);
router.get('/users/:userId/favorites', validarJWT, httpUsers.getFavorites);

export default router; 