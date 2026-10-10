import { FiMessageCircle, FiZap, FiHeart } from "react-icons/fi";
export default function BackgroundBlue() {
  return (
    <aside className="auth-art">
      <div className="auth-art-orbit" />
      <span className="pill pill-light">
        <span className="tiny-dot" /> Menos distância. Mais conexão.
      </span>
      <h2>
        Gente de verdade.
        <br />
        Conversas que
        <br />
        <em>fazem bem.</em>
      </h2>
      <div className="auth-bubbles">
        <div className="art-bubble">
          <span className="avatar avatar-2">AM</span>
          <div>
            <b>Ana Martins</b>
            <p>Um café e uma boa conversa? ☕</p>
          </div>
          <small>agora</small>
        </div>
        <div className="art-bubble art-bubble-reply">
          <p>Sempre! Vamos combinar 💜</p>
          <span>✓✓</span>
        </div>
        <span className="art-typing">
          <i />
          <i />
          <i />
        </span>
      </div>
      <div className="auth-art-bottom">
        <FiMessageCircle />
        <p>
          Um espaço para seus amigos,
          <br />
          suas ideias e seu próximo olá.
        </p>
        <FiHeart />
        <FiZap />
      </div>
    </aside>
  );
}
