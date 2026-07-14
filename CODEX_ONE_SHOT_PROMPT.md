# PROMPT MESTRE ONE-SHOT — RECONSTRUÇÃO TOTAL DO SITE JUMPSTYLE BRASIL

Você é o agente principal de engenharia, arquitetura da informação, design de produto, pesquisa documental, QA e publicação deste projeto. Execute o trabalho completo de ponta a ponta. Não entregue apenas sugestões, wireframes ou trechos de código: crie o repositório, implemente, teste, publique e apresente evidências verificáveis.

## 0. Objetivo final

Reconstruir integralmente o site da Jumpstyle Brasil a partir dos arquivos fornecidos, abandonando a aparência de “slides do Canva” e entregando um site jovem, brasileiro, energético, confiável, responsivo e realmente estruturado.

O novo site deve:

- preservar 100% das informações do site original;
- preservar todos os hyperlinks externos funcionais;
- manter todas as páginas/áreas originais, ainda que reorganizadas;
- melhorar profundamente arquitetura da informação, UX, acessibilidade, performance e SEO;
- permitir manutenção futura por código e Git;
- ser estático e compatível com GitHub Pages;
- utilizar as credenciais GitHub já disponíveis no ambiente, sem solicitar nem imprimir tokens;
- publicar automaticamente por GitHub Actions;
- enriquecer conteúdo apenas quando houver fonte verificável;
- nunca inventar fatos, datas, títulos, rankings, perfis, eventos, métricas ou citações.

## 1. Entradas obrigatórias

Considere como entradas locais:

- `inputs/site-original.pdf`
- `inputs/canva-editor-snapshot.html`
- `reference-renders/page-1.png` até `reference-renders/page-9.png`
- `manifests/source-content-by-page.json`
- `manifests/source-links.json`
- `manifests/jun-source-manifest.json`
- `MIGRATION_AUDIT.md`

Também use como fonte documental prioritária:

- `https://github.com/Mreaggle/JumpstyleUnitedNations`

Arquivos prioritários dentro desse repositório:

- `JumpstyleTimeline/Global/global-timeline.md`
- `JumpstyleTimeline/Brazil/br-timeline.md`
- `JUNToolkit/KeyFiguresWorldwide/Dance/README.md`

Faça checkout do commit atual e grave o SHA utilizado em `docs/SOURCES.md`. O commit observado ao preparar este pacote foi `35812ad5e5e73194a765320a7c7f04bc06761d10`, mas verifique novamente durante a execução e registre o valor efetivo.

## 2. Regra absoluta de preservação

Não perca uma única informação.

Antes de projetar a UI:

1. Parseie o PDF com PyMuPDF ou ferramenta equivalente.
2. Extraia texto página por página.
3. Extraia todas as anotações de link, incluindo links internos e externos.
4. Parseie o HTML com BeautifulSoup ou equivalente.
5. Extraia textos acessíveis, âncoras, atributos `aria-label`, dimensões úteis e referências de mídia.
6. Renderize e inspecione visualmente todas as nove páginas.
7. Use os manifests fornecidos como baseline e valide sua própria extração contra eles.
8. Crie `docs/SOURCE_INVENTORY.md`.
9. Crie `docs/CONTENT_MIGRATION_MATRIX.md`.
10. Crie `src/data/original-content.json` ou equivalente, mantendo o texto original por página.

O HTML salvo é um snapshot do editor do Canva. Não o use como base da aplicação, não copie o runtime do Canva e não tente “consertar” seus scripts. Ele referencia dependências locais ausentes e URLs `blob:` temporárias. Use-o somente como fonte complementar.

## 3. Páginas obrigatórias

A nova aplicação deve possuir rotas estáticas e navegáveis para, no mínimo:

- `/` — Início
- `/all-star/`
- `/historia/`
- `/como-dancar/`
- `/roadmap/`
- `/manifesto/`
- `/musicas/`
- `/criadores/`
- `/faq/`

Pode criar páginas adicionais, como `/eventos/`, `/museu/`, `/figuras-historicas/` ou `/comunidade/`, desde que as páginas originais continuem representadas e nenhum conteúdo seja removido.

## 4. Arquitetura e tecnologia

Use uma stack estática adequada para conteúdo, SEO e GitHub Pages.

Preferência:

