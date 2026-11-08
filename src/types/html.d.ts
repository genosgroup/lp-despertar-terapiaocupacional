// Arquivos .html importados como texto (regra "*.html" no next.config.ts).
declare module "*.html" {
  const conteudo: string;
  export default conteudo;
}
