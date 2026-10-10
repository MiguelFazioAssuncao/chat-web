import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiMessageCircle,
  FiZap,
  FiUsers,
  FiSearch,
  FiCheck,
  FiSmile,
  FiSend,
  FiMenu,
  FiX,
  FiMoon,
  FiSun,
} from "react-icons/fi";
import Brand from "../../components/ui/Brand";
import Avatar from "../../components/ui/Avatar";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { demoContacts } from "../../data/demo";
function ProductPreview() {
  return (
    <Link
      to="/demo"
      className="product-preview"
      aria-label="Abrir demonstração interativa do ChatWeb"
    >
      <div className="preview-top">
        <div className="window-dots">
          <i />
          <i />
          <i />
        </div>
        <span>
          <FiMessageCircle /> chatweb
        </span>
        <span className="preview-secure">
          <span className="tiny-dot" /> Seu espaço de conexão
        </span>
      </div>
      <div className="preview-body">
        <aside className="preview-rail">
          <span className="preview-rail-active">
            <FiMessageCircle />
          </span>
          <FiUsers />
          <FiSearch />
          <span className="preview-rail-bottom">
            <Avatar name="Você" />
          </span>
        </aside>
        <aside className="preview-list">
          <div className="preview-list-title">
            <b>Conversas</b>
            <span>+</span>
          </div>
          <div className="preview-search">
            <FiSearch /> Buscar uma conversa
          </div>
          <small>SEU DIA, EM BOAS COMPANHIAS</small>
          {demoContacts.map((contact, index) => (
            <div
              className={`preview-contact ${index === 0 ? "selected" : ""}`}
              key={contact.id}
            >
              <Avatar name={contact.username} online={index === 0} />
              <div>
                <b>{contact.username}</b>
                <p>{contact.lastMessage}</p>
              </div>
              {index < 2 && (
                <span className="unread-count">{index === 0 ? 2 : 1}</span>
              )}
            </div>
          ))}
          <div className="preview-invite">
            <FiUsers />
            <b>
              Boas conversas começam
              <br />
              com um novo olá.
            </b>
          </div>
        </aside>
        <section className="preview-chat">
          <div className="preview-chat-header">
            <Avatar name="Ana Martins" online />
            <div>
              <b>Ana Martins</b>
              <small>Uma boa conversa começa aqui</small>
            </div>
            <FiSearch />
          </div>
          <div className="preview-messages">
            <span className="day-divider">Hoje</span>
            <div className="preview-bubble">
              Oi! Tudo bem? 👋<small>10:30</small>
            </div>
            <div className="preview-bubble">
              Estava pensando naquele projeto.
              <br />
              Já tive algumas ideias!<small>10:30</small>
            </div>
            <div className="preview-bubble sent">
              Que coincidência! Também estava
              <br />
              pensando nisso 😊<small>10:32 ✓✓</small>
            </div>
            <div className="preview-bubble">
              Vamos tirar essa ideia do papel? ✨<small>10:34</small>
            </div>
          </div>
          <div className="preview-composer">
            <FiSmile />
            <span>Escreva sua mensagem…</span>
            <i>
              <FiSend />
            </i>
          </div>
        </section>
      </div>
    </Link>
  );
}
export default function Landing() {
  const [menu, setMenu] = useState(false);
  const { dark, toggle } = useTheme();
  const { isAuthenticated } = useAuth();
  return (
    <div className="landing">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className="site-header page-width">
        <Brand />
        <nav
          aria-label="Navegação principal"
          className={menu ? "site-nav menu-open" : "site-nav"}
        >
          <a href="#experiencia" onClick={() => setMenu(false)}>
            A experiência
          </a>
          <a href="#como-funciona" onClick={() => setMenu(false)}>
            Como funciona
          </a>
          <Link to="/demo">
            Explorar o app <FiArrowUpRight />
          </Link>
        </nav>
        <div className="header-actions">
          <button
            className="icon-button theme-button"
            onClick={toggle}
            aria-label={dark ? "Ativar tema claro" : "Ativar tema escuro"}
          >
            {dark ? <FiSun /> : <FiMoon />}
          </button>
          <Link
            className="login-link"
            to={isAuthenticated ? "/app" : "/auth/login"}
          >
            {isAuthenticated ? "Meu chat" : "Entrar"}
          </Link>
          <Link
            to={isAuthenticated ? "/app" : "/auth/register"}
            className="button button-primary button-small"
          >
            {isAuthenticated ? "Abrir conversas" : "Começar agora"}
            <FiArrowUpRight />
          </Link>
          <button
            className="icon-button mobile-menu"
            onClick={() => setMenu((v) => !v)}
            aria-label="Abrir menu"
            aria-expanded={menu}
          >
            {menu ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </header>
      <main id="conteudo">
        <section className="hero page-width">
          <div className="hero-copy">
            <span className="pill">
              <span className="tiny-dot" /> A vida acontece em boa companhia
            </span>
            <h1>
              Menos distância.
              <br />
              Mais{" "}
              <span className="hero-word">
                conversa.
                <svg viewBox="0 0 500 24" aria-hidden="true">
                  <path d="M5 17C130 0 335 0 492 13" />
                </svg>
              </span>
            </h1>
            <p>
              Um olá pode mudar o seu dia. Conecte-se com seus amigos em um
              espaço simples, leve e feito para vocês.
            </p>
            <div className="hero-actions">
              <Link to="/auth/register" className="button button-primary">
                Começar uma conversa <FiArrowRight />
              </Link>
              <Link to="/demo" className="button button-ghost">
                <span className="play-icon">▷</span> Conhecer o ChatWeb
              </Link>
            </div>
            <div className="hero-note">
              <span>
                <FiCheck /> Sem complicação
              </span>
              <span>
                <FiCheck /> No seu ritmo
              </span>
              <span>
                <FiCheck /> Em qualquer tela
              </span>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <span className="hello-sticker">
              oi<span>!</span>
            </span>
            <span className="floating-message floating-one">
              Bora colocar o papo em dia? <span>👋</span>
            </span>
            <span className="floating-message floating-two">
              Tava com saudade! <span>💜</span>
            </span>
            <span className="sparkle sparkle-one">✳</span>
            <span className="sparkle sparkle-two">✦</span>
            <span className="visual-caption">
              CONEXÕES REAIS, TODOS OS DIAS
            </span>
          </div>
        </section>
        <section id="experiencia" className="experience page-width">
          <div className="section-top">
            <div>
              <span className="eyebrow">UM ESPAÇO QUE É SEU</span>
              <h2>O importante é a conversa.</h2>
            </div>
            <p>
              O resto, a gente deixa simples.
              <br />
              Conheça seu novo ponto de encontro.
            </p>
          </div>
          <div className="preview-wrap">
            <ProductPreview />
            <span className="preview-label">
              Uma prévia com conversas ilustrativas.{" "}
              <Link to="/demo">
                Experimente de verdade <FiArrowUpRight />
              </Link>
            </span>
          </div>
          <div className="feature-row">
            <article>
              <span className="feature-icon">
                <FiZap />
              </span>
              <div>
                <h3>No momento certo.</h3>
                <p>Mensagens em tempo real para o papo acompanhar a vida.</p>
              </div>
            </article>
            <article>
              <span className="feature-icon feature-peach">
                <FiUsers />
              </span>
              <div>
                <h3>Perto de quem importa.</h3>
                <p>
                  Encontre seus amigos, envie um convite e comece a conversar.
                </p>
              </div>
            </article>
            <article>
              <span className="feature-icon feature-mint">
                <FiSearch />
              </span>
              <div>
                <h3>Tudo no seu lugar.</h3>
                <p>
                  Busque contatos e encontre aquela mensagem sem perder o fio.
                </p>
              </div>
            </article>
          </div>
        </section>
        <section id="como-funciona" className="how-section page-width">
          <div className="how-intro">
            <span className="eyebrow">DO PRIMEIRO CLIQUE AO PRIMEIRO OLÁ</span>
            <h2>
              Boas conversas.
              <br />
              Poucos passos.
            </h2>
            <Link to="/auth/register" className="text-link">
              Vamos começar? <FiArrowUpRight />
            </Link>
          </div>
          <div className="steps">
            <article>
              <span>01</span>
              <div>
                <h3>Crie seu espaço</h3>
                <p>Uma conta, seu nome e um perfil com a sua cara.</p>
              </div>
              <FiArrowUpRight />
            </article>
            <article>
              <span>02</span>
              <div>
                <h3>Encontre sua companhia</h3>
                <p>Convide seus amigos pelo e-mail e aceite novas conexões.</p>
              </div>
              <FiArrowUpRight />
            </article>
            <article>
              <span>03</span>
              <div>
                <h3>Deixe a conversa acontecer</h3>
                <p>
                  Troque ideias, compartilhe o dia e continue de onde parou.
                </p>
              </div>
              <FiMessageCircle />
            </article>
          </div>
        </section>
        <section className="closing-cta page-width">
          <div>
            <span className="eyebrow">TEM ALGUÉM ESPERANDO SEU OLÁ</span>
            <h2>Conecte-se. O resto é conversa.</h2>
          </div>
          <Link to="/auth/register" className="button button-primary">
            Criar minha conta <FiArrowRight />
          </Link>
          <span className="cta-sparkle" aria-hidden="true">
            ✳
          </span>
        </section>
      </main>
      <footer className="site-footer page-width">
        <Brand />
        <p>Feito para conectar pessoas.</p>
        <span>© {new Date().getFullYear()} ChatWeb</span>
        <a href="#conteudo">Voltar ao topo ↑</a>
      </footer>
    </div>
  );
}
