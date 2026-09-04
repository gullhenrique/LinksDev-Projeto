import { useEffect, useState } from 'react'
import { Check, MapPin, Moon, Share2, Sparkles, Sun } from 'lucide-react'
import { profile } from './profile'

type Theme = 'dark' | 'light'

export function App() {
  const [theme, setTheme] = useState<Theme>(() => localStorage.getItem('linksdev-theme') === 'light' ? 'light' : 'dark')
  const [shared, setShared] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('linksdev-theme', theme)
  }, [theme])

  async function shareProfile() {
    const data = { title: `${profile.name} — Links`, text: profile.bio, url: window.location.href }
    try {
      if (navigator.share) await navigator.share(data)
      else await navigator.clipboard.writeText(window.location.href)
      setShared(true)
      window.setTimeout(() => setShared(false), 1800)
    } catch { /* O usuário pode cancelar a janela nativa. */ }
  }

  return (
    <main className="page-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <section className="profile-card" aria-label={`Perfil de ${profile.name}`}>
        <nav className="card-actions" aria-label="Ações do perfil">
          <span className="brand-mark"><Sparkles size={16} /> LinksDev</span>
          <div>
            <button className="icon-button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={`Ativar tema ${theme === 'dark' ? 'claro' : 'escuro'}`}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button className="icon-button" onClick={shareProfile} aria-label="Compartilhar este perfil">{shared ? <Check size={18} /> : <Share2 size={18} />}</button>
          </div>
        </nav>
        <header className="profile-header">
          <div className="avatar-wrap"><img src={profile.avatar} alt={`Foto de ${profile.name}`} /><span className="status-dot" title="Disponível para projetos" /></div>
          <p className="eyebrow">{profile.username}</p><h1>{profile.name}</h1><p className="role">{profile.role}</p>
          <p className="bio">{profile.bio}</p><p className="location"><MapPin size={14} /> {profile.location} · Disponível para projetos</p>
        </header>
        <div className="links-list">
          {profile.links.map(({ label, description, url, icon: Icon, featured }) => (
            <a className={`profile-link${featured ? ' featured' : ''}`} href={url} target="_blank" rel="noreferrer" key={label}>
              <span className="link-icon"><Icon size={21} /></span><span className="link-copy"><strong>{label}</strong><small>{description}</small></span><span className="link-arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
        <footer><div className="socials">{profile.socials.map(({ label, url, icon: Icon }) => <a href={url} target="_blank" rel="noreferrer" aria-label={label} title={label} key={label}><Icon size={20} /></a>)}</div><p>Feito com intenção por {profile.name}</p></footer>
      </section>
    </main>
  )
}
