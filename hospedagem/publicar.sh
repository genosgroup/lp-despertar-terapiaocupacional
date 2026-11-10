#!/bin/sh
# Envia a pagina exportada (out/, gerada por `npm run build`) para a hospedagem.
#
# Uso: sh hospedagem/publicar.sh <alvo> <raiz>
#   alvo: "destino" na publicacao pelo GitHub (servidor do ~/.ssh/config) ou
#         "local" para testar numa pasta do proprio computador
#   raiz: pasta raiz do site no servidor (ex.: public_html, relativa a pasta do
#         usuario) ou, em "local", o caminho da pasta de teste
#
# A pagina vai inteira para <raiz>/terapia-ocupacional-salvador/, que e so dela:
# arquivos que sairam do pacote sao apagados la. Trava de seguranca: se a pasta
# ja existir e nao tiver sido criada por esta publicacao (sem o arquivo-marca),
# nada e enviado.
set -eu

ALVO="$1"
RAIZ="$2"
PASTA="terapia-ocupacional-salvador"
MARCA=".publicado-pela-despertar-lp"

if [ "$ALVO" = "local" ]; then
  no_alvo() { sh -c "$1"; }
  DESTINO="$RAIZ"
else
  no_alvo() { ssh "$ALVO" "$1"; }
  DESTINO="$ALVO:$RAIZ"
fi

[ -f out/index.html ] || { echo "out/ nao existe: rode npm run build antes" >&2; exit 1; }

no_alvo "cd '$RAIZ' && if [ -d '$PASTA' ] && [ ! -f '$PASTA/$MARCA' ]; then echo 'A pasta $PASTA ja existe na hospedagem e nao foi criada por esta publicacao. Nada foi enviado.' >&2; exit 1; fi"

touch "out/$MARCA"
rsync -rlptz --delete out/ "$DESTINO/$PASTA/"
echo "Publicado em $RAIZ/$PASTA/"
