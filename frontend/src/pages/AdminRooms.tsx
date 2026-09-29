import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sidebar } from "@/components/Sidebar";
import { FaEdit, FaTrash, FaBed, FaPlus } from "react-icons/fa";

const BACKEND_URL = import.meta.env.VITE_API_URL || "https://darmamiedida.onrender.com";

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

  const [rooms,   setRooms]   = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen,     setFormOpen]     = useState(false);
  const [editingRoom,  setEditingRoom]  = useState<Room | null>(null);

  const [nameInput,        setNameInput]        = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [slugInput,        setSlugInput]        = useState("");
  const [priceInput,       setPriceInput]       = useState(0);
  const [sizeInput,        setSizeInput]        = useState(0);
  const [capacityInput,    setCapacityInput]    = useState(1);
  const [isActiveInput,    setIsActiveInput]    = useState(true);
  const [imageInput,       setImageInput]       = useState<File | null>(null);

  const [gallery,         setGallery]         = useState<GalleryImage[]>([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState<FileList | null>(null);

  /* ── Fetch ── */
  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BACKEND_URL}/api/admin/rooms`);
      if (!res.ok) throw new Error();
      setRooms(await res.json());
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les chambres", variant: "destructive" });
    }
    setLoading(false);
  };

  const fetchGallery = async (roomId: number) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/gallery/${roomId}`);
      if (!res.ok) throw new Error();
      setGallery(await res.json());
    } catch { setGallery([]); }
  };

  useEffect(() => { fetchRooms(); }, []);

  /* ── Form ── */
  const openForm = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setNameInput(room.name); setDescriptionInput(room.description || "");
      setSlugInput(room.slug); setPriceInput(room.price);
      setSizeInput(room.size); setCapacityInput(room.capacity);
      setIsActiveInput(room.is_active === 1); setImageInput(null);
      fetchGallery(room.id);
    } else {
      setEditingRoom(null);
      setNameInput(""); setDescriptionInput(""); setSlugInput("");
      setPriceInput(0); setSizeInput(0); setCapacityInput(1);
      setIsActiveInput(true); setImageInput(null); setGallery([]);
    }
    setFormOpen(true);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const url    = editingRoom ? `${BACKEND_URL}/api/admin/rooms/${editingRoom.id}` : `${BACKEND_URL}/api/admin/rooms`;
    const method = editingRoom ? "PUT" : "POST";
    const fd     = new FormData();
    fd.append("name", nameInput); fd.append("description", descriptionInput);
    fd.append("slug", slugInput); fd.append("price", String(priceInput));
    fd.append("size", String(sizeInput)); fd.append("capacity", String(capacityInput));
    fd.append("is_active", isActiveInput ? "1" : "0");
    if (imageInput) fd.append("image", imageInput);
    try {
      const res = await fetch(url, { method, body: fd });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Erreur serveur"); }
      toast({ title: "Succès", description: editingRoom ? "Chambre modifiée" : "Chambre ajoutée" });
      setFormOpen(false); fetchRooms();
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteRoom = async (id: number) => {
    if (!confirm("Supprimer cette chambre ?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/rooms/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: "Succès", description: "Chambre supprimée" });
      fetchRooms();
    } catch {
      toast({ title: "Erreur", description: "Suppression impossible", variant: "destructive" });
    }
  };

  const handleUploadGallery = async () => {
    if (!editingRoom || !newGalleryFiles) return;
    const fd = new FormData();
    Array.from(newGalleryFiles).forEach((f) => fd.append("images", f));
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/gallery/${editingRoom.id}`, { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      fetchGallery(editingRoom.id); setNewGalleryFiles(null);
      const inp = document.querySelector('input[type="file"][multiple]') as HTMLInputElement;
      if (inp) inp.value = "";
      toast({ title: "Succès", description: "Galerie mise à jour" });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteGallery = async (id: number) => {
    if (!confirm("Supprimer cette image ?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/gallery/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      if (editingRoom) fetchGallery(editingRoom.id);
      toast({ title: "Succès", description: "Image supprimée" });
    } catch {
      toast({ title: "Erreur", description: "Suppression impossible", variant: "destructive" });
    }
  };

  /* ── RENDER ── */
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active="rooms" />

      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-x-hidden">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Chambres</h1>
            <p className="text-gray-500 text-sm">Gérez vos hébergements</p>
          </div>
          <Button onClick={() => openForm()} className="gap-2 bg-blue-600 hover:bg-blue-700 text-sm">
            <FaPlus className="size-3" /> Ajouter
          </Button>
        </div>

        {loading && <p className="text-center text-gray-400 py-12">Chargement…</p>}

        {/* ── TABLEAU desktop (md+) ── */}
        {!loading && (
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-[11px] text-gray-400 uppercase font-semibold tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Image</th>
                    <th className="px-4 py-3 text-left">Nom</th>
                    <th className="px-4 py-3 text-left">Slug</th>
                    <th className="px-4 py-3 text-center">Prix</th>
                    <th className="px-4 py-3 text-center">Capacité</th>
                    <th className="px-4 py-3 text-center">Surface</th>
                    <th className="px-4 py-3 text-center">État</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rooms.map((room) => (
                    <tr key={room.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3">
                        {room.image
                          ? <img src={`${BACKEND_URL}${room.image}`} alt={room.name} className="h-12 w-20 object-cover rounded-lg" />
                          : <div className="h-12 w-20 bg-gray-100 rounded-lg flex items-center justify-center"><FaBed className="text-gray-300" /></div>
                        }
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{room.name}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{room.slug}</td>
                      <td className="px-4 py-3 text-center font-bold text-gray-900">{room.price} DT</td>
                      <td className="px-4 py-3 text-center text-gray-600">{room.capacity} pers.</td>
                      <td className="px-4 py-3 text-center text-gray-600">{room.size} m²</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 text-xs rounded-full font-bold ${room.is_active === 1 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                          {room.is_active === 1 ? "Active" : "Désactivée"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openForm(room)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"><FaEdit /></button>
                          <button onClick={() => handleDeleteRoom(room.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"><FaTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rooms.length === 0 && (
                    <tr><td colSpan={8} className="p-10 text-center text-gray-400">Aucune chambre.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CARTES mobile/tablette (<md) ── */}
        {!loading && (
          <div className="md:hidden space-y-3">
            {rooms.length === 0 && (
              <div className="text-center text-gray-400 py-10">Aucune chambre.</div>
            )}
            {rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Image full-width */}
                {room.image
                  ? <img src={`${BACKEND_URL}${room.image}`} alt={room.name} className="w-full h-40 object-cover" />
                  : <div className="w-full h-28 bg-gray-100 flex items-center justify-center"><FaBed className="text-gray-300 text-3xl" /></div>
                }

                <div className="p-4 space-y-3">
                  {/* Nom + état */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-gray-900">{room.name}</p>
                      <p className="text-xs text-gray-400">{room.slug}</p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs rounded-full font-bold flex-shrink-0 ${room.is_active === 1 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {room.is_active === 1 ? "Active" : "Désactivée"}
                    </span>
                  </div>

                  {/* Infos */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 rounded-xl py-2">
                      <p className="font-bold text-gray-900 text-sm">{room.price} DT</p>
                      <p className="text-[10px] text-gray-400">/ nuit</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl py-2">
                      <p className="font-bold text-gray-900 text-sm">{room.capacity}</p>
                      <p className="text-[10px] text-gray-400">pers.</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl py-2">
                      <p className="font-bold text-gray-900 text-sm">{room.size}</p>
                      <p className="text-[10px] text-gray-400">m²</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => openForm(room)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition">
                      <FaEdit size={13} /> Modifier
                    </button>
                    <button onClick={() => handleDeleteRoom(room.id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-500 rounded-xl text-sm font-medium hover:bg-red-100 transition">
                      <FaTrash size={13} /> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── MODAL ── */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="w-[95vw] max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl">
            <DialogHeader>
              <DialogTitle>{editingRoom ? "Modifier la chambre" : "Ajouter une chambre"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSaveRoom} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Nom *</Label>
                  <Input value={nameInput} onChange={(e) => setNameInput(e.target.value)} required />
                </div>
                <div>
                  <Label>Slug *</Label>
                  <Input value={slugInput} onChange={(e) => setSlugInput(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Prix (DT) *</Label>
                  <Input type="number" value={priceInput} onChange={(e) => setPriceInput(+e.target.value)} />
                </div>
                <div>
                  <Label>Capacité *</Label>
                  <Input type="number" value={capacityInput} onChange={(e) => setCapacityInput(+e.target.value)} />
                </div>
              </div>

              <div>
                <Label>Surface (m²)</Label>
                <Input type="number" value={sizeInput} onChange={(e) => setSizeInput(+e.target.value)} />
              </div>

              {editingRoom?.image && (
                <div>
                  <Label>Image actuelle</Label>
                  <img src={`${BACKEND_URL}${editingRoom.image}`} className="mt-2 h-32 w-full object-cover rounded-xl border" alt="Image chambre" />
                </div>
              )}

              <div>
                <Label>Nouvelle image principale</Label>
                <Input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) setImageInput(e.target.files[0]); }} />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea value={descriptionInput} onChange={(e) => setDescriptionInput(e.target.value)} className="resize-none" rows={3} />
              </div>

              {/* Galerie */}
              <div className="border-t pt-4">
                <Label className="font-bold">Galerie Photos</Label>
                {gallery.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {gallery.map((img) => (
                      <div key={img.id} className="relative group">
                        <img src={`${BACKEND_URL}${img.url}`} className="w-full h-24 object-cover rounded-lg border" alt="Galerie" />
                        <button
                          type="button"
                          onClick={() => handleDeleteGallery(img.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] hover:bg-red-700"
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-3 space-y-2">
                  <Input type="file" multiple accept="image/*" onChange={(e) => setNewGalleryFiles(e.target.files)} />
                  <Button type="button" variant="secondary" className="w-full" onClick={handleUploadGallery} disabled={!newGalleryFiles}>
                    Uploader vers la galerie
                  </Button>
                </div>
              </div>

              {/* État */}
              <div className="flex items-center gap-3 border-t pt-4">
                <Label>État de la chambre</Label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isActiveInput} onChange={(e) => setIsActiveInput(e.target.checked)} className="accent-green-600 w-4 h-4" />
                  <span className={isActiveInput ? "text-green-600 font-semibold text-sm" : "text-red-500 font-semibold text-sm"}>
                    {isActiveInput ? "Activée" : "Désactivée"}
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)} className="flex-1">Annuler</Button>
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">Enregistrer</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
