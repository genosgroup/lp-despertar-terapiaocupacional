import {
  attributesToProps,
  domToReact,
  htmlToDOM,
  type DOMNode,
  type Element,
  type HTMLReactParserOptions,
} from "html-react-parser";
import htmlDoPacote from "../../conteudo/pagina.html";
import { BASE_PATH, FOTO_PRINCIPAL as ARQUIVO_DA_FOTO_PRINCIPAL } from "@/lib/site";
import BotaoFixo from "./BotaoFixo";
import Formulario from "./Formulario";

/**
 * A pagina e o HTML do pacote aprovado (conteudo/pagina.html), sem reescrever
 * nada. Ele e lido no build e vira React; aqui so se troca o que no WordPress
 * dependia do Elementor ou de script solto:
 *
 * - o encaixe do formulario (#dsp-form-slot) vira o <Formulario>, com a
 *   marcacao da previa aprovada, e o bloco de confirmacao (#dsp-ok) vai junto
 *   com ele;
 * - o botao fixo do celular (#dsp-fixo) ganha o comportamento de sumir no topo
 *   e no formulario;
 * - os <link> das fontes e o <script> do fim saem (fontes no layout,
 *   comportamento nos componentes);
 * - as imagens apontam para /imagens/ em vez da biblioteca de midia do
 *   WordPress, e as que estao fora da primeira dobra carregam sob demanda.
 *
 * Pacote novo? Troque conteudo/pagina.html e conteudo/dsp-lp.css pelos novos e
 * confira se os ids acima continuam existindo.
 */

const IMAGENS_NO_WORDPRESS = "/wp-content/uploads/2026/11/";
// O <img> do HTML nao ganha o basePath sozinho: o caminho vai escrito inteiro.
const IMAGENS_AQUI = `${BASE_PATH}/imagens/`;
const FOTO_PRINCIPAL = `${IMAGENS_AQUI}${ARQUIVO_DA_FOTO_PRINCIPAL}`;
// Se o pacote vier sem botao de WhatsApp na confirmacao, a falha usa este.
const WHATSAPP_PADRAO = "https://wa.me/5571993996613";

/**
 * Elemento HTML (tag, script ou style), pelo formato do no. Nao usa
 * `instanceof Element`: o html-react-parser pode carregar o domhandler de
 * dois lugares, e ai o instanceof falha em silencio.
 */
function ehElemento(no: DOMNode): no is Element {
  return "attribs" in no && "name" in no;
}

function encontrar(nos: DOMNode[], teste: (no: Element) => boolean): Element | null {
  for (const no of nos) {
    if (!ehElemento(no)) continue;
    if (teste(no)) return no;
    const achado = encontrar(no.children as DOMNode[], teste);
    if (achado) return achado;
  }
  return null;
}

function imagem(no: Element) {
  const props = attributesToProps(no.attribs, "img") as Record<string, unknown>;
  const src = String(no.attribs.src ?? "");
  if (src.startsWith("data:")) return undefined; // icones embutidos: ficam como estao

  const naPrimeiraDobra =
    src === FOTO_PRINCIPAL || (no.attribs.class ?? "").startsWith("dsp-lp-barra__");
  return (
    // As imagens do pacote ja vem em WebP no tamanho de exibicao (§8.1).
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img
      {...props}
      decoding="async"
      loading={naPrimeiraDobra ? "eager" : "lazy"}
      fetchPriority={src === FOTO_PRINCIPAL ? "high" : undefined}
    />
  );
}

export default function PaginaDoPacote() {
  const dom = htmlToDOM(htmlDoPacote.replaceAll(IMAGENS_NO_WORDPRESS, IMAGENS_AQUI));

  const opcoes: HTMLReactParserOptions = {
    replace(no) {
      if (!ehElemento(no)) return undefined;
      if (no.name === "link" || no.name === "script") return <></>;
      if (no.name === "img") return imagem(no);

      switch (no.attribs.id) {
        case "dsp-form-slot":
          return <Formulario confirmacao={confirmacao} linkWhatsApp={linkWhatsApp} />;
        case "dsp-ok":
          return <></>; // vai dentro do <Formulario>
        case "dsp-fixo":
          return <BotaoFixo>{domToReact(no.children as DOMNode[], opcoes)}</BotaoFixo>;
        default:
          return undefined;
      }
    },
  };

  const blocoOk = encontrar(dom, (no) => no.attribs.id === "dsp-ok");
  const confirmacao = blocoOk ? domToReact(blocoOk.children as DOMNode[], opcoes) : null;
  const botaoWhatsApp = blocoOk
    ? encontrar(blocoOk.children as DOMNode[], (no) => (no.attribs.href ?? "").includes("wa.me/"))
    : null;
  const linkWhatsApp = botaoWhatsApp?.attribs.href ?? WHATSAPP_PADRAO;

  return <>{domToReact(dom, opcoes)}</>;
}
