import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  Globe2,
  ImageUp,
  Link2,
  Loader2,
  LogOut,
  MapPin,
  MonitorSmartphone,
  Moon,
  Palette,
  Plus,
  Save,
  Settings,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Trash2,
  UserRound,
  Zap,
} from "lucide-react";
import type { IconType } from "react-icons";
import {
  FaFacebookF,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaPinterestP,
  FaSpotify,
  FaTiktok,
  FaTwitch,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import type { Session } from "@supabase/supabase-js";
import Cropper, { type Area, type Point } from "react-easy-crop";
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
  banner_url: string;
  instagram_handle: string;
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
  banner_url: "",
  instagram_handle: "",
  show_bio: true,
  show_role: true,
  show_location: false,
  accent_color: "#6ef5a8",
  theme: "dark",
};
const exampleAvatar = `${import.meta.env.BASE_URL}perfil-exemplo.png`;

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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const passwordMismatch =
    mode === "signup" &&
    confirmPassword.length > 0 &&
    password !== confirmPassword;
  const navigate = useNavigate();
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (mode === "signup" && password !== confirmPassword) {
      setMessage("As senhas não coincidem. Confira e tente novamente.");
      return;
    }
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
        : await supabase.auth.signUp({
            email,
            password,
          });
    setLoading(false);
    if (result.error) setMessage(result.error.message);
    else if (mode === "signup") {
      setAwaitingCode(true);
      setMessage("");
    } else navigate("/dashboard");
  }
  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: confirmationCode,
      type: "signup",
    });
    setLoading(false);
    if (error)
      setMessage("Código inválido ou expirado. Solicite um novo código.");
    else navigate("/dashboard");
  }
  async function resendCode() {
    setLoading(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setLoading(false);
    setMessage(error ? error.message : "Um novo código foi enviado.");
  }
  if (awaitingCode)
    return (
      <main className="auth-page">
        <div className="auth-orb" />
        <section className="auth-card code-card">
          <Brand />
          <div className="auth-heading">
            <span className="kicker">Última etapa</span>
            <h1>Confirme seu e-mail.</h1>
            <p>
              Enviamos um código de 8 dígitos para <strong>{email}</strong>.
            </p>
          </div>
          <form onSubmit={verifyCode}>
            <label>
              Código de confirmação
              <input
                className="code-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={confirmationCode}
                onChange={(e) =>
                  setConfirmationCode(
                    e.target.value.replace(/\D/g, "").slice(0, 8),
                  )
                }
                placeholder="00000000"
                pattern="[0-9]{8}"
                maxLength={8}
                autoFocus
                required
              />
            </label>
            {message && <p className="form-message">{message}</p>}
            <button
              className="primary-button"
              disabled={loading || confirmationCode.length !== 8}
            >
              {loading ? (
                <Loader2 className="spin" size={18} />
              ) : (
                "Confirmar cadastro"
              )}
            </button>
          </form>
          <button
            className="text-button"
            onClick={resendCode}
            disabled={loading}
          >
            Não recebeu? Enviar outro código
          </button>
          <button
            className="back-link button-link"
            onClick={() => setAwaitingCode(false)}
          >
            <ArrowLeft size={15} /> Corrigir meu e-mail
          </button>
        </section>
      </main>
    );
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
          {mode === "signup" && (
            <label>
              Confirmar senha
              <input
                className={passwordMismatch ? "input-error" : undefined}
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (message.startsWith("As senhas")) setMessage("");
                }}
                placeholder="Digite a mesma senha novamente"
                minLength={6}
                aria-invalid={passwordMismatch}
                aria-describedby={
                  passwordMismatch ? "password-error" : undefined
                }
                required
              />
              {passwordMismatch && (
                <span className="field-error" id="password-error">
                  As senhas precisam ser iguais.
                </span>
              )}
            </label>
          )}
          {message && <p className="form-message">{message}</p>}
          <button
            className="primary-button"
            disabled={
              loading ||
              (mode === "signup" &&
                (confirmPassword.length === 0 || passwordMismatch))
            }
          >
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
            setConfirmPassword("");
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
  const [uploading, setUploading] = useState<"avatar" | "banner" | null>(null);
  const [cropSource, setCropSource] = useState<{
    url: string;
    kind: "avatar" | "banner";
  } | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
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
  function chooseMedia(
    event: ChangeEvent<HTMLInputElement>,
    kind: "avatar" | "banner",
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setNotice("Escolha um arquivo de imagem.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setNotice("A imagem deve ter no máximo 5 MB.");
      return;
    }
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
    setCropSource({ url: URL.createObjectURL(file), kind });
    event.target.value = "";
  }
  function closeCropper() {
    if (cropSource) URL.revokeObjectURL(cropSource.url);
    setCropSource(null);
  }
  async function finishCrop() {
    if (!cropSource || !croppedArea) return;
    setUploading(cropSource.kind);
    setNotice("");
    const kind = cropSource.kind;
    let blob: Blob;
    try {
      blob = await cropImage(cropSource.url, croppedArea);
    } catch {
      setNotice("Não foi possível recortar esta imagem. Tente outro arquivo.");
      setUploading(null);
      return;
    }
    const path = `${session.user.id}/${kind}-${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from("profile-media")
      .upload(path, blob, { contentType: "image/jpeg" });
    if (error) {
      setNotice(`Não foi possível enviar a imagem: ${error.message}`);
      setUploading(null);
      return;
    }
    const { data } = supabase.storage.from("profile-media").getPublicUrl(path);
    update(kind === "avatar" ? "avatar_url" : "banner_url", data.publicUrl);
    setNotice(
      `${kind === "avatar" ? "Foto" : "Banner"} enviado. Salve para publicar.`,
    );
    setUploading(null);
    closeCropper();
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
          url: normalizeUrl(l.url),
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
            href={`${import.meta.env.BASE_URL}${profile.username}`}
            target="_blank"
            rel="noreferrer"
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
                label="Instagram"
                prefix="@"
                value={profile.instagram_handle}
                onChange={(v) =>
                  update(
                    "instagram_handle",
                    v.replace(/^@/, "").replace(/[^a-zA-Z0-9._]/g, ""),
                  )
                }
              />
              <div className="media-upload-grid wide">
                <MediaUpload
                  label="Foto de perfil"
                  hint="Quadrada, até 5 MB"
                  value={profile.avatar_url}
                  uploading={uploading === "avatar"}
                  onChange={(event) => chooseMedia(event, "avatar")}
                />
                <MediaUpload
                  label="Banner da página"
                  hint="Horizontal, até 5 MB"
                  value={profile.banner_url}
                  uploading={uploading === "banner"}
                  onChange={(event) => chooseMedia(event, "banner")}
                />
              </div>
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
                  <span className="detected-icon" title="Ícone identificado">
                    <AutomaticLinkIcon url={l.url} />
                  </span>
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
                      onBlur={(e) =>
                        updateLink(i, "url", normalizeUrl(e.target.value))
                      }
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
            <div className="save-actions">
              <a
                className="open-page-button"
                href={`${import.meta.env.BASE_URL}${profile.username}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={17} /> Ver minha página
              </a>
              <button
                className="primary-button"
                onClick={save}
                disabled={saving || Boolean(uploading)}
              >
                <Save size={18} />
                {saving ? "Salvando…" : "Salvar e publicar"}
              </button>
            </div>
          </div>
          {cropSource && (
            <CropImageModal
              source={cropSource.url}
              kind={cropSource.kind}
              crop={crop}
              zoom={zoom}
              saving={Boolean(uploading)}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setCroppedArea(pixels)}
              onCancel={closeCropper}
              onConfirm={finishCrop}
            />
          )}
        </section>
      </div>
    </main>
  );
}

