import { useEffect, useState } from "react";
import { Button, Label, TextInput, Alert } from "flowbite-react";
import { FaTrash, FaPlus } from "react-icons/fa";

export default function Clientes() {
  const rol = localStorage.getItem("rol");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState({ nombre: "", direccion: "", telefono: "" });

  const token = localStorage.getItem("token");

  const fetchClients = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:4000/api/clientes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los clientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line
  }, []);

  const handleCreateOpen = () => {
    setForm({ nombre: "", direccion: "", telefono: "" });
    setShowForm(true);
    setError("");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:4000/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Error al crear cliente");
      }
      await fetchClients();
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError("No se pudo crear el cliente.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar cliente? Esta acción no se puede deshacer.")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`http://localhost:4000/api/clientes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchClients();
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar el cliente.");
    } finally {
      setActionLoading(null);
    }
  };

  if (rol !== "admin") {
    return <div className="p-6 text-red-600">Acceso denegado: solo administradores.</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <div className="flex items-center gap-2">
          <Button color="green" onClick={handleCreateOpen}>
            <FaPlus className="mr-2" /> Nuevo cliente
          </Button>
        </div>
      </div>

      {error && <Alert color="failure">{error}</Alert>}

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs uppercase text-gray-700 bg-gray-50">
            <tr>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Dirección</th>
              <th className="px-6 py-3">Teléfono</th>
              <th className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan="4" className="p-6 text-center">Cargando...</td></tr>
            ) : clients.length === 0 ? (
              <tr><td colSpan="4" className="p-6 text-center text-gray-500">No hay clientes.</td></tr>
            ) : (
              clients.map(c => (
                <tr key={c.id} className="bg-white">
                  <td className="px-6 py-3">{c.nombre}</td>
                  <td className="px-6 py-3">{c.direccion}</td>
                  <td className="px-6 py-3">{c.telefono}</td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      <Button color="failure" size="sm" onClick={() => handleDelete(c.id)} disabled={actionLoading === c.id}>
                        {actionLoading === c.id ? "..." : <FaTrash />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Simple form modal */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow-lg w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Crear Cliente</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-500">Cerrar</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <Label htmlFor="nombre" value="Nombre" />
                <TextInput id="nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="direccion" value="Dirección" />
                <TextInput id="direccion" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="telefono" value="Teléfono" />
                <TextInput id="telefono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" color="gray" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit" color="green" disabled={actionLoading}>{actionLoading ? "Guardando..." : "Crear"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}