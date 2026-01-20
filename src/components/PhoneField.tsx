import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

interface PhoneFieldProps {
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  onInvalid?: () => void; // callback si numéro invalide
}

export function PhoneField({ value, onChange, required = true, onInvalid }: PhoneFieldProps) {
  // Validation stricte
  const validatePhone = (val: string) => {
    if (!val) return false;             // vide
    const justCode = /^\+\d{1,4}$/;     // indicatif seul
    return !justCode.test(val);         // valide si ce n’est pas juste l’indicatif
  };

  return (
    <PhoneInput
      country="tn"
      value={value}
      onChange={(val) => onChange(val)}
      enableSearch
      countryCodeEditable={false}
      inputClass="!pl-14 !h-10 !w-full !rounded-md"
      buttonClass="!pl-3"
      containerClass="!w-full"
      inputProps={{
        name: "phone",
        required,
        placeholder: "Numéro valide",
        onBlur: () => {
          if (required && !validatePhone(value)) {
            onInvalid?.(); // déclenche un toast ou message d'erreur
          }
        },
      }}
    />
  );
}
