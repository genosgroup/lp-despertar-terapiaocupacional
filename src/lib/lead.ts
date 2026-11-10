/**
 * O lead do formulario: campos, opcoes e validacao (no navegador). O
 * public/api/lead/index.php refaz a parte essencial da validacao no servidor.
 */

/**
 * A pergunta de idade. Vai para um campo so no Kommo, "Idade da criança", nas
 * tres paginas; o que muda e o texto. Opcoes do pacote aprovado (LEIA-ME,
 * item 5 da montagem), escritas como nas previas de fono e TO.
 */
export const PERGUNTA_IDADE = {
  rotulo: "Idade da criança",
  erro: "Escolha a idade da criança.",
  opcoes: ["até 2 anos", "2 a 4", "5 a 7", "8 a 12", "mais de 12"],
} as const;

export const OPCOES_QUEM_INDICOU = [
  "Escola",
  "Pediatra ou neuropediatra",
  "Dentista ou outro profissional de saúde",
  "Google",
  "Instagram",
  "Amigo ou família",
  "Outro",
] as const;

/** Parametros de rastreio lidos da URL de chegada (os mesmos campos de rastreio do Kommo). */
export const PARAMETROS_DE_RASTREIO = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
] as const;

export type ParametroDeRastreio = (typeof PARAMETROS_DE_RASTREIO)[number];

export type Rastreio = Partial<Record<ParametroDeRastreio, string>> & {
  /** De onde a pessoa veio (document.referrer na chegada). */
  referrer?: string;
  /** URL completa da chegada, com a query string. */
  pagina_de_entrada?: string;
};

/** O que o formulario manda para /api/lead. */
export type LeadEnviado = {
  nome: string;
  whatsapp: string;
  /** Resposta da PERGUNTA_IDADE. */
  idade: string;
  quem_indicou: string;
  /** Campo-isca: gente nao preenche, robo preenche. */
  empresa?: string;
  rastreio?: Rastreio;
};

export type Campo = "nome" | "whatsapp" | "idade" | "quem_indicou";
export type ErrosDoLead = Partial<Record<Campo, string>>;

/** So os digitos do telefone. */
export function digitos(valor: string) {
  return valor.replace(/\D/g, "");
}

export function validarLead(lead: Partial<LeadEnviado>): ErrosDoLead {
  const erros: ErrosDoLead = {};
  const nome = (lead.nome ?? "").trim();
  if (nome.length < 2) erros.nome = "Escreva seu nome.";

  const tel = digitos(lead.whatsapp ?? "");
  const local = tel.startsWith("55") && tel.length >= 12 ? tel.slice(2) : tel;
  if (local.length < 10 || local.length > 11) {
    erros.whatsapp = "Confira o WhatsApp, com DDD. Ex.: (71) 9 0000-0000";
  }

  if (!(PERGUNTA_IDADE.opcoes as readonly string[]).includes(lead.idade ?? "")) {
    erros.idade = PERGUNTA_IDADE.erro;
  }

  const indicou = lead.quem_indicou ?? "";
  if (indicou && !(OPCOES_QUEM_INDICOU as readonly string[]).includes(indicou)) {
    erros.quem_indicou = "Escolha uma das opções.";
  }
  return erros;
}
