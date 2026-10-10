import axios from "axios";

export const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
export const api = axios.create({ baseURL: apiBase, timeout: 15000 });
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token && !config.url?.startsWith("/auth/"))
    config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.startsWith("/auth/")
    ) {
      window.dispatchEvent(new Event("chatweb:session-expired"));
    }
    return Promise.reject(error);
  },
);
export function errorMessage(error: unknown): string {
  if (!axios.isAxiosError(error))
    return "Não foi possível concluir. Tente novamente.";
  if (!error.response)
    return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
  const data = error.response.data;
  const message =
    typeof data === "string" ? data : data?.message || data?.error;
  const translations: Record<string, string> = {
    "User not found": "Usuário não encontrado.",
    "Invalid email or password": "E-mail ou senha incorretos.",
    "Email not found": "E-mail não encontrado.",
    "Invalid or expired token":
      "O link expirou. Solicite uma nova recuperação.",
    "Username must be between 3 and 20 characters":
      "O nome deve ter entre 3 e 20 caracteres.",
    "Description must be at most 250 characters":
      "A descrição deve ter até 250 caracteres.",
    "Avatar must contain at most 5 MB": "Escolha uma imagem de até 5 MB.",
    "Avatar must be PNG, JPG or WebP": "Escolha uma imagem PNG, JPG ou WebP.",
  };
  if (typeof message === "string" && translations[message])
    return translations[message];
  if (error.response.status === 401)
    return error.config?.url?.startsWith("/auth/login")
      ? "E-mail ou senha incorretos."
      : "Sua sessão expirou. Entre novamente.";
  if (error.response.status === 409)
    return "Este usuário ou e-mail já está em uso.";
  if (error.response.status === 400)
    return typeof message === "string"
      ? message
      : "Confira os dados e tente novamente.";
  if (error.response.status >= 500)
    return "O servidor está indisponível no momento. Tente novamente em instantes.";
  return "Não foi possível concluir. Tente novamente.";
}
export function avatarUrl(path?: string) {
  if (!path) return undefined;
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  return `${apiBase}/${path.replace(/^\//, "")}`;
}
export function socketUrl(token: string) {
  return `${apiBase || window.location.origin}/ws?token=${encodeURIComponent(token)}`;
}
