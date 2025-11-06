// ...existing code...
import { Badge, Button, Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle } from "flowbite-react";
import { RiLogoutBoxRLine } from "react-icons/ri";
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
        {/* <Button className="mr-2">{user.nombre}</Button> */}
        <Badge color="light" size="sm" className="mr-4 self-center">{rol}</Badge>
        {/* <Button href="#" onClick={handleLogout}>Cerrar sesión</Button> */}
        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          className="flex items-center justify-center p-2 rounded hover:bg-gray-200/20 text-white"
        >
          <RiLogoutBoxRLine size={20} />
        </button>
        {/* si es admin ver NavbarToggle */}
        {rol === "admin" &&(
          <>
            <NavbarToggle />
          </>
        )}
      </div>
        {rol === "admin" && (
          <>
            <NavbarCollapse>
              <NavbarLink href="/viajes">Viajes</NavbarLink>
              <NavbarLink href="/usuarios">Usuarios</NavbarLink>
              <NavbarLink href="/clientes">Clientes</NavbarLink>
            </NavbarCollapse>   
          </>
        )}

        {/* {rol === "chofer" && <NavbarLink href="/mi-perfil">Mi Perfil</NavbarLink>} */}

        
    </Navbar>
  );
}