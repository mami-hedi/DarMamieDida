// pages/AdminTarifs.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sidebar } from "@/components/Sidebar";
import { FaEdit, FaTrash } from "react-icons/fa";

interface Room {
  id: number;
  slug: string;
  price: number | null;
  translations?: {
    fr?: {
      name?: string;
    };
  };
}

export function AdminTarifs() {
  const { toast } = useToast();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const [nameFr, setNameFr] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState<number>(0);

  // ======================
  // Fetch rooms
  // ======================
  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/admin/rooms");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRooms(data);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de charger les chambres",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // ======================
  // Open form
  // ======================
  const openForm = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setSlug(room.slug);
      setPrice(Number(room.price) || 0);
      setNameFr(room.translations?.fr?.name || "");
    } else {
      setEditingRoom(null);
      setSlug("");
      setPrice(0);
      setNameFr("");
    }
    setFormOpen(true);
  };

  // ======================
  // Save (CREATE / UPDATE)
  // ======================
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingRoom
        ? `http://localhost:3000/api/admin/rooms/${editingRoom.id}`
        : "http://localhost:3000/api/admin/rooms";

      const method = editingRoom ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          price,
          translations: {
            fr: {
              name: nameFr,
              shortDescription: "",
              fullDescription: "",
              amenities: [],
            },
            en: {
              name: "",
              shortDescription: "",
              fullDescription: "",
              amenities: [],
            },
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur serveur");
      }

      toast({
        title: "Succès",
        description: editingRoom
          ? "Chambre modifiée"
          : "Chambre ajoutée",
      });

      setFormOpen(false);
      fetchRooms();
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // ======================
  // Delete
  // ======================
  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette chambre ?")) return;

    try {
      const res = await fetch(
        `http://localhost:3000/api/admin/rooms/${id}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error();

      toast({
        title: "Succès",
        description: "Chambre supprimée",
      });

      fetchRooms();
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer",
        variant: "destructive",
      });
    }
  };

  // ======================
  // UI
  // ======================
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar active="tarifs" />

      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8">
        <h1 className="text-3xl font-bold text-center mb-6">
          Gestion des chambres
        </h1>

        <div className="flex justify-end mb-4">
          <Button onClick={() => openForm()}>
            + Ajouter une chambre
          </Button>
        </div>

        {loading ? (
          <p className="text-center">Chargement...</p>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Nom</th>
                  <th className="px-4 py-3 text-left">Slug</th>
                  <th className="px-4 py-3 text-center">Prix (DT)</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id} className="border-t">
                    <td className="px-4 py-3">
                      {room.translations?.fr?.name || "-"}
                    </td>
                    <td className="px-4 py-3">{room.slug}</td>
                    <td className="px-4 py-3 text-center">
                      {room.price ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openForm(room)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(room.id)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MODAL */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingRoom ? "Modifier la chambre" : "Ajouter une chambre"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label>Nom (FR)</Label>
                <Input
                  value={nameFr}
                  onChange={(e) => setNameFr(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>Slug</Label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>Prix (DT)</Label>
                <Input
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                {editingRoom ? "Modifier" : "Ajouter"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
