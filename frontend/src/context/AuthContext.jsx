import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

 /*  const login = async (email, password) => {
    try {
      const res = await fetch("http://localhost:4000/api/auth/inicio-sesion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Respuesta del backend:", data);

      if (!res.ok) throw new Error(data.message || "Error al iniciar sesión");

      const userData = {
        rol: data.rol,
        token: data.token,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      console.log("Usuario seteado:", userData);
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  };
 */
// authContext.js (o donde esté tu lógica de login)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("rol");
    if (token && rol) {
      setUser({ token, rol });
    }
  }, []);

  const login = async (email, password) => {
    const res = await fetch("http://localhost:4000/api/auth/inicio-sesion", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ email, password }),
    });
    
    const data = await res.json();
    if(!res.ok) throw new Error(data.message || "Error al iniciar sesión");
    // Guardar token y rol
    localStorage.setItem("token", data.token);
    localStorage.setItem("rol", data.rol);

    setUser({ token: data.token, rol: data.rol });
  };

  const logout = () => {
    /* localStorage.removeItem("user"); */
    localStorage.clear();
    setUser(null);
  };

  /* useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []); */

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
