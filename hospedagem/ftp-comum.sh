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

# ftp_conferir <pasta local> <pasta no servidor> [opcoes do mirror]: falha se
# algum arquivo nao estiver no servidor com o mesmo tamanho (ou, com --delete,
# se sobrar algum que saiu do pacote).
ftp_conferir() {
  for remoto in "$@"; do :; done
  pendentes=$(ftp_pendentes "$@") || { echo "Nao deu para conferir $remoto no servidor." >&2; return 1; }
  [ "$pendentes" = 0 ] && return 0
  echo "$pendentes arquivo(s) de $remoto nao conferem com o pacote." >&2
  return 1
}

# ftp_enviar <pasta local> <pasta no servidor> [opcoes do mirror]: envia sem
# apagar nada, na ordem que nao deixa a pagina quebrada no meio do caminho:
# primeiro os arquivos que as paginas usam (js, css, fontes, imagens), depois
# as paginas (.html, e os .txt que o Next le na navegacao). Depois confere,
# pelo tamanho, se cada arquivo chegou inteiro; o que nao bater e reenviado
# uma vez e, se ainda nao bater, falha (e a publicacao para).
ftp_enviar() {
  origem="$1"; destino="$2"; shift 2
  ftp_lftp "mirror -R --no-perms --parallel=3 -X '*.html' -X '*.txt' $* $origem $destino"
  ftp_lftp "mirror -R --no-perms --parallel=3 -I '*.html' -I '*.txt' $* $origem $destino"
  ftp_conferir "$@" "$origem" "$destino" 2>/dev/null && return 0
  echo "Algum arquivo de $destino chegou diferente; reenviando so o que difere." >&2
  ftp_lftp "mirror -R --ignore-time --no-perms $* $origem $destino"
  ftp_conferir "$@" "$origem" "$destino"
}

# ftp_limpar <pasta local> <pasta no servidor>: apaga do servidor o que saiu
# do pacote. Roda por ultimo, quando as paginas novas ja estao no lugar, para
# ninguem abrir uma pagina que aponta para um arquivo ja apagado.
ftp_limpar() {
  ftp_lftp "mirror -R --delete --no-perms $1 $2"
  ftp_conferir --delete "$1" "$2"
}
