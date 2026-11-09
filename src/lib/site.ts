/**
 * O que muda de uma pagina da Despertar para outra (principal, fono, TO).
 * Os componentes sao os mesmos nos tres repositorios; a diferenca fica aqui,
 * em src/lib/medicao.ts, em src/lib/lead.ts (a pergunta de idade) e no pacote
 * (conteudo/).
 */

/**
 * Caminho em que esta pagina e servida no dominio. Tem que bater com o
 * basePath do next.config.ts: a rota do Worker casa por prefixo, entao todo
 * arquivo servido (imagens, /_next, a rota do lead, a og:image) precisa morar
 * dentro dele (§1.3).
 */
export const BASE_PATH = "/terapia-ocupacional-salvador";

/** Endereco final da pagina (canonical, og:url). */
export const URL_DA_PAGINA = "https://despertaresi.com.br/terapia-ocupacional-salvador/";

/** Foto do topo: carrega primeiro e com prioridade, porque e o LCP no celular. */
export const FOTO_PRINCIPAL = "dsp-lp-to-topo.webp";

/** Para onde o formulario manda o lead (com a barra final do trailingSlash). */
export const ROTA_DO_LEAD = `${BASE_PATH}/api/lead/`;

/**
 * Webhook do n8n que recebe o lead desta pagina e cria o card no Kommo. Cada
 * pagina tem o seu (despertar-lp-principal, -fono, -to). O repositorio e
 * publico, entao este endereco e visivel: a protecao e o LEAD_WEBHOOK_TOKEN
 * (ver src/app/api/lead/route.ts).
 */
export const WEBHOOK_DO_LEAD =
  "https://webhook.automacaogenosgroup.com.br/webhook/despertar-lp-to";
