import { BriefcaseBusiness, Github, Instagram, Linkedin, Youtube } from 'lucide-react'

export const profile = {
  name: 'Gustavo Henrique',
  username: '@gullhenrique',
  role: 'Desenvolvedor & Designer',
  bio: 'Transformo ideias em experiências digitais simples, bonitas e memoráveis.',
  location: 'Brasil',
  avatar: `${import.meta.env.BASE_URL}assets/avatar.png`,
  links: [
    { label: 'Veja meus projetos no GitHub', description: 'Código, estudos e projetos open source', url: 'https://github.com/gullhenrique', icon: Github, featured: true },
    { label: 'Portfólio no Behance', description: 'Interfaces, marcas e experiências visuais', url: 'https://behance.net/guhenrique', icon: BriefcaseBusiness },
    { label: 'Conecte-se no LinkedIn', description: 'Carreira, experiências e networking', url: 'https://linkedin.com/in/gustavohenriquedc', icon: Linkedin },
    { label: 'Acompanhe no Instagram', description: 'Bastidores, rotina e novos trabalhos', url: 'https://instagram.com/gullhenrique', icon: Instagram },
  ],
  socials: [
    { label: 'GitHub', url: 'https://github.com/gullhenrique', icon: Github },
    { label: 'Instagram', url: 'https://instagram.com/gullhenrique', icon: Instagram },
    { label: 'YouTube', url: 'https://youtube.com/channel/UC3IVbz0Q59YheP2P8LyWyPQ', icon: Youtube },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/gustavohenriquedc', icon: Linkedin },
  ],
}
