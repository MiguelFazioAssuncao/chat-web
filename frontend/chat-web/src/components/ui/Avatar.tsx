import { useState } from "react";
import { avatarUrl } from "../../utils/axiosConfig";
export default function Avatar({
  name,
  src,
  size = "",
  online = false,
}: {
  name: string;
  src?: string;
  size?: string;
  online?: boolean;
}) {
  const [failed, setFailed] = useState<string>();
  const color = [...name].reduce((n, char) => n + char.charCodeAt(0), 0) % 5;
  return (
    <span className={`avatar avatar-${color} ${size}`} aria-label={name}>
      {src && failed !== src ? (
        <img src={avatarUrl(src)} alt="" onError={() => setFailed(src)} />
      ) : (
        name
          .split(/\s+/)
          .map((v) => v[0])
          .slice(0, 2)
          .join("")
          .toUpperCase() || "?"
      )}
      {online && <i className="online-dot" />}
    </span>
  );
}
