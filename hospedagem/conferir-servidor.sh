#!/bin/sh
# Roda NO SERVIDOR, pelo workflow "Testar conexao com a Turbo Cloud". So le: a
# unica escrita e um arquivo de teste criado e apagado na hora, para saber se da
# para gravar. Imprime so sim/nao, sem listar arquivos: o log das Actions de um
# repositorio publico e publico.

sim_nao() { if eval "$1" >/dev/null 2>&1; then echo "sim"; else echo "nao"; fi; }

echo "rsync no servidor: $(sim_nao 'command -v rsync')"
echo "PHP na linha de comando: $(php -v 2>/dev/null | head -1 | cut -d' ' -f1-2)"
echo "curl do PHP: $(sim_nao 'php -r "exit(function_exists(\"curl_init\") ? 0 : 1);"')"

echo "--- raiz do documento de despertaresi.com.br, segundo o cPanel:"
if command -v uapi >/dev/null 2>&1; then
  uapi --output=json DomainInfo single_domain_data domain=despertaresi.com.br 2>/dev/null \
    | grep -o '"documentroot":"[^"]*"' | sed "s#$HOME#~#" || echo "(o cPanel nao respondeu)"
else
  echo "(uapi indisponivel)"
fi

for RAIZ in public_html despertaresi.com.br public_html/despertaresi.com.br; do
  [ -d "$HOME/$RAIZ" ] || continue
  echo "--- pasta ~/$RAIZ"
  cd "$HOME/$RAIZ" || continue
  echo "tem WordPress (wp-config.php): $(sim_nao '[ -f wp-config.php ]')"
  echo ".htaccess com o bloco do WordPress: $(sim_nao 'grep -q "BEGIN WordPress" .htaccess')"
  echo ".htaccess ja com o bloco da Despertar: $(sim_nao 'grep -q "BEGIN Despertar LP principal" .htaccess')"
  for item in index.html robots.txt sitemap.xml _next imagens api/lead fonoaudiologia-salvador terapia-ocupacional-salvador; do
    if [ -e "$item" ]; then
      if [ -f "$item/.publicado-pela-despertar-lp" ]; then dono="desta publicacao"; else dono="NAO e desta publicacao"; fi
      [ -d "$item" ] || dono="arquivo"
      echo "ja existe '$item': sim ($dono)"
    else
      echo "ja existe '$item': nao"
    fi
  done
  echo "da para gravar aqui: $(sim_nao 'touch .despertar-teste-escrita && rm -f .despertar-teste-escrita')"
done

echo "--- senha do webhook (~/.despertar-lp.php): $(sim_nao '[ -f "$HOME/.despertar-lp.php" ]')"
