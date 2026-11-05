import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiCamera, FiLogOut, FiCheck, FiLock } from "react-icons/fi";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { errorMessage } from "../../utils/axiosConfig";
import Modal from "../ui/Modal";
import Avatar from "../ui/Avatar";
export default function ProfilePanel({ onClose }: { onClose: () => void }) {
  const { profile, updateProfile, changePassword, uploadAvatar, demo } =
    useChat();
  const { logout } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState(profile.username);
  const [description, setDescription] = useState(profile.description || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await updateProfile(username.trim(), description.trim());
      setSuccess("Perfil atualizado. Ficou com a sua cara!");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setSuccess(
        demo
          ? "Demonstração: a senha não é alterada neste modo."
          : "Sua senha foi atualizada com sucesso.",
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  const upload = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await uploadAvatar(file);
      setSuccess("Foto atualizada!");
    } catch (err) {
      setError(
        err instanceof Error && !("isAxiosError" in err)
          ? err.message
          : errorMessage(err),
      );
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };
  return (
    <Modal title="Seu perfil, sua cara." onClose={onClose}>
      <div className="profile-photo">
        <Avatar
          name={profile.username}
          src={profile.avatarUrl}
          size="avatar-large"
        />
        <button
          className="icon-button"
          disabled={busy}
          aria-label="Alterar foto de perfil"
          onClick={() => inputRef.current?.click()}
        >
          <FiCamera />
        </button>
        <input
          ref={inputRef}
          className="visually-hidden"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          tabIndex={-1}
          onChange={(e) => void upload(e.target.files?.[0])}
        />
        <small>JPG, PNG ou WebP · Até 5 MB</small>
      </div>
      <form onSubmit={save}>
        <div className="field">
          <label htmlFor="profile-name">Nome de usuário</label>
          <input
            id="profile-name"
            value={username}
            minLength={3}
            maxLength={20}
            required
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="profile-bio">Um pouco sobre você</label>
          <textarea
            id="profile-bio"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Seus interesses, uma frase ou só um olá…"
            maxLength={250}
            rows={3}
          />
          <small>{description.length}/250 caracteres</small>
        </div>
        {error && (
          <p className="feedback feedback-error" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="feedback feedback-success" role="status">
            {success}
          </p>
        )}
        <button className="button button-primary button-full" disabled={busy}>
          {busy ? (
            "Salvando…"
          ) : (
            <>
              <FiCheck /> Salvar alterações
            </>
          )}
        </button>
      </form>
      {!demo && (
        <form onSubmit={savePassword} className="profile-password-section">
          <h3>SEGURANÇA · ALTERAR SENHA</h3>
          <div className="field">
            <label htmlFor="current-password">Senha atual</label>
            <div className="input-wrap">
              <FiLock />
              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                placeholder="Sua senha atual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="new-password">Nova senha</label>
            <div className="input-wrap">
              <FiLock />
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                placeholder="Pelo menos 6 caracteres"
                minLength={6}
                maxLength={60}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button
            className="button button-secondary button-full"
            disabled={busy || !currentPassword || newPassword.length < 6}
          >
            Atualizar senha
          </button>
        </form>
      )}
      {demo ? (
        <Link className="profile-logout" to="/auth/register">
          Criar uma conta de verdade →
        </Link>
      ) : (
        <button className="profile-logout" onClick={logout}>
          <FiLogOut /> Sair da minha conta
        </button>
      )}
    </Modal>
  );
}
