# Jumpstyle Brasil

Site estático mobile-first da Jumpstyle Brasil, reconstruído a partir do pacote de migração local e publicado como project site da conta Mreaggle.

**Produção:** https://mreaggle.github.io/jumpstylebrasil/

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
- `src/styles/site.css`: tokens visuais e UI responsiva.
- `src/scripts/main.js`: interacoes locais.
- `scripts/`: build, smoke tests e auditorias.
- `docs/`: inventario, fontes, matriz de migracao e notas editoriais.

## Conteudo e preservacao

Cada rota publica inclui um bloco expansivel com o texto integral da pagina original correspondente. A auditoria de conteudo verifica que os nove blocos originais estao presentes no HTML gerado ou no dataset do site. A auditoria de links verifica os 16 URLs externos unicos do PDF.

## Publicacao

O workflow `.github/workflows/deploy-pages.yml` valida e publica `dist/` via GitHub Pages a cada push em `main`. O build usa `/jumpstylebrasil/` como base path para funcionar corretamente em `Mreaggle/jumpstylebrasil`.
