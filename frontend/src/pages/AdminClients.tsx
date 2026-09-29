import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/Sidebar";
import {
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  Download,
  ChevronLeft,
  ChevronRight,
  Users,
  Mail,
  Phone,
  RefreshCw,
} from "lucide-react";

interface Client {
  name: string;
  email: string;
  phone: string;
  reservationsCount: number;
}

interface Reservation {
  id: number;
  name: string;
  email: string;
  phone: string;
}

type SortKey = "name" | "email" | "reservationsCount";
type SortDir = "asc" | "desc";

export function AdminClients() {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const BACKEND_URL = import.meta.env.VITE_API_URL || "https://darmamiedida.onrender.com";

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 10;

  const fetchClients = async () => {
    setLoading(true);
    setErrored(false);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/reservations`);
      if (!res.ok) throw new Error("request failed");
      const data: Reservation[] = await res.json();

      const uniqueClientsMap = new Map<string, Client>();
      data.forEach((r) => {
        const existing = uniqueClientsMap.get(r.email);
        if (existing) {
          existing.reservationsCount += 1;
        } else {
          uniqueClientsMap.set(r.email, {
            name: r.name,
            email: r.email,
            phone: r.phone,
            reservationsCount: 1,
          });
        }
      });
      setClients(Array.from(uniqueClientsMap.values()));
    } catch (error) {
      setErrored(true);
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortKey, sortDir]);

  const filteredClients = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const filtered = clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );

    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortKey === "reservationsCount") {
        comparison = a.reservationsCount - b.reservationsCount;
      } else {
        comparison = a[sortKey].localeCompare(b[sortKey]);
      }
      return sortDir === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [clients, searchQuery, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const copyToClipboard = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast({ title: `${label} copié`, description: value });
  };

  const exportCsv = () => {
    const header = ["Nom", "Email", "Téléphone", "Réservations"];
    const rows = filteredClients.map((c) => [
      c.name,
      c.email,
      c.phone,
      String(c.reservationsCount),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `clients-dar-mamie-dida-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  // Pagination logic
  const indexOfLast = currentPage * clientsPerPage;
  const indexOfFirst = indexOfLast - clientsPerPage;
  const currentClients = filteredClients.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / clientsPerPage));

  const pageNumbers = useMemo(() => {
    const pages: (number | "ellipsis")[] = [];
    const window = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - window && i <= currentPage + window)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "ellipsis") {
        pages.push("ellipsis");
      }
    }
    return pages;
  }, [totalPages, currentPage]);

  const initials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("");

  const SortHeader = ({ label, sortField }: { label: string; sortField: SortKey }) => (
    <button
      onClick={() => toggleSort(sortField)}
      className="flex items-center gap-1.5 hover:text-[#1C5D7C] transition-colors"
    >
      {label}
      {sortKey === sortField ? (
        sortDir === "asc" ? (
          <ArrowUp className="w-3.5 h-3.5" />
        ) : (
          <ArrowDown className="w-3.5 h-3.5" />
        )
      ) : (
        <ArrowUpDown className="w-3.5 h-3.5 opacity-30" />
      )}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-[#F7F5F1]">
      <Sidebar active="clients" />

      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-3xl text-[#2A2521]">Clients</h1>
            <p className="text-sm text-[#8A7C6C] mt-1">
              {loading
                ? "Chargement de la liste..."
                : `${clients.length} client${clients.length > 1 ? "s" : ""} au total`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={fetchClients}
              className="rounded-full border-[#E7E0D4]"
              title="Actualiser"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              onClick={exportCsv}
              disabled={filteredClients.length === 0}
              className="rounded-full bg-[#1C5D7C] hover:bg-[#164A63] text-white"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Exporter CSV
            </Button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-5 max-w-sm">
          <Search className="w-4 h-4 text-[#B8A88E] absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Recherche par nom ou email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 bg-white border-[#E7E0D4]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#B8A88E] hover:text-[#6B5F52]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Erreur */}
        {errored && !loading && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-[#E7B9A3] bg-[#FBF0EA] px-4 py-3 text-[#8C3B1B] text-sm">
            <span>Le chargement des clients a échoué.</span>
            <Button size="sm" variant="ghost" onClick={fetchClients} className="text-[#8C3B1B] hover:bg-[#f3ddd0]">
              Réessayer
            </Button>
          </div>
        )}

        {/* Chargement */}
        {loading && (
          <div className="rounded-xl border border-[#E7E0D4] bg-white overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-[#F0EBE0] last:border-0 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-[#EFE9DD]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-1/4 bg-[#EFE9DD] rounded" />
                  <div className="h-3 w-1/3 bg-[#EFE9DD] rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vide */}
        {!loading && !errored && filteredClients.length === 0 && (
          <div className="text-center rounded-2xl border border-dashed border-[#D9CFBE] py-16 px-6 bg-white">
            <Users className="w-7 h-7 mx-auto text-[#B8A88E] mb-3" />
            <p className="text-[#6B5F52]">
              {searchQuery
                ? "Aucun client ne correspond à cette recherche."
                : "Aucun client pour le moment."}
            </p>
          </div>
        )}

        {/* Table (desktop) */}
        {!loading && !errored && filteredClients.length > 0 && (
          <>
            <div className="hidden md:block overflow-x-auto rounded-xl border border-[#E7E0D4] bg-white shadow-[0_1px_3px_rgba(42,37,33,0.06)]">
              <table className="min-w-full text-sm">
                <thead className="bg-[#FAF7F1] text-[#8A7C6C] text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium"><SortHeader label="Nom" sortField="name" /></th>
                    <th className="px-4 py-3 text-left font-medium"><SortHeader label="Email" sortField="email" /></th>
                    <th className="px-4 py-3 text-left font-medium">Téléphone</th>
                    <th className="px-4 py-3 text-left font-medium"><SortHeader label="Réservations" sortField="reservationsCount" /></th>
                  </tr>
                </thead>
                <tbody>
                  {currentClients.map((client) => (
                    <tr key={client.email} className="border-t border-[#F0EBE0] hover:bg-[#FAF7F1] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-[#1C5D7C]/10 text-[#1C5D7C] text-xs font-medium flex items-center justify-center shrink-0">
                            {initials(client.name)}
                          </span>
                          <span className="text-[#2A2521]">{client.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => copyToClipboard(client.email, "Email")}
                          className="flex items-center gap-1.5 text-[#6B5F52] hover:text-[#1C5D7C] group"
                        >
                          {client.email}
                          <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => copyToClipboard(client.phone, "Téléphone")}
                          className="flex items-center gap-1.5 text-[#6B5F52] hover:text-[#1C5D7C] group"
                        >
                          {client.phone}
                          <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center min-w-[1.75rem] h-7 px-2 rounded-full bg-[#C1622D]/10 text-[#C1622D] text-xs font-medium">
                          {client.reservationsCount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cartes (mobile) */}
            <div className="md:hidden space-y-3">
              {currentClients.map((client) => (
                <div key={client.email} className="rounded-xl border border-[#E7E0D4] bg-white p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-9 h-9 rounded-full bg-[#1C5D7C]/10 text-[#1C5D7C] text-xs font-medium flex items-center justify-center shrink-0">
                      {initials(client.name)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#2A2521] font-medium truncate">{client.name}</p>
                      <span className="inline-flex items-center mt-0.5 h-5 px-2 rounded-full bg-[#C1622D]/10 text-[#C1622D] text-[11px] font-medium">
                        {client.reservationsCount} réservation{client.reservationsCount > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(client.email, "Email")}
                    className="flex items-center gap-2 text-sm text-[#6B5F52] py-1"
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(client.phone, "Téléphone")}
                    className="flex items-center gap-2 text-sm text-[#6B5F52] py-1"
                  >
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    {client.phone}
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5">
              <p className="text-xs text-[#8A7C6C]">
                Affichage {indexOfFirst + 1}–{Math.min(indexOfLast, filteredClients.length)} sur {filteredClients.length}
              </p>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full border-[#E7E0D4] w-8 h-8 p-0"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  {pageNumbers.map((p, idx) =>
                    p === "ellipsis" ? (
                      <span key={`e-${idx}`} className="px-1 text-[#B8A88E] text-sm">…</span>
                    ) : (
                      <Button
                        key={p}
                        size="sm"
                        variant="outline"
                        className={`rounded-full w-8 h-8 p-0 border-[#E7E0D4] ${
                          currentPage === p ? "bg-[#1C5D7C] text-white border-[#1C5D7C] hover:bg-[#164A63]" : ""
                        }`}
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </Button>
                    )
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full border-[#E7E0D4] w-8 h-8 p-0"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}