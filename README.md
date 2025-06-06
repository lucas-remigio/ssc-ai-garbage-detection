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

## Modelo S: Arquitetura Convolucional Desenvolvida de Raiz

O modelo desenvolvido neste projeto segue uma arquitetura de rede neuronal convolucional (CNN), desenhada especificamente para a tarefa de classificação multiclasse de resíduos. Foi empregue um conjunto alargado de estratégias de treino e otimização com o objetivo de maximizar a performance do modelo e prevenir fenómenos como _overfitting_ e _underfitting_.

### Arquitetura do Modelo

O modelo CNN foi construído do zero com a seguinte composição:

- Camada de normalização dos valores de entrada (`Rescaling`);
- Três blocos convolucionais compostos por:
  - Camada `Conv2D` com filtros de 32, 64 e 128;
  - Camada `BatchNormalization`;
  - Função de ativação `ReLU`;
  - Camada de `MaxPooling`;
- Camada `Flatten` para conversão em vetor unidimensional;
- Camada `Dropout` com taxa de 0.3 para regularização;
- Camada `Dense` com 256 neurónios, seguida por `BatchNormalization` e ativação `ReLU`;
- Camada final `Dense` com função de ativação `softmax`, ajustada ao número total de classes (10).

### Configuração de Treino

O modelo foi compilado com os seguintes parâmetros:

- **Função de perda**: `sparse_categorical_crossentropy`, adequada para classificação com labels inteiros;
- **Otimizador**: `Adam` com `learning_rate=1e-3`, reconhecido pela sua eficiência em redes profundas;
- **Métrica de avaliação**: `accuracy`.

### Callbacks e Regularização

Para uma gestão inteligente do processo de treino, foram utilizados diversos _callbacks_:

- **EarlyStopping**:
  - Monitorização da métrica `val_accuracy` e `val_loss`;
  - `patience=5` e `restore_best_weights=True`, garantindo a recuperação do melhor modelo.
- **ModelCheckpoint**:
  - Salvamento automático do modelo com melhor desempenho com base em `val_accuracy`.
- **ReduceLROnPlateau**:
  - Redução dinâmica da _learning rate_ quando a perda de validação estagna;
  - `factor=0.2`, `patience=3` e `min_lr=1e-6`.

Estas estratégias contribuem para um treino mais eficiente e estável, reduzindo o risco de sobreajuste e adaptando dinamicamente a taxa de aprendizagem ao comportamento do modelo.

### Pesos por Classe

Foi também aplicado um sistema de **ponderação de classes** (`class_weight`) para lidar com **desequilíbrios no dataset**. Os pesos foram calculados com base na frequência de amostras por classe, assegurando que classes minoritárias não fossem negligenciadas durante o treino.

### Parâmetros de Execução

- **Épocas**: O modelo foi treinado por até **20 épocas**, com interrupção antecipada ativada via `EarlyStopping`;
- **Dados de entrada**: Foi utilizada a versão _pré-processada e embaralhada_ dos conjuntos de treino e validação (`train_dataset_pref`, `validation_dataset_pref`);
- **Salvamento de modelo**: O modelo completo, bem como os seus pesos, foram guardados após o treino para reutilização futura.

### Visualização de Resultados

Foi incluída uma visualização gráfica das métricas de desempenho por época:

- Gráficos de `accuracy` e `loss` para treino e validação;
- Análise visual do ponto de convergência e estabilidade do modelo.

Estas abordagens revelam uma estratégia de treino robusta, que combina boas práticas da aprendizagem profunda com mecanismos dinâmicos de controlo de desempenho.

## Modelo T: Transferência de Aprendizagem com Fine-Tuning

Para explorar os benefícios da reutilização de conhecimento aprendido por modelos de larga escala, foi desenvolvido um segundo modelo (Model T) baseado em **transfer learning**, uma abordagem amplamente adotada em cenários com datasets moderadamente dimensionados. Esta estratégia visa acelerar o treino, reduzir o risco de sobreajuste e melhorar a generalização.

### Arquitetura Base

Inicialmente, foi considerada a arquitetura **ResNet50** pré-treinada no ImageNet como **extrator de características (feature extractor)**. No entanto, após testes comparativos e revisão da literatura, observou-se que a arquitetura **VGG16** obteve melhores resultados, nomeadamente maior **accuracy** e menor **loss** tanto nos dados de validação como no conjunto de teste. Assim, a versão final do **Model T** recorre à arquitetura **VGG16** como base para transferência de aprendizagem.

A arquitetura completa é composta por:

- **Entrada e Normalização**:

  - Camada `Input` com dimensões (IMG_SIZE, IMG_SIZE, 3);
  - `Rescaling(1./255)` para normalizar os valores dos pixels.

- **Camadas pré-treinadas (VGG16)**:

  - A base `VGG16` é utilizada com pesos do ImageNet, inicialmente **congelada** (`training=False`);
  - A seguir é aplicada uma camada `GlobalAveragePooling2D` para reduzir a dimensionalidade do tensor de saída.

