#!/bin/sh
# Teste de conexao (workflow "Testar conexao com a Turbo Cloud"). Entra por
# FTPS e confere o que a publicacao precisa. So le: a unica escrita e um
# arquivo de teste criado e apagado na hora. Imprime so sim/nao, sem listar
# arquivos: o log das Actions de um repositorio publico e publico.
set -u
. hospedagem/ftp-comum.sh

sim_nao() { if "$@" >/dev/null 2>&1; then echo "sim"; else echo "nao"; fi; }

if ftp_lftp "quote NOOP" >/dev/null 2>&1; then
  if [ "$FTP_VERIFICA" = "yes" ]; then
    echo "Entrou por FTPS, com o certificado do servidor conferido: sim"
  else
    echo "Entrou por FTPS: sim (certificado nao conferido: FTP_VERIFICAR_CERTIFICADO=nao)"
  fi
else
  VERIFICA_ORIGINAL="$FTP_VERIFICA"
  FTP_VERIFICA="no"
  if ftp_lftp "quote NOOP" >/dev/null 2>&1; then
    echo "Entrou por FTPS: sim, mas o certificado do servidor NAO confere com o nome em DESPERTAR_SSH_HOST"
    echo "(a publicacao exige certificado conferido; use o nome que aparece no certificado)"
  else
    echo "Entrou por FTPS: NAO. Confira DESPERTAR_FTP_USER, DESPERTAR_FTP_PASSWORD e se a conta FTP existe."
    ftp_lftp "quote NOOP" 2>&1 | tail -3
    exit 1
  fi
  FTP_VERIFICA="$VERIFICA_ORIGINAL"
fi

echo "--- raiz da conta FTP"
echo "tem WordPress (wp-config.php): $(sim_nao ftp_existe wp-config.php)"
TMP=$(mktemp -d)
if ftp_lftp "get .htaccess -o $TMP/htaccess" >/dev/null 2>&1; then
  echo ".htaccess com o bloco do WordPress: $(sim_nao grep -q 'BEGIN WordPress' "$TMP/htaccess")"
  echo ".htaccess ja com o bloco da Despertar: $(sim_nao grep -q 'BEGIN Despertar LP principal' "$TMP/htaccess")"
else
  echo ".htaccess: nao existe"
fi
rm -rf "$TMP"

for item in index.html robots.txt sitemap.xml _next imagens api/lead fonoaudiologia-salvador terapia-ocupacional-salvador; do
  if ftp_existe "$item"; then
    if ftp_existe "$item/.publicado-pela-despertar-lp"; then dono="desta publicacao"; else dono="NAO e desta publicacao"; fi
    case "$item" in *.*) dono="arquivo" ;; esac
    echo "ja existe '$item': sim ($dono)"
  else
    echo "ja existe '$item': nao"
  fi
done

ARQ=$(mktemp)
echo teste > "$ARQ"
echo "da para gravar: $(sim_nao ftp_lftp "put $ARQ -o .despertar-teste-escrita; rm .despertar-teste-escrita")"
rm -f "$ARQ"
