import pool from '../config/db.js';

export const crearViaje = async (req, res) => {
    const { 
    cliente_id, 
    matricula, 
    n_orden, 
    origen, 
    destino,
    contenedor,
    tipo_cont,
    cargado,
    observaciones
    } = req.body;

    // El ID del usuario viene del token JWT
    const usuario_id = req.user.id;
    try {
        const result = await pool.query(
      `INSERT INTO viajes 
      (usuario_id, matricula, cliente_id, n_orden, origen, destino, contenedor, tipo_cont, cargado, observaciones) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) 
      RETURNING *`,
      [
        usuario_id,
        matricula,
        cliente_id,
        n_orden,
        origen,
        destino,
        contenedor,
        tipo_cont,
        cargado,
        observaciones,
      ]
    );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al crear viaje' });
    }   
};

/* export const listarViajes = async (req, res) => {
  try {
    const { rol, id } = req.user; // viene del token
    const { fecha } = req.query; // parámetro opcional ?fecha=YYYY-MM-DD

    // Si no se pasa fecha, usamos la fecha actual (sin hora)
    const fechaFiltro = fecha || new Date().toISOString().split('T')[0];

    let query = "";
    let params = [];

    if (rol === "admin") {
      query = `
        SELECT v.*, u.nombre AS chofer_nombre 
        FROM viajes v
        LEFT JOIN usuarios u ON v.usuario_id = u.id
        WHERE DATE(v.fecha) = $1
        ORDER BY v.fecha DESC
      `;
      params = [fechaFiltro];
    } else if (rol === "chofer") {
      query = `
        SELECT *
        FROM viajes
        WHERE usuario_id = $1 AND DATE(fecha) = $2
        ORDER BY fecha DESC
      `;
      params = [id, fechaFiltro];
    } else {
      return res.status(403).json({ message: "Rol no autorizado para ver viajes" });
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(200).json({ message: "No hay viajes para esta fecha" });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error al obtener viajes:", err);
    res.status(500).json({ error: "Error al obtener viajes" });
  }
}; */
/* export const listarViajes = async (req, res) => {
  try {
    const { rol, id } = req.user; // viene del token
    const { fecha } = req.query; // parámetro opcional ?fecha=YYYY-MM-DD

    // Si no se pasa fecha, usamos la fecha actual (sin hora)
    const fechaFiltro = fecha || new Date().toISOString().split('T')[0];

    let query = "";
    let params = [];

    if (rol === "admin") {
      query = `
        SELECT v.*, u.nombre AS chofer_nombre 
        FROM viajes v
        LEFT JOIN usuarios u ON v.usuario_id = u.id
        WHERE DATE(v.fecha) = $1
        ORDER BY v.fecha DESC
      `;
      params = [fechaFiltro];
    } else if (rol === "chofer") {
      query = `
        SELECT *
        FROM viajes
        WHERE usuario_id = $1 AND DATE(fecha) = $2
        ORDER BY fecha DESC
      `;
      params = [id, fechaFiltro];
    } else {
      return res.status(403).json({ message: "Rol no autorizado para ver viajes" });
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(200).json({ message: "No hay viajes para esta fecha" });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error al obtener viajes:", err);
    res.status(500).json({ error: "Error al obtener viajes" });
  }
}; */
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
        matricula,
        cliente_id,
        n_orden,
        origen,
        destino,
        contenedor,
        tipo_cont,
        cargado,
        observaciones,
    } = req.body;

  try {
      const result = await pool.query(
      `UPDATE viajes 
      SET matricula=$1, cliente_id=$2, n_orden=$3, 
           origen=$4, destino=$5, contenedor=$6, tipo_cont=$7, cargado=$8, observaciones=$9
       WHERE id=$10 RETURNING *`,
       [
           matricula,
           cliente_id,
           n_orden,
           origen,
           destino,
           contenedor,
           tipo_cont,
           cargado,
           observaciones,
           id,
        ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Viaje no encontrado" });
    }
    
    res.json(result.rows[0]);
    console.log("Viaje actualizado:", result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al actualizar viaje" });
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