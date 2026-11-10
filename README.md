# Clínica Despertar · Terapia ocupacional

A página de terapia ocupacional infantil do site da Clínica Despertar, em Next.js,
publicada como site estático na Turbo Cloud e servida em
`despertaresi.com.br/terapia-ocupacional-salvador/`.

- **Conteúdo:** o `terapia-ocupacional-salvador.html` do pacote aprovado
  `pacote-wordpress-despertar-v2.zip`, anexo da tarefa
  [[Despertar] Subir as 3 páginas novas do site](https://app.clickup.com/t/17tkuw63mv7).
- **Prévia aprovada:** [Terapia Ocupacional](https://claude.ai/artifact/GCp4UkVBkoA2WC8wDx2QiY).
  A página gerada aqui foi comparada pixel a pixel com essa prévia, no celular (390 px)
  e no desktop (1280 px): sem diferença.
- **Padrão Genos:** começou do `template-lp/` de
  [genosgroup/padroes](https://github.com/genosgroup/padroes). Antes de mexer em medição,
  leia o `AGENTS.md`: esta é uma LP de **cliente**, e os IDs são os da Despertar.

É irmã de [`lp-despertar-principal`](https://github.com/genosgroup/lp-despertar-principal)
(a home) e de [`lp-despertar-fonoaudiologia`](https://github.com/genosgroup/lp-despertar-fonoaudiologia). Os componentes são os mesmos nas três. O
que muda de uma para outra fica em quatro lugares: `src/lib/site.ts`, `src/lib/medicao.ts`,
a pergunta de idade em `src/lib/lead.ts` e o pacote em `conteudo/`.

## Rodar

```bash
npm install
```

```bash
npm run dev
```

Abra `http://localhost:3000/terapia-ocupacional-salvador/`. A raiz `/` dá 404 de propósito: a
página mora no caminho.

```bash
npm run build && npm run lint
```

`npm run build` gera a página em `out/`, pronta para publicar.

Em `npm run dev` o formulário não envia: quem recebe o lead é um arquivo PHP
(`public/api/lead/index.php`), e o `next dev` não roda PHP. Assim ninguém cria card de
teste no Kommo sem querer. Para testar o envio de ponta a ponta, depois do build, monte a
pasta no caminho da página e sirva com o PHP:

```bash
mkdir -p /tmp/site && ln -sfn "$PWD/out" /tmp/site/terapia-ocupacional-salvador
```

```bash
LEAD_WEBHOOK_URL=https://seu-webhook-de-teste php -S 127.0.0.1:8080 -t /tmp/site
```

Abra `http://127.0.0.1:8080/terapia-ocupacional-salvador/`.

## Servida sob um caminho

O `basePath` do `next.config.ts` e o `BASE_PATH` de `src/lib/site.ts` são
`/terapia-ocupacional-salvador`. Tudo que a página serve mora dentro dele: as imagens
(`/terapia-ocupacional-salvador/imagens/`), o `/_next/`, o PHP do lead
(`/terapia-ocupacional-salvador/api/lead/`) e a imagem de compartilhamento. É o que o padrão
pede para LP servida sob um caminho (§1.3): a rota da hospedagem casa por prefixo, e
arquivo fora dele nunca chega a esta página.

Por isso esta base **não** tem `robots.txt` nem `sitemap.xml`. Os do domínio ficam na
principal, que já lista esta página.

Os links "voltar para a home" do pacote (`/` e `/#adultos`) vão para a raiz do domínio,
ou seja, para a principal. É o esperado.

## Onde está cada coisa

| Arquivo | O que é |
| --- | --- |
| `conteudo/pagina.html` e `conteudo/dsp-lp.css` | O HTML (o `terapia-ocupacional-salvador.html` do pacote) e o CSS, **idênticos ao aprovado**. Não edite à mão |
| `public/imagens/` | As 7 imagens do pacote que esta página usa, com os nomes originais |
| `src/lib/site.ts` | Caminho, endereço e foto do topo desta página |
| `src/lib/lead.ts` | Campos e validação do formulário. Aqui a pergunta é "Idade da criança" |
| `src/lib/medicao.ts` | **Todos os IDs de medição.** `NOME_DA_PAGINA = "LP TO"`, `CONTENT_GROUP = "LP · Despertar TO"` |
| `src/components/` | Página a partir do pacote, formulário, botão fixo do celular e tags. Iguais aos da principal |
| `public/api/lead/index.php` | Recebe o lead, valida e repassa para o webhook do n8n. Igual nas três páginas |
| `public/api/lead/pagina.php` | O nome da página no Kommo ("LP TO") e o webhook desta página |
| `public/.htaccess` | Cache dos arquivos desta pasta na hospedagem (só cabeçalhos, sem reescrita) |
| `hospedagem/` | Os scripts da publicação |
| `.github/workflows/` | As automações de publicação e de teste de conexão |
| `src/app/page.tsx` | Title e description do LEIA-ME, canonical, Open Graph e dados da clínica |

## Medição e envio do lead

São os mesmos da principal, com os IDs da Despertar: Pixel `984879360375130` (PageView,
Lead e Contact), Google Ads `AW-16923338982` (conversão de lead só no envio com sucesso e
de contato no WhatsApp da confirmação), Clarity, e GA4 desligado até a propriedade existir.
A explicação completa, com o que muda em relação ao GTM antigo, está no
[README da principal](https://github.com/genosgroup/lp-despertar-principal#medição).

O formulário manda o lead para `/terapia-ocupacional-salvador/api/lead/` (o `public/api/lead/index.php`),
que valida e repassa para a automação do n8n que cria o card no Kommo, pelo webhook desta
página (`https://webhook.automacaogenosgroup.com.br/webhook/despertar-lp-to`, em
`public/api/lead/pagina.php`), no mesmo JSON das outras duas páginas. Aqui:

- `pagina` é `"LP TO"`, a nota do card no Kommo;
- `idade` traz a resposta de "Idade da criança" (até 2 anos, 2 a 4, 5 a 7, 8 a 12 ou mais
  de 12), que vai para o campo **"Idade da criança"** do Kommo. Esse campo ainda precisa
  ser criado.

Se o envio falhar, o formulário mostra a falha com o WhatsApp e não conta conversão.

**Proteção do webhook.** O endereço está no código, e este repositório é público. A
proteção é a mesma das três páginas: Header Auth no n8n e a senha no arquivo
`.despertar-lp.php`, fora da `public_html`. Passo a passo no
[README da principal](https://github.com/genosgroup/lp-despertar-principal#formulário-e-envio-do-lead).

## Publicação (Turbo Cloud)

A página vai como **arquivos estáticos** para a pasta `public_html/terapia-ocupacional-salvador/` da
Turbo Cloud (cPanel, CloudLinux e LiteSpeed), ao lado do WordPress da Despertar. Pasta
real tem prioridade sobre os endereços do WordPress, então ele não é tocado.

**Como publicar:** em **Actions > Publicar na Turbo Cloud > Run workflow**. A automação
roda `npm run build` e envia o `out/` por SSH com `hospedagem/publicar.sh`, espelhando a
pasta (arquivos que saíram do pacote são apagados lá). Trava de segurança: se a pasta já
existir na hospedagem sem ter sido criada por esta publicação, nada é enviado. Por
enquanto a automação só roda quando alguém dispara.

**Testar a conexão:** **Actions > Testar conexão com a Turbo Cloud > Run workflow**. Só
lê o servidor e mostra sim/não, sem listar arquivos.

Os segredos (`DESPERTAR_SSH_KEY`, `DESPERTAR_SSH_PASSPHRASE`, `DESPERTAR_SSH_HOST`,
`DESPERTAR_SSH_USER` e `DESPERTAR_SSH_PORT`) são os mesmos nos três repositórios e estão
explicados no
[README da principal](https://github.com/genosgroup/lp-despertar-principal#publicação-turbo-cloud).

## Antes de ir ao ar

- [ ] **GA4:** preencher `GA_ID` em `src/lib/medicao.ts` quando a propriedade existir.
- [ ] **Automação do n8n:** montar o webhook `despertar-lp-to` e protegê-lo (Header Auth + `.despertar-lp.php`). Criar no Kommo o campo "Idade da
      criança".
- [ ] **Troca de 16/11:** o grupo T.O da /lp1 (`utm_content=203827881070`) redireciona
      para cá mantendo a query string (tabela no LEIA-ME do pacote).
- [ ] **Card da terapeuta ocupacional:** liberar quando a Mayara mandar nome, foto e
      CREFITO (passo a passo abaixo).
- [ ] **Parte 4 do [checklist](https://github.com/genosgroup/padroes/blob/main/checklist-lp.md):**
      lead de teste real pelo celular, conversão no Google Ads, Lead no Meta Pixel Helper,
      PageSpeed no celular.
- [ ] **Inventário:** registrar a página na planilha
      [UTMs e páginas](https://docs.google.com/spreadsheets/d/16Imi0K-b4Vb7sijtPDagR8-5IAbJ4YQ8177BRfNpAzc/edit).
- [ ] **Fotos:** as do pacote são da prévia do Drive. Quando a Mayara mandar as originais,
      troque mantendo o nome e o recorte (tabela no LEIA-ME do pacote).

## O card da terapeuta ocupacional

No pacote, o card da TO da equipe está **comentado** (bloco `CARD DA TO` em
`conteudo/pagina.html`) até chegarem nome, foto e CREFITO, e por isso não aparece na página.
É a única edição à mão prevista no HTML:

1. Ponha a foto em `public/imagens/`, em WebP e no mesmo formato das outras da equipe
   (retrato 4:5), por exemplo `dsp-lp-equipe-nome.webp`.
2. Em `conteudo/pagina.html`, apague as linhas `<!-- CARD DA TO: ...` e `-->` em volta
   do card.
3. Troque o `<div class="dsp-lp-pessoa__vazia">...</div>` por
   `<img src="/wp-content/uploads/2026/11/dsp-lp-equipe-nome.webp" alt="Nome" width="..." height="...">`.
   O caminho do WordPress é trocado sozinho pelo de `public/imagens/`, igual às outras fotos.
4. Preencha o nome em `dsp-lp-pessoa__nome` e o número no `<small>CREFITO</small>`.
5. `npm run build` e confira a seção da equipe no celular.