- Astro;
- TypeScript estrito;
- Tailwind CSS ou CSS modular com design tokens;
- componentes acessíveis;
- conteúdo estruturado em JSON, YAML ou coleções Markdown;
- JavaScript somente onde agrega valor;
- sem backend;
- sem dependência de serviços pagos;
- sem CMS externo obrigatório;
- sem bibliotecas pesadas para efeitos banais.

Use a versão estável atual no momento da execução. Não fixe versões antigas por memória. O projeto deve funcionar com:

```bash
npm ci
npm run check
npm run test
npm run build
```

Inclua:

- `README.md`;
- `.editorconfig`;
- `.gitignore`;
- `.nojekyll` quando necessário;
- `404.html` ou estratégia estática equivalente;
- sitemap;
- `robots.txt`;
- Open Graph;
- Twitter Card;
- favicon;
- JSON-LD para organização/comunidade;
- política clara de links externos;
- licença ou aviso de direitos compatível com os ativos utilizados.

## 5. Direção visual

O site deve parecer feito por uma comunidade jovem brasileira de hard dance, não por uma corporação genérica e nem por um template de carnaval turístico.

Princípios:

- energia, movimento, ritmo e identidade digital;
- brasilidade contemporânea e urbana, sem estereótipos excessivos;
- preservar sinais da identidade existente: verde/teal, amarelo vivo e atmosfera alegre;
- modernizar com fundo escuro ou superfícies contrastantes, azul elétrico, magenta e detalhes ácidos;
- tipografia expressiva nos títulos e altamente legível no corpo;
- diagonais, ondas, grids, BPM, linhas cinéticas e microanimações discretas;
- nada de emoji 3D como sistema principal de ícones;
- nada de cartões gigantes que pareçam slides;
- nada de excesso de glassmorphism;
- nada de autoplay com áudio;
- respeitar `prefers-reduced-motion`;
- contraste WCAG AA;
- foco visível;
- navegação completa por teclado;
- experiência mobile impecável.

Crie um sistema visual com tokens em CSS:

- cores;
- tipografia;
- espaçamento;
- raios;
- sombras;
- estados;
- motion;
- largura de leitura;
- breakpoints.

A identidade precisa parecer própria da Jumpstyle Brasil, não uma cópia de Spotify, Nike, Red Bull ou qualquer landing page de IA.

## 6. UX por área

### Início

- hero forte com proposta clara;
- CTA principal para aprender a dançar;
- CTAs comunitários para WhatsApp, Discord e Instagram;
- visão rápida da história, eventos, manifesto, música e criadores;
- navegação sticky;
- menu mobile;
- rodapé completo;
- destaque para JUN como museu/base documental global;
- links para todas as áreas originais.

### All-Star

Preservar:

- Área Jumper;
- Votar;
- Resultados;
- descrição original do evento;
- todos os links bit.ly originais.

Apresente CTAs claros e indique que são destinos externos.

### História

- timeline semântica e responsiva;
- preservar integralmente o texto original;
- permitir ampliação documentada a partir do JUN;
- separar “resumo original” de “linha do tempo ampliada”;
- incluir referências por item ampliado.

### Como Dançar

Preservar:

- Tutorial Fundamental;
- Tutoriais Avançados;
- Roadmap;
- todos os vídeos e playlists originais.

Use cards de aprendizado e uma progressão clara, sem transformar orientação técnica em texto promocional.

### Roadmap

Preservar todos os itens:

- Iniciantes;
- Intermediários;
- Avançados.

Transformar em trilha acessível, accordions ou checklist, mantendo cada item original. Não inventar requisitos de graduação.

### Manifesto

- manter o manifesto completo;
- apresentar boa largura de leitura;
- índice interno;
- assinatura e data;
- nenhuma reescrita ideológica silenciosa;
- correções ortográficas somente se documentadas em `docs/EDITORIAL_CHANGES.md`.

### Músicas

Preservar:

- explicação sobre Jump, Hardstyle e Hardcore;
- BPMs;
- exemplos de músicas;
- playlist oficial;
- todos os links.

Embeds devem ter fallback, consentimento e boa performance. Não assumir disponibilidade eterna de Spotify/YouTube.

### Criadores

A página original apresenta snapshots dos seguintes handles:

- `mreaggle`
- `lufefbs`
- `digo3492_`
- `guilhermedourado`
- `tauan.rick`
- `figurinha696`
- `nakpovs`

Regras:

