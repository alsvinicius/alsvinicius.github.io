# Portfolio de projetos

Página estática em português com uma seleção manual de projetos públicos de
[`alsvinicius`](https://github.com/alsvinicius). O catálogo fica em
`assets/app.js`; a página não consulta a API do GitHub. Para incluir, remover ou
atualizar um projeto, edite a lista `repositories` nesse arquivo.

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

## Catálogo

Os projetos, descrições, linguagens, tópicos, contagens e datas de atualização
são dados locais e devem ser mantidos manualmente. Busca, filtro por linguagem,
ordenação, destaques e contagens são calculados no navegador a partir dessa
lista.

## Publicar no GitHub Pages

O workflow em `.github/workflows/pages.yml` publica o conteúdo estático a cada
push para `main`. GitHub Pages já está configurado para usar **GitHub Actions**
em `https://alsvinicius.github.io/`.
