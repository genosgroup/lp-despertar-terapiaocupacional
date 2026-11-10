#!/bin/bash
# Diz, a partir da maquina do GitHub, se o servidor e alcancavel e quais portas
# respondem. Nao entra no servidor nem usa senha. Serve para separar problema
# de rede (firewall, nome errado) de problema de login. Sempre termina sem erro.

SERVIDOR="${SERVIDOR:-}"

case "$SERVIDOR" in
  "") echo "O segredo DESPERTAR_SSH_HOST (servidor) esta vazio."; exit 0 ;;
  *://*|*/*|*:*|*" "*) echo "ATENCAO: o servidor tem http, barra, dois-pontos ou espaco. Deve ser so o nome." ;;
esac

if getent hosts "$SERVIDOR" >/dev/null 2>&1; then
  echo "Nome do servidor resolve no DNS: sim"
else
  echo "Nome do servidor resolve no DNS: NAO (confira o segredo do servidor)"
  exit 0
fi

responde() { timeout 6 bash -c "exec 3<>/dev/tcp/$SERVIDOR/$1" 2>/dev/null; }

for p in 21 443; do
  if responde "$p"; then echo "porta $p: responde"; else echo "porta $p: NAO responde"; fi
done

saudacao=$(timeout 6 bash -c "exec 3<>/dev/tcp/$SERVIDOR/21; head -c 80 <&3" 2>/dev/null | tr -d '\r\n' | tr -cd '[:print:]')
echo "Saudacao do servidor FTP: ${saudacao:-(nenhuma)}"
exit 0
