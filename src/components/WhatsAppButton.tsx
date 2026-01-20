// src/components/WhatsAppButton.tsx
import { FaWhatsapp } from "react-icons/fa";

interface WhatsAppButtonProps {
  number?: string; // Numéro WhatsApp
  message?: string; // Message par défaut
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  number = "+21658146177", // ton numéro
  message = "Bonjour, je souhaite vous contacter !",
}) => {
  const link = `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      title="Contactez-nous sur WhatsApp"
    >
      <FaWhatsapp className="text-white w-7 h-7" />
    </a>
  );
};

export default WhatsAppButton;
