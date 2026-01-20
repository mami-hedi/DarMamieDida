import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // 👇 Identifiants admin (à remplacer par tes identifiants sécurisés)
  const ADMIN_USERNAME = "mhadmin"; 
  const ADMIN_PASSWORD = "123456789@@!"; 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem("admin_logged_in", "true"); // token simple
      navigate("/admin/reservations");
    } else {
      toast({
        title: "Erreur",
        description: "Nom d'utilisateur ou mot de passe incorrect",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Connexion Administrateur</h2>

        <div>
          <label className="block mb-1 text-sm font-medium">Nom d'utilisateur</label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>

        <div className="relative">
          <label className="block mb-1 text-sm font-medium">Mot de passe</label>
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-500"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <Button type="submit" className="w-full">Se connecter</Button>
      </form>
    </div>
  );
}
