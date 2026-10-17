# Portfolio GitHub

Página estática em português para explorar os repositórios públicos de
[`alsvinicius`](https://github.com/alsvinicius). A lista vem da API pública do
GitHub; nenhum token é enviado ao navegador ou guardado no projeto.

## Rodar localmente

Requer Python 3 e Make. Na galeria de projetos, inicie a instância normalmente.
Pelo terminal:

```sh
make start
make stop
```

O servidor usa `127.0.0.1:4178` por padrão. A galeria pode fornecer outra porta
pela variável `PAGE_PORT` (ou `PORT`, em catálogos anteriores).
O arquivo local `.project-gallery.mk` tem prioridade sobre a porta padrão.

## Destaques

Todos os repositórios públicos do perfil aparecem na grade. Para destacar um
projeto, adicione o tópico `portfolio` nas configurações do repositório no
GitHub. O link “Explorar projetos” mostra primeiro essa seleção quando houver
algum destaque. Busca, filtro por linguagem e ordenação são aplicados no
navegador.

## Publicar no GitHub Pages

O workflow em `.github/workflows/pages.yml` publica o conteúdo estático a cada
push para `main`. GitHub Pages já está configurado para usar **GitHub Actions**
em `https://alsvinicius.github.io/`.

## Direção visual

Instrument Design, tema Chalk: corpo mineral fosco, módulos elevados,
campos rebaixados e ações em vermelhão. Os papéis de cor e material ficam em
`assets/instrument-tokens.css`; as construções reutilizáveis, em
`assets/instrument-components.css`; a composição do portfólio, em `assets/styles.css`.
O painel do GitHub usa contagens reais da mesma consulta que alimenta os projetos.
