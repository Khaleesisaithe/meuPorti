# Portfólio — Khaleesi Saithe

Site pessoal de portfólio, em HTML/CSS/JS puro (sem build, sem dependências —
funciona direto no GitHub Pages, Vercel ou Netlify).

## Estrutura de pastas

```
/
├── index.html          → todo o conteúdo e a estrutura das seções
├── css/
│   └── style.css       → todo o visual (cores, layout, animações)
├── js/
│   └── script.js       → toda a interatividade (menus, filtros, terminal, etc.)
├── assets/
│   └── img/
│       └── id-photo.jpg → foto usada no "crachá" do topo
└── README.md            → este arquivo
```

## Onde mexer em cada coisa

| Quero alterar...                         | Vou em...                                  |
|-------------------------------------------|---------------------------------------------|
| Texto de qualquer seção                   | `index.html` (procure o comentário `<!-- ===== NOME DA SEÇÃO ===== -->`) |
| Cores (paleta roxo-gótico)                | `css/style.css`, bloco `:root` (tema claro) e `[data-theme="dark"]` (tema escuro), no topo do arquivo |
| Adicionar um projeto novo                 | `index.html`, seção `#projetos` — copie um bloco `.proj-card` inteiro e troque o conteúdo |
| Categoria/filtro de projeto novo          | `index.html`, `.filter-row` (adicione um botão) **e** o `data-tag` do card correspondente |
| Nível de habilidade (barra de %)          | `index.html`, seção `#stack`, atributo `data-w="XX"` de cada `.bar-fill` |
| Linha do tempo / experiência profissional | `index.html`, seções `#experiencia` e `#trajetoria` |
| Comandos do terminal (botão `>_`)         | `js/script.js`, objeto `commands` no final do arquivo |
| Textos do "boot" inicial (tela de carregamento) | `js/script.js`, array `bootLines` no topo |

## Sobre os "previews" de terminal nos projetos

Cada card em `#projetos` tem uma mini janela de terminal (`.proj-preview`)
feita 100% em HTML/CSS — não são screenshots reais. Isso evita imagens
desatualizadas e mantém o visual consistente com o resto do site.
Para editar o texto de um preview, procure `.preview-line` dentro do card
correspondente em `index.html`.

## Selos de status dos projetos

Classe CSS (`.proj-status`) usada em cada card, com 4 variações já prontas:

- `.status-ativo` — verde, projeto em produção/deploy funcionando
- `.status-dev` — âmbar, em desenvolvimento
- `.status-learn` — roxo claro, aprendizado contínuo
- `.status-done` — magenta, marco/objetivo concluído

## Deploy

Como é um site estático puro, basta:
1. Subir esta pasta inteira para um repositório no GitHub.
2. Ativar o GitHub Pages (Settings → Pages → Deploy from branch) **ou**
   conectar o repositório na Vercel/Netlify.

Nenhum passo de build é necessário.
