import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "PENDING" | "COMPLETED";
  userEmail?: string; // Optional, only for admins
}

export function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // For resetting the cache
  
  const userRole= localStorage.getItem("role")||"USER"; // Get the user role from localStorage (optional, since we can decode the token)
  const userLoggedEmail = localStorage.getItem("email")||"";

  // Local state (filter, pagination and form)
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "COMPLETED">("ALL");
  const [page, setPage] = useState(1);
  const limit = 3; // We'll show 3 tasks per page
  
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const token = localStorage.getItem("token");

  // 1. USE QUERY: Fetch tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", filter, page],
    queryFn: async () => {
      if (!token) {
        navigate("/login");
        throw new Error("No token");
      }
      
      let url = `http://localhost:3000/api/tasks?page=${page}&limit=${limit}`;
      if (filter !== "ALL") url += `&status=${filter}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error("Error fetching tasks");
      const result = await response.json();
      return result.data as Task[];
    },
    enabled: !!token, // Only run if there is a token
  });

  // 2. CUD (Crear, Actualizar, Borrar)
  // useMutation maneja las acciones que modifican datos en el servidor
  const createTaskMutation = useMutation({
    mutationFn: async (newTask: { title: string, description: string }) => {
      const res = await fetch("http://localhost:3000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newTask),
      });
      if (!res.ok) throw new Error("Error creating task");
    },
    onSuccess: () => {
      setNewTitle("");
      setNewDescription("");
      // Tell React Query: "Data is stale, refetch tasks"
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (task: Task) => {
      const newStatus = task.status === "PENDING" ? "COMPLETED" : "PENDING";
      const res = await fetch(`http://localhost:3000/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Error updating task status");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] })
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`http://localhost:3000/api/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error deleting task");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] })
  });

  // Handlers de los botones
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle) createTaskMutation.mutate({ title: newTitle, description: newDescription });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <header className="flex justify-between items-center mb-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold">My Tasks ({userLoggedEmail})</h1>
        <Button variant="outline" onClick={handleLogout}>Log Out</Button>
      </header>

      <main className="max-w-5xl mx-auto space-y-6">
        
        {/* Formulario Crear */}
        <form onSubmit={handleCreateTask} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-card">
          <Input placeholder="Title" maxLength={250} minLength={3} required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="flex-1" />
          <Input placeholder="Description (optional)" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="flex-1" />
          <Button type="submit" disabled={createTaskMutation.isPending}>
            <Plus className="w-4 h-4 mr-2" /> 
            {createTaskMutation.isPending ? "Adding..." : "Add"}
          </Button>
        </form>

        {/* Filtros */}
        <div className="flex gap-2">
          {["ALL", "PENDING", "COMPLETED"].map((f) => (
            <Button 
              key={f}
              variant={filter === f ? "default" : "outline"} 
              onClick={() => { setFilter(f as any); setPage(1); }} // Reset to page 1 when filtering
              size="sm"
            >
              {f === "ALL" ? "All" : f === "PENDING" ? "Pending" : "Completed"}
            </Button>
          ))}
        </div>

        {/* Tabla */}
        <div className="border rounded-lg bg-card overflow-hidden">
          {isLoading ? (
            <p className="p-8 text-center text-muted-foreground">Loading...</p>
          ) : tasks.length === 0 && page === 1 ? (
            <p className="p-8 text-center text-muted-foreground">No tasks available.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    {userRole === "ADMIN" && <TableHead>Owner</TableHead>}
                    <TableHead className="text-right">Actions</TableHead>
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
                        <Badge variant={task.status === "COMPLETED" ? "default" : "secondary"}>{task.status}</Badge>
                      </TableCell>
                      {userRole === "ADMIN" && (
                        <TableCell className="text-muted-foreground text-sm font-medium">
                          {task.userEmail}
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => toggleStatusMutation.mutate(task)}>
                          <Check className={`w-4 h-4 ${task.status === "COMPLETED" ? "text-green-500" : "text-gray-400"}`} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => window.confirm("¿Borrar?") && deleteTaskMutation.mutate(task.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Controles de Paginación */}
              <div className="flex items-center justify-between p-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <span className="text-sm text-muted-foreground">Page {page}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => p + 1)}
                  disabled={tasks.length < limit} // If fewer tasks than the limit arrived, we are on the last page
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}