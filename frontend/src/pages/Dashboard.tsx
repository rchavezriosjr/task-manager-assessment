import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Trash2, Plus } from "lucide-react"; // Importamos íconos
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "PENDING" | "COMPLETED";
}

export function Dashboard() {
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "COMPLETED">("ALL");
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para crear una nueva tarea
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // 1. OBTENER TAREAS
  const fetchTasks = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    setIsLoading(true);
    try {
      let url = "http://localhost:3000/api/tasks";
      if (filter !== "ALL") {
        url += `?status=${filter}`;
      }

      const response = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setTasks(result.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [navigate, filter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // 2. CREAR TAREA 
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:3000/api/tasks", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ title: newTitle, description: newDescription }),
      });

      if (response.ok) {
        setNewTitle("");
        setNewDescription("");
        fetchTasks(); // Recargamos la lista para ver la nueva tarea
      }
    } catch (error) {
      console.error("Error al crear tarea", error);
    }
  };

  // 3. ACTUALIZAR ESTADO
  const handleToggleStatus = async (task: Task) => {
    const token = localStorage.getItem("token");
    const newStatus = task.status === "PENDING" ? "COMPLETED" : "PENDING";

    try {
      const response = await fetch(`http://localhost:3000/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchTasks(); // Recargamos la lista para ver el cambio de color
      }
    } catch (error) {
      console.error("Error al actualizar tarea", error);
    }
  };

  // 4. BORRAR TAREA
  const handleDeleteTask = async (id: string) => {
    // Pequeña confirmación por UX
    if (!window.confirm("¿Estás seguro de borrar esta tarea?")) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:3000/api/tasks/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (response.ok) {
        fetchTasks(); // Recargamos la lista para que desaparezca
      }
    } catch (error) {
      console.error("Error al borrar tarea", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <header className="flex justify-between items-center mb-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold">Mis Tareas</h1>
        <Button variant="outline" onClick={handleLogout}>Cerrar Sesión</Button>
      </header>

      <main className="max-w-5xl mx-auto space-y-6">
        
        {/* Formulario para Crear Tarea */}
        <form onSubmit={handleCreateTask} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-card">
          <Input 
            placeholder="¿Qué necesitas hacer? (Título)" 
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full sm:w-auto sm:flex-1"
          />
          <Input 
            placeholder="Detalles (opcional)" 
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="w-full sm:w-auto sm:flex-1"
          />
          <Button type="submit" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" /> Agregar
          </Button>
        </form>

        {/* Filtros de Estado */}
        <div className="flex gap-2">
          <Button 
            variant={filter === "ALL" ? "default" : "outline"} 
            onClick={() => setFilter("ALL")}
            size="sm"
          >
            Todas
          </Button>
          <Button 
            variant={filter === "PENDING" ? "default" : "outline"} 
            onClick={() => setFilter("PENDING")}
            size="sm"
          >
            Pendientes
          </Button>
          <Button 
            variant={filter === "COMPLETED" ? "default" : "outline"} 
            onClick={() => setFilter("COMPLETED")}
            size="sm"
          >
            Completadas
          </Button>
        </div>

        {/* Tabla de Tareas */}
        <div className="border rounded-lg bg-card overflow-hidden">
          {isLoading ? (
            <p className="p-8 text-center text-muted-foreground">Cargando...</p>
          ) : tasks.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">¡Todo al día! No hay tareas pendientes.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className={`font-medium ${task.status === "COMPLETED" ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{task.description}</TableCell>
                    <TableCell>
                      <Badge variant={task.status === "COMPLETED" ? "default" : "secondary"}>
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Botón Completar/Pendiente */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Marcar como completada/pendiente"
                        onClick={() => handleToggleStatus(task)}
                      >
                        <Check className={`w-4 h-4 ${task.status === "COMPLETED" ? "text-green-500" : "text-gray-400"}`} />
                      </Button>
                      
                      {/* Botón Borrar */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Borrar tarea"
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
}