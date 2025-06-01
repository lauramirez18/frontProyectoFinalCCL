import User from '../models/usuarios.js';
import mongoose from 'mongoose';
import { generarJWT } from '../middleware/validar-jwt.js';
import bcrypt from 'bcryptjs';

const httpUsers = {
    postRegistrarUsuario: async (req, res) => {
        try {
            const { name, email, password, role } = req.body;
            const existinguser = await User.findOne({ email });
            if (existinguser) {
                return res.status(400).json({ error: 'usuario ya registrado' });
            }

            const hash = await bcrypt.hash(password, 10);
            const NuevoUsuario = new User({ 
                name, 
                email, 
                password: hash, 
                role: role || 'user',
                favoritos: []
            });
            await NuevoUsuario.save();

            res.status(201).json({ message: 'usuario registrado con éxito' });
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            return res.status(500).json({ error: 'error al registrar usuario' });
        }
    },

    postLogin: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email }).populate('favoritos');
            if (!user) {
                return res.status(400).json({ error: 'usuario no encontrado' });
            }
            const passwordCorrecto = await bcrypt.compare(password, user.password);
            if (!passwordCorrecto) {
                return res.status(400).json({ error: 'contraseña incorrecta' });
            }
            const token = await generarJWT(user);
            res.status(200).json({ 
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    favoritos: user.favoritos || []
                }
            });
        } catch (error) {
            console.error('Error al autenticar usuario:', error);
            return res.status(500).json({ error: 'error al autenticar usuario' });
        }
    },

    getlistUser: async (req, res) => {
        try {
            const users = await User.find().select('-password');
            res.status(200).json(users);
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            res.status(500).json({ error: 'Error al obtener los usuarios' });
        }
    },

    putModifyUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, email, password, role } = req.body;
            
            // Si se proporciona una nueva contraseña, hashearla
            let update = { name, email, role };
            if (password) {
                const hash = await bcrypt.hash(password, 10);
                update.password = hash;
            }

            const userModify = await User.findByIdAndUpdate(
                id, 
                update, 
                { new: true }
            ).select('-password');

            if (!userModify) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json(userModify);
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            res.status(500).json({ error: 'error al Actualizar usuario' });
        }
    },

    addToFavorites: async (req, res) => {
        try {
            const { productId } = req.params;
            const userId = req.usuario._id;
            
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({ error: 'ID de producto inválido' });
            }
            
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            
            if (!user.favoritos) {
                user.favoritos = [];
            }
            
            if (user.favoritos.includes(productId)) {
                return res.status(400).json({ message: 'El producto ya está en favoritos' });
            }
            
            user.favoritos.push(productId);
            await user.save();
            
            const updatedUser = await User.findById(userId).populate('favoritos');
            
            res.status(200).json({ 
                message: 'Producto añadido a favoritos', 
                favoritos: updatedUser.favoritos 
            });
        } catch (error) {
            console.error('Error al añadir a favoritos:', error);
            return res.status(500).json({ error: 'Error al añadir a favoritos' });
        }
    },

    removeFromFavorites: async (req, res) => {
        try {
            const { productId } = req.params;
            const userId = req.usuario._id;
            
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            
            if (!user.favoritos || !user.favoritos.includes(productId)) {
                return res.status(400).json({ message: 'El producto no está en favoritos' });
            }
            
            user.favoritos = user.favoritos.filter(id => id.toString() !== productId);
            await user.save();
            
            const updatedUser = await User.findById(userId).populate('favoritos');
            
            res.status(200).json({ 
                message: 'Producto eliminado de favoritos', 
                favoritos: updatedUser.favoritos 
            });
        } catch (error) {
            console.error('Error al eliminar de favoritos:', error);
            return res.status(500).json({ error: 'Error al eliminar de favoritos' });
        }
    },

    getFavorites: async (req, res) => {
        try {
            const userId = req.usuario._id;
            
            const user = await User.findById(userId).populate('favoritos');
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            
            res.status(200).json({ favoritos: user.favoritos || [] });
        } catch (error) {
            console.error('Error al obtener favoritos:', error);
            return res.status(500).json({ error: 'Error al obtener favoritos' });
        }
    }
};

export default httpUsers; 