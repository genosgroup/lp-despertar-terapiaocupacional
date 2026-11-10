#!/bin/sh
# Funcoes de FTPS (FTP com TLS) usadas pela publicacao e pelo teste de conexao.
# Igual nos tres repositorios. Uso: . hospedagem/ftp-comum.sh
#
# Por que FTPS e nao SSH: o firewall da Turbo Cloud nao deixa a maquina do
# GitHub entrar por SSH (a porta nao responde), e a porta 21 responde.
#
# Le do ambiente (segredos do repositorio):
#   FTP_HOST      servidor (DESPERTAR_FTP_HOST ou, sem ele, DESPERTAR_SSH_HOST)
#   FTP_USER      usuario da conta FTP (DESPERTAR_FTP_USER), com raiz na public_html
#   FTP_PASSWORD  senha (DESPERTAR_FTP_PASSWORD); vai por variavel, nunca na linha de comando
#   FTP_PORTA     opcional, padrao 21
#   FTP_VERIFICAR_CERTIFICADO  "nao" so em teste local com certificado proprio
#
# A conexao e sempre criptografada (ftp:ssl-force): se o servidor nao aceitar
# TLS, nada e enviado.

: "${FTP_HOST:?falta o segredo DESPERTAR_SSH_HOST (ou DESPERTAR_FTP_HOST)}"
: "${FTP_USER:?falta o segredo DESPERTAR_FTP_USER}"
: "${FTP_PASSWORD:?falta o segredo DESPERTAR_FTP_PASSWORD}"
FTP_PORTA="${FTP_PORTA:-21}"
LFTP_PASSWORD="$FTP_PASSWORD"
export LFTP_PASSWORD

if [ "${FTP_VERIFICAR_CERTIFICADO:-sim}" = "nao" ]; then
  FTP_VERIFICA="no"
else
  FTP_VERIFICA="yes"
fi

# ftp_lftp "<comandos do lftp>": abre a conexao e roda os comandos. Para no
# primeiro erro (cmd:fail-exit) e devolve o codigo de saida do lftp.
ftp_lftp() {
  lftp -c "
    set cmd:fail-exit yes
    set ftp:ssl-force true
    set ftp:ssl-protect-data true
    set ftp:ssl-protect-list true
    set ssl:verify-certificate $FTP_VERIFICA
    set ftp:passive-mode true
    set net:timeout 25
    set net:max-retries 2
    set net:reconnect-interval-base 5
    open -u '$FTP_USER' --env-password -p $FTP_PORTA '$FTP_HOST'
    $1
  "
}

# ftp_existe <caminho>: verdadeiro se o arquivo ou pasta existe (caminho
# relativo a raiz da conta FTP, que e a public_html).
ftp_existe() {
  ftp_lftp "cls -d '$1'" >/dev/null 2>&1
}

# ftp_pendentes <opcoes e pastas do mirror>: quantos arquivos o servidor ainda
# precisaria receber (ou apagar, com --delete) para ficar igual a pasta local,
# comparando so o tamanho. Falha se nao conseguir conferir.
ftp_pendentes() {
  saida=$(ftp_lftp "mirror -R --dry-run --ignore-time --no-perms $*") || return 1
  printf '%s\n' "$saida" | grep -cE '^(get|rm) ' || true
}

# ftp_espelhar <pasta local> <pasta no servidor> [opcoes do mirror]: envia e
# confere, pelo tamanho, se cada arquivo chegou inteiro. O que nao bater e
# reenviado uma vez; se ainda nao bater, falha (e a publicacao para).
ftp_espelhar() {
  origem="$1"; destino="$2"; shift 2
  ftp_lftp "mirror -R --no-perms --parallel=3 $* $origem $destino"
  pendentes=$(ftp_pendentes "$@" "$origem" "$destino") || { echo "Nao deu para conferir $destino depois do envio." >&2; return 1; }
  [ "$pendentes" = 0 ] && return 0
  echo "$pendentes arquivo(s) de $destino chegaram diferentes; reenviando so esses." >&2
  ftp_lftp "mirror -R --ignore-time --no-perms $* $origem $destino"
  pendentes=$(ftp_pendentes "$@" "$origem" "$destino") || { echo "Nao deu para conferir $destino depois do reenvio." >&2; return 1; }
  [ "$pendentes" = 0 ] && return 0
  echo "$pendentes arquivo(s) de $destino continuam diferentes no servidor. Publicacao interrompida." >&2
  return 1
}
