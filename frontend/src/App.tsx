import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ProtectedAdminRoute } from "./components/ProtectedAdminRoute";
import ScrollToTop from "@/components/ScrollToTop";

// ── Pages publiques chargées immédiatement ────────────────────────────────────
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// ── Pages publiques lazy ──────────────────────────────────────────────────────
const About          = lazy(() => import("./pages/About"));
const Galerie        = lazy(() => import("./pages/Galerie"));
const Rooms          = lazy(() => import("./pages/Rooms"));
const RoomDetail     = lazy(() => import("./pages/RoomDetail"));
const Contact        = lazy(() => import("./pages/Contact"));
const Services       = lazy(() => import("./pages/Services"));
const CheckRoomsPage = lazy(() => import("./pages/CheckRoomsPage"));
const ChatBotPage    = lazy(() => import("./pages/ChatBotPage"));
const Reservations   = lazy(() => import("./pages/Reservations"));
const Faq            = lazy(() => import("./pages/Faq"));

// ── Pages admin lazy (chunk séparé) ──────────────────────────────────────────
const AdminLogin        = lazy(() => import("./pages/AdminLogin").then(m => ({ default: m.AdminLogin })));
const AdminDashboard    = lazy(() => import("./pages/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const AdminReservations = lazy(() => import("./pages/AdminReservations").then(m => ({ default: m.AdminReservations })));
const AdminRooms        = lazy(() => import("./pages/AdminRooms").then(m => ({ default: m.AdminRooms })));
const AdminClients      = lazy(() => import("./pages/AdminClients").then(m => ({ default: m.AdminClients })));
const AdminAvailability = lazy(() => import("./pages/AdminAvailability").then(m => ({ default: m.AdminAvailability })));
const AdminCalendar     = lazy(() => import("./pages/AdminCalendar").then(m => ({ default: m.AdminCalendar })));

// ── Spinner de chargement ─────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground font-body">Chargement…</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Public ── */}
            <Route path="/" element={<Index />} />
            <Route path="/a-propos" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/galerie" element={<Galerie />} />
            <Route path="/chambres" element={<Rooms />} />
            <Route path="/chambres/:slug" element={<RoomDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/disponibilite" element={<CheckRoomsPage />} />
            <Route path="/chatbot" element={<ChatBotPage />} />

            {/* ── Admin ── */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard"    element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
            <Route path="/admin/reservations" element={<ProtectedAdminRoute><AdminReservations /></ProtectedAdminRoute>} />
            <Route path="/admin/rooms"        element={<ProtectedAdminRoute><AdminRooms /></ProtectedAdminRoute>} />
            <Route path="/admin/clients"      element={<ProtectedAdminRoute><AdminClients /></ProtectedAdminRoute>} />
            <Route path="/admin/availability" element={<ProtectedAdminRoute><AdminAvailability /></ProtectedAdminRoute>} />
            <Route path="/admin/calendar"     element={<ProtectedAdminRoute><AdminCalendar /></ProtectedAdminRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
