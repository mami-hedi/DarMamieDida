import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Room } from "@/data/rooms";
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css'; // styles par défaut
import { PhoneField } from "@/components/PhoneField";


interface ReservationModalProps {
  room: Room;
  children: React.ReactNode;
}

export function ReservationModal({ room, children }: ReservationModalProps) {
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
const today = new Date();
today.setHours(0, 0, 0, 0);

  const [checkinDate, setCheckinDate] = useState<Date | null>(null);
  const [checkoutDate, setCheckoutDate] = useState<Date | null>(null);

  const [availability, setAvailability] = useState<string[]>([]);

  const [nights, setNights] = useState(0);
  const [total, setTotal] = useState(0);

  // Charger les dates depuis l’URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const checkin = params.get("checkin");
    const checkout = params.get("checkout");

    if (checkin) setCheckinDate(new Date(checkin));
    if (checkout) setCheckoutDate(new Date(checkout));
  }, []);

  // Charger dates réservées
  useEffect(() => {
  fetch(`http://localhost:3000/api/reservations/days/${room.id}`)
    .then((res) => res.json())
    .then((data) => setAvailability(data.reservedDays))
    .catch(console.error);
}, [room.id]);


  // Calcul automatique du nombre de nuits
  useEffect(() => {
    if (checkinDate && checkoutDate) {
      const diff =
        (checkoutDate.getTime() - checkinDate.getTime()) /
        (1000 * 60 * 60 * 24);

      setNights(diff > 0 ? diff : 0);
    }
  }, [checkinDate, checkoutDate]);

  // Calcul du total
  useEffect(() => {
    setTotal(nights * room.price);
  }, [nights, room.price]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const formatDateLocal = (date: Date) => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const d = date.getDate().toString().padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const isDayAvailable = (date: Date) => {
  const str = formatDateLocal(date);
  return !availability.includes(str);
};

const dayClassName = (date: Date) => {
  const str = formatDateLocal(date);
  return availability.includes(str)
    ? "bg-red-200 text-red-800 rounded-full"
    : "bg-green-200 text-green-800 rounded-full";
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validation stricte du téléphone
  if (!formData.phone || /^\+\d{1,4}$/.test(formData.phone)) {
    toast({
      title: "Numéro invalide",
      description: "Le téléphone ne peut pas être vide ni contenir seulement l'indicatif.",
      variant: "destructive",
    });
    return; // Arrête la soumission
  }


    if (!checkinDate || !checkoutDate) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une date d'arrivée et de départ.",
        variant: "destructive",
      });
      return;
    }

    if (checkoutDate <= checkinDate) {
      toast({
        title: "Erreur",
        description: "La date de départ doit être après la date d'arrivée.",
        variant: "destructive",
      });
      return;
    }

    const todayCheck = new Date();
todayCheck.setHours(0, 0, 0, 0);

if (checkinDate < todayCheck) {
  toast({
    title: "Date invalide",
    description: "La date d'arrivée ne peut pas être dans le passé.",
    variant: "destructive",
  });
  return;
}


    setIsSubmitting(true);

    const checkin = formatDateLocal(checkinDate);
    const checkout = formatDateLocal(checkoutDate);

    try {
      const res = await fetch("http://localhost:3000/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: room.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          checkin,
          checkout,
          nights,
          total,
          message: formData.message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Erreur",
          description: data.error || "Impossible d'enregistrer la réservation.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      toast({
        title: "Réservation enregistrée",
        description: `Votre séjour du ${checkin} au ${checkout} (${nights} nuits) est confirmé.`,
      });

      setFormData({ name: "", email: "", phone: "", message: "" });
      setCheckinDate(null);
      setCheckoutDate(null);
      setOpen(false);
    } catch (err) {
      toast({
        title: "Erreur serveur",
        description: "Le serveur ne répond pas.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Réserver la chambre{" "}
            <span className="text-primary">{room.name}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informations chambre */}
          <div className="bg-secondary/50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-body text-sm text-muted-foreground">
                  Prix par nuit
                </p>
                <p className="font-display text-2xl font-bold text-primary">
                  {room.price}Dinars
                </p>
              </div>
              <div className="text-right">
                <p className="font-body text-sm text-muted-foreground">
                  Capacité
                </p>
                <p className="font-body font-medium">
                  {room.capacity} pers. • {room.size}m²
                </p>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div>
            <Label>Nom complet *</Label>
            <Input name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
  <div>
    <Label>Email *</Label>
    <Input
      name="email"
      type="email"
      value={formData.email}
      onChange={handleChange}
      required
    />
  </div>

  <div>
  <Label>Téléphone *</Label>
  <PhoneField
  value={formData.phone}
  onChange={(val) => setFormData({ ...formData, phone: val })}
  onInvalid={() =>
    toast({
      title: "Numéro invalide",
      description: "Le téléphone ne peut pas être vide ni contenir seulement l'indicatif.",
      variant: "destructive",
    })
  }
/>


</div>

</div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Arrivée *</Label>
              <DatePicker
  selected={checkinDate}
  onChange={(date) => setCheckinDate(date)}
  dateFormat="yyyy-MM-dd"
  dayClassName={dayClassName}
  filterDate={(date) =>
    date >= today && isDayAvailable(date)
  }
  placeholderText="YYYY-MM-DD"
  required
/>

            </div>

            <div>
              <Label>Départ *</Label>
              <DatePicker
  selected={checkoutDate}
  onChange={(date) => setCheckoutDate(date)}
  dateFormat="yyyy-MM-dd"
  dayClassName={dayClassName}
  filterDate={(date) =>
    date >= today &&
    isDayAvailable(date) &&
    (checkinDate ? date > checkinDate : true)
  }
  placeholderText="YYYY-MM-DD"
  required
/>

            </div>
          </div>

          {/* 🔥 Calcul automatique */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nombre de nuits</Label>
              <Input value={nights} readOnly className="bg-gray-100 font-bold" />
            </div>
            <div>
              <Label>Total à payer</Label>
              <Input value={total + ' Dinars'} readOnly className="bg-gray-100 font-bold" />
            </div>
          </div>

          <div>
            <Label>Message (optionnel)</Label>
            <Textarea name="message" value={formData.message} onChange={handleChange} />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Enregistrement..." : "Confirmer la réservation"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
