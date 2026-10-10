import { Link } from "react-router-dom";
import { FiMessageCircle } from "react-icons/fi";
export default function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      className={`brand ${compact ? "brand-compact" : ""}`}
      aria-label="ChatWeb, início"
    >
      <span className="brand-mark">
        <FiMessageCircle />
        <span />
      </span>
      {!compact && (
        <span>
          chat<span className="brand-light">web</span>
          <span className="brand-dot">.</span>
        </span>
      )}
    </Link>
  );
}