function MediaUpload({
  label,
  hint,
  value,
  uploading,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  uploading: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="media-upload">
      <div className="media-preview">
        {value ? <img src={value} alt="" /> : <ImageIcon />}
      </div>
      <div>
        <strong>{label}</strong>
        <small>{hint}</small>
      </div>
      <label className="upload-button">
        {uploading ? <Loader2 className="spin" /> : <ImageUp />}
        {uploading ? "Enviando…" : value ? "Trocar" : "Enviar"}
        <input
          type="file"
          accept="image/*"
          onChange={onChange}
          disabled={uploading}
        />
      </label>
    </div>
  );
}

function ImageIcon() {
  return <UserRound aria-hidden="true" />;
}

function CropImageModal({
  source,
  kind,
  crop,
  zoom,
  saving,
  onCropChange,
  onZoomChange,
  onCropComplete,
  onCancel,
  onConfirm,
}: {
  source: string;
  kind: "avatar" | "banner";
  crop: Point;
  zoom: number;
  saving: boolean;
  onCropChange: (point: Point) => void;
  onZoomChange: (zoom: number) => void;
  onCropComplete: (area: Area, pixels: Area) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) onCancel();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onCancel, saving]);
  return (
    <div className="crop-modal-backdrop" role="presentation">
      <section
        className="crop-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="crop-title"
      >
        <header>
          <div>
            <span className="kicker">Ajustar imagem</span>
            <h2 id="crop-title">
              {kind === "avatar" ? "Foto de perfil" : "Banner da página"}
            </h2>
          </div>
          <button
            className="crop-close"
            onClick={onCancel}
            disabled={saving}
            aria-label="Fechar"
          >
            ×
          </button>
        </header>
        <div className={`crop-area crop-${kind}`}>
          <Cropper
            image={source}
            crop={crop}
            zoom={zoom}
            aspect={kind === "avatar" ? 1 : 3.2}
            cropShape="rect"
            showGrid
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropComplete}
          />
        </div>
        <label className="zoom-control">
          <span>Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(event) => onZoomChange(Number(event.target.value))}
          />
        </label>
        <p>Arraste a imagem para escolher o melhor enquadramento.</p>
        <footer>
          <button className="crop-cancel" onClick={onCancel} disabled={saving}>
            Cancelar
          </button>
          <button
            className="primary-button"
            onClick={onConfirm}
            disabled={saving}
          >
            {saving ? <Loader2 className="spin" /> : <Check />}
            {saving ? "Enviando…" : "Aplicar recorte"}
          </button>
        </footer>
      </section>
    </div>
  );
}

