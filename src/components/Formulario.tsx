"use client";

import { useEffect, useRef, useState, type FormEvent, type MouseEvent, type ReactNode } from "react";
import { registrarContato, registrarLead } from "@/lib/conversao";
import {
  OPCOES_QUEM_INDICOU,
  PERGUNTA_IDADE,
  validarLead,
  type Campo,
  type ErrosDoLead,
  type LeadEnviado,
} from "@/lib/lead";
import { NOME_DA_PAGINA } from "@/lib/medicao";
import { guardarRastreio, lerRastreio } from "@/lib/rastreio";
import { ROTA_DO_LEAD } from "@/lib/site";

/** id do campo na tela -> campo do lead */
const IDS: Record<Campo, string> = {
  nome: "dsp-nome",
  whatsapp: "dsp-whats",
  idade: "dsp-idade",
  quem_indicou: "dsp-indicou",
};
const CAMPO_DO_NAME: Record<string, Campo> = {
  nome: "nome",
  whatsapp: "whatsapp",
  idade: "idade",
  indicou: "quem_indicou",
};

type Estado = "form" | "enviando" | "ok" | "falha";

/**
 * O formulario da "Primeira conversa", com a mesma marcacao da previa
 * aprovada. No WordPress ele seria o formulario do Elementor encaixado no
 * cartao; aqui ele e proprio e envia para a rota do lead.
 *
 * `confirmacao` e o bloco "Recebemos seu contato" do HTML do pacote, passado
 * pronto pelo servidor. Os cliques dentro dele (WhatsApp e "ver o formulario
 * de novo") sao tratados aqui por delegacao. `linkWhatsApp` e o link do botao
 * dessa confirmacao, reaproveitado na mensagem de falha.
 */
export default function Formulario({
  confirmacao,
  linkWhatsApp,
}: {
  confirmacao: ReactNode;
  linkWhatsApp: string;
}) {
  const [estado, setEstado] = useState<Estado>("form");
  const [erros, setErros] = useState<ErrosDoLead>({});
  const okRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    guardarRastreio();
  }, []);

  useEffect(() => {
    if (estado !== "ok") return;
    const titulo = okRef.current?.querySelector("h3");
    if (titulo) {
      titulo.setAttribute("tabindex", "-1");
      titulo.focus();
    }
  }, [estado]);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (estado === "enviando") return;
    const form = e.currentTarget;
    const dados = new FormData(form);
    const lead: LeadEnviado = {
      nome: String(dados.get("nome") ?? "").trim(),
      whatsapp: String(dados.get("whatsapp") ?? "").trim(),
      idade: String(dados.get("idade") ?? ""),
      quem_indicou: String(dados.get("indicou") ?? ""),
      empresa: String(dados.get("empresa") ?? ""),
      rastreio: lerRastreio(),
    };

    const encontrados = validarLead(lead);
    setErros(encontrados);
    const primeiro = (Object.keys(IDS) as Campo[]).find((c) => encontrados[c]);
    if (primeiro) {
      document.getElementById(IDS[primeiro])?.focus();
      return;
    }

    setEstado("enviando");
    try {
      const resposta = await fetch(ROTA_DO_LEAD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
      const corpo = (await resposta.json().catch(() => null)) as { ok?: boolean } | null;
      if (!resposta.ok || !corpo?.ok) throw new Error(`envio recusado (${resposta.status})`);
    } catch {
      setEstado("falha");
      return;
    }

    // Depois da resposta de sucesso e antes de qualquer mudanca de tela (§1.7).
    registrarLead(NOME_DA_PAGINA);
    form.reset();
    setEstado("ok");
  }

  function limparErro(e: FormEvent<HTMLFormElement>) {
    const campo = CAMPO_DO_NAME[(e.target as HTMLInputElement).name];
    if (campo && erros[campo]) setErros((atual) => ({ ...atual, [campo]: undefined }));
  }

  function cliqueNaConfirmacao(e: MouseEvent<HTMLDivElement>) {
    const alvo = e.target as HTMLElement;
    if (alvo.closest('a[href*="wa.me/"]')) registrarContato(NOME_DA_PAGINA);
    if (alvo.closest("#dsp-voltar")) setEstado("form");
  }

  const erroDe = (campo: Campo) =>
    erros[campo] ? (
      <p className="dsp-lp-campo__erro" id={`${IDS[campo]}-erro`}>
        {erros[campo]}
      </p>
    ) : null;
  const ariaDe = (campo: Campo) =>
    erros[campo]
      ? { "aria-invalid": true as const, "aria-describedby": `${IDS[campo]}-erro` }
      : {};

  return (
    <>
      <form
        className="dsp-lp-campos"
        id="dsp-form"
        noValidate
        hidden={estado === "ok"}
        onSubmit={enviar}
        onInput={limparErro}
      >
        <div className="dsp-lp-campo">
          <label htmlFor="dsp-nome">Seu nome</label>
          <input
            id="dsp-nome"
            name="nome"
            type="text"
            autoComplete="name"
            placeholder="Como podemos chamar você?"
            {...ariaDe("nome")}
          />
          {erroDe("nome")}
        </div>
        <div className="dsp-lp-campo">
          <label htmlFor="dsp-whats">WhatsApp</label>
          <input
            id="dsp-whats"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(71) 9 0000-0000"
            {...ariaDe("whatsapp")}
          />
          {erroDe("whatsapp")}
        </div>
        <div className="dsp-lp-campo">
          <label htmlFor="dsp-idade">{PERGUNTA_IDADE.rotulo}</label>
          <select id="dsp-idade" name="idade" defaultValue="" {...ariaDe("idade")}>
            <option value="">Escolha</option>
            {PERGUNTA_IDADE.opcoes.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          {erroDe("idade")}
        </div>
        <div className="dsp-lp-campo">
          <label htmlFor="dsp-indicou">
            Alguém indicou a Despertar? <small>(opcional)</small>
          </label>
          <select id="dsp-indicou" name="indicou" defaultValue="" {...ariaDe("quem_indicou")}>
            <option value="">Escolha</option>
            {OPCOES_QUEM_INDICOU.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          {erroDe("quem_indicou")}
        </div>
        <div className="dsp-lp-isca" aria-hidden="true">
          <label htmlFor="dsp-empresa">Empresa</label>
          <input id="dsp-empresa" name="empresa" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        {estado === "falha" ? (
          <p className="dsp-lp-form__falha" role="alert">
            Não conseguimos enviar agora. Tente de novo em instantes ou{" "}
            <a
              href={linkWhatsApp}
              target="_blank"
              rel="noopener"
              onClick={() => registrarContato(NOME_DA_PAGINA)}
            >
              chame a gente no WhatsApp
            </a>
            .
          </p>
        ) : null}
        <button className="dsp-lp-botao" type="submit" disabled={estado === "enviando"}>
          {estado === "enviando" ? "Enviando..." : "Quero marcar a primeira conversa"}
        </button>
      </form>
      <div
        className="dsp-lp-ok"
        id="dsp-ok"
        hidden={estado !== "ok"}
        ref={okRef}
        onClick={cliqueNaConfirmacao}
        aria-live="polite"
      >
        {confirmacao}
      </div>
    </>
  );
}
