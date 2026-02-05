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
   
   const BACKEND_URL = import.meta.env.VITE_API_URL || "https://darmamiedida.onrender.com";

  const [capacityInput, setCapacityInput] = useState(1);
  const [imageInput, setImageInput] = useState<File | null>(null);

  // 🔹 Galerie
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState<FileList | null>(null);

 // 🔹 Fetch rooms
const fetchRooms = async () => {
  setLoading(true);
  try {
    // ✅ Utilisation des backticks ` ` pour injecter la variable BACKEND_URL
    const res = await fetch(`${BACKEND_URL}/api/admin/rooms`);
    
    if (!res.ok) throw new Error("Erreur réseau");
    
    const data = await res.json();
    setRooms(data);
  } catch (error) {
    toast({
      title: "Erreur",
      description: "Impossible de charger les chambres depuis le serveur Render",
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
    // ✅ Utilisation des backticks ` ` pour que ${} fonctionne
    const res = await fetch(`${BACKEND_URL}/api/admin/gallery/${roomId}`);
    
    if (!res.ok) throw new Error("Erreur lors du chargement de la galerie");
    
    const data = await res.json();
    setGallery(data);
  } catch (err) {
    console.error("Erreur galerie:", err);
    setGallery([]);
    toast({
      title: "Galerie",
      description: "Impossible de charger les images de la galerie.",
      variant: "destructive",
    });
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
  // 🔹 Save room (CREATE / UPDATE)
const handleSaveRoom = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    // ✅ Utilisation impérative des backticks ` ` pour interpréter les variables
    const url = editingRoom
      ? `${BACKEND_URL}/api/admin/rooms/${editingRoom.id}`
      : `${BACKEND_URL}/api/admin/rooms`;

    const method = editingRoom ? "PUT" : "POST";

    const formData = new FormData();
    formData.append("name", nameInput);
    formData.append("description", descriptionInput);
    formData.append("slug", slugInput);
    formData.append("price", String(priceInput));
    formData.append("size", String(sizeInput));
    formData.append("capacity", String(capacityInput));
    formData.append("is_active", isActiveInput ? "1" : "0");

    if (imageInput) {
      formData.append("image", imageInput);
    }

    const res = await fetch(url, {
      method,
      body: formData, // Pas besoin de headers "Content-Type", le navigateur le fait seul pour FormData
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Erreur serveur");
    }

    toast({
      title: "Succès",
      description: editingRoom ? "Chambre modifiée" : "Chambre ajoutée",
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
  if (!confirm("Voulez-vous vraiment supprimer cette chambre ? Cette action est irréversible.")) return;

  try {
    // ✅ Utilisation des BACKTICKS (touches AltGr + 7 ou touche sous Échap)
    const res = await fetch(
      `${BACKEND_URL}/api/admin/rooms/${id}`, 
      { method: "DELETE" }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Erreur lors de la suppression");
    }

    toast({ title: "Succès", description: "Chambre supprimée avec succès" });
    fetchRooms(); // Rafraîchit la liste
  } catch (error: any) {
    toast({
      title: "Erreur",
      description: error.message || "Suppression impossible",
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
    // ✅ Utilisation de BACKEND_URL pour le serveur Render
    const res = await fetch(
      `${BACKEND_URL}/api/admin/gallery/${editingRoom.id}`,
      { 
        method: "POST", 
        body: formData 
      }
    );
    
    if (!res.ok) throw new Error("Erreur lors de l'envoi des images");
    
    fetchGallery(editingRoom.id);
    setNewGalleryFiles(null);
    
    // On réinitialise l'input file visuellement
    const fileInput = document.querySelector('input[type="file"][multiple]') as HTMLInputElement;
    if (fileInput) fileInput.value = "";

    toast({ title: "Succès", description: "Galerie mise à jour" });
  } catch (err: any) {
    toast({ 
      title: "Erreur", 
      description: err.message || "Impossible d'uploader les images", 
      variant: "destructive" 
    });
  }
};
 

  // 🔹 Supprimer image galerie
const handleDeleteGallery = async (id: number) => {
  if (!confirm("Voulez-vous vraiment supprimer cette image de la galerie ?")) return;

  try {
    // ✅ Utilisation de BACKEND_URL pour Render
    const res = await fetch(`${BACKEND_URL}/api/admin/gallery/${id}`, { 
      method: "DELETE" 
    });

    if (!res.ok) throw new Error("Erreur lors de la suppression");

    // Rafraîchir la galerie si on est toujours sur la même chambre
    if (editingRoom) {
      fetchGallery(editingRoom.id);
    }

    toast({ 
      title: "Succès", 
      description: "Image supprimée avec succès" 
    });
  } catch (err) {
    toast({ 
      title: "Erreur", 
      description: "Impossible de supprimer l'image du serveur", 
      variant: "destructive" 
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
                        /* ✅ CORRECTION : URL Render au lieu de localhost */
                        src={`${BACKEND_URL}${room.image}`}
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
                      <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">Active</span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">Désactivée</span>
                    )}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openForm(room)}>Modifier</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteRoom(room.id)}>Supprimer</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRoom ? "Modifier la chambre" : "Ajouter une chambre"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveRoom} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nom *</Label>
                <Input value={nameInput} onChange={(e) => setNameInput(e.target.value)} required />
              </div>
              <div>
                <Label>Slug *</Label>
                <Input value={slugInput} onChange={(e) => setSlugInput(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prix *</Label>
                <Input type="number" value={priceInput} onChange={(e) => setPriceInput(+e.target.value)} />
              </div>
              <div>
                <Label>Capacité *</Label>
                <Input type="number" value={capacityInput} onChange={(e) => setCapacityInput(+e.target.value)} />
              </div>
            </div>

            <div>
              <Label>Surface (m²) *</Label>
              <Input type="number" value={sizeInput} onChange={(e) => setSizeInput(+e.target.value)} required />
            </div>

            {editingRoom?.image && (
              <div>
                <Label>Image principale actuelle</Label>
                <img src={`${BACKEND_URL}${editingRoom.image}`} className="mt-2 h-32 w-full object-cover rounded-lg border" />
              </div>
            )}

            <div>
              <Label>Nouvelle Image principale</Label>
              <Input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) setImageInput(e.target.files[0]); }} />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea value={descriptionInput} onChange={(e) => setDescriptionInput(e.target.value)} />
            </div>

            {/* ✅ SECTION GALERIE CORRIGÉE */}
            <div className="mt-4 border-t pt-4">
              <Label className="font-bold">Galerie Photos</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {gallery.map((img) => (
                  <div key={img.id} className="relative group">
                    <img src={`${BACKEND_URL}${img.url}`} className="w-full h-24 object-cover rounded border" alt="Galerie" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs hover:bg-red-700"
                      onClick={() => handleDeleteGallery(img.id)}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-3 space-y-2">
                <Input type="file" multiple accept="image/*" onChange={(e) => setNewGalleryFiles(e.target.files)} />
                <Button type="button" variant="secondary" className="w-full" onClick={handleUploadGallery} disabled={!newGalleryFiles}>
                  Uploader vers la galerie
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t pt-4">
              <Label>État de la chambre</Label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isActiveInput} onChange={(e) => setIsActiveInput(e.target.checked)} className="accent-green-600" />
                <span className={isActiveInput ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                  {isActiveInput ? "Activée" : "Désactivée"}
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)} className="flex-1">Annuler</Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">Enregistrer la chambre</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  </div>
);
}
