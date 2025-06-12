## Descrição do Dataset

O _dataset_ utilizado neste projeto é o **Garbage Classification v2**, disponível publicamente na plataforma _Kaggle_ ([link para o _dataset_](https://www.kaggle.com/datasets/sumn2u/garbage-classification-v2)). Este conjunto de dados foi concebido para tarefas de classificação de imagens e destina-se à identificação automática de diferentes tipos de resíduos encontrados em ambientes urbanos e naturais. A aplicação prática centra-se no apoio a sistemas de separação e reciclagem de lixo, nomeadamente no contexto da educação ambiental e da sustentabilidade.

### Estrutura e Conteúdo

O _dataset_ é composto por imagens RGB distribuídas em **10 classes distintas**, que representam categorias típicas de resíduos sólidos urbanos. Cada imagem retrata objetos do quotidiano descartados no chão ou em contentores, e está classificada conforme o tipo de material predominante. As categorias incluem:

- **Cardboard** (papelão)
- **Glass** (vidro)
- **Metal** (metal)
- **Paper** (papel)
- **Plastic** (plástico)
- **Trash** (lixo indiferenciado)
- **Battery** (pilhas)
- **Shoes** (calçado)
- **Clothes** (roupa)
- **Light bulbs** (lâmpadas)

Estas classes foram escolhidas com base na sua relevância para sistemas de triagem e reciclagem seletiva, e apresentam um desafio interessante pela sua variedade visual e pelas semelhanças visuais entre certos tipos de materiais (e.g., papel vs. cartão).

### Motivação e Aplicação

O objetivo da utilização deste _dataset_ é o desenvolvimento de um modelo de visão por computador que, integrado numa aplicação móvel, permita identificar automaticamente o tipo de lixo captado pela câmara do dispositivo. A ideia é que o utilizador aponte a câmara para o objeto e a aplicação indique a categoria correta e a correspondente cor do ecoponto onde o objeto deve ser colocado, por exemplo:

- Vidro → **Verde**
- Papel/Papelão → **Azul**
- Plástico e Metal → **Amarelo**
- Lixo indiferenciado → **Preto**
- Pilhas e lâmpadas → **Recolha especial**

Este tipo de solução tem um forte impacto educativo e ambiental, promovendo a reciclagem consciente e a correta separação dos resíduos, além de representar um excelente caso de uso para sistemas _context-aware_ baseados em sensores (neste caso, a câmara) e inteligência artificial.

### Tamanho e Qualidade

O dataset está organizado de forma a facilitar a divisão em conjuntos de treino, validação e teste, cumprindo os requisitos mínimos estipulados para este projeto:

- **Train:** ≥ 2000 imagens
- **Validation:** ≥ 1000 imagens
- **Test:** ≥ 1000 imagens

As imagens possuem resolução variável e estão em formato RGB, permitindo a utilização de arquiteturas baseadas em redes neuronais convolucionais (CNNs). A diversidade das amostras contribui para a robustez do modelo e oferece uma boa base para experimentações com técnicas de _data augmentation_, regularização e transferência de aprendizagem.
