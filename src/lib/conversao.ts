/**
 * Eventos de conversao da pagina. Copiado do template-lp de genosgroup/padroes
 * e adaptado para a Despertar, que alem de GA4 e Meta tambem otimiza no
 * Google Ads.
 *
 * Os nomes nao sao escolha de estilo. "Lead" e "Contact" sao os nomes padrao
 * da Meta e "generate_lead" o do GA4: so com eles o evento aparece como
 * conversao otimizavel. Nome inventado vira evento solto, que nenhuma
 * campanha consegue usar para otimizar.
 *
 * Lead e so para quem entregou contato. Clique no WhatsApp e Contact, nunca
 * Lead.
 *
 * Tudo dentro de try/catch e com checagem de existencia porque bloqueador de
 * anuncio e comum no publico de trafego pago: com o gtag ou o fbq barrado, a
 * funcao vira no-op e o formulario segue normal. Medicao nunca pode derrubar
 * o envio do lead.
 */
import {
  ADS_ID,
  ADS_LABEL_CONTATO,
  ADS_LABEL_LEAD,
  GA_ID,
  META_PIXEL_ID,
} from "@/lib/medicao";

type Fn = (...args: unknown[]) => void;

function gtag(...args: unknown[]) {
  try {
    const fn = (window as unknown as { gtag?: Fn }).gtag;
    if (typeof fn === "function") fn(...args);
  } catch {
    // medicao bloqueada: segue o jogo
  }
}

function fbq(...args: unknown[]) {
  try {
    const fn = (window as unknown as { fbq?: Fn }).fbq;
    if (META_PIXEL_ID && typeof fn === "function") fn(...args);
  } catch {
    // medicao bloqueada: segue o jogo
  }
}

/**
 * Chamar DEPOIS da resposta de sucesso do envio e ANTES de qualquer redirect.
 * Envio que falhou nao e lead: conta-lo infla a conversao e estraga a
 * otimizacao.
 */
export function registrarLead(origem: string) {
  if (GA_ID) gtag("event", "generate_lead", { origem, send_to: GA_ID });
  if (ADS_ID && ADS_LABEL_LEAD) {
    gtag("event", "conversion", { send_to: `${ADS_ID}/${ADS_LABEL_LEAD}` });
  }
  fbq("track", "Lead", { content_name: origem });
}

/** Clique num botao de WhatsApp de paciente. */
export function registrarContato(origem: string) {
  if (GA_ID) gtag("event", "whatsapp_clicado", { origem, send_to: GA_ID });
  if (ADS_ID && ADS_LABEL_CONTATO) {
    gtag("event", "conversion", { send_to: `${ADS_ID}/${ADS_LABEL_CONTATO}` });
  }
  fbq("track", "Contact", { content_name: origem });
}
