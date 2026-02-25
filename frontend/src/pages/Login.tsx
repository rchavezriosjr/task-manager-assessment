import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function Login() {
  // 1. Estados de React para guardar lo que el usuario escribe
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Estados para la experiencia de usuario (UX)
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  //Hook para redireccionar a otras páginas
  const navigate = useNavigate();

  // 2. Función que se ejecuta al enviar el formulario
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue
    setError("");
    setIsLoading(true);

    try {
      // 3. Consumiendo API de Fastify con Fetch
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Si el backend responde con error (ej. 401 Credenciales inválidas)
        throw new Error(data.error || "Error al iniciar sesión");
      }

      // 4. Guardamos el Token JWT en el navegador
      // localStorage guarda el token incluso si el usuario cierra la pestaña
      localStorage.setItem("token", data.token);
      
      // Prueba de Funcionamiento
      //alert(`¡Bienvenido ${data.user.email}! Token guardado.`);
      navigate("/dashboard");
      

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false); // Apagamos el estado de carga sin importar si falló o fue exitoso
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Bienvenido</CardTitle>
          <CardDescription className="text-center">
            Ingresa tus credenciales para acceder a tus tareas
          </CardDescription>
        </CardHeader>
        
        {/* Usamos onSubmit en un formulario real para permitir enviar con la tecla 'Enter' */}
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {/* Mensaje de error visual */}
            {error && (
              <div className="bg-red-100 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@miprueba.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Cargando..." : "Iniciar Sesión"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}