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
npm run sync:jun
npm run check:jun-sync
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
- `src/data/global-timeline.md`: copia gerada da timeline canonica; nao deve ser editada manualmente.
- `src/styles/site.css`: tokens visuais e UI responsiva.
- `src/scripts/main.js`: interacoes locais.
- `scripts/`: build, smoke tests e auditorias.
- `docs/`: inventario, fontes, matriz de migracao e notas editoriais.

## Conteudo e preservacao

Os textos de origem permanecem em `src/data/original-content.json` para rastreabilidade interna, mas não são exibidos aos visitantes. A auditoria compara os nove registros internos com o manifesto de migração, enquanto a auditoria de links verifica os 16 URLs externos do acervo.

## Publicacao

O workflow `.github/workflows/deploy-pages.yml` valida e publica `dist/` via GitHub Pages a cada push em `main`, por acionamento manual, por `repository_dispatch` do tipo `jun-timeline-updated` e na verificacao periodica. Antes de validar ou construir, o pipeline faz checkout de `Mreaggle/JumpstyleUnitedNations`, copia `JumpstyleTimeline/Global/global-timeline.md` e exige paridade exata entre o arquivo canonico, o manifesto e o que sera exibido.

**Regra de sincronia JUN:** o numero de registros exibido no front nunca deve ser alterado manualmente. Ele e calculado no build a partir da copia integral do arquivo canonico. Toda atualizacao da Global Timeline deve primeiro entrar no repositorio JUN e depois acionar/reexecutar este deploy; `npm run check:jun-sync` deve falhar se a copia local ou o manifesto estiverem defasados.

O build tambem gera `dist/JUN/index.html`, `dist/JUN/llms.txt` e o indice geral `dist/llms.txt`. Assim, `https://jumpstyle.com.br/JUN/` continua no mesmo Pages e dominio, mas usa shell, navegacao, idioma, metadados e identidade visual proprios.
