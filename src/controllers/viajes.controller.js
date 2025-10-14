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

//listar todos los viajes
export const listarViajes = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM viajes ORDER BY fecha DESC");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener viajes" });
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