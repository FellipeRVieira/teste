FORMA3D — versão com galeria e zoom de produtos

Melhorias incluídas:

1. Zoom estilo marketplace/Mercado Livre no modal do produto.
   - Desktop: ao passar o mouse sobre a imagem aparece uma lente e uma área ampliada ao lado.
   - A ampliação acompanha a posição do mouse.

2. Suporte a múltiplas fotos por produto.
   - Cada produto agora possui o campo images: [].
   - Adicione 2, 3 ou mais caminhos de imagens nesse campo.

3. Miniaturas reais.
   - As miniaturas são botões acessíveis e trocam a imagem principal.

4. Compatibilidade com os produtos atuais.
   - Se images estiver vazio, o SVG atual continua sendo usado como fallback.
   - Assim, o projeto não quebra enquanto as fotos reais ainda não foram adicionadas.

5. Zoom para celular/tablet.
   - Toque na imagem para abrir o zoom.
   - Toque novamente para fechar.
   - Durante o zoom, o movimento do dedo acompanha a área ampliada.

6. Cards e produtos relacionados.
   - Quando houver foto real, o card usa automaticamente a primeira imagem.
   - Enquanto não houver foto, o SVG ilustrativo permanece.

7. Nova pasta:
   IMG/produtos/
   - Inclui um README explicando como organizar as fotos.

Como adicionar fotos:

No JS/produtos.js, localize um produto e altere, por exemplo:

images: [
  "IMG/produtos/suporte-controle-01.jpg",
  "IMG/produtos/suporte-controle-02.jpg",
  "IMG/produtos/suporte-controle-03.jpg"
]

Coloque os arquivos correspondentes dentro de IMG/produtos/.

Observação:
O número de WhatsApp continua como placeholder 5500000000000 e deve ser
substituído pelo número real antes da publicação.
