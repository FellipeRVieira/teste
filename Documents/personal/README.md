# Personal Trainer — Portfólio

## Estrutura

```text
personal-trainer/
├── index.html
├── CSS/
│   ├── principal.css
│   ├── base.css
│   ├── components.css
│   ├── home.css
│   ├── responsive.css
│   └── themes.css
├── JS/
│   ├── main.js
│   ├── theme.js
│   └── animations.js
├── assets/
│   ├── img/
│   │   ├── hero/
│   │   │   └── professor-hero.webp
│   │   ├── sobre/
│   │   │   ├── professor-01.webp
│   │   │   └── professor-02.webp
│   │   ├── servicos/
│   │   │   ├── musculacao.webp
│   │   │   ├── domicilio.webp
│   │   │   └── acompanhamento.webp
│   │   └── logo/
│   │       └── logo.svg
│   ├── icons/
│   └── videos/
│       └── sobre-professor.mp4
└── README.md
```

### Correções aplicadas

- `CSS/principal.css` passou a ser o único entry point de estilos.
- `responsive.css` foi colocado por último na cascata.
- A pasta antiga `IMG/` foi substituída por `assets/`.
- Caminhos do `index.html` foram alinhados à estrutura `assets/img/...`.
- Foram adicionados os três arquivos JS que o HTML já referenciava.
- O tema claro/escuro agora persiste no navegador.
- O menu mobile agora abre/fecha corretamente.
- O ano do footer é atualizado automaticamente.
- Foi adicionada a animação de entrada via `IntersectionObserver`.
- O projeto mantém suporte a `prefers-reduced-motion`.

**Importante:** o ZIP original não continha as imagens, logo ou vídeo finais; as pastas de `IMG/` estavam vazias. Os locais corretos para inserir esses arquivos estão preparados na estrutura acima.


## Segunda etapa — refinamento visual

- Hero com maior presença visual, contraste e hierarquia tipográfica.
- Separação visual mais clara entre as seções.
- Cards de serviços com hover, profundidade e alturas consistentes.
- Cards de preços com hierarquia mais forte e destaque do plano recomendado.
- Seção de contato com CTA mais evidente.
- Melhorias de espaçamento e leitura em tablet/mobile.
- Estados de foco e hover mais consistentes.
- Menu mobile com fechamento por `Esc`.
- Redução de movimento respeitada também no marquee e nos hovers.


## Imagens provisórias
As fotos desta versão usam imagens remotas do Unsplash como placeholders. Substitua as URLs no `index.html` pelas fotos reais quando estiverem disponíveis.
