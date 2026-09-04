# LinksDev

Uma página de links moderna, responsiva e personalizável, criada como base para uma futura plataforma de perfis digitais.

Agora inclui autenticação, painel individual e perfis públicos persistidos no Supabase.

## Visualizar online

[Acessar o LinksDev](https://gullhenrique.github.io/LinksDev-Projeto/)

## Tecnologias

- React 19
- TypeScript
- Vite
- Lucide Icons
- GitHub Actions e GitHub Pages
- Supabase Auth, PostgreSQL e Row Level Security

## Desenvolvimento

```bash
npm install
npm run dev
```

Depois do cadastro, cada usuário personaliza nome, descrição, links e aparência pelo próprio painel.

O banco pode ser recriado com `supabase/schema.sql`. Copie `.env.example` para `.env.local` e informe a URL e a chave publicável do projeto Supabase.

## Publicação

Cada alteração enviada para a branch `main` é compilada e publicada automaticamente no GitHub Pages.
