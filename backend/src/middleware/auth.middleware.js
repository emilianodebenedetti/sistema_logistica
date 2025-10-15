import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; //bearer <token>
  if (!token) return res.status(403).json({ message: 'Token no proporcionado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; //guardamos los datos del usuario en la request
    next();
  } catch (error) {
    console.error("Error al verificar token", error);
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

export const esAdmin = (req, res, next) => { //
//   const { rol_id } = req.body;
  if (req.user?.rol !== "admin") { 
    return res.status(403).json({ message: 'Acceso denegado. Solo admin permitido' });
  }
  next();
};
