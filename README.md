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
pela variável `PAGE_PORT`.

## Destaques

Todos os repositórios públicos do perfil aparecem na grade. Para destacar um
projeto, adicione o tópico `portfolio` nas configurações do repositório no
GitHub. O link “Explorar projetos” mostra primeiro essa seleção quando houver
algum destaque. Busca, filtro por linguagem e ordenação são aplicados no
navegador.

## Publicar no GitHub Pages

O workflow em `.github/workflows/pages.yml` publica o conteúdo estático a cada
push para `main`. No GitHub, configure Pages para usar **GitHub Actions** em
Settings → Pages. O deploy é feito para `https://alsvinicius.github.io/`.
