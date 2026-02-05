import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

export function CheckAvailability({
  onSearch,
}: {
  onSearch: (checkin: string, checkout: string) => void;
}) {
  const { t } = useTranslation();

  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const today = new Date().toISOString().split("T")[0];

  const handleCheckinChange = (value: string) => {
    setCheckin(value);

    // Si la date de départ est avant la date d’arrivée → reset
    if (checkout && checkout <= value) {
      setCheckout("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkin || !checkout) {
      return alert(t("availability.alert.selectBothDates"));
    }

    if (checkout <= checkin) {
      return alert(t("availability.alert.checkoutAfterCheckin"));
    }

    onSearch(checkin, checkout);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white rounded shadow space-y-3 max-w-md mx-auto mt-6"
    >
      <h2 className="text-xl font-semibold text-center">
        {t("availability.title")}
      </h2>

      <div>
        <label className="block text-sm mb-1">{t("availability.checkin")}</label>
        <Input
          type="date"
          min={today}
          value={checkin}
          onChange={(e) => handleCheckinChange(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm mb-1">{t("availability.checkout")}</label>
        <Input
          type="date"
          min={checkin || today}
          value={checkout}
          onChange={(e) => setCheckout(e.target.value)}
          disabled={!checkin}
          required
        />
      </div>

      <Button type="submit" className="w-full">
        {t("availability.search")}
      </Button>
    </form>
  );
}
