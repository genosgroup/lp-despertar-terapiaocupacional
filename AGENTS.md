# Genos · regras desta base

## Medição: leia antes de criar ou mexer em LP

O padrão completo está em **[genosgroup/padroes → checklist-lp.md](https://github.com/genosgroup/padroes/blob/main/checklist-lp.md)**.
O que nunca pode ser decidido de novo caso a caso:

- **GA4 `G-X2G6KW4TNY` e Pixel `624880005754303`**, os mesmos em toda LP da Genos.
  Propriedade por LP parte o funil em pedaços que não somam; Pixel por LP fragmenta o
  aprendizado e deixa cada público pequeno demais para a Meta otimizar.
- **`content_group` com o nome da LP** no `gtag('config')`. É o que separa as LPs nos
  relatórios sem depender de filtro por URL.
- **Tags no template compartilhado** (layout raiz), nunca página a página. E lembre que
  cobertura é por **deploy**, não por domínio: LP nova em repositório novo precisa das
  tags no código dela, mesmo que o domínio já esteja coberto. (§1.5)
- **Conversão em código**, nunca só dentro de um GTM: `generate_lead` no GA4 e `Lead` na
  Meta, disparados **depois** da resposta de sucesso da API e **antes** de qualquer
  redirect. Nome inventado não conta como conversão otimizável. (§1.7)
- **Todo disparo em `try/catch`.** Bloqueador de anúncio é comum no público de tráfego
  pago; medição bloqueada não pode derrubar o envio do lead. (§1.4)
- **Nenhuma tag de terceiro.** Se aparecer `GT-`, `GTM-` ou `G-` que não seja a da Genos,
  provavelmente veio de migração de WordPress — e antes de remover, procure a conversão
  dentro dela. (§1.6)

Além da medição, o checklist cobre **SEO técnico** (§7), **performance** (§8) e
**conteúdo** (§9). Dois itens que o padrão antigo não pegava e que valem para toda LP
nova: `<html lang="pt-BR">` — boilerplate nasce com `en` e ninguém repara — e
`robots.txt` com `sitemap.xml`.

O kit para copiar numa LP nova está no §1.7. O inventário das páginas no ar está na
Parte 3, e **a lista que se roda antes do primeiro anúncio está na Parte 4.**

## Arquivos servidos

A rota do Worker casa por **prefixo**. Todo arquivo público precisa caber dentro do prefixo da rota: um arquivo em `/og.png` nunca chega a um Worker servido sob `/caminho`. (§1.3)
`avaliacao` por isso: um arquivo em `/og.png` nunca chega a este Worker. (§1.3)

## Nesta base: LP de cliente (Clínica Despertar · Terapia ocupacional)

Esta é a página de terapia ocupacional do site da **Clínica Despertar**
(`despertaresi.com.br/terapia-ocupacional-salvador/`), não uma LP da Genos. Por isso os IDs de
medição **não** são os da regra acima: o checklist (Fase 0, §2.5 e §4.2) manda LP de
cliente usar a propriedade e o pixel **da marca**. Pôr o Pixel da Genos aqui faria o Lead
da Despertar sumir das campanhas da Despertar. **Não troque pelos IDs da Genos.**

Os IDs ficam todos em `src/lib/medicao.ts`. Vazio = desligado.

| O quê | ID | Observação |
| --- | --- | --- |
| Pixel da Meta | `984879360375130` | "Pixel - Despertar", conta CA - Despertar Oficial |
| Google Ads | `AW-16923338982` | conversões com rótulo próprio para Lead e para Contato |
| GA4 | ainda não existe | a Despertar não tem GA4; preencher quando a propriedade for criada |
| Clarity | `qy00gm1j1s` | herdado do GTM do site antigo |

O site antigo (WordPress) media tudo pelo `GTM-MDXF8NKB`. Esta base não usa GTM: as tags e
as conversões estão no código, como manda o padrão (§1.6 e §4.1).

**A página é servida sob um caminho.** O `basePath` do `next.config.ts` e o `BASE_PATH` de
`src/lib/site.ts` são `/terapia-ocupacional-salvador`, e todo arquivo servido mora dentro dele
(§1.3). Por isso esta base **não** tem `robots.txt` nem `sitemap.xml`: os do domínio ficam
no repositório da raiz (`lp-despertar-principal`), que já lista esta página.

Esta base é irmã de `lp-despertar-principal` e `lp-despertar-fonoaudiologia`: os
componentes são os mesmos, e o que muda fica em `src/lib/site.ts`, `src/lib/medicao.ts`,
na pergunta de idade de `src/lib/lead.ts` e no pacote em `conteudo/`. Mudou um componente
aqui? Leve a mudança para as outras duas.

O card da terapeuta ocupacional está **comentado** em `conteudo/pagina.html` (bloco
`CARD DA TO`), como no pacote, e por isso não aparece. Quando chegarem nome, foto e
CREFITO, essa é a única edição à mão prevista no HTML: tire o comentário, preencha e ponha a
foto em `public/imagens/`. Passo a passo no `README.md`.

**Publicação:** Turbo Cloud (cPanel + LiteSpeed), como **site estático** (`output: "export"`,
sem Node e sem Cache Components, que não funciona em exportação). O envio do lead é o
`public/api/lead/index.php` (igual nas três páginas; o que muda fica em `pagina.php`), não
uma rota do Next. Quem publica é o GitHub Actions, por SSH, com os scripts de
`hospedagem/`. Não crie rota de servidor no Next (route handler com POST, server action):
ela não existe no site publicado.

O HTML e o CSS da página vêm do pacote aprovado e ficam em `conteudo/`, sem edição à mão.
Para mudar texto, troque o pacote inteiro. Detalhes no `README.md`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
