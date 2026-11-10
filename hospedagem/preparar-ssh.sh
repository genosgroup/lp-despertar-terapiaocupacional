#!/bin/sh
# Prepara o acesso SSH a Turbo Cloud dentro da maquina temporaria do GitHub
# Actions (apagada no fim de cada execucao). Igual nos tres repositorios.
#
# Le dos segredos da organizacao (liberados so para os repositorios da Despertar):
#   DESPERTAR_SSH_KEY         chave privada gerada no cPanel (com BEGIN/END)
#   DESPERTAR_SSH_PASSPHRASE  senha da chave (o cPanel nao gera chave sem senha)
#   DESPERTAR_SSH_HOST        servidor (ex.: br.brasil105-9070.com.br)
#   DESPERTAR_SSH_USER        usuario do cPanel
#   DESPERTAR_SSH_PORT        porta SSH (segredo ou variavel; sem ela, 22)
#
# Depois disto, "ssh destino" e "rsync ... destino:..." funcionam.
set -eu

: "${CHAVE:?falta o segredo DESPERTAR_SSH_KEY}"
: "${SERVIDOR:?falta o segredo DESPERTAR_SSH_HOST}"
: "${USUARIO:?falta o segredo DESPERTAR_SSH_USER}"
PORTA="${PORTA:-22}"

mkdir -p ~/.ssh
chmod 700 ~/.ssh
printf '%s\n' "$CHAVE" | tr -d '\r' > ~/.ssh/despertar
chmod 600 ~/.ssh/despertar

# Tira a senha da copia da chave que existe so nesta maquina temporaria.
if [ -n "${SENHA:-}" ]; then
  ssh-keygen -p -q -P "$SENHA" -N "" -f ~/.ssh/despertar >/dev/null
fi

if ! ssh-keyscan -T 20 -p "$PORTA" "$SERVIDOR" >> ~/.ssh/known_hosts 2>/dev/null || [ ! -s ~/.ssh/known_hosts ]; then
  echo "Nao consegui falar com o servidor na porta $PORTA. Confira DESPERTAR_SSH_HOST e DESPERTAR_SSH_PORT." >&2
  exit 1
fi

cat > ~/.ssh/config <<EOF
Host destino
  HostName $SERVIDOR
  Port $PORTA
  User $USUARIO
  IdentityFile ~/.ssh/despertar
  IdentitiesOnly yes
  StrictHostKeyChecking yes
  ConnectTimeout 20
  ServerAliveInterval 15
EOF
chmod 600 ~/.ssh/config

ssh destino 'echo "Conectado a hospedagem."'
