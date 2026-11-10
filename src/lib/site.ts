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

/**
 * Para onde o formulario manda o lead: public/api/lead/index.php, que repassa
 * para o webhook do n8n (endereco em public/api/lead/pagina.php). Com a barra
 * final: sem ela o servidor redireciona, e o POST se perde.
 */
export const ROTA_DO_LEAD = `${BASE_PATH}/api/lead/`;
