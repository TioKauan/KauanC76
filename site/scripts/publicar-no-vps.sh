#!/usr/bin/env bash
# Publica o site no VPS (rodar NO SERVIDOR, como root, com o pacote já enviado).
# Faz o passo a passo de site/README.md ("Publicação"): guarda a versão no ar, extrai a nova ao lado,
# copia os assets antigos (quem tem a página antiga no cache continua com estilo), troca as pastas
# num instante e confere. Se algo falhar antes da troca, nada no ar muda.
#
# Uso:   bash publicar-no-vps.sh /tmp/somoscella-AAAAMMDD-HHMMSS.tar.gz
# Volta: bash publicar-no-vps.sh --voltar AAAAMMDD-HHMMSS   (devolve as pastas index.antigo-<data>)
set -euo pipefail

BASE="${SITES_BASE:-/etc/icontainer/apps/nginx/nginx/www/sites}"
SITES=("somoscella.online" "landing.vps11377.panel.icontainer.net")
BACKUPS="${BACKUPS:-/opt/somoscella/backups}"
DONO="${DONO:-root:root}"

if [[ "${1:-}" == "--voltar" ]]; then
  data="${2:?informe a data da publicação a desfazer (AAAAMMDD-HHMMSS)}"
  for s in "${SITES[@]}"; do
    d="$BASE/$s"
    [[ -d "$d/index.antigo-$data" ]] || { echo "Não achei $d/index.antigo-$data"; exit 1; }
  done
  for s in "${SITES[@]}"; do
    d="$BASE/$s"
    mv "$d/index" "$d/index.desfeito-$data" && mv "$d/index.antigo-$data" "$d/index"
    echo "ok: $s voltou para a versão anterior a $data"
  done
  exit 0
fi

pacote="${1:?informe o pacote .tar.gz}"
[[ -f "$pacote" ]] || { echo "Pacote não encontrado: $pacote"; exit 1; }
data="$(date -u +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUPS"

# 1. Confere o pacote antes de mexer em qualquer coisa
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
tar -xzf "$pacote" -C "$tmp"
for f in index.html 404.html casa/index.html comercio/index.html empresa/index.html condominio/index.html robots.txt sitemap-index.xml; do
  [[ -f "$tmp/$f" ]] || { echo "Pacote incompleto: falta $f"; exit 1; }
done
[[ ! -e "$tmp/fotos/LEIA-ME.md" ]] || { echo "O pacote não pode levar fotos/LEIA-ME.md (nota interna)"; exit 1; }

for s in "${SITES[@]}"; do
  d="$BASE/$s"
  [[ -d "$d/index" ]] || { echo "Não achei $d/index"; exit 1; }
  # 2. Guarda a versão no ar
  tar -czf "$BACKUPS/site-no-ar-antes-$data-$s.tar.gz" -C "$d" index
  # 3. Extrai a nova ao lado e copia os assets antigos que não existem na nova (sem sobrescrever)
  novo="$d/index.novo-$data"
  mkdir -p "$novo"
  tar -xzf "$pacote" -C "$novo"
  mkdir -p "$novo/assets"
  for antigo in "$d/index/assets" "$d"/index.antigo-*/assets; do
    [[ -d "$antigo" ]] && cp -rn "$antigo/." "$novo/assets/"
  done
  chown -R "$DONO" "$novo"
  find "$novo" -type d -exec chmod 755 {} +
  find "$novo" -type f -exec chmod 644 {} +
done

# 4. Troca as pastas (instantâneo: o site nunca fica pela metade)
for s in "${SITES[@]}"; do
  d="$BASE/$s"
  mv "$d/index" "$d/index.antigo-$data" && mv "$d/index.novo-$data" "$d/index"
  echo "ok: $s publicado (anterior em index.antigo-$data e $BACKUPS/site-no-ar-antes-$data-$s.tar.gz)"
done

# 5. Confere: os arquivos no ar são os do pacote
for s in "${SITES[@]}"; do
  d="$BASE/$s"
  (cd "$tmp" && find . -type f -print0 | xargs -0 sha256sum) | (cd "$d/index" && sha256sum --quiet -c -) \
    && echo "ok: $s idêntico ao pacote" || { echo "ATENÇÃO: $s diferente do pacote"; exit 1; }
done
echo "Publicação $data concluída. Para desfazer: bash $0 --voltar $data"