async function cropImage(source: string, area: Area) {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = reject;
    element.src = source;
  });
  const scale = Math.min(1, 1600 / area.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(area.width * scale);
  canvas.height = Math.round(area.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Não foi possível preparar a imagem.");
  context.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha no recorte."))),
      "image/jpeg",
      0.9,
    );
  });
}

const networkIcons: Array<{ domains: string[]; icon: IconType }> = [
  { domains: ["instagram.com"], icon: FaInstagram },
  { domains: ["youtube.com", "youtu.be"], icon: FaYoutube },
  { domains: ["github.com"], icon: FaGithub },
  { domains: ["linkedin.com"], icon: FaLinkedinIn },
  { domains: ["facebook.com", "fb.com"], icon: FaFacebookF },
  { domains: ["tiktok.com"], icon: FaTiktok },
  { domains: ["whatsapp.com", "wa.me"], icon: FaWhatsapp },
  { domains: ["twitter.com", "x.com"], icon: FaXTwitter },
  { domains: ["spotify.com"], icon: FaSpotify },
  { domains: ["twitch.tv"], icon: FaTwitch },
  { domains: ["pinterest.com"], icon: FaPinterestP },
];

function AutomaticLinkIcon({ url }: { url: string }) {
  let hostname = "";
  try {
    hostname = new URL(normalizeUrl(url)).hostname
      .toLowerCase()
      .replace(/^www\./, "");
  } catch {
    return <Globe2 size={21} />;
  }
  const match = networkIcons.find(({ domains }) =>
    domains.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
    ),
  );
  if (!match) return <Globe2 size={21} />;
  const Icon = match.icon;
  return <Icon size={20} aria-hidden="true" />;
}

