import { useEffect, useRef, useState } from "react";
import { FiSmile, FiSend, FiX, FiEdit2, FiCheck } from "react-icons/fi";
import type { ChatMessage } from "../../types/chat";
export default function MessageInput({
  value,
  onChange,
  onSend,
  onTyping,
  editingMessage,
  onCancelEdit,
  onEditLast,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onTyping?: () => void;
  editingMessage?: ChatMessage | null;
  onCancelEdit?: () => void;
  onEditLast?: () => void;
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
    if (editingMessage) {
      ref.current?.focus();
    }
  }, [editingMessage]);
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
      {editingMessage && (
        <div className="composer-editing" role="status">
          <FiEdit2 />
          <span>Editando mensagem</span>
          <button
            type="button"
            className="icon-button"
            aria-label="Cancelar edição"
            onClick={onCancelEdit}
          >
            <FiX />
          </button>
        </div>
      )}
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
                    onChange((value + item).slice(0, 1000));
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
          maxLength={1000}
          placeholder={
            disabled
              ? "Aguardando conexão…"
              : editingMessage
                ? "Edite sua mensagem…"
                : "Escreva sua mensagem…"
          }
          onChange={(e) => {
            onChange(e.target.value);
            if (e.target.value.trim() && !editingMessage) {
              onTyping?.();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape" && editingMessage && onCancelEdit) {
              e.preventDefault();
              onCancelEdit();
              return;
            }
            if (
              e.key === "ArrowUp" &&
              !value &&
              !editingMessage &&
              onEditLast
            ) {
              e.preventDefault();
              onEditLast();
              return;
            }
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
          aria-label={editingMessage ? "Salvar edição" : "Enviar mensagem"}
          onClick={onSend}
          disabled={disabled || !value.trim()}
        >
          {editingMessage ? <FiCheck /> : <FiSend />}
        </button>
      </div>
      <div className="composer-hint">
        <span>
          <kbd>Enter</kbd> para {editingMessage ? "salvar" : "enviar"} ·{" "}
          {editingMessage ? (
            <>
              <kbd>Esc</kbd> para cancelar
            </>
          ) : (
            <>
              <kbd>Shift + Enter</kbd> para nova linha
            </>
          )}
        </span>
        {value.length > 850 && <span>{value.length}/1000</span>}
        <span>
          Um olá faz a diferença <span className="purple-heart">♡</span>
        </span>
      </div>
    </footer>
  );
}
