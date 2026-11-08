/**
 * IDs de medicao desta LP, num lugar so. Vazio = desligado.
 *
 * ATENCAO: esta e uma LP de CLIENTE (Clinica Despertar). Os IDs sao os da
 * Despertar, nao os da Genos. O checklist manda LP de cliente usar o pixel e
 * a propriedade da marca (Fase 0, §2.5 e §4.2): com o Pixel da Genos aqui, o
 * Lead sumiria das campanhas da Despertar. Ver AGENTS.md.
 *
 * De onde veio cada um: o GTM do site antigo (GTM-MDXF8NKB) e a conta de
 * anuncios da Meta. O site antigo nao tinha GA4.
 */

/** GA4 da Despertar. Ainda nao existe: preencher com o G-XXXXXXXXXX quando for criado. */
export const GA_ID = "";

/** Pixel "Pixel - Despertar" (conta CA - Despertar Oficial). */
export const META_PIXEL_ID = "984879360375130";

/** Google Ads da Despertar (conta 640-302-0329). */
export const ADS_ID = "AW-16923338982";

/**
 * Rotulos das conversoes do Google Ads, os mesmos que o GTM antigo usava.
 * - LEAD: no GTM disparava em qualquer envio de formulario. Aqui so dispara
 *   depois da resposta de sucesso do envio.
 * - CONTATO: no GTM disparava no clique do link de WhatsApp.
 * A terceira conversao do GTM (-BduCL3e-6saEObR1oU_) disparava em TODA
 * visualizacao de pagina e nao foi trazida de proposito: visita nao e
 * conversao.
 */
export const ADS_LABEL_LEAD = "1OExCPnL-qsaEObR1oU_";
export const ADS_LABEL_CONTATO = "pPSJCJrC4qsaEObR1oU_";

/** Microsoft Clarity, herdado do GTM antigo. */
export const CLARITY_ID = "qy00gm1j1s";

/** Separa esta pagina das outras nos relatorios do GA4 (§2.5 / §3.6). */
export const CONTENT_GROUP = "LP · Despertar TO";

/** Nome desta pagina no card do Kommo e nos eventos ("Home", "LP Fono", "LP TO"). */
export const NOME_DA_PAGINA = "LP TO";
