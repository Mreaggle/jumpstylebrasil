# Jumpstyle Brasil

Site estático mobile-first da Jumpstyle Brasil, reconstruído a partir do pacote de migração local e publicado via GitHub Pages no domínio próprio. Inclui áreas independentes para a Fireborn Squad e para o museu internacional Jumpstyle United Nations.

**Produção:** https://jumpstyle.com.br/

## Stack

- HTML estatico gerado por scripts Node.js
- CSS com identidade visual techno, tipografia Handjet e navegação responsiva
- JavaScript leve para menu mobile, BPM interativo, filtro de FAQ, progresso de leitura e checklist do roadmap
- Sem backend, sem CMS, sem dependencias de runtime externas

## Comandos

```bash
npm ci
npm run check
npm run build
npm run test
npm run audit:content
npm run audit:links
npm run preview
```

O build final fica em `dist/`.

## Estrutura

- `src/data/original-content.json`: texto original preservado por pagina.
- `src/data/site-data.json`: navegacao, links, FAQ, roadmap e conteudo estruturado.
- `src/data/jun-data.json`: timeline global, paises, figuras e fontes da pagina internacional `/JUN/`.
- `src/styles/site.css`: tokens visuais e UI responsiva.
- `src/scripts/main.js`: interacoes locais.
- `scripts/`: build, smoke tests e auditorias.
- `docs/`: inventario, fontes, matriz de migracao e notas editoriais.

## Conteudo e preservacao

Os textos de origem permanecem em `src/data/original-content.json` para rastreabilidade interna, mas não são exibidos aos visitantes. A auditoria compara os nove registros internos com o manifesto de migração, enquanto a auditoria de links verifica os 16 URLs externos do acervo.

## Publicacao

O workflow `.github/workflows/deploy-pages.yml` valida e publica `dist/` via GitHub Pages a cada push em `main`. O build usa `/` como base path para funcionar corretamente no domínio próprio `jumpstyle.com.br`.

O build tambem gera `dist/JUN/index.html`, `dist/JUN/llms.txt` e o indice geral `dist/llms.txt`. Assim, `https://jumpstyle.com.br/JUN/` continua no mesmo Pages e dominio, mas usa shell, navegacao, idioma, metadados e identidade visual proprios.