- **Cabeça personalizada densa**:
  - `Dropout(0.3)` seguido por uma camada `Dense(512)` com `BatchNormalization` e ativação `ReLU`;
  - `Dropout(0.4)` adicional, seguido de uma camada `Dense(256)`, novamente com normalização e ativação;
  - Camada de saída `Dense` com ativação `softmax`, ajustada ao número de classes.

### Estratégia de Treino

#### 1. **Feature Extraction**

Na primeira fase, apenas as camadas superiores são treinadas, mantendo os pesos do modelo base intactos:

- **Compilação** com:

  - Otimizador `Adam(learning_rate=0.0003)`;
  - Perda `sparse_categorical_crossentropy`;
  - Métrica `accuracy`.

- **Treino** por até 20 épocas com `EarlyStopping` (patience=5), monitorando a perda de validação (`val_loss`).

#### 2. **Fine-Tuning**

Após a fase inicial de treino com a VGG16 congelada (_feature extraction_), foi realizada a técnica de **fine-tuning**, onde parte das camadas finais da base VGG16 foram descongeladas para permitir uma afinação mais precisa dos pesos:

- As últimas **50 camadas** da VGG16 foram descongeladas seletivamente;
- O modelo foi recompilado com um **learning rate mais baixo** (`Adam(learning_rate=1e-5)`) para evitar grandes atualizações destrutivas;
- Foi utilizado o callback `ReduceLROnPlateau` para ajustar dinamicamente a taxa de aprendizagem em caso de estagnação da métrica de validação.

Esta segunda fase permitiu adaptar com maior fidelidade os padrões extraídos pela VGG16 às especificidades visuais das imagens do domínio alvo — resíduos sólidos urbanos em cenários reais.

### Técnicas de Otimização

- **Regularização com Dropout** (0.3 e 0.4) nas camadas densas para prevenir sobreajuste;
- **BatchNormalization** após cada camada densa, promovendo estabilidade do treino;
- **Class Weights** ajustados para mitigar desequilíbrios entre classes;
- **Callbacks**:
  - `EarlyStopping` com restauração de melhores pesos;
  - `ReduceLROnPlateau` para adaptação da _learning rate_.

### Salvamento e Persistência

Ao final do treino, foram guardados tanto os pesos (`.h5`) como o modelo completo (`.keras`) para reutilização e _deployment_:

```python
model.save('models/vgg16_finetuned_model.keras')
model.save_weights('models/vgg16.weights.h5')
```

## Comparação entre Model S e Model T

Neste projeto foram desenvolvidos dois modelos distintos para a tarefa de classificação de resíduos sólidos: **Model S** (desenvolvido de raiz) e **Model T** (baseado em transferência de aprendizagem). A comparação entre ambos permite avaliar o impacto da reutilização de conhecimento prévio e da complexidade arquitetural sobre o desempenho obtido.

| Aspeto                      | **Model S**                                   | **Model T**                                                 |
| --------------------------- | --------------------------------------------- | ----------------------------------------------------------- |
| **Tipo de Arquitetura**     | CNN construída do zero                        | Transfer learning com VGG16 pré-treinada                    |
| **Camadas Convolucionais**  | 3 blocos CNN + Flatten + Dense                | VGG16 (congelada inicialmente) + cabeça densa personalizada |
| **Número de Parâmetros**    | Reduzido                                      | Elevado, devido à profundidade da VGG16                     |
| **Pré-treinamento**         | Não                                           | Sim (pesos do ImageNet)                                     |
| **Tempo de Treino**         | Mais rápido inicialmente, mas menos eficiente | Treino rápido na fase de extração; fine-tuning mais lento   |
| **Generalização**           | Boa, mas sensível a overfitting               | Melhor generalização, com menor loss e maior accuracy       |
| **Regularização**           | Dropout, BatchNormalization                   | Dropout, BatchNormalization, fine-tuning controlado         |
| **Callbacks Utilizados**    | EarlyStopping, ReduceLROnPlateau, Checkpoint  | EarlyStopping, ReduceLROnPlateau                            |
| **Ajuste da Learning Rate** | Sim, com `ReduceLROnPlateau`                  | Sim, com `ReduceLROnPlateau` e ajuste manual no fine-tuning |
| **Class Weights**           | Sim                                           | Sim                                                         |
| **Desempenho (accuracy)**   | (Inserir resultados experimentais)            | (Inserir resultados experimentais)                          |

### Análise

O **Model S** revelou-se eficaz e controlável, permitindo uma construção arquitetónica adaptada à tarefa. No entanto, o **Model T**, após testes iniciais com **ResNet50**, demonstrou resultados superiores quando baseada na **VGG16**, com melhor **accuracy** e menor **loss** tanto em validação como em teste.

O uso de transferência de aprendizagem, especialmente com VGG16, mostrou-se vantajoso em contextos com conjuntos de dados visuais específicos mas com dimensão moderada, sendo especialmente eficaz para capturar padrões visuais relevantes de forma mais robusta e generalizável.

Esta comparação realça a importância de combinar o conhecimento prévio embutido em modelos de larga escala com a afinação adequada para o domínio específico.
