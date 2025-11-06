import { useEffect, useState } from "react";
import {
  Spinner,
  Button,
  Label,
  TextInput,
  Textarea,
  Alert,
} from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

export default function Viajes() {
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedUsuario, setSelectedUsuario] = useState("");
  const [selectedCliente, setSelectedCliente] = useState("");
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");
  const navigate = useNavigate();

  // modals & selected data
  const [showViewModal, setShowViewModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedViaje, setSelectedViaje] = useState(null);
  const [form, setForm] = useState({
    n_orden: "",
    origen: "",
    destino: "",
    contenedor: "",
    fecha: "",
    matricula: "",
    tipo_cont: "",
    cargado: false,
    observaciones: "",
    cliente_nombre: "",
  });

  // asegurar auth
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // helper: formatear fechas para mostrar y para input[type=date]
  function formatDisplayDate(date) {
    if (!date) return "";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return String(date);
    return d.toLocaleDateString("es-ES"); // ejemplo: 04/11/2025
  }
  function formatInputDate(date) {
    if (!date) return "";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0]; // formato yyyy-mm-dd para input[type=date]
  }

  // normalizar viajes para tener fecha ready-to-use
  const normalizeViaje = (v) => {
    return {
      ...v,
      cliente_nombre: v.cliente_nombre || v.cliente || "",
      usuario_nombre: v.usuario_nombre || v.chofer || "",
      fecha_display: v.fecha ? formatDisplayDate(v.fecha) : "",
      fecha_input: v.fecha ? formatInputDate(v.fecha) : "",
    };
  };

  // fetch users and clients for admin filters
  useEffect(() => {
    if (rol !== "admin") return;
    const token = localStorage.getItem("token");
    const fetchLists = async () => {
      try {
        const [uRes, cRes] = await Promise.all([
          fetch("http://localhost:4000/api/usuarios", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:4000/api/clientes", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (uRes.ok) setUsers(await uRes.json());
        if (cRes.ok) setClients(await cRes.json());
      } catch (err) {
        console.error("Error cargando usuarios o clientes:", err);
      }
    };
    fetchLists();
  }, [rol]);

  // ajustar fetchList para usar filtros seleccionados
  const fetchList = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      params.set("fecha", fecha);
      if (selectedUsuario) params.set("usuario_id", selectedUsuario);
      if (selectedCliente) params.set("cliente_id", selectedCliente);

      const url = rol === "admin"
        ? `http://localhost:4000/api/viajes?${params.toString()}`
        : `http://localhost:4000/api/viajes/chofer?fecha=${fecha}`;

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setViajes(Array.isArray(data) ? data.map(normalizeViaje) : []);
    } catch (err) {
      console.error(err);
      setError("Error al cargar los viajes.");
    } finally {
      setLoading(false);
    }
  };

  // exportar resultados actuales a Excel
  const handleExport = async () => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      params.set("fecha", fecha);
      if (selectedUsuario) params.set("usuario_id", selectedUsuario);
      if (selectedCliente) params.set("cliente_id", selectedCliente);

      const res = await fetch(`http://localhost:4000/api/reportes/viajes?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Error al exportar");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `viajes_${fecha}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      setError("No se pudo exportar los viajes.");
    }
  };

  useEffect(() => {
    if (token) fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, fecha, rol, selectedUsuario, selectedCliente]);

  // Mostrar (modal) -> trae datos si no los tiene
  const handleView = async (id) => {
    setError("");
    try {
      const local = viajes.find((v) => v.id === id);
      if (local) {
        setSelectedViaje(local);
        setShowViewModal(true);
        return;
      }
      const res = await fetch(`http://localhost:4000/api/viajes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No se pudo obtener el viaje");
      const data = await res.json();
      setSelectedViaje(normalizeViaje(data));
      setShowViewModal(true);
    } catch (err) {
      console.error(err);
      setError("No se pudo obtener el viaje");
    }
  };

  // Preparar formulario para crear
  const handleCreate = () => {
    setIsEditing(false);
    setForm({
      n_orden: "",
      origen: "",
      destino: "",
      contenedor: "",
      fecha: new Date().toISOString().split("T")[0],
      matricula: "",
      tipo_cont: "",
      cargado: false,
      observaciones: "",
      cliente_nombre: "",
    });
    setShowFormModal(true);
  };

  // Preparar formulario para editar (trae datos si no están)
  const handleEdit = async (id) => {
    setError("");
    setIsEditing(true);
    try {
      const local = viajes.find((v) => v.id === id);
      const data = local ? local : await (await fetch(`http://localhost:4000/api/viajes/${id}`, { headers: { Authorization: `Bearer ${token}` } })).json();
      setForm({
        n_orden: data.n_orden || "",
        origen: data.origen || "",
        destino: data.destino || "",
        contenedor: data.contenedor || "",
        fecha: data.fecha ? formatInputDate(data.fecha) : "",
        matricula: data.matricula || "",
        tipo_cont: data.tipo_cont || "",
        cargado: !!data.cargado,
        observaciones: data.observaciones || "",
        cliente_nombre: data.cliente_nombre || "",
        id: data.id,
      });
      setShowFormModal(true);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar datos del viaje para editar.");
    }
  };

  // Enviar formulario (create or update)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setError("");
    setActionLoadingId("form");
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `http://localhost:4000/api/viajes/${form.id}` : `http://localhost:4000/api/viajes`;
      const payload = { ...form };

      // always send cliente_nombre (remove cliente_id if present)
      if (payload.cliente_nombre) {
        delete payload.cliente_id;
      } else {
        if (payload.cliente_id === "" || payload.cliente_id == null) delete payload.cliente_id;
      }

      // sanitize contenedor: empty -> null, trim
      if (payload.contenedor !== undefined) {
        payload.contenedor = payload.contenedor === "" ? null : String(payload.contenedor).trim();
      }

      // ensure cargado is boolean
      payload.cargado = !!payload.cargado;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Error en guardar viaje");
      }
      // refrescar lista y cerrar modal
      await fetchList();
      setShowFormModal(false);
    } catch (err) {
      console.error(err);
      // try to parse backend json error
      try {
        const parsed = JSON.parse(err.message);
        setError(parsed.message || "No se pudo guardar el viaje.");
      } catch {
        setError("No se pudo guardar el viaje.");
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // Eliminar
  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que desea eliminar este viaje?")) return;
    setError("");
    setActionLoadingId(id);
    try {
      const res = await fetch(`http://localhost:4000/api/viajes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        setError("No autorizado. Inicie sesión de nuevo.");
        return;
      }
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || "Error al eliminar el viaje");
      }
      setViajes((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error("Eliminar viaje:", err);
      setError("No se pudo eliminar el viaje. Intente nuevamente.");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );

  return (
    <div className="p-6">
      <div className="flex flex-row justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-white-800">Viajes</h1>
        <div className="flex items-center gap-2">
          {rol === "chofer" && (
            <Button size="sm" color="green" onClick={handleCreate}>
              Crear Viaje
            </Button>
          )}
          <Label htmlFor="fecha" value="Seleccionar fecha:" />
          <TextInput id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
      </div>

      {error ? (
        <Alert color="warning">{error}</Alert>
      ) : (
        <>
          {/* Filters (admin) */}
          {rol === "admin" && (
            <div className="flex gap-4 items-end mb-4">
              <div className="w-48">
                <Label value="Usuario" />
                <select
                  className="w-full rounded px-2 py-1"
                  value={selectedUsuario}
                  onChange={(e) => setSelectedUsuario(e.target.value)}
                >
                  <option value="">Todos</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-48">
                <Label value="Cliente" />
                <select
                  className="w-full rounded px-2 py-1"
                  value={selectedCliente}
                  onChange={(e) => setSelectedCliente(e.target.value)}
                >
                  <option value="">Todos</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ml-auto">
                <Button color="gray" onClick={handleExport}>
                  Exportar Excel
                </Button>
              </div>
            </div>
          )}

          {/* Single table with resultados (usá el estado viajes) */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs uppercase text-gray-700 bg-gray-50">
                <tr>
                  <th className="px-6 py-3">N° Orden</th>
                  <th className="px-6 py-3">Origen</th>
                  <th className="px-6 py-3">Destino</th>
                  {rol === "admin" && (
                    <>
                      <th className="px-6 py-3">Contenedor</th>
                      <th className="px-6 py-3">Cliente</th>
                      <th className="px-6 py-3">Chofer</th>
                    </>
                  )}
                  <th className="px-6 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {viajes.map((v) => (
                  <tr key={v.id} className="bg-white">
                    <td className="px-6 py-3 align-top">{v.n_orden}</td>
                    <td className="px-6 py-3 align-top">{v.origen}</td>
                    <td className="px-6 py-3 align-top">{v.destino}</td>
                    {rol === "admin" && (
                      <>
                        <td className="px-6 py-3 align-top">{v.contenedor}</td>
                        <td className="px-6 py-3 align-top">{v.cliente_nombre}</td>
                        <td className="px-6 py-3 align-top">{v.usuario_nombre}</td>
                      </>
                     )}
                    <td className="py-3 align-top">
                      <div className="flex items-center gap-1">
                        <button
                          title="Ver"
                          aria-label="Ver viaje"
                          className="w-8 h-8 flex items-center justify-center rounded-sm border border-gray-200 text-sm bg-white hover:bg-gray-50"
                          onClick={() => handleView(v.id)}
                        >
                          <FaEye className="text-sm" />
                        </button>

                        {rol === "chofer" && (
                          <>
                            <button
                              title="Editar"
                              aria-label="Editar viaje"
                              className="w-8 h-8 flex items-center justify-center rounded-sm border border-gray-200 text-sm bg-white hover:bg-gray-50"
                              onClick={() => handleEdit(v.id)}
                            >
                              <FaEdit className="text-sm" />
                            </button>

                            <button
                              title="Eliminar"
                              aria-label="Eliminar viaje"
                              className="w-8 h-8 flex items-center justify-center rounded-sm border border-gray-200 text-sm bg-white hover:bg-gray-50 text-red-600"
                              onClick={() => handleDelete(v.id)}
                              disabled={actionLoadingId === v.id}
                            >
                              {actionLoadingId === v.id ? "..." : <FaTrash />}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {viajes.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No hay viajes para la selección.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal Ver (SimpleModal) */}
      <SimpleModal
        show={showViewModal}
        title="Detalle del viaje"
        onClose={() => setShowViewModal(false)}
        footer={<Button onClick={() => setShowViewModal(false)}>Cerrar</Button>}
      >
        <div className="space-y-2">
          {selectedViaje ? (
            <>
              {/* mostrar campos con etiquetas legibles */}
              <div className="flex gap-4"><div className="font-semibold w-36">id:</div><div>{selectedViaje.id}</div></div>
              <div className="flex gap-4"><div className="font-semibold w-36">Cliente:</div><div>{selectedViaje.cliente_nombre}</div></div>
              <div className="flex gap-4"><div className="font-semibold w-36">Chofer:</div><div>{selectedViaje.usuario_nombre}</div></div>
              <div className="flex gap-4"><div className="font-semibold w-36">Fecha:</div>
                <div>{selectedViaje.fecha_display || formatDisplayDate(selectedViaje.fecha)}</div></div>
              <div className="flex gap-4"><div className="font-semibold w-36">Matrícula:</div><div>{selectedViaje.matricula}</div></div>
              <div className="flex gap-4"><div className="font-semibold w-36">N° Orden:</div><div>{selectedViaje.n_orden}</div></div>
              <div className="flex gap-4"><div className="font-semibold w-36">Origen:</div><div>{selectedViaje.origen}</div></div>
              <div className="flex gap-4"><div className="font-semibold w-36">Destino:</div><div>{selectedViaje.destino}</div></div>
              <div className="flex gap-4"><div className="font-semibold w-36">Contenedor:</div><div>{selectedViaje.contenedor}</div></div>
              <div className="flex gap-4"><div className="font-semibold w-36">Tipo cont:</div><div>{selectedViaje.tipo_cont}</div></div>
              <div className="flex gap-4"><div className="font-semibold w-36">Cargado:</div><div>{String(selectedViaje.cargado)}</div></div>
              <div className="flex gap-4"><div className="font-semibold w-36">Observaciones:</div><div>{selectedViaje.observaciones}</div></div>
            </>
          ) : (
            <div>Cargando...</div>
          )}
        </div>
      </SimpleModal>

      {/* Modal Crear / Editar (SimpleModal) */}
      <SimpleModal
        show={showFormModal}
        title={isEditing ? "Editar viaje" : "Crear viaje"}
        onClose={() => setShowFormModal(false)}
        footer={
          <div className="flex gap-2 justify-end">
            <Button type="submit" form="viaje-form" color="green" disabled={actionLoadingId === "form"}>
              {actionLoadingId === "form" ? "Guardando..." : "Guardar"}
            </Button>
            <Button color="red" onClick={() => setShowFormModal(false)}>
              Cancelar
            </Button>
          </div>
        }
      >
        <form id="viaje-form" onSubmit={handleSubmitForm}>
          <div className="flex flex-col gap-3">
            <div>
              <Label htmlFor="n_orden" value="N° Orden" />
              <TextInput id="n_orden" placeholder="N° Orden" value={form.n_orden} onChange={(e) => setForm({ ...form, n_orden: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="origen" value="Origen" />
                <TextInput id="origen" placeholder="Origen" value={form.origen} onChange={(e) => setForm({ ...form, origen: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="destino" value="Destino" />
                <TextInput id="destino" placeholder="Destino" value={form.destino} onChange={(e) => setForm({ ...form, destino: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="contenedor" value="Contenedor" />
                <TextInput
                  id="contenedor"
                  placeholder="Ej: ABCD1234567"
                  value={form.contenedor}
                  onChange={(e) => setForm({ ...form, contenedor: String(e.target.value || "").toUpperCase() })}
                />
                <div className="text-xs text-gray-500 mt-1">4 letras + 7 dígitos (p.e. ABCD1234567)</div>
              </div>
              <div>
                <Label htmlFor="fechaField" value="Fecha" />
                <TextInput id="fechaField" type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="matricula" value="Matrícula" />
              <TextInput id="matricula" placeholder="Matricula" value={form.matricula} onChange={(e) => setForm({ ...form, matricula: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="tipo_cont" value="Tipo Contenedor" />
              <TextInput id="tipo_cont" placeholder="Tipo Contenedor" value={form.tipo_cont} onChange={(e) => setForm({ ...form, tipo_cont: e.target.value })} />
            </div>

            <div className="flex items-center gap-2">
              <div>Cargado</div>
              <input
                id="cargado"
                type="checkbox"
                checked={!!form.cargado}
                onChange={(e) => setForm({ ...form, cargado: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="cargado" value="Cargado" />
            </div>

            <div>
              <Label htmlFor="cliente_nombre" value="Cliente (nombre)" />
              <TextInput id="cliente_nombre" placeholder="Nombre del cliente" value={form.cliente_nombre} onChange={(e) => setForm({ ...form, cliente_nombre: e.target.value })} />
            </div>

            <div>
              <Label htmlFor="observaciones" value="Observaciones" />
              <Textarea id="observaciones" placeholder="Observaciones" value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
            </div>
          </div>
        </form>
      </SimpleModal>
    </div>
  );
}

// Simple modal (sin dependencia de flowbite)
function SimpleModal({ show, title, onClose, children, footer }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-w-2xl w-full bg-white rounded-md shadow-lg overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="text-lg font-medium">{title}</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">✕</button>
        </div>
        <div className="p-4">{children}</div>
        {footer && <div className="px-4 py-3 border-t">{footer}</div>}
      </div>
    </div>
  );
}