function normalizeUrl(url: string) {
  const clean = url.trim();
  if (!clean || clean === "https://") return clean;
  return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
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

function LandingPage() {
  return (
    <main className="landing">
      <nav className="landing-nav">
        <Brand />
        <div className="landing-nav-links">
          <a href="#como-funciona">Como funciona</a>
          <a href="#recursos">Recursos</a>
        </div>
        <div className="landing-nav-actions">
          <Link className="nav-login" to="/login">
            Entrar
          </Link>
          <Link className="nav-cta" to="/login">
            Criar minha página
          </Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="hero-copy">
          <span className="hero-badge">
            <Sparkles size={15} /> Um link para tudo que é seu
          </span>
          <h1>
            Sua presença digital,
            <br />
            <em>do seu jeito.</em>
          </h1>
          <p>
            Reúna seus sites, redes sociais, vídeos, produtos e contatos em uma
            página bonita que combina com você.
          </p>
          <div className="hero-actions">
            <Link className="hero-primary" to="/login">
              Criar minha página grátis <ArrowRight size={18} />
            </Link>
            <Link className="hero-secondary" to="/camilanogueira">
              Ver página de exemplo
            </Link>
          </div>
          <div className="hero-proof">
            <span>✓ Sem código</span>
            <span>✓ Personalizável</span>
            <span>✓ Pronto em minutos</span>
          </div>
        </div>

        <div
          className="hero-showcase"
          aria-label="Exemplo de uma página de links"
        >
          <div className="showcase-glow" />
          <div className="browser-frame">
            <div className="browser-bar">
              <i />
              <i />
              <i />
              <span>links.dev/camilanogueira</span>
            </div>
            <div className="mini-profile">
              <img src={exampleAvatar} alt="Foto da usuária de exemplo" />
              <small>@camilanogueira</small>
              <h2>Camila Nogueira</h2>
              <p>Conteúdo, projetos e novidades reunidos em um só lugar.</p>
              <div className="mini-link featured">
                <span>
                  <Zap size={17} />
                </span>
                <b>Conheça meu trabalho</b>
                <i>↗</i>
              </div>
              <div className="mini-link">
                <span>
                  <Link2 size={17} />
                </span>
                <b>Meu canal no YouTube</b>
                <i>↗</i>
              </div>
              <div className="mini-link">
                <span>
                  <MonitorSmartphone size={17} />
                </span>
                <b>Visite meu site</b>
                <i>↗</i>
              </div>
            </div>
          </div>
          <div className="floating-note note-one">
            <Palette size={17} />
            <span>
              <b>Sua identidade</b> cores e estilo
            </span>
          </div>
          <div className="floating-note note-two">
            <Eye size={17} />
            <span>
              <b>Você escolhe</b> o que exibir
            </span>
          </div>
        </div>
      </section>

      <section className="how-section" id="como-funciona">
        <div className="section-heading">
          <span className="kicker">Simples de verdade</span>
          <h2>
            Da ideia ao seu link
            <br />
            em três passos.
          </h2>
        </div>
        <div className="steps-grid">
          <article>
            <span>01</span>
            <UserRound />
            <h3>Crie sua conta</h3>
            <p>Escolha seu endereço exclusivo e conte um pouco sobre você.</p>
          </article>
          <article>
            <span>02</span>
            <SlidersHorizontal />
            <h3>Personalize tudo</h3>
            <p>Adicione seus links e decida quais informações quer mostrar.</p>
          </article>
          <article>
            <span>03</span>
            <Share2 />
            <h3>Compartilhe</h3>
            <p>Use seu único link na bio, cartão, mensagem ou onde quiser.</p>
          </article>
        </div>
      </section>

      <section className="features-section" id="recursos">
        <div className="feature-copy">
          <span className="kicker">Feito para todo mundo</span>
          <h2>Você não precisa ter portfólio para ter presença.</h2>
          <p>
            Divulgue o que importa para você: uma loja, um canal, uma agenda,
            suas redes ou apenas um jeito fácil de entrar em contato.
          </p>
          <ul>
            <li>
              <ShieldCheck /> Seus dados protegidos
            </li>
            <li>
              <Palette /> Visual com a sua identidade
            </li>
            <li>
              <Eye /> Informações sempre opcionais
            </li>
          </ul>
        </div>
        <div className="audience-cloud">
          <span>Criadores</span>
          <span>Profissionais</span>
          <span>Lojas</span>
          <span>Artistas</span>
          <span>Freelancers</span>
          <span>Empresas</span>
          <span>Influenciadores</span>
        </div>
      </section>

      <section className="landing-final">
        <Sparkles />
        <h2>
          Tudo o que é seu.
          <br />
          Em um só lugar.
        </h2>
        <p>Comece agora e transforme sua bio em uma experiência.</p>
        <Link to="/login">
          Criar minha página <ArrowRight size={18} />
        </Link>
      </section>
      <footer className="landing-footer">
        <Brand />
        <p>Uma nova forma de compartilhar sua presença digital.</p>
        <span>© 2026 LinksDev · nome provisório</span>
      </footer>
    </main>
  );
}

function PublicPage({ session }: { session: Session | null }) {
  const { username } = useParams();
  const [data, setData] = useState<{
    profile: Profile;
    links: UserLink[];
  } | null>(null);
  const [loading, setLoading] = useState(Boolean(username));
  useEffect(() => {
    if (!username || username === "camilanogueira") {
      setLoading(false);
      return;
    }
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
  if (username && username !== "camilanogueira" && !data)
    return (
      <main className="not-found">
        <Brand />
        <h1>Página não encontrada</h1>
        <p>Este endereço ainda não foi criado.</p>
        <Link to="/login">Criar minha página</Link>
      </main>
    );
  const p = data?.profile;
  const isDemo = username === "camilanogueira";
  const publicName =
    p?.display_name || (isDemo ? "Camila Nogueira" : demo.name);
  const instagramHandle = p
    ? p.instagram_handle
    : isDemo
      ? "camilanogueira"
      : "";
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
        {
          "--accent": p?.accent_color || "#6ef5a8",
          "--accent-strong": p?.accent_color || "#6ef5a8",
        } as React.CSSProperties
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
            {session && (
              <Link
                className="icon-button"
                to="/dashboard"
                aria-label="Configurar minha página"
                title="Configurar minha página"
              >
                <Settings size={18} />
              </Link>
            )}
            <button
              className="icon-button"
              onClick={() =>
                navigator.share?.({
                  url: location.href,
                  title: publicName,
                })
              }
            >
              <Share2 size={18} />
            </button>
          </div>
        </nav>
        {p?.banner_url && (
          <div className="profile-banner">
            <img src={p.banner_url} alt="Banner do perfil" />
          </div>
        )}
        <header className="profile-header">
          <div className="avatar-wrap">
            <img
              src={p?.avatar_url || (isDemo ? exampleAvatar : demo.avatar)}
              alt="Foto de perfil"
            />
          </div>
          {instagramHandle && <p className="eyebrow">@{instagramHandle}</p>}
          <h1>{publicName}</h1>
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
                <AutomaticLinkIcon url={l.url} />
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
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/camilanogueira"
        element={<PublicPage session={session} />}
      />
      <Route path="/u/:username" element={<PublicPage session={session} />} />
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
      <Route path="/:username" element={<PublicPage session={session} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppRoutes />
    </BrowserRouter>
  );
}
