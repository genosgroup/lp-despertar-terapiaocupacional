/**
 * Guarda a origem da visita (UTMs, gclid, fbclid, referrer e URL de chegada)
 * para mandar junto com o lead.
 *
 * Fica no sessionStorage porque a pessoa pode chegar com UTM, ir para a
 * pagina de fono ou TO e voltar sem a query string: sem guardar, o lead
 * chegaria sem origem. Vale a primeira chegada da sessao. Tudo em try/catch:
 * aba anonima e bloqueador podem negar o storage, e o formulario tem que
 * funcionar igual.
 */
import { PARAMETROS_DE_RASTREIO, type Rastreio } from "@/lib/lead";

const CHAVE = "dsp-rastreio";

function lerDaUrl(): Rastreio {
  const rastreio: Rastreio = {};
  try {
    const params = new URLSearchParams(window.location.search);
    for (const p of PARAMETROS_DE_RASTREIO) {
      const v = params.get(p);
      if (v) rastreio[p] = v.slice(0, 300);
    }
    rastreio.pagina_de_entrada = window.location.href.slice(0, 1000);
    if (document.referrer) rastreio.referrer = document.referrer.slice(0, 1000);
  } catch {
    // sem acesso a URL: segue sem rastreio
  }
  return rastreio;
}

function temOrigem(r: Rastreio) {
  return PARAMETROS_DE_RASTREIO.some((p) => r[p]);
}

/** Chamar uma vez ao carregar a pagina. */
export function guardarRastreio() {
  const atual = lerDaUrl();
  try {
    const salvo = sessionStorage.getItem(CHAVE);
    // Chegada nova com UTM substitui; sem UTM, mantem o que ja estava guardado.
    if (!salvo || temOrigem(atual)) {
      sessionStorage.setItem(CHAVE, JSON.stringify(atual));
    }
  } catch {
    // storage bloqueado: lerRastreio() cai na URL atual
  }
}

export function lerRastreio(): Rastreio {
  try {
    const salvo = sessionStorage.getItem(CHAVE);
    if (salvo) return JSON.parse(salvo) as Rastreio;
  } catch {
    // storage bloqueado ou corrompido
  }
  return lerDaUrl();
}
