import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import reservationRoutes from "./routes/reservationRoutes";
import adminReservationRoutes from "./routes/adminReservationRoutes";
import roomsRoutes from "./routes/roomsRoutes";
import chatRoutes from "./routes/chatRoutes";
import adminRoomsRouter from "./routes/adminRoomsRoutes";
import adminGalleryRouter from "./routes/adminGalleryRoutes";
import adminCalendarRouter, { initCalendarTables } from "./routes/adminCalendarRoutes";
import adminAuthRouter from "./routes/adminAuth.routes";
import dotenv from "dotenv";
// v2.1.0 — calendar routes + code splitting + auth fix

dotenv.config();

const app = express();
const server = http.createServer(app);

// Liste des origines autorisées
const allowedOrigins = [
  "http://localhost:5173",      // Vite dev (frontend)
  "http://localhost:5174",      // Vite alternative
  "http://localhost:8080",      // Votre config actuelle
  process.env.FRONTEND_URL,     // URL Vercel en production
];

// Configuration Socket.IO avec origines multiples
export const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Autoriser les requêtes sans origine (Postman, curl, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔌 Client connecté", socket.id);
  
  socket.on("disconnect", () => {
    console.log("❌ Client déconnecté", socket.id);
  });
});

// Middlewares CORS pour Express
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use("/uploads", express.static("public/uploads"));

// ── Auth admin ────────────────────────────────────────────────────────────────
app.use("/api/admin/auth", adminAuthRouter);

app.use("/api/admin/rooms", adminRoomsRouter);

app.use("/api/admin/gallery", adminGalleryRouter); // ← route pour gérer galerie

app.use("/api/admin/calendar", adminCalendarRouter); // ← tarifs & blocage de dates

// Routes Front-end client
app.use("/api/reservations", reservationRoutes);

// Routes Back-office admin
app.use("/api/admin/reservations", adminReservationRoutes);


// Routes Rooms
app.use("/api/rooms", roomsRoutes);



// Routes Chat
app.use("/api/chat", chatRoutes);

// Route de santé (pour vérifier que le serveur fonctionne)
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Backend Maison Daly Elegance is running",
    environment: process.env.NODE_ENV || "development"
  });
});

// Démarrage serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Initialisation des tables calendar (idempotent : CREATE TABLE IF NOT EXISTS)
(async () => {
  try {
    await initCalendarTables();
  } catch (err) {
    console.error("❌ Erreur lors de l'initialisation des tables calendar :", err);
  }
})();