- preservar esses nomes;
- verificar individualmente URLs oficiais antes de criar links;
- não inventar perfil quando não houver confirmação;
- não exibir contagens antigas como atuais;
- se preservar os números do screenshot, rotular como “registro histórico do site original”;
- guardar a página original renderizada como evidência documental, não como substituto do novo layout;
- não criar biografias sem fonte.

### FAQ

- preservar todas as perguntas e respostas;
- usar accordions acessíveis;
- busca/filtro local opcional;
- manter Pânico Jumpen como elemento folclórico exatamente no contexto original;
- permitir links para Roadmap, História e Comunidade;
- não “higienizar” a personalidade do texto.

## 7. Enriquecimento documental sem alucinação

Use esta hierarquia:

1. conteúdo original do PDF;
2. repositório `Mreaggle/JumpstyleUnitedNations`;
3. fontes primárias: canais oficiais, páginas oficiais de artistas/eventos, documentos do organizador, Discogs para lançamentos, registros oficiais de mídia;
4. fontes jornalísticas reconhecidas;
5. fontes terciárias apenas como apoio, nunca como única prova para afirmações controversas.

Toda informação adicionada deve possuir:

- título;
- texto;
- URL de fonte;
- nome da fonte;
- data de acesso;
- tipo de fonte;
- status de verificação;
- origem no código.

Crie `src/data/sources.json` e `docs/SOURCES.md`.

Não publique:

- placeholders do JUN;
- `[Event or Contribution 1]`;
- `[Brief Overview of Contributions]`;
- links `#`;
- frases sem fonte apresentadas como fato;
- listas incompletas apresentadas como definitivas;
- rankings subjetivos como fatos;
- métricas sociais antigas como atuais.

Quando fontes sérias divergirem:

- não escolha silenciosamente;
- descreva a divergência;
- atribua cada versão;
- mantenha a posição editorial da Jumpstyle Brasil identificada como posição da comunidade, não como consenso universal.

## 8. Preservação de links

Use `manifests/source-links.json` como contrato.

Todos os 16 URLs externos únicos do PDF devem aparecer no novo site ou em um arquivo documental de redirects/legado, salvo URL comprovadamente maliciosa ou removida. Nesse caso:

- não apague;
- registre em `docs/BROKEN_OR_DEPRECATED_LINKS.md`;
- mantenha a URL original como referência;
- forneça destino atualizado somente quando verificado.

Links internos do Canva devem ser remapeados para as novas rotas.

Links externos devem:

- abrir com comportamento coerente;
- usar `rel="noopener noreferrer"` quando aplicável;
- possuir rótulo acessível;
- indicar visualmente saída do site.

## 9. Teste automático de fidelidade

Implemente scripts de auditoria.

### `npm run audit:content`

Deve:

- carregar `manifests/source-content-by-page.json`;
- normalizar apenas whitespace e quebras de linha;
- verificar que cada bloco de conteúdo original esteja presente no HTML construído ou no dataset exposto pelo site;
- gerar relatório por página;
- falhar se houver omissão não registrada.

### `npm run audit:links`

Deve:

- carregar `manifests/source-links.json`;
- verificar que cada URL externa única esteja presente;
- validar links internos;
- gerar relatório;
- não depender de requisições externas para passar, pois encurtadores podem bloquear bots.

### Testes de interface

Use Playwright ou equivalente para:

- 375 px;
- 768 px;
- 1440 px;
- navegação por teclado;
- menu mobile;
- accordions;
- ausência de overflow horizontal;
- rotas;
- 404;
- CTAs externos;
- `prefers-reduced-motion`.

Gere screenshots em `artifacts/screenshots/` e, se possível, publique como artifact do workflow.

## 10. Qualidade

Metas:

- HTML semântico;
- nenhuma informação importante desenhada apenas em imagem;
- imagens com `alt`;
- LCP otimizado;
- lazy loading;
- fontes com fallback;
- imagens locais otimizadas para WebP/AVIF quando legalmente e tecnicamente possível;
- nenhuma chave ou segredo no cliente;
- nenhuma coleta analítica sem solicitação;
- nenhuma dependência do Canva em produção;
- nenhum erro no console;
- nenhum link interno quebrado;
- build reproduzível.

## 11. GitHub e publicação

### Preflight de segurança

Execute:

```bash
gh auth status
gh api user --jq .login
git --version
node --version
npm --version
```

Nunca exiba tokens. Nunca grave credenciais no repositório.

### Regra de URL

