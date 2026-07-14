# Auditoria de migração — Jumpstyle Brasil

## Diagnóstico dos arquivos

- `inputs/site-original.pdf` é a fonte primária de conteúdo, estrutura visual e hyperlinks.
- O PDF possui 9 páginas e 88 anotações de link; 56 são links externos e há 16 URLs externas únicas.
- `inputs/canva-editor-snapshot.html` é um snapshot do editor do Canva, não um código-fonte de site independente.
- O HTML referencia uma pasta auxiliar `...Website_files/` que não acompanha o arquivo e também contém URLs `blob:` temporárias. Portanto, ele serve para confirmar textos, links, dimensões e detalhes do DOM, mas não deve ser reutilizado como aplicação.
- As imagens em `reference-renders/` são referências visuais autoritativas para conferir tudo o que o parser de texto não captura, especialmente a página de Criadores.

## Mapa obrigatório de páginas

1. Início / Hub
2. All-Star
3. História
4. Como Dançar
5. Roadmap
6. Jumper Manifesto
7. Músicas
8. Criadores
9. FAQ / Sugestões

A nova arquitetura pode reorganizar navegação e hierarquia, mas não pode eliminar nenhuma dessas áreas nem omitir conteúdo.

## Conteúdo visual que exige inspeção humana

A página 8 contém cards/snapshots de criadores. Os handles visíveis são:

- `mreaggle`
- `lufefbs`
- `digo3492_`
- `guilhermedourado`
- `tauan.rick`
- `figurinha696`
- `nakpovs`

Os números de seguidores e curtidas são um registro histórico do snapshot original, não dados atuais. Se forem exibidos, rotular como “registro do site original” e nunca como métricas em tempo real.

## Links externos únicos que precisam ser preservados

- https://bit.ly/AllStarJumpBR
- https://bit.ly/Round2JumpBR
- https://bit.ly/VotarJumpBR
- https://chat.whatsapp.com/L9WMrarqAkc3GKFvQdv2dK
- https://discord.gg/9CT8uPr
- https://github.com/Mreaggle/JumpstyleUnitedNations/
- https://github.com/Mreaggle/JumpstyleUnitedNations/blob/main/JUNToolkit/KeyFiguresWorldwide/Dance/README.md
- https://github.com/Mreaggle/JumpstyleUnitedNations/blob/main/JumpstyleTimeline/Global/global-timeline.md
- https://shorturl.at/jKRT8
- https://vm.tiktok.com/ZMMJYpjGk/
- https://vm.tiktok.com/ZMMccMWYx/
- https://www.instagram.com/jumpstylebrasil
- https://www.tiktok.com/@mreaggle/video/7320740245882801413?_t=8k3IFjBNvjZ&_r=1
- https://www.youtube.com/@MreaggleJumpstyle/playlists
- https://www.youtube.com/playlist?list=PLZqEDYStFZmbF3Tv2hiJgLugJYViEuPjF
- https://www.youtube.com/watch?v=X4MajOncy_k

## Regra de fidelidade

O agente deve criar uma matriz de migração que associe cada página do PDF a uma rota do novo site e registrar:

- texto original preservado;
- link original preservado;
- imagem ou informação visual preservada;
- destino novo;
- qualquer correção ortográfica;
- qualquer ampliação editorial;
- fonte da ampliação.

Conteúdo adicional nunca deve substituir silenciosamente o conteúdo original. Use blocos separados, como “Conteúdo original da Jumpstyle Brasil” e “Ampliação documentada”.

## Bloqueio importante de GitHub Pages

A identidade GitHub conectada durante esta auditoria é `Mreaggle`.

- Repositório `Mreaggle/jumpstylebrasil` resulta normalmente em:
  `https://mreaggle.github.io/jumpstylebrasil/`
- Para obter exatamente:
  `https://jumpstylebrasil.github.io/`
  o proprietário GitHub precisa ser o usuário ou organização `jumpstylebrasil`, e o repositório precisa se chamar:
  `jumpstylebrasil.github.io`

Não afirmar que o endereço exato foi criado quando o proprietário necessário não estiver disponível.
