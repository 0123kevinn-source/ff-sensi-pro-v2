import { motion } from "framer-motion";

export default function PhoneCard({
  phone,
  onSelect,
  isSelected = false,
}) {
  return (
    <motion.button
      type="button"
      className={`phone-card${isSelected ? " is-selected" : ""}`}
      aria-label={`Seleccionar ${phone.brand} ${phone.model}, DPI ${phone.dpi}`}
      aria-pressed={isSelected}
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -2,
      }}
      whileTap={{
        scale: 0.99,
      }}
      transition={{
        duration: 0.18,
      }}
      onClick={() => onSelect(phone)}
    >
      <span className="phone-card-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="6.5" y="2.75" width="11" height="18.5" rx="2.5" />
          <path d="M10 5.75h4M11 18.25h2" />
        </svg>
      </span>
      <span className="phone-card-copy">
        <strong>{phone.brand}</strong>
        <span>{phone.model}</span>
      </span>
      <span className="phone-card-dpi">
        <small>DPI REF.</small>
        <strong>{phone.dpi}</strong>
      </span>
      <span className="phone-card-arrow" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="none">
          <path d="M4 10h11m-4-4 4 4-4 4" />
        </svg>
      </span>
    </motion.button>
  );
}