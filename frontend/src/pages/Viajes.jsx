/* import { useEffect, useState } from "react";
import { Table, Spinner, Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";

export default function Viajes() {
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if(!token){
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchViajes = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/viajes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Error al obtener viajes");
        const data = await res.json();
        setViajes(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if(token) fetchViajes();
  }, [token]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Listado de Viajes</h1>
        <Button color="success">Exportar Excel</Button>
      </div>

      <div className="overflow-x-auto">
        <Table striped hoverable>
          <Table.Head>
            <Table.HeadCell>Fecha</Table.HeadCell>
            <Table.HeadCell>Chofer</Table.HeadCell>
            <Table.HeadCell>Cliente</Table.HeadCell>
            <Table.HeadCell>Origen</Table.HeadCell>
            <Table.HeadCell>Destino</Table.HeadCell>
            <Table.HeadCell>Contenedor</Table.HeadCell>
            <Table.HeadCell>Observaciones</Table.HeadCell>
          </Table.Head>

          <TableBody className="divide-y">
            {viajes.map((v) => (
              <TableRow
                key={v.id}
                className="bg-white dark:border-gray-700 dark:bg-gray-800"
              >
                <TableCell>{new Date(v.fecha).toLocaleDateString()}</TableCell>
                <TableCell>{v.chofer_nombre}</TableCell>
                <TableCell>{v.cliente_nombre}</TableCell>
                <TableCell>{v.origen}</TableCell>
                <TableCell>{v.destino}</TableCell>
                <TableCell>{v.contenedor || "-"}</TableCell>
                <TableCell>{v.observaciones || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
 */
import { useEffect, useState } from "react";
import { Table, Spinner, Button, Label, TextInput, Alert, TableHead, TableHeadCell, TableBody, TableRow, TableCell } from "flowbite-react";
import { useNavigate } from "react-router-dom";

export default function Viajes() {
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]); // fecha actual
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");
  const navigate = useNavigate();

  // 🔒 Validación de autenticación
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // 🚀 Cargar viajes según rol y fecha
  useEffect(() => {
    const fetchViajes = async () => {
      setLoading(true);
      setError("");

      try {
        const url =
          rol === "admin"
            ? `http://localhost:4000/api/viajes?fecha=${fecha}`
            : `http://localhost:4000/api/viajes/chofer?fecha=${fecha}`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Error al obtener viajes");
        const data = await res.json();

        if (!data.length) {
          setError("No hay viajes para la fecha seleccionada.");
          setViajes([]);
        } else {
          setViajes(data);
        }
      } catch (err) {
        console.error(err);
        setError("Error al cargar los viajes. Intente nuevamente.");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchViajes();
  }, [token, fecha, rol]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Listado de Viajes</h1>

        <div className="flex items-center gap-2">
          <Label htmlFor="fecha" value="Seleccionar fecha:" />
          <TextInput
            id="fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>

        <Button color="success">Exportar Excel</Button>
      </div>

      {error ? (
        <Alert color="warning">{error}</Alert>
      ) : (
        <div className="overflow-x-auto">
          <Table striped hoverable>
            <TableHead>
              <TableHeadCell>Fecha</TableHeadCell>
              <TableHeadCell>Chofer</TableHeadCell>
              <TableHeadCell>Cliente</TableHeadCell>
              <TableHeadCell>Origen</TableHeadCell>
              <TableHeadCell>Destino</TableHeadCell>
              <TableHeadCell>Contenedor</TableHeadCell>
              <TableHeadCell>Observaciones</TableHeadCell>
            </TableHead>

            <TableBody className="divide-y">
              {viajes.map((v) => (
                <TableRow
                  key={v.id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <TableCell>{new Date(v.fecha).toLocaleDateString()}</TableCell>
                  <TableCell>{v.usuario_id.nombre}</TableCell>
                  <TableCell>{v.cliente_id.nombre}</TableCell>
                  <TableCell>{v.origen}</TableCell>
                  <TableCell>{v.destino}</TableCell>
                  <TableCell>{v.contenedor || "-"}</TableCell>
                  <TableCell>{v.observaciones || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
