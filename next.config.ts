import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  // A pagina mora em despertaresi.com.br/terapia-ocupacional-salvador/, e tudo que
  // ela serve tem que caber nesse prefixo (§1.3). Igual a BASE_PATH em
  // src/lib/site.ts: mudou um, mude o outro.
  basePath: "/terapia-ocupacional-salvador",
  // Endereco com barra no fim, como no LEIA-ME e nos redirecionamentos da troca.
  trailingSlash: true,
  turbopack: {
    rules: {
      // O HTML do pacote aprovado (conteudo/*.html) entra no build como texto.
      // Ele e lido em tempo de build e vira componentes React em
      // src/components/PaginaDoPacote.tsx; nenhum arquivo e lido no servidor.
      "*.html": { type: "text" },
    },
  },
};

export default nextConfig;
