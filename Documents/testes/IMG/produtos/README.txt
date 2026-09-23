PASTA DE IMAGENS DOS PRODUTOS

Coloque aqui as fotos reais dos produtos.

Exemplo:
IMG/produtos/suporte-controle-01.jpg
IMG/produtos/suporte-controle-02.jpg
IMG/produtos/suporte-controle-03.jpg

Depois, no arquivo JS/produtos.js, altere o campo images do produto:

images: [
  "IMG/produtos/suporte-controle-01.jpg",
  "IMG/produtos/suporte-controle-02.jpg",
  "IMG/produtos/suporte-controle-03.jpg"
]

Você pode usar JPG, PNG ou WebP.
Recomendação: manter as imagens em formato quadrado ou próximo de 1:1,
com fundo limpo e boa iluminação.

Se o campo images ficar vazio ([]), o site usa automaticamente o SVG
ilustrativo atual como fallback, sem quebrar a galeria.
