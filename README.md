## Descrição do Dataset

O _dataset_ utilizado neste projeto é o **Garbage Classification v2**, disponível publicamente na plataforma _Kaggle_ ([link para o _dataset_](https://www.kaggle.com/datasets/sumn2u/garbage-classification-v2)). Este conjunto de dados foi concebido para tarefas de classificação de imagens e destina-se à identificação automática de diferentes tipos de resíduos encontrados em ambientes urbanos e naturais. A aplicação prática centra-se no apoio a sistemas de separação e reciclagem de lixo, nomeadamente no contexto da educação ambiental e da sustentabilidade.

### Estrutura e Conteúdo

O _dataset_ é composto por 19762 imagens RGB distribuídas em **10 classes distintas**, que representam categorias típicas de resíduos sólidos urbanos. Cada imagem retrata objetos do quotidiano descartados no chão ou em contentores, e está classificada conforme o tipo de material predominante. As categorias incluem:

- **Metal** (metal) com 1020 imagens;
- **Glass** (vidro) com 3061 imagens;
- **Biological** (biológico) com 997 imagens;
- **Paper** (papel) com 1680 imagens;
- **Battery** (pilhas) com 944 imagens;
- **Trash** (lixo indiferenciado) com 947 imagens;
- **Cardboard** (cartão) com 1825 imagens;
- **Shoes** (calçado) com 1977 imagens;
- **Clothes** (roupa) com 5327 imagens;
- **Plastic** (plástico) com 1984 imagens;

Estas classes foram escolhidas com base na sua relevância para sistemas de triagem e reciclagem seletiva, e apresentam um desafio interessante pela sua variedade visual e pelas semelhanças visuais entre certos tipos de materiais (e.g., papel vs. cartão).

Para o processo de treino, utilizou-se a plataforma [Roboflow](https://roboflow.com/) para divisão do dataset nas seguintes percentagens:

- 70 % das imagens para treino
- 15 % das imagens para validação
- 15 % das imagens para teste

Optou-se pela divisão 70-15-15 para garantir um conjunto de treino robusto, sem comprometer o número de imagens disponíveis para validação e teste. Apesar de se ter ponderado uma divisão 80-10-10, a grande variedade de imagens levou a concluir que 70 % (aproximadamente 13 800) eram suficientes para treinar o modelo, ao mesmo tempo que se mantinham 15 % cada para avaliar a sua eficiência em validação e teste.

Neste projeto, as _features_ extraídas pelas arquiteturas convolucionais (Model S e Model T) foram utilizadas diretamente dentro do _pipeline_ de treino e validação, não sendo exportadas separadamente para ficheiros externos. Por esse motivo, a entrega não inclui ficheiros com _computed features_.

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

- **Train:** ≥ 13800 imagens
- **Validation:** ≥ 2950 imagens
- **Test:** ≥ 2950 imagens

As imagens possuem resolução variável e estão em formato RGB, permitindo a utilização de arquiteturas baseadas em redes neuronais convolucionais (CNNs). A diversidade das amostras contribui para a robustez do modelo e oferece uma boa base para experimentações com técnicas de _data augmentation_, regularização e transferência de aprendizagem.
