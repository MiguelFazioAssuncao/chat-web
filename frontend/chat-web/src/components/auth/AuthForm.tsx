import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiMail,
  FiLock,
  FiUser,
  FiArrowLeft,
  FiCheckCircle,
} from "react-icons/fi";
import { api, errorMessage } from "../../utils/axiosConfig";
import { useAuth } from "../../context/AuthContext";
export type AuthMode = "login" | "register" | "forgot" | "reset";
const content = {
  login: {
    eyebrow: "BOM TER VOCÊ DE VOLTA",
    title: "A conversa continua.",
    subtitle: "Entre na sua conta e fique perto de quem importa.",
    button: "Entrar na minha conta",
  },
  register: {
    eyebrow: "SEU PRÓXIMO OLÁ COMEÇA AQUI",
    title: "Vamos nos conectar?",
    subtitle: "Crie sua conta e dê espaço para boas conversas.",
    button: "Criar minha conta",
  },
  forgot: {
    eyebrow: "A GENTE TE AJUDA",
    title: "Esqueceu a senha?",
    subtitle: "Informe seu e-mail para receber um link de recuperação.",
    button: "Enviar link de recuperação",
  },
  reset: {
    eyebrow: "UM NOVO COMEÇO",
    title: "Crie uma nova senha.",
    subtitle: "Escolha uma senha que só você conhece.",
    button: "Salvar nova senha",
  },
};
export default function AuthForm({ mode }: { mode: AuthMode }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const copy = content[mode];
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (mode === "reset" && password !== confirm) {
      setError("As senhas precisam ser iguais.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "forgot") {
        await api.post("/auth/forgot-password", { email: email.trim() });
        setSuccess(
          "Link solicitado! Confira sua caixa de entrada e a pasta de spam.",
        );
      } else if (mode === "reset") {
        await api.post("/auth/reset-password", {
          token: params.get("token"),
          newPassword: password,
        });
        setSuccess("Senha atualizada. Você já pode entrar na sua conta.");
      } else {
        const response = await api.post(`/auth/${mode}`, {
          email: email.trim(),
          password,
          ...(mode === "register" ? { username: username.trim() } : {}),
        });
        login(response.data, remember);
        navigate("/app", { replace: true });
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="auth-form">
      <span className="eyebrow">{copy.eyebrow}</span>
      <h1>{copy.title}</h1>
      <p className="muted auth-subtitle">{copy.subtitle}</p>
      {success ? (
        <div className="auth-success" role="status">
          <FiCheckCircle />
          <h2>Tudo certo!</h2>
          <p>{success}</p>
          <Link className="button button-primary" to="/auth/login">
            Voltar para entrar <FiArrowRight />
          </Link>
        </div>
      ) : (
        <form onSubmit={submit}>
          {error && (
            <p className="feedback feedback-error" role="alert">
              {error}
            </p>
          )}
          {mode === "register" && (
            <div className="field">
              <label htmlFor="username">Como podemos te chamar?</label>
              <div className="input-wrap">
                <FiUser />
                <input
                  id="username"
                  autoComplete="username"
                  placeholder="Seu nome de usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  minLength={3}
                  maxLength={20}
                  required
                />
              </div>
              <small>De 3 a 20 caracteres.</small>
            </div>
          )}
          {mode !== "reset" && (
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <div className="input-wrap">
                <FiMail />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>
            </div>
          )}
          {mode !== "forgot" && (
            <div className="field">
              <label htmlFor="password">
                {mode === "reset" ? "Nova senha" : "Senha"}
              </label>
              <div className="input-wrap">
                <FiLock />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  placeholder={
                    mode === "login" ? "Sua senha" : "Pelo menos 6 caracteres"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={mode === "login" ? undefined : 6}
                  maxLength={60}
                  required
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {mode === "register" && password.length > 0 && (
                <div className="password-strength">
                  <span
                    style={{
                      width: `${Math.min(password.length / 12, 1) * 100}%`,
                    }}
                  />
                  <small>
                    {password.length < 6
                      ? "Use pelo menos 6 caracteres"
                      : password.length < 12
                        ? "Bom começo. Uma senha mais longa é melhor."
                        : "Ótimo comprimento de senha"}
                  </small>
                </div>
              )}
            </div>
          )}
          {mode === "reset" && (
            <div className="field">
              <label htmlFor="confirm">Confirme a nova senha</label>
              <div className="input-wrap">
                <FiLock />
                <input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  minLength={6}
                  maxLength={60}
                  required
                  placeholder="Repita sua senha"
                />
              </div>
            </div>
          )}
          {mode === "login" && (
            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Lembrar de mim
              </label>
              <Link to="/auth/forgot-password">Esqueci minha senha</Link>
            </div>
          )}
          <button
            type="submit"
            className="button button-primary button-full"
            disabled={busy}
          >
            {busy ? (
              <>
                <span className="spinner" />
                Aguarde…
              </>
            ) : (
              <>
                {copy.button}
                <FiArrowRight />
              </>
            )}
          </button>
        </form>
      )}
      {!success && (
        <p className="auth-switch">
          {mode === "login" ? (
            <>
              Ainda não tem uma conta?{" "}
              <Link to="/auth/register">Criar conta</Link>
            </>
          ) : mode === "register" ? (
            <>
              Já faz parte? <Link to="/auth/login">Entrar na minha conta</Link>
            </>
          ) : (
            <Link to="/auth/login">
              <FiArrowLeft /> Voltar para entrar
            </Link>
          )}
        </p>
      )}
      {(mode === "login" || mode === "register") && (
        <div className="auth-demo">
          <span>Quer conhecer primeiro?</span>
          <Link to="/demo">
            Explorar a demonstração <FiArrowRight />
          </Link>
        </div>
      )}
    </div>
  );
}
