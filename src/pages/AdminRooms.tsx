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
import { Textarea } from "@/components/ui/textarea";
import { Sidebar } from "@/components/Sidebar";

interface Room {
  id: number;
  name: string;
  description: string;
  slug: string;
  price: number;
  size: number;
  capacity: number;
  image?: string;
  created_at?: string;
}

export function AdminRooms() {
  const { toast } = useToast();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // 🔹 Form states
  const [nameInput, setNameInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [slugInput, setSlugInput] = useState("");
  const [priceInput, setPriceInput] = useState(0);
  const [sizeInput, setSizeInput] = useState(0);
  const [capacityInput, setCapacityInput] = useState(1);
  const [imageInput, setImageInput] = useState<File | null>(null);

  // 🔹 Fetch rooms
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

  // 🔹 Open form
  const openForm = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setNameInput(room.name);
      setDescriptionInput(room.description || "");
      setSlugInput(room.slug);
      setPriceInput(room.price);
      setSizeInput(room.size);
      setCapacityInput(room.capacity);
      setImageInput(null); // ⚠️ jamais pré-remplir input file
    } else {
      setEditingRoom(null);
      setNameInput("");
      setDescriptionInput("");
      setSlugInput("");
      setPriceInput(0);
      setSizeInput(0);
      setCapacityInput(1);
      setImageInput(null);
    }
    setFormOpen(true);
  };

  // 🔹 Save room (CREATE / UPDATE)
  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingRoom
        ? `http://localhost:3000/api/admin/rooms/${editingRoom.id}`
        : "http://localhost:3000/api/admin/rooms";

      const method = editingRoom ? "PUT" : "POST";

      const formData = new FormData();
      formData.append("name", nameInput);
      formData.append("description", descriptionInput);
      formData.append("slug", slugInput);
      formData.append("price", String(priceInput));
      formData.append("size", String(sizeInput));
      formData.append("capacity", String(capacityInput));

      if (imageInput) {
        formData.append("image", imageInput);
      }

      const res = await fetch(url, {
        method,
        body: formData,
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
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // 🔹 Delete room
  const handleDeleteRoom = async (id: number) => {
    if (!confirm("Supprimer cette chambre ?")) return;

    try {
      const res = await fetch(
        `http://localhost:3000/api/admin/rooms/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      toast({ title: "Succès", description: "Chambre supprimée" });
      fetchRooms();
    } catch {
      toast({
        title: "Erreur",
        description: "Suppression impossible",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar active="rooms" />

      <main className="flex-1 p-6 pt-20 md:pt-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Gestion des Chambres
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
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Nom</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Prix</th>
                  <th className="px-4 py-3">Capacité</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id} className="border-t">
                    <td className="px-4 py-3">
                      {room.image ? (
                        <img
                          src={`http://localhost:3000${room.image}`}
                          alt={room.name}
                          className="h-12 w-20 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{room.name}</td>
                    <td className="px-4 py-3">{room.slug}</td>
                    <td className="px-4 py-3">{room.price} DT</td>
                    <td className="px-4 py-3">{room.capacity}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openForm(room)}
                      >
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteRoom(room.id)}
                      >
                        Supprimer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 🔹 FORM */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
         <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">


            <DialogHeader>
              <DialogTitle>
                {editingRoom ? "Modifier la chambre" : "Ajouter une chambre"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSaveRoom} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                <div>
                <Label>Nom *</Label>
                <Input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  required
                />
              </div>
                <div>
                
                <Label>Slug *</Label>
                <Input
                  value={slugInput}
                  onChange={(e) => setSlugInput(e.target.value)}
                  required
                />
              </div>
              </div>
              

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prix *</Label>
                  <Input
                    type="number"
                    value={priceInput}
                    onChange={(e) => setPriceInput(+e.target.value)}
                  />
                </div>
                <div>
                  <Label>Capacité *</Label>
                  <Input
                    type="number"
                    value={capacityInput}
                    onChange={(e) => setCapacityInput(+e.target.value)}
                  />
                </div>
              </div>

              {/* 🔹 Image actuelle */}
              {editingRoom?.image && (
                <div>
                  <Label>Image actuelle</Label>
                  <img
                    src={`http://localhost:3000${editingRoom.image}`}
                    alt="Image actuelle"
                    className="mt-2 h-32 w-3/4 object-cover rounded-lg border"
                  />
                </div>
              )}

              <div>
                <Label>Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setImageInput(e.target.files[0]);
                    }
                  }}
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormOpen(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button type="submit" className="flex-1">
                  Enregistrer
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
