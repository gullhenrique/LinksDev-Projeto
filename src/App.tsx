import { FormEvent, useEffect, useState } from "react";
import {
  HashRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  GripVertical,
  Link2,
  Loader2,
  LogOut,
  MapPin,
  MonitorSmartphone,
  Moon,
  Palette,
  Plus,
  Save,
  Share2,
  Sparkles,
  Sun,
  Trash2,
  UserRound,
} from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import { profile as demo } from "./profile";

type Profile = {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  role: string;
  location: string;
  avatar_url: string;
  show_bio: boolean;
  show_role: boolean;
  show_location: boolean;
  accent_color: string;
  theme: "dark" | "light";
};
type UserLink = {
  id?: string;
  profile_id?: string;
  title: string;
  description: string;
  url: string;
  position: number;
  is_featured: boolean;
  is_visible: boolean;
};
const emptyProfile: Profile = {
  id: "",
  username: "",
  display_name: "",
  bio: "",
  role: "",
  location: "",
  avatar_url: "",
  show_bio: true,
  show_role: true,
  show_location: false,
  accent_color: "#6ef5a8",
  theme: "dark",
};

function Brand() {
  return (
    <Link className="app-brand" to="/">
      <Sparkles size={18} /> LinksDev
    </Link>
  );
}

function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    if (!isSupabaseConfigured) {
      setMessage("O banco ainda está sendo conectado.");
      setLoading(false);
      return;
    }
    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (result.error) setMessage(result.error.message);
    else if (mode === "signup")
      setMessage("Confira seu e-mail para confirmar o cadastro.");
    else navigate("/dashboard");
  }
  return (
    <main className="auth-page">
      <div className="auth-orb" />
      <section className="auth-card">
        <Brand />
        <div className="auth-heading">
          <span className="kicker">Seu espaço, do seu jeito</span>
          <h1>
            {mode === "login"
              ? "Que bom ter você de volta."
              : "Crie sua página em minutos."}
          </h1>
          <p>
            {mode === "login"
              ? "Entre para editar seus links e sua aparência."
              : "Cadastre-se para reunir tudo o que importa em um só lugar."}
          </p>
        </div>
        <form onSubmit={submit}>
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              required
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
              minLength={6}
              required
            />
          </label>
          {message && <p className="form-message">{message}</p>}
          <button className="primary-button" disabled={loading}>
            {loading ? (
              <Loader2 className="spin" size={18} />
            ) : mode === "login" ? (
              "Entrar"
            ) : (
              "Criar minha página"
            )}
          </button>
        </form>
        <button
          className="text-button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setMessage("");
          }}
        >
          {mode === "login" ? "Ainda não tenho conta" : "Já tenho uma conta"}
        </button>
        <Link className="back-link" to="/">
          <ArrowLeft size={15} /> Voltar para a página
        </Link>
      </section>
    </main>
  );
}

