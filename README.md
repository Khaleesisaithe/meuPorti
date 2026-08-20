# Portfólio — Khaleesi Saithe

Site pessoal de portfólio desenvolvido em **HTML, CSS e JavaScript puro**, sem frameworks, dependências ou processo de build. A interface combina uma identidade visual roxo-gótica com recursos interativos para apresentar habilidades, projetos, experiências e trajetória profissional.

O projeto pode ser aberto diretamente no navegador e publicado em serviços de hospedagem estática, como GitHub Pages, Vercel ou Netlify.

![HTML5](https://img.shields.io/badge/HTML5-estrutura-orange)![CSS3](https://img.shields.io/badge/CSS3-estilos-blue)![JavaScript](https://img.shields.io/badge/JavaScript-interatividade-yellow)![Status](https://img.shields.io/badge/status-portf%C3%B3lio%20pessoal-purple)

## Demonstração

🔗 [Ver repositório no GitHub](https://github.com/khaleesisaithe)

<!-- Adicione aqui o link do portfólio publicado, quando disponível:
🔗 [Ver portfólio online](https://seu-link-de-deploy.example )
-->

## ✨ Funcionalidades

🪪 **Apresentação pessoal** — seção inicial com identidade visual própria e foto utilizada no crachá do topo

🧰 **Stack de habilidades** — exibição das tecnologias e dos respectivos níveis de domínio por meio de barras de progresso

🗂️ **Projetos filtráveis** — organização dos projetos por categoria, com cards individuais e status de acompanhamento

🖥️ **Previews de terminal** — mini janelas de terminal criadas em HTML e CSS para representar visualmente os projetos

⌨️ **Terminal interativo** — comandos personalizados executados diretamente na interface do portfólio

🌓 **Tema claro e escuro** — alternância entre os dois temas visuais da página

⏳ **Tela de carregamento inicial** — sequência de textos de boot apresentada antes da abertura do conteúdo principal

📍 **Experiência e trajetória** — seções organizadas em formato de linha do tempo para apresentar momentos profissionais e objetivos

## 📦 Instalação

Clone o repositório ou baixe os arquivos do projeto:

```bash
git clone URL_DO_REPOSITORIO
cd NOME_DO_REPOSITORIO
```

O projeto não possui dependências externas nem exige a execução de comandos de build.

### Pré-requisitos

- Um navegador moderno

- Git, caso queira clonar o repositório

- Um servidor HTTP local, opcionalmente, para testar o site em um ambiente semelhante ao deploy

## 🚀 Como usar

Você pode abrir o arquivo `index.html` diretamente no navegador.

Para executar localmente com um servidor HTTP simples, use:

```bash
python3 -m http.server 8000
```

Depois, acesse `http://localhost:8000` no navegador.

O portfólio é dividido nas seguintes áreas principais:

| Seção | O que apresenta |
| --- | --- |
| Apresentação | Identidade pessoal, introdução e foto do topo |
| Stack | Habilidades e níveis de domínio das tecnologias |
| Projetos | Cards de projetos com filtros, categorias e status |
| Experiência | Histórico de experiências profissionais |
| Trajetória | Linha do tempo com marcos e objetivos |
| Terminal | Interface interativa com comandos personalizados |

## 📁 Estrutura do projeto

```
portfolio/
├── index.html              # Conteúdo e estrutura de todas as seções
├── css/
│   └── style.css           # Cores, layout, temas e animações
├── js/
│   └── script.js           # Menus, filtros, terminal e interações
├── assets/
│   └── img/
│       └── id-photo.jpg    # Foto utilizada no crachá do topo
└── README.md               # Documentação do projeto
```

## 🛠️ Tecnologias utilizadas

**HTML5** — estrutura semântica e conteúdo das seções do portfólio

**CSS3** — identidade visual roxo-gótica, responsividade, temas, componentes e animações

**JavaScript** — lógica dos menus, filtros de projetos, terminal interativo e tela de carregamento

## 🧠 Como funciona por baixo dos panos

O projeto foi organizado para manter conteúdo, apresentação visual e interatividade separados:

- `index.html` concentra o conteúdo da página, os cards de projeto, a linha do tempo e os elementos do terminal.

- `css/style.css` controla a paleta de cores, os layouts, as animações e os temas claro e escuro.

- `js/script.js` controla os comportamentos interativos, como menus, filtros, comandos do terminal e textos da tela de boot.

- Os previews dos projetos são construídos com HTML e CSS. Eles não são screenshots reais, o que facilita a atualização das informações e mantém o visual consistente.

## ✏️ Onde editar cada parte

| Quero alterar... | Vou em... |
| --- | --- |
| Texto de qualquer seção | `index.html`; procure o comentário `<!-- ===== NOME DA SEÇÃO ===== -->` correspondente |
| Cores do tema claro | `css/style.css`, no bloco `:root` |
| Cores do tema escuro | `css/style.css`, no seletor `[data-theme="dark"]` |
| Adicionar um projeto | `index.html`, na seção `#projetos`; copie um bloco `.proj-card` completo |
| Criar uma categoria de filtro | `index.html`; adicione um botão em `.filter-row` e o `data-tag` correspondente no card |
| Alterar o nível de uma habilidade | `index.html`, na seção `#stack`; edite o atributo `data-w="XX"` de `.bar-fill` |
| Editar experiência profissional | `index.html`, nas seções `#experiencia` e `#trajetoria` |
| Alterar os comandos do terminal | `js/script.js`, no objeto `commands` ao final do arquivo |
| Alterar os textos de boot | `js/script.js`, no array `bootLines` no início do arquivo |
| Editar um preview de terminal | `index.html`; altere os elementos `.preview-line` do card desejado |

### Status dos projetos

Cada card de projeto utiliza a classe `.proj-status`. Há quatro variações visuais disponíveis:

| Classe | Significado |
| --- | --- |
| `.status-ativo` | Projeto em produção ou com deploy funcionando |
| `.status-dev` | Projeto em desenvolvimento |
| `.status-learn` | Projeto relacionado a aprendizado contínuo |
| `.status-done` | Marco ou objetivo concluído |

## 🌐 Deploy

Como o site é estático, não é necessário configurar um servidor de aplicação ou executar um processo de build.

### GitHub Pages

1. Envie a pasta do projeto para um repositório no GitHub.

1. Acesse **Settings → Pages**.

1. Selecione **Deploy from a branch**.

1. Escolha a branch que contém o `index.html`.

1. Salve a configuração e aguarde a publicação.

### Vercel ou Netlify

Importe o repositório na plataforma escolhida e mantenha o projeto como um site estático. Não é necessário informar comando de build; o arquivo de entrada é o `index.html`.

## ✅ Verificações antes de publicar

Antes de fazer o deploy, confirme se a foto `assets/img/id-photo.jpg` está no caminho correto, se os links dos projetos estão atualizados e se todos os filtros funcionam corretamente.

Também é importante testar a alternância entre os temas claro e escuro, os comandos do terminal, a tela de carregamento e a visualização em diferentes larguras de tela.

## 👤 Autoria

Desenvolvido por **Khaleesi Saithe**.

- GitHub: [@khaleesisaithe](https://github.com/khaleesisaithe)

## 📄 Licença

Este projeto é um portfólio pessoal. Caso o código seja disponibilizado para reutilização, adicione um arquivo `LICENSE` ao repositório e informe aqui os termos da licença escolhida.

---

Se este projeto foi útil ou interessante, considere deixar uma estrela no repositório e acompanhar sua evolução.