Há duas modalidades possíveis, e você deve tratá-las honestamente.

#### Modalidade A — URL exata exigida

URL:

```text
https://jumpstylebrasil.github.io/
```

Isso exige:

```text
owner: jumpstylebrasil
repository: jumpstylebrasil.github.io
```

Verifique se o usuário autenticado possui permissão para esse owner.

Crie:

```text
jumpstylebrasil/jumpstylebrasil.github.io
```

Não crie um repositório chamado apenas `jumpstylebrasil` e depois afirme que ele gera a URL raiz.

#### Modalidade B — project site da conta Mreaggle

Somente use esta modalidade se a Modalidade A não estiver disponível e houver autorização explícita no ambiente ou nas instruções adicionais.

```text
owner: Mreaggle
repository: jumpstylebrasil
URL: https://mreaggle.github.io/jumpstylebrasil/
```

Nesse caso, configure corretamente `site` e `base` para o subdiretório.

### Comportamento obrigatório diante do bloqueio

Se o owner `jumpstylebrasil` não existir ou não estiver autorizado:

- conclua toda a implementação e todos os testes localmente;
- não alegue que `jumpstylebrasil.github.io` foi publicado;
- não crie a alternativa silenciosamente;
- produza `DEPLOYMENT_BLOCKER.md` com o passo exato necessário;
- somente use a Modalidade B se houver autorização explícita.

### Repositório

- público;
- descrição adequada;
- branch padrão `main`;
- commits claros;
- sem arquivos gerados desnecessários;
- sem `node_modules`;
- tópicos relevantes;
- README com desenvolvimento, build, deploy, conteúdo e fontes.

### GitHub Pages

Use GitHub Actions com as versões oficiais atuais recomendadas pela documentação do GitHub.

Workflow deve:

- disparar em push para `main`;
- permitir `workflow_dispatch`;
- instalar dependências com `npm ci`;
- executar check, testes, auditoria de conteúdo e auditoria de links;
- construir o site;
- fazer upload do artifact Pages;
- publicar no ambiente `github-pages`;
- usar permissões mínimas:
  - `contents: read`
  - `pages: write`
  - `id-token: write`
- usar concurrency para evitar deploys concorrentes.

Configure Pages para GitHub Actions por API/CLI, se permitido. Verifique o deploy e faça uma requisição final à URL.

## 12. Estrutura esperada

Exemplo adaptável:

```text
.
├── .github/workflows/deploy-pages.yml
├── docs/
│   ├── SOURCE_INVENTORY.md
│   ├── CONTENT_MIGRATION_MATRIX.md
│   ├── SOURCES.md
│   ├── EDITORIAL_CHANGES.md
│   └── BROKEN_OR_DEPRECATED_LINKS.md
├── public/
├── scripts/
│   ├── audit-content.mjs
│   └── audit-links.mjs
├── src/
│   ├── components/
│   ├── data/
│   ├── layouts/
│   ├── pages/
│   └── styles/
├── tests/
├── astro.config.mjs
├── package.json
├── README.md
└── tsconfig.json
```

## 13. Critérios de aceite

O trabalho só está concluído quando:

- todas as nove áreas originais estão representadas;
- nenhum texto original foi omitido;
- todos os URLs externos foram preservados ou documentados;
- o site funciona em mobile e desktop;
- `npm ci` funciona;
- `npm run check` passa;
- `npm run test` passa;
- `npm run build` passa;
- `npm run audit:content` passa;
- `npm run audit:links` passa;
- o workflow de Pages passa;
- o site publicado responde HTTP 200;
- as rotas principais funcionam diretamente;
- README e documentação estão completos;
- o relatório final informa honestamente owner, repo, commit, workflow e URL.

## 14. Relatório final obrigatório

Ao terminar, responda com:

1. resumo do que foi construído;
2. stack utilizada;
3. owner e nome exato do repositório;
4. URL do repositório;
5. URL publicada;
6. SHA do commit final;
7. resultado de cada comando de teste;
8. resultado do workflow;
9. matriz de preservação resumida;
10. fontes adicionadas;
11. itens não resolvidos;
12. bloqueios reais, sem fingir sucesso.

Não pare no meio para pedir preferências estéticas. Tome decisões profissionais fundamentadas nas regras acima. Só interrompa se houver um bloqueio externo impossível de contornar, especialmente ausência de permissão para o owner necessário ao endereço `jumpstylebrasil.github.io`.
