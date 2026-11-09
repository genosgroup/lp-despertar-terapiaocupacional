import {
  PARAMETROS_DE_RASTREIO,
  validarLead,
  whatsappComDdi,
  type LeadEnviado,
} from "@/lib/lead";
import { NOME_DA_PAGINA } from "@/lib/medicao";
import { WEBHOOK_DO_LEAD } from "@/lib/site";

/**
 * Recebe o lead do formulario, valida e repassa para a automacao do n8n, que
 * cria o card no Kommo. O lead vai num JSON plano, ja com os nomes dos campos
 * do Kommo, e o mesmo nas tres paginas da Despertar.
 *
 * Para onde vai:
 *   - em producao (next build / next start, e no ar): o webhook desta pagina,
 *     WEBHOOK_DO_LEAD em src/lib/site.ts;
 *   - em desenvolvimento (next dev): para lugar nenhum, a nao ser que
 *     LEAD_WEBHOOK_URL esteja definida. Assim ninguem cria lead de teste no
 *     Kommo da Despertar sem querer;
 *   - LEAD_WEBHOOK_URL, se definida, vale sobre os dois (para testar com um
 *     webhook de teste, por exemplo).
 *
 *   LEAD_WEBHOOK_TOKEN  opcional; vai como "Authorization: Bearer ...". E o que
 *                       protege o webhook, que esta escrito num repositorio
 *                       publico: com a autenticacao por cabecalho ligada no n8n,
 *                       quem tem so o endereco nao consegue mandar lead.
 *
 * Sem destino, ou com o destino fora do ar, a rota responde erro: o formulario
 * mostra a falha com o WhatsApp e NAO conta conversao. Lead nunca e dado como
 * enviado sem ter ido.
 */

const LIMITE = 200;

function texto(valor: unknown, limite = LIMITE) {
  return typeof valor === "string" ? valor.trim().slice(0, limite) : "";
}

export async function POST(request: Request) {
  let corpo: Partial<LeadEnviado>;
  try {
    corpo = (await request.json()) as Partial<LeadEnviado>;
  } catch {
    return Response.json({ ok: false, erro: "json_invalido" }, { status: 400 });
  }

  const lead: LeadEnviado = {
    nome: texto(corpo.nome, 120),
    whatsapp: texto(corpo.whatsapp, 40),
    idade: texto(corpo.idade),
    quem_indicou: texto(corpo.quem_indicou),
  };

  // Campo-isca preenchido = robo. Responde ok para ele nao tentar de novo, e nao repassa.
  if (texto(corpo.empresa)) return Response.json({ ok: true });

  const erros = validarLead(lead);
  if (Object.keys(erros).length > 0) {
    return Response.json({ ok: false, erro: "dados_invalidos", campos: erros }, { status: 422 });
  }

  const destino =
    process.env.LEAD_WEBHOOK_URL ||
    (process.env.NODE_ENV === "production" ? WEBHOOK_DO_LEAD : "");
  if (!destino) {
    console.error("[lead] sem destino (desenvolvimento sem LEAD_WEBHOOK_URL): lead nao repassado");
    return Response.json({ ok: false, erro: "destino_nao_configurado" }, { status: 503 });
  }

  const r = corpo.rastreio ?? {};
  const rastreio = Object.fromEntries(
    PARAMETROS_DE_RASTREIO.map((p) => [p, texto(r[p], 300)]),
  );

  const payload = {
    pagina: NOME_DA_PAGINA, // nota do card no Kommo ("Home", "LP Fono", "LP TO")
    nome: lead.nome,
    whatsapp: whatsappComDdi(lead.whatsapp),
    idade: lead.idade, // campo "Idade da criança" no Kommo, nas tres paginas
    quem_indicou: lead.quem_indicou,
    ...rastreio,
    referrer: texto(r.referrer, 1000),
    pagina_de_entrada: texto(r.pagina_de_entrada, 1000),
    enviado_em: new Date().toISOString(),
  };

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.LEAD_WEBHOOK_TOKEN) {
    headers.Authorization = `Bearer ${process.env.LEAD_WEBHOOK_TOKEN}`;
  }

  try {
    const resposta = await fetch(destino, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    if (!resposta.ok) {
      console.error(`[lead] destino respondeu ${resposta.status}`);
      return Response.json({ ok: false, erro: "destino_recusou" }, { status: 502 });
    }
  } catch (erro) {
    console.error("[lead] falha ao repassar", erro);
    return Response.json({ ok: false, erro: "destino_indisponivel" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
