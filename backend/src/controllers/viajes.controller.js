import pool from '../config/db.js';

// helper: buscar o crear cliente por nombre
async function getOrCreateClienteId(nombre) {
  if (!nombre) return null;
  const trimmed = String(nombre).trim();
  if (!trimmed) return null;

  const q = await pool.query('SELECT id FROM clientes WHERE nombre = $1', [trimmed]);
  if (q.rows.length) return q.rows[0].id;

  const ins = await pool.query('INSERT INTO clientes (nombre) VALUES ($1) RETURNING id', [trimmed]);
  return ins.rows[0].id;
}

export const crearViaje = async (req, res) => {
  const {
    cliente_id,
    cliente_nombre,
    matricula,
    n_orden,
    origen,
    destino,
    contenedor,
    tipo_cont,
    cargado,
    observaciones,
  } = req.body;

  const usuario_id = req.user.id;

  if (!n_orden || !origen || !destino) {
    return res.status(400).json({ message: "Faltan campos requeridos: n_orden/origen/destino" });
  }

  // resolver cliente: si llega nombre, usarlo; si llega id, usarlo; '' -> null
  let clienteId = null;
  try {
    if (cliente_nombre) {
      clienteId = await getOrCreateClienteId(cliente_nombre);
    } else if (cliente_id !== undefined && cliente_id !== "" && cliente_id !== null) {
      const parsed = Number(cliente_id);
      if (Number.isNaN(parsed)) return res.status(400).json({ message: "cliente_id inválido" });
      clienteId = parsed;
    } else {
      clienteId = null;
    }

    // Saneamiento de contenedor: '' -> null, trim
    const cont = contenedor === "" || contenedor == null ? null : String(contenedor).trim();

    const cargadoBool = cargado === true || cargado === "true" || cargado === 1 || cargado === "1";

    const result = await pool.query(
      `INSERT INTO viajes 
      (usuario_id, matricula, cliente_id, n_orden, origen, destino, contenedor, tipo_cont, cargado, observaciones) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) 
      RETURNING *`,
      [
        usuario_id,
        matricula || null,
        clienteId,
        n_orden,
        origen,
        destino,
        cont,
        tipo_cont || null,
        cargadoBool,
        observaciones || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    // si la constraint de contenedor falla, devolver 400 con mensaje claro
    if (err && (err.constraint === "viajes_contenedor_check" || (err.message && err.message.includes("viajes_contenedor_check")))) {
      return res.status(400).json({ message: "Contenedor inválido: formato/valor no permitido" });
    }
    console.error("crearViaje error:", err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Error al crear viaje", error: err.message });
  }
};

export const listarViajes = async (req, res) => {
  try {
    const { rol } = req.user;
    const { fecha } = req.query;

    if (rol !== "admin") {
      return res.status(403).json({ message: "Acceso denegado: solo administradores" });
    }

    const fechaFiltro = fecha || new Date().toISOString().split("T")[0];

    const query = `
      SELECT v.*, u.nombre AS chofer_nombre, c.nombre AS cliente_nombre
      FROM viajes v
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      LEFT JOIN clientes c ON v.cliente_id = c.id
      WHERE DATE(v.fecha) = $1
      ORDER BY v.fecha DESC
    `;

    const result = await pool.query(query, [fechaFiltro]);

    if (result.rows.length === 0) {
      return res.status(200).json([]);
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Error al listar viajes:", err);
    res.status(500).json({ message: "Error al obtener los viajes" });
  }
};

export const listarViajesChofer = async (req, res) => {
  const usuario_id = req.user.id;
  const { fecha } = req.query;

  try {
    const result = await pool.query(
      `SELECT * FROM viajes 
       WHERE usuario_id = $1 AND DATE(fecha) = $2 
       ORDER BY fecha DESC`,
      [usuario_id, fecha]
    );

    /* const result = await pool.query(
      `SELECT * FROM viajes
       WHERE usuario_id = $1
       AND fecha >= $2::date
       AND fecha < ($2::date + INTERVAL '1 day')
       ORDER BY fecha DESC`,
      [usuario_id, fecha]
    ); */
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener viajes del chofer" });
  }
};

export const editarViaje = async (req, res) => {
  const { id } = req.params;
  const {
    cliente_id,
    cliente_nombre,
    matricula,
    n_orden,
    origen,
    destino,
    contenedor,
    tipo_cont,
    cargado,
    observaciones,
  } = req.body;

  try {
    // resolver cliente similar a crear
    let clienteId = null;
    if (cliente_nombre) {
      clienteId = await getOrCreateClienteId(cliente_nombre);
    } else if (cliente_id !== undefined && cliente_id !== "" && cliente_id !== null) {
      const parsed = Number(cliente_id);
      if (Number.isNaN(parsed)) return res.status(400).json({ message: "cliente_id inválido" });
      clienteId = parsed;
    } else {
      clienteId = null;
    }

    const cargadoBool = cargado === true || cargado === "true" || cargado === 1 || cargado === "1";

    const result = await pool.query(
      `UPDATE viajes 
       SET matricula=$1, cliente_id=$2, n_orden=$3, origen=$4, destino=$5, contenedor=$6, tipo_cont=$7, cargado=$8, observaciones=$9
       WHERE id=$10 RETURNING *`,
      [
        matricula || null,
        clienteId,
        n_orden,
        origen,
        destino,
        contenedor || null,
        tipo_cont || null,
        cargadoBool,
        observaciones || null,
        id,
      ]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Viaje no encontrado" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("editarViaje error:", err && err.stack ? err.stack : err);
    res.status(500).json({ error: "Error al actualizar viaje", details: err.message });
  }
};

export const eliminarViaje = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM viajes WHERE id = $1 RETURNING *', [id]);
        if(result.rows.length === 0) {
            console.log("Viaje con ID:", id, "no existe.");
            return res.status(404).json({ message: 'Viaje no encontrado' });
        }
        
        res.json({ message: 'Viaje eliminado' });
    } catch (err) {    
        console.error(err);
        res.status(500).json({ message: 'Error al eliminar viaje' });   
    }
};