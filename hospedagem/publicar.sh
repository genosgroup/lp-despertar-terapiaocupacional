#!/bin/sh
# Envia a pagina exportada (out/, gerada por `npm run build`) para a hospedagem,
# por FTPS, e confere pelo tamanho se cada arquivo chegou inteiro. A conta FTP
# tem a raiz na public_html do site. Ordem: arquivos novos, depois as paginas,
# por ultimo a limpeza dos antigos (ver ftp_enviar em ftp-comum.sh).
#
# Uso: sh hospedagem/publicar.sh   (com FTP_HOST, FTP_USER e FTP_PASSWORD no ambiente)
#
# A pagina vai inteira para terapia-ocupacional-salvador/, que e so dela: arquivos
# que sairam do pacote sao apagados la. Trava de seguranca: se a pasta ja
# existir e nao tiver sido criada por esta publicacao (sem o arquivo-marca),
# nada e enviado.
set -eu
. hospedagem/ftp-comum.sh

PASTA="terapia-ocupacional-salvador"
MARCA=".publicado-pela-despertar-lp"

[ -f out/index.html ] || { echo "out/ nao existe: rode npm run build antes" >&2; exit 1; }

if ftp_existe "$PASTA" && ! ftp_existe "$PASTA/$MARCA"; then
  echo "A pasta $PASTA ja existe na hospedagem e nao foi criada por esta publicacao. Nada foi enviado." >&2
  exit 1
fi

touch "out/$MARCA"
ftp_enviar out/ "$PASTA/"
ftp_limpar out/ "$PASTA/"
echo "Publicado em $PASTA/"
