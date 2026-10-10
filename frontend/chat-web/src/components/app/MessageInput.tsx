import { useEffect, useRef, useState } from "react";
import { FiSmile, FiSend, FiX } from "react-icons/fi";
export default function MessageInput({
  value,
  onChange,
  onSend,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
}) {
  const [emoji, setEmoji] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${Math.min(ref.current.scrollHeight, 140)}px`;
    }
  }, [value]);
  useEffect(() => {
    if (!emoji) return;
    const close = (event: MouseEvent) => {
      if (!emojiRef.current?.contains(event.target as Node)) setEmoji(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [emoji]);
  return (
    <footer className="composer-footer">
      <div className="composer">
        <div className="emoji-wrap" ref={emojiRef}>
          <button
            className="icon-button"
            aria-label="Inserir emoji"
            aria-expanded={emoji}
            onClick={() => setEmoji((v) => !v)}
            disabled={disabled}
          >
            {emoji ? <FiX /> : <FiSmile />}
          </button>
          {emoji && (
            <div
              className="emoji-picker"
              role="group"
              aria-label="Escolha um emoji"
            >
              {[
                "😊",
                "👋",
                "💜",
                "✨",
                "☕",
                "🙌",
                "🎉",
                "👍",
                "❤️",
                "😂",
                "🤔",
                "🚀",
              ].map((item) => (
                <button
                  key={item}
                  aria-label={`Inserir ${item}`}
                  onClick={() => {
                    onChange(value + item);
                    ref.current?.focus();
                    setEmoji(false);
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
        <textarea
          ref={ref}
          aria-label="Mensagem"
          rows={1}
          value={value}
          maxLength={4000}
          placeholder={
            disabled ? "Aguardando conexão…" : "Escreva sua mensagem…"
          }
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              if (!disabled) onSend();
            }
          }}
        />
        <button
          className="send-button"
          aria-label="Enviar mensagem"
          onClick={onSend}
          disabled={disabled || !value.trim()}
        >
          <FiSend />
        </button>
      </div>
      <div className="composer-hint">
        <span>
          <kbd>Enter</kbd> para enviar · <kbd>Shift + Enter</kbd> para nova
          linha
        </span>
        {value.length > 3500 && <span>{value.length}/4000</span>}
        <span>
          Um olá faz a diferença <span className="purple-heart">♡</span>
        </span>
      </div>
    </footer>
  );
}