function Dashboard({ session }: { session: Session }) {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [links, setLinks] = useState<UserLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    void load();
  }, [session.user.id]);
  async function load() {
    const { data: p } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();
    const base = p || {
      ...emptyProfile,
      id: session.user.id,
      username: (session.user.email?.split("@")[0] || "usuario")
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 30),
      display_name: session.user.user_metadata.full_name || "",
    };
    setProfile(base);
    if (p) {
      const { data: l } = await supabase
        .from("links")
        .select("*")
        .eq("profile_id", session.user.id)
        .order("position");
      setLinks(l || []);
    }
    setLoading(false);
  }
  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile({ ...profile, [key]: value });
  }
  function updateLink(
    i: number,
    key: keyof UserLink,
    value: string | boolean | number,
  ) {
    setLinks(links.map((l, n) => (n === i ? { ...l, [key]: value } : l)));
  }
  function addLink() {
    setLinks([
      ...links,
      {
        title: "",
        description: "",
        url: "https://",
        position: links.length,
        is_featured: false,
        is_visible: true,
      },
    ]);
  }
  async function save() {
    setSaving(true);
    setNotice("");
    const clean = {
      ...profile,
      username: profile.username.toLowerCase().replace(/[^a-z0-9_]/g, ""),
    };
    const { error: pError } = await supabase.from("profiles").upsert(clean);
    if (pError) {
      setNotice(pError.message);
      setSaving(false);
      return;
    }
    await supabase.from("links").delete().eq("profile_id", session.user.id);
    if (links.length) {
      const payload = links
        .filter((l) => l.title && l.url)
        .map((l, i) => ({
          profile_id: session.user.id,
          title: l.title,
          description: l.description,
          url: l.url,
          position: i,
          is_featured: l.is_featured,
          is_visible: l.is_visible,
        }));
      const { error } = await supabase.from("links").insert(payload);
      if (error) {
        setNotice(error.message);
        setSaving(false);
        return;
      }
    }
    setProfile(clean);
    setNotice("Alterações publicadas!");
    setSaving(false);
  }
  if (loading)
    return (
      <main className="loading-page">
        <Loader2 className="spin" /> Carregando seu painel…
      </main>
    );
  return (
    <main className="dashboard">
      <header className="dashboard-top">
        <Brand />
        <div>
          <a
            className="preview-button"
            href={`${import.meta.env.BASE_URL}#/u/${profile.username}`}
            target="_blank"
          >
            <Eye size={17} /> Ver página
          </a>
          <button
            className="icon-button"
            onClick={() => supabase.auth.signOut()}
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>
      <div className="dashboard-grid">
        <aside>
          <span className="kicker">Painel de controle</span>
          <h1>
            Sua página.
            <br />
            Suas escolhas.
          </h1>
          <p>
            Mostre somente o que faz sentido para você. Nenhum campo é
            obrigatório.
          </p>
          <nav>
            <a href="#perfil">
              <UserRound /> Perfil
            </a>
            <a href="#links">
              <Link2 /> Links
            </a>
            <a href="#aparencia">
              <Palette /> Aparência
            </a>
          </nav>
        </aside>
        <section className="editor-stack">
          <EditorSection
            id="perfil"
            icon={<UserRound />}
            title="Perfil"
            description="As informações que identificam sua página."
          >
            <div className="form-grid">
              <Field
                label="Nome"
                value={profile.display_name}
                onChange={(v) => update("display_name", v)}
              />
              <Field
                label="Nome de usuário"
                prefix="links.dev/"
                value={profile.username}
                onChange={(v) => update("username", v)}
              />
              <Field
                label="Imagem (URL)"
                value={profile.avatar_url}
                onChange={(v) => update("avatar_url", v)}
                wide
              />
              <Field
                label="Descrição"
                value={profile.bio}
                onChange={(v) => update("bio", v)}
                wide
              />
              <Toggle
                label="Exibir descrição"
                checked={profile.show_bio}
                onChange={(v) => update("show_bio", v)}
              />
              <Field
                label="Profissão ou título"
                value={profile.role}
                onChange={(v) => update("role", v)}
              />
              <Toggle
                label="Exibir profissão"
                checked={profile.show_role}
                onChange={(v) => update("show_role", v)}
              />
              <Field
                label="Localização"
                value={profile.location}
                onChange={(v) => update("location", v)}
              />
              <Toggle
                label="Exibir localização"
                checked={profile.show_location}
                onChange={(v) => update("show_location", v)}
              />
            </div>
          </EditorSection>
          <EditorSection
            id="links"
            icon={<Link2 />}
            title="Links"
            description="Adicione sites, redes, vídeos, lojas ou qualquer endereço."
          >
            <div className="link-editor-list">
              {links.map((l, i) => (
                <div className="link-editor" key={i}>
                  <GripVertical className="drag" />
                  <div>
                    <input
                      aria-label="Título do link"
                      value={l.title}
                      onChange={(e) => updateLink(i, "title", e.target.value)}
                      placeholder="Título do link"
                    />
                    <input
                      aria-label="Endereço do link"
                      value={l.url}
                      onChange={(e) => updateLink(i, "url", e.target.value)}
                      placeholder="https://..."
                    />
                    <input
                      aria-label="Descrição do link"
                      value={l.description}
                      onChange={(e) =>
                        updateLink(i, "description", e.target.value)
                      }
                      placeholder="Descrição opcional"
                    />
                  </div>
                  <div className="link-tools">
                    <button
                      onClick={() => updateLink(i, "is_visible", !l.is_visible)}
                      title={l.is_visible ? "Ocultar" : "Exibir"}
                    >
                      {l.is_visible ? <Eye /> : <EyeOff />}
                    </button>
                    <button
                      onClick={() => setLinks(links.filter((_, n) => n !== i))}
                      title="Remover"
                    >
                      <Trash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="add-button" onClick={addLink}>
              <Plus size={18} /> Adicionar link
            </button>
          </EditorSection>
          <EditorSection
            id="aparencia"
            icon={<Palette />}
            title="Aparência"
            description="Escolha um estilo que combine com você."
          >
            <div className="appearance-row">
              <label>
                Cor de destaque
                <input
                  type="color"
                  value={profile.accent_color}
                  onChange={(e) => update("accent_color", e.target.value)}
                />
              </label>
              <div>
                <button
                  className={
                    profile.theme === "dark"
                      ? "theme-choice active"
                      : "theme-choice"
                  }
                  onClick={() => update("theme", "dark")}
                >
                  <Moon /> Escuro
                </button>
                <button
                  className={
                    profile.theme === "light"
                      ? "theme-choice active"
                      : "theme-choice"
                  }
                  onClick={() => update("theme", "light")}
                >
                  <Sun /> Claro
                </button>
              </div>
            </div>
          </EditorSection>
          <div className="save-bar">
            {notice && (
              <span>
                <Check size={17} />
                {notice}
              </span>
            )}
            <button className="primary-button" onClick={save} disabled={saving}>
              <Save size={18} />
              {saving ? "Salvando…" : "Salvar e publicar"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  wide,
  prefix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  wide?: boolean;
  prefix?: string;
}) {
  return (
    <label className={wide ? "field wide" : "field"}>
      {label}
      <div className={prefix ? "prefixed" : ""}>
        {prefix && <span>{prefix}</span>}
        <input value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </label>
  );
}
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <i />
    </label>
  );
}
function EditorSection({
  id,
  icon,
  title,
  description,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="editor-card" id={id}>
      <header>
        <span>{icon}</span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

function PublicPage() {
  const { username } = useParams();
  const [data, setData] = useState<{
    profile: Profile;
    links: UserLink[];
  } | null>(null);
  const [loading, setLoading] = useState(Boolean(username));
  useEffect(() => {
    if (!username) return;
    void (async () => {
      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();
      if (p) {
        const { data: l } = await supabase
          .from("links")
          .select("*")
          .eq("profile_id", p.id)
          .eq("is_visible", true)
          .order("position");
        setData({ profile: p, links: l || [] });
      }
      setLoading(false);
    })();
  }, [username]);
  if (loading)
    return (
      <main className="loading-page">
        <Loader2 className="spin" />
      </main>
    );
  if (username && !data)
    return (
      <main className="not-found">
        <Brand />
        <h1>Página não encontrada</h1>
        <p>Este endereço ainda não foi criado.</p>
        <Link to="/login">Criar minha página</Link>
      </main>
    );
  const p = data?.profile;
  const shownLinks =
    data?.links ||
    demo.links.map((l, i) => ({
      title: l.label,
      description: l.description,
      url: l.url,
      position: i,
      is_featured: Boolean(l.featured),
      is_visible: true,
    }));
  return (
    <main
      className={`page-shell ${p?.theme === "light" ? "public-light" : ""}`}
      style={
        { "--accent": p?.accent_color || "#6ef5a8" } as React.CSSProperties
      }
    >
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <section className="profile-card">
        <nav className="card-actions">
          <span className="brand-mark">
            <Sparkles size={16} /> LinksDev
          </span>
          <div>
            <Link className="create-pill" to="/login">
              Crie a sua
            </Link>
            <button
              className="icon-button"
              onClick={() =>
                navigator.share?.({
                  url: location.href,
                  title: p?.display_name || demo.name,
                })
              }
            >
              <Share2 size={18} />
            </button>
          </div>
        </nav>
        <header className="profile-header">
          <div className="avatar-wrap">
            <img src={p?.avatar_url || demo.avatar} alt="Foto de perfil" />
          </div>
          <p className="eyebrow">
            @{p?.username || demo.username.replace("@", "")}
          </p>
          <h1>{p?.display_name || demo.name}</h1>
          {(!p || p.show_role) && (
            <p className="role">{p?.role || demo.role}</p>
          )}
          {(!p || p.show_bio) && <p className="bio">{p?.bio || demo.bio}</p>}
          {p?.show_location && p.location && (
            <p className="location">
              <MapPin size={14} />
              {p.location}
            </p>
          )}
        </header>
        <div className="links-list">
          {shownLinks.map((l, i) => (
            <a
              className={`profile-link${l.is_featured ? " featured" : ""}`}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              key={i}
            >
              <span className="link-icon">
                <Link2 size={21} />
              </span>
              <span className="link-copy">
                <strong>{l.title}</strong>
                {l.description && <small>{l.description}</small>}
              </span>
              <span className="link-arrow">↗</span>
            </a>
          ))}
        </div>
        <footer>
          <p>
            Feito com <strong>LinksDev</strong>
          </p>
        </footer>
      </section>
    </main>
  );
}

function AppRoutes() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return supabase.auth.onAuthStateChange((_, s) => setSession(s)).data
      .subscription.unsubscribe;
  }, []);
  if (!ready)
    return (
      <main className="loading-page">
        <Loader2 className="spin" />
      </main>
    );
  return (
    <Routes>
      <Route path="/" element={<PublicPage />} />
      <Route path="/u/:username" element={<PublicPage />} />
      <Route
        path="/login"
        element={session ? <Navigate to="/dashboard" /> : <AuthPage />}
      />
      <Route
        path="/dashboard"
        element={
          session ? <Dashboard session={session} /> : <Navigate to="/login" />
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
export function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}
