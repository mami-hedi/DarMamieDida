import 'dotenv/config';
import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const DISABLE_EMAIL = process.env.DISABLE_EMAIL === "true";

export async function sendReservationEmail(reservation: {
  name: string;
  email: string;
  room_name: string;
  checkin: string;
  checkout: string;
  total: number;
}) {
  try {
    // 🔕 EMAIL DÉSACTIVÉ
    if (DISABLE_EMAIL) {
      console.log("📧 Envoi email désactivé (mode dev)");
      console.log("➡️ Réservation :", reservation);
      return { disabled: true };
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Dar Mamie Dida" <${EMAIL_USER}>`,
      to: reservation.email,
      subject: `Confirmation de réservation - ${reservation.room_name}`,
      html: `
        <h2>Bonjour ${reservation.name},</h2>
        <p>Merci pour votre réservation à <strong>Dar Mamie Dida</strong> !</p>
        <p><strong>Chambre :</strong> ${reservation.room_name}</p>
        <p><strong>Arrivée :</strong> ${reservation.checkin}</p>
        <p><strong>Départ :</strong> ${reservation.checkout}</p>
        <p><strong>Total :</strong> ${reservation.total} DT</p>
        <p>— Dar Mamie Dida</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email envoyé :", info.response);
    return info;

  } catch (error) {
    console.error("❌ Erreur email :", error);
    return { error: true };
  }
}
