import tensorflow as tf
import time
import os
import json
from datetime import datetime

# Início do processo
print(f"[{datetime.now()}] Início da conversão para TFLite")
print(f"Versão do TensorFlow: {tf.__version__}")

# Função para medir tempo
def log_time(start_time, message):
    elapsed = time.time() - start_time
    print(f"[{datetime.now()}] {message} - Levou {elapsed:.2f} segundos")
    return time.time()

total_start = time.time()
step_start = total_start

# Passo 1: Carregar modelo .keras
print(f"[{datetime.now()}] Carregando modelo .keras...")
try:
    model = tf.keras.models.load_model("vgg16_finetuned_model.keras")
    step_start = log_time(step_start, "✅ Modelo carregado com sucesso")
    print("Resumo do modelo:")
    model.summary()
except Exception as e:
    print(f"[{datetime.now()}] ❌ Erro ao carregar o modelo: {str(e)}")
    raise

# Passo 2: Carregar nomes das classes (se tiveres o JSON já gerado)
try:
    with open("class_names.json", "r") as f:
        class_names = json.load(f)
    print(f"[{datetime.now()}] ✅ Nomes das classes carregados: {class_names}")
    step_start = log_time(step_start, "Nomes das classes carregados")
except:
    class_names = ["class_" + str(i) for i in range(model.output_shape[-1])]
    print(f"[{datetime.now()}] ⚠️ Usando nomes de classe genéricos: {class_names}")
    step_start = log_time(step_start, "Classes genéricas atribuídas")

# Passo 3: Preparar conversor TFLite
print(f"[{datetime.now()}] Configurando TFLiteConverter...")
try:
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    converter.target_spec.supported_ops = [
        tf.lite.OpsSet.TFLITE_BUILTINS,     # Operações padrão do TFLite
        tf.lite.OpsSet.SELECT_TF_OPS        # Operações completas do TF (necessário p/ VGG16, etc.)
    ]
    converter.experimental_enable_resource_variables = True
    step_start = log_time(step_start, "✅ Conversor configurado")
except Exception as e:
    print(f"[{datetime.now()}] ❌ Erro ao configurar o conversor: {str(e)}")
    raise

# Passo 4: Converter o modelo
print(f"[{datetime.now()}] Convertendo modelo...")
try:
    conversion_start = time.time()
    tflite_model = converter.convert()
    print(f"[{datetime.now()}] ✅ Conversão feita com sucesso! Tamanho: {len(tflite_model) / (1024 * 1024):.2f} MB")
    step_start = log_time(conversion_start, "Conversão para TFLite finalizada")
except Exception as e:
    print(f"[{datetime.now()}] ❌ Erro durante a conversão: {str(e)}")
    raise

# Passo 5: Guardar modelo .tflite
print(f"[{datetime.now()}] Guardando modelo .tflite...")
try:
    with open("garbage_classifier.tflite", "wb") as f:
        f.write(tflite_model)
    print(f"[{datetime.now()}] ✅ Modelo salvo como garbage_classifier.tflite")
    step_start = log_time(step_start, "Salvo com sucesso")
except Exception as e:
    print(f"[{datetime.now()}] ❌ Erro ao guardar o modelo TFLite: {str(e)}")
    raise

# Passo 6: Guardar nomes das classes
print(f"[{datetime.now()}] Guardando class_names.json...")
try:
    with open("class_names.json", "w") as f:
        json.dump(class_names, f)
    print(f"[{datetime.now()}] ✅ Arquivo class_names.json salvo")
    step_start = log_time(step_start, "Classes salvas")
except Exception as e:
    print(f"[{datetime.now()}] ❌ Erro ao salvar nomes das classes: {str(e)}")
    raise

# Fim
log_time(total_start, "🎉 Processo de conversão completo")
print(f"[{datetime.now()}] Modelo TFLite pronto para uso em app móvel.")
