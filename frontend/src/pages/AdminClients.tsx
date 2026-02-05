import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/Sidebar";

interface Client {
  name: string;
  email: string;
  phone: string;
}

interface Reservation {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export function AdminClients() {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 10;

  const fetchClients = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/admin/reservations");
      const data: Reservation[] = await res.json();

      const uniqueClientsMap = new Map<string, Client>();
      data.forEach((r) => {
        if (!uniqueClientsMap.has(r.email)) {
          uniqueClientsMap.set(r.email, {
            name: r.name,
            email: r.email,
            phone: r.phone,
          });
        }
      });
      setClients(Array.from(uniqueClientsMap.values()));
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const indexOfLast = currentPage * clientsPerPage;
  const indexOfFirst = indexOfLast - clientsPerPage;
  const currentClients = filteredClients.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar active="clients" />

      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Liste des Clients</h1>

        <div className="flex flex-col md:flex-row gap-3 mb-4 justify-between">
          <Input
            placeholder="Recherche par nom ou email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:max-w-xs"
          />
        </div>

        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Téléphone</th>
              </tr>
            </thead>
            <tbody>
              {currentClients.map((client) => (
                <tr key={client.email} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{client.name}</td>
                  <td className="px-4 py-3">{client.email}</td>
                  <td className="px-4 py-3">{client.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Précédent
            </Button>
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                className={currentPage === i + 1 ? "bg-blue-500 text-white" : ""}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Suivant
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
