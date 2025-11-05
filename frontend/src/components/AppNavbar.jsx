// ...existing code...
import { Badge, Button, Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle } from "flowbite-react";
import { useNavigate } from "react-router-dom";

export default function AppNavbar() {
  const navigate = useNavigate();
  const rol = localStorage.getItem("rol"); // or get from AuthContext
  const user = localStorage.getItem("user"); // or get from AuthContext
  console.log("User data from localStorage:", user);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    navigate("/login");
  };

  return (
    <Navbar fluid className="mb-6 shadow">
      <NavbarBrand href="/">
        <span className="self-center whitespace-nowrap text-xl text-white font-semibold">Sistema Logístico</span>
      </NavbarBrand>

      <div className="flex md:order-2">
        <Button className="mr-2">{user.nombre}</Button>
        <Badge color="light" size="sm" className="mr-4 self-center">{rol}</Badge>
        <NavbarToggle />
      </div>

      <NavbarCollapse>
        <NavbarLink href="/viajes">Viajes</NavbarLink>

        {rol === "admin" && (
          <>
            <NavbarLink href="/usuarios">Usuarios</NavbarLink>
            <NavbarLink href="/clientes">Clientes</NavbarLink>
            <NavbarLink href="/reportes">Reportes</NavbarLink>
          </>
        )}

        {rol === "chofer" && <NavbarLink href="/mi-perfil">Mi Perfil</NavbarLink>}

        <NavbarLink href="#" onClick={handleLogout}>Cerrar sesión</NavbarLink>
      </NavbarCollapse>
    </Navbar>
  );
}