import { useEffect, useState } from "react";
import { Button, Label, TextInput, Alert } from "flowbite-react";
import { FaTrash, FaPlus } from "react-icons/fa";

export default function Usuarios() {
  const rol = localStorage.getItem("rol");
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState({ nombre: "", email: "", password: "", rol: "chofer" });

  const token = localStorage.getItem("token");

  const fetchUsuarios = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:4000/api/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    // eslint-disable-next-line
  }, []);

  const handleCreateOpen = () => {
    setForm({ nombre: "", email: "", password: "", rol: "chofer" });
    setShowForm(true);
    setError("");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:4000/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Error al crear usuario");
      }
      await fetchUsuarios();
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError("No se pudo crear el usuario.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar usuario? Esta acción no se puede deshacer.")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`http://localhost:4000/api/usuarios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchUsuarios();
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar el usuario.");
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
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <div className="flex items-center gap-2">
          <Button color="green" onClick={handleCreateOpen}>
            <FaPlus className="mr-2" /> Nuevo usuario
          </Button>
        </div>
      </div>

      {error && <Alert color="failure">{error}</Alert>}

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs uppercase text-gray-700 bg-gray-50">
            <tr>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Rol</th>
              <th className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan="4" className="p-6 text-center">Cargando...</td></tr>
            ) : usuarios.length === 0 ? (
              <tr><td colSpan="4" className="p-6 text-center text-gray-500">No hay usuarios.</td></tr>
            ) : (
              usuarios.map(u => (
                <tr key={u.id} className="bg-white">
                  <td className="px-6 py-3">{u.nombre}</td>
                  <td className="px-6 py-3">{u.email}</td>
                  <td className="px-6 py-3">{u.rol}</td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      <Button color="failure" size="sm" onClick={() => handleDelete(u.id)} disabled={actionLoading === u.id}>
                        {actionLoading === u.id ? "..." : <FaTrash />}
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
              <h3 className="font-semibold">Crear Usuario</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-500">Cerrar</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <Label htmlFor="nombre" value="Nombre" />
                <TextInput id="nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="email" value="Email" />
                <TextInput id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="password" value="Contraseña" />
                <TextInput id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="rol" value="Rol" />
                <select id="rol" className="w-full rounded px-2 py-1" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                  <option value="chofer">chofer</option>
                  <option value="admin">admin</option>
                </select>
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