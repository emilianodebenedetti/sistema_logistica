import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Card, Label, TextInput } from "flowbite-react";
/* import { login } from "../context/AuthContext"; */

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password); // Esperar a que se complete el login
      console.log("ROL:", localStorage.getItem("rol"));
      console.log("TOKEN:", localStorage.getItem("token"));
      navigate("/viajes"); // Luego redirigir
    } catch (err) {
      console.error(err);
      setError("Credenciales incorrectas");
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="w-full py-8 px-6">
        <h1 className="text-2xl font-semibold text-green-800">Sistema Logístico</h1>
        <p className="text-sm text-gray-500">by chili.dev</p>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md rounded-xl bg-[#F5F6F2] border border-gray-50 shadow-sm p-6">
          <legend className="text-lg font-semibold mb-4">Inicia Sesión</legend>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="email" value="Correo electrónico" className="mb-2 " />
              <TextInput
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Correo electrónico"
                required
                className="rounded-full w-full !bg-white"
              />
            </div>

            <div>
              <Label htmlFor="password" value="Contraseña" className="mb-2" />
              <TextInput
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Contraseña"
                required
                className="rounded-full"
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <Button type="submit" className="w-full rounded-full bg-[#426B1F]">
              Iniciar Sesión
            </Button>

            <p className="text-center text-sm text-gray-600 mt-3">
              No tienes cuenta? <a className="text-green-700 underline" href="#">Regístrate gratis!</a>
            </p>
          </form>
        </Card>
      </main>

      <footer className="w-full py-6 text-center text-sm text-gray-500">
        Copyright © {new Date().getFullYear()} - chili.dev
      </footer>
    </div>
  );
 /*  return (
    <div className="flex items-center justify-center h-screen" >         
      <Card className="max-w-sm w-full px-6" style={{ backgroundColor: "#E6E6E6" }}>
        <legend className="text-2xl text-left">Iniciar Sesión</legend>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="email" value="Email" >Email</Label>
              </div>
              <TextInput
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Ingresa tu email..."
                required
                />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="password" value="Password" >Contraseña</Label>
              </div>
              <TextInput
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Ingresa tu contraseña..."
                required
                />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
             <Button type="submit" className="text-left">Iniciar Sesion</Button>
          </form>
      </Card>
    </div>
  ); */
}
