import { Router } from "express";
import { 
    crearViaje,
    listarViajes,
    editarViaje,
    eliminarViaje
} from '../controllers/viajes.controller.js';
import { verificarToken } from '../middleware/auth.middleware.js';

const router = Router();

// Crear un nuevo viaje
router.post('/', verificarToken, crearViaje);//testeado admin
// Listar todos los viajes
router.get('/', verificarToken, listarViajes);//testeado admin
// Editar un viaje existente
router.put('/:id', verificarToken, editarViaje);//testeado admin y chofer
// Eliminar un viaje
router.delete('/:id', verificarToken, eliminarViaje);//testeado admin y chofer

export default router;

