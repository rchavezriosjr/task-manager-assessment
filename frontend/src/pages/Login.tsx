import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function Login() {
  // 1. React state hooks to store what the user types
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // State for user experience (UX)
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Hook to redirect to other pages
  const navigate = useNavigate();

  // 2. Function that runs when the form is submitted
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents the page from reloading
    setError("");
    setIsLoading(true);

    try {
      // 3. Consuming Fastify API with Fetch
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If the backend responds with an error (e.g. 401 invalid credentials)
        throw new Error(data.error || "Error logging in");
      }

      // 4. Save the JWT token in the browser
      // localStorage keeps the token even if the user closes the tab
      localStorage.setItem("token", data.token);

      //localStorage keeps the role and email for easy access across the app (optional, since we can decode the token)
      localStorage.setItem("email", data.user.email);
      localStorage.setItem("role", data.user.role);

      // Test route
      //alert(`Welcome ${data.user.email}! Token saved.`);
      navigate("/dashboard");
      

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false); // Turn off loading state regardless of success or failure
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Welcome</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your tasks
          </CardDescription>
        </CardHeader>
        
        {/* We use onSubmit on a real form to allow submitting with the 'Enter' key */}
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {/* Visual error message */}
            {error && (
              <div className="bg-red-100 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@mytest.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
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
              {isLoading ? "Loading..." : "Log In"}
            </Button>
            <Button type="button" variant="ghost" className="w-full ms-3" onClick={() => navigate("/register")}>
                Don't have an account? Sign Up here
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}