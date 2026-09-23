import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages de projeto serve em usuario.github.io/nome-do-repo/, então os
// assets (JS/CSS) precisam desse prefixo no build. Em desenvolvimento local
// (`npm run dev`) ou build local sem essa variável, cai em "/" normalmente.
// `GITHUB_REPOSITORY` é definida automaticamente pelo GitHub Actions no
// formato "usuario/nome-do-repo" — não precisa configurar nada manualmente.
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];

export default defineConfig({
  plugins: [react()],
  base: repoName ? `/${repoName}/` : "/",
});
