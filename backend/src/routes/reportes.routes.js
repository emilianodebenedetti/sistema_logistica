import express from "express";
import {
  obtenerViajes,
  filtrarPorChofer,
  filtrarPorCliente,
  exportarExcel,
  exportarExcelGeneral,
  exportarViajesExcel
} from "../controllers/reportes.controller.js";
/* import { verifyToken } from "../middleware/auth.middleware.js";
 */
const router = express.Router();

router.get("/viajes", obtenerViajes);//tsteado y funcionando
router.get("/viajes/chofer/:id", filtrarPorChofer);//tsteado y funcionando
router.get("/viajes/cliente/:id", filtrarPorCliente);//
router.get("/viajes/excel", exportarExcel);// 
router.get("/viajes/excel/general", exportarExcelGeneral);
router.get("/viajes", exportarViajesExcel);

export default router;
