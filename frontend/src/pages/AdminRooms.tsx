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
  is_active: number; 
  created_at?: string;
}

interface GalleryImage {
  id: number;
  url: string;
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
  const [isActiveInput, setIsActiveInput] = useState(true);


  const [capacityInput, setCapacityInput] = useState(1);
  const [imageInput, setImageInput] = useState<File | null>(null);

  // 🔹 Galerie
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState<FileList | null>(null);

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

  // 🔹 Fetch galerie
  const fetchGallery = async (roomId: number) => {
    try {
      const res = await fetch(`http://localhost:3000/api/admin/gallery/${roomId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGallery(data);
    } catch (err) {
      console.error(err);
      setGallery([]);
    }
  };

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
      setIsActiveInput(room.is_active === 1);
      setImageInput(null); // ⚠️ jamais pré-remplir input file
      fetchGallery(room.id);
    } else {
      setEditingRoom(null);
      setNameInput("");
      setDescriptionInput("");
      setSlugInput("");
      setPriceInput(0);
      setSizeInput(0);
      setCapacityInput(1);
      setIsActiveInput(true); // 👈 actif par défaut
      setImageInput(null);
      setGallery([]);
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
    formData.append("is_active", isActiveInput ? "1" : "0"); // ✅ ICI

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




  // 🔹 Upload nouvelles images de galerie
  const handleUploadGallery = async () => {
    if (!editingRoom || !newGalleryFiles) return;
    const formData = new FormData();
    Array.from(newGalleryFiles).forEach((f) => formData.append("images", f));
    try {
      const res = await fetch(
        `http://localhost:3000/api/admin/gallery/${editingRoom.id}`,
        { method: "POST", body: formData }
      );
      if (!res.ok) throw new Error();
      fetchGallery(editingRoom.id);
      setNewGalleryFiles(null);
      toast({ title: "Succès", description: "Galerie mise à jour" });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };
 

  // 🔹 Supprimer image galerie
  const handleDeleteGallery = async (id: number) => {
    try {
      await fetch(`http://localhost:3000/api/admin/gallery/${id}`, { method: "DELETE" });
      if (editingRoom) fetchGallery(editingRoom.id);
      toast({ title: "Succès", description: "Image supprimée" });
    } catch {
      toast({ title: "Erreur", description: "Suppression impossible", variant: "destructive" });
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
          <Button onClick={() => openForm()}>+ Ajouter une chambre</Button>
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
                  <th className="px-4 py-3">Surface (m²)</th>
                  <th className="px-4 py-3">État</th>
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
                    <td className="px-4 py-3">{room.size} m²</td>
                    <td className="px-4 py-3">
  {room.is_active === 1 ? (
    <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
      Active
    </span>
  ) : (
    <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">
      Désactivée
    </span>
  )}
</td>

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
              <div>
    <Label>Surface (m²) *</Label>
    <Input
      type="number"
      value={sizeInput}
      onChange={(e) => setSizeInput(+e.target.value)}
      required
    />
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
                    if (e.target.files?.[0]) setImageInput(e.target.files[0]);
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

              {/* 🔹 Galerie */}
              <div className="mt-4">
                <Label>Galerie</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {gallery.map((img) => (
                    <div key={img.id} className="relative">
                      <img
                        src={`http://localhost:3000${img.url}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-500 text-white px-1 rounded"
                        onClick={() => handleDeleteGallery(img.id)}
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>

                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  className="mt-2"
                  onChange={(e) => setNewGalleryFiles(e.target.files)}
                />

                <Button onClick={handleUploadGallery} className="mt-2">
                  Ajouter à la galerie
                </Button>
              </div>

              <div className="flex items-center gap-3">
  <Label>État de la chambre</Label>

  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={isActiveInput}
      onChange={(e) => setIsActiveInput(e.target.checked)}
      className="accent-green-600"
    />
    <span className={isActiveInput ? "text-green-600" : "text-red-600"}>
      {isActiveInput ? "Activée" : "Désactivée"}
    </span>
  </label>
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
