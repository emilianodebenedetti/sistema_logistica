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
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Card className="w-96">
        <h2 className="text-2xl font-semibold text-center">Iniciar Sesión</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="email" value="Correo electrónico" />
            <TextInput
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="password" value="Contraseña" />
            <TextInput
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Button type="submit">{/*  gradientduotone="greenToBlue" */}
            Ingresar
          </Button>
        </form>
      </Card>
    </div>
  );
}
