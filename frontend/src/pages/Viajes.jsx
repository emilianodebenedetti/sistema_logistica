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
    cargado: "",
    observaciones: "",
    cliente_id: "",
    // ...agregar otros campos según tu modelo
  });

  // asegurar auth
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const fetchList = async () => {
    setLoading(true);
    setError("");
    try {
      const url =
        rol === "admin"
          ? `http://localhost:4000/api/viajes?fecha=${fecha}`
          : `http://localhost:4000/api/viajes/chofer?fecha=${fecha}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Error al obtener viajes");
      }
      const data = await res.json();
      setViajes(Array.isArray(data) ? data : []);
      if (!data.length) setError("No hay viajes para la fecha seleccionada.");
    } catch (err) {
      console.error(err);
      setError("Error al cargar los viajes. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, fecha, rol]);

  // Mostrar (modal) -> trae datos si no los tiene
  const handleView = async (id) => {
    setError("");
    try {
      // puedes reutilizar la info si ya está en state
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
      setSelectedViaje(data);
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
      cliente_id: "",
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
      // mapear solo campos que tiene tu form
      setForm({
        n_orden: data.n_orden || "",
        origen: data.origen || "",
        destino: data.destino || "",
        contenedor: data.contenedor || "",
        fecha: data.fecha ? new Date(data.fecha).toISOString().split("T")[0] : "",
        matricula: data.matricula || "",
        tipo_cont: data.tipo_cont || "",
        cargado: !!data.cargado,
        observaciones: data.observaciones || "",
        cliente_id: data.cliente_id || "",
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

      // si maneja nombre:
      if (payload.cliente_nombre) {
        // enviar cliente_nombre y no enviar cliente_id
        delete payload.cliente_id;
      } else {
        // si cliente_id está vacío, no lo envíes
        if (payload.cliente_id === "" || payload.cliente_id == null) delete payload.cliente_id;
      }

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
      setError("No se pudo guardar el viaje.");
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
          {/* solo chofer puede crear */}
          {rol === "chofer" && (
            <Button size="xs" color="success" onClick={handleCreate}>
              Crear
            </Button>
          )}
          <Label htmlFor="fecha" value="Seleccionar fecha:" />
          <TextInput id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
      </div>

      {error ? (
        <Alert color="warning">{error}</Alert>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs uppercase text-gray-700 bg-gray-50">
              <tr>
                <th className="px-6 py-3">N° Orden</th>
                <th className="px-6 py-3">Origen</th>
                <th className="px-6 py-3">Destino</th>
                <th className="px-6 py-3">Contenedor</th>
                <th className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {viajes.map((v) => (
                <tr key={v.id} className="bg-white">
                  <td className="px-6 py-3 align-top">{v.n_orden}</td>
                  <td className="px-6 py-3 align-top">{v.origen}</td>
                  <td className="px-6 py-3 align-top">{v.destino}</td>
                  <td className="px-6 py-3 align-top">{v.contenedor}</td>
                  <td className="px-6 py-3 align-top">
                    <div className="flex items-center gap-2">
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
            </tbody>
          </table>
        </div>
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
              {Object.entries(selectedViaje).map(([key, val]) => (
                <div key={key} className="flex gap-4">
                  <div className="font-semibold w-36">{key}:</div>
                  <div className="flex-1 break-words">{String(val ?? "")}</div>
                </div>
              ))}
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
            <Button type="submit" form="viaje-form" color="success" disabled={actionLoadingId === "form"}>
              {actionLoadingId === "form" ? "Guardando..." : "Guardar"}
            </Button>
            <Button color="gray" onClick={() => setShowFormModal(false)}>
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
                <TextInput id="contenedor" placeholder="Contenedor" value={form.contenedor} onChange={(e) => setForm({ ...form, contenedor: e.target.value })} />
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
            <div>
              <Label htmlFor="observaciones" value="Observaciones" />
              <Textarea id="observaciones" placeholder="Observaciones" value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
            </div>
          </div>
          {/* {error && <div className="text-sm text-red-500 mt-2">{error}</div>} */}
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