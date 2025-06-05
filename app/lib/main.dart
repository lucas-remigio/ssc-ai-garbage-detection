import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:tflite_flutter/tflite_flutter.dart';
import 'package:flutter/services.dart';
import 'dart:typed_data';
import 'package:image/image.dart' as img;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final cameras = await availableCameras();
  runApp(MaterialApp(home: CameraScreen(cameras: cameras)));
}

class CameraScreen extends StatefulWidget {
  final List<CameraDescription> cameras;
  const CameraScreen({super.key, required this.cameras});

  @override
  _CameraScreenState createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen> {
  late CameraController controller;
  Interpreter? tflite;
  String prediction = "Analyzing...";
  bool isDetecting = false;
  List<String> labels = [];
  int frameCount = 0; // Add frame counter
  final int classifyEveryNFrames = 10; // Classify every 10th frame

  @override
  void initState() {
    super.initState();
    controller = CameraController(widget.cameras[0], ResolutionPreset.medium);
    controller.initialize().then((_) {
      if (!mounted) return;
      setState(() {});
      loadModel();
      controller.startImageStream((image) {
        frameCount++;
        if (!isDetecting && frameCount % classifyEveryNFrames == 0) {
          isDetecting = true;
          classifyImage(image);
        }
      });
    });
  }

  loadModel() async {
    try {
      // Load your TFLite model
      if (kDebugMode) {
        print("[MODEL] Loading model...");
      }
      tflite = await Interpreter.fromAsset('assets/garbage_classifier.tflite');
      if (kDebugMode) {
        print("[MODEL] Model loaded successfully");
      }

      // Load labels - proper JSON parsing
      final labelData = await rootBundle.loadString('assets/class_names.json');
      labels = List<String>.from(json.decode(labelData));
      if (kDebugMode) {
        print("[MODEL] Model loaded with ${labels.length} classes");
      }
    } catch (e) {
      if (kDebugMode) {
        print("[MODEL] Error loading model: $e");
      }
    }
  }

  classifyImage(CameraImage image) async {
    if (tflite == null) {
      setState(() {
        prediction = "Model not loaded yet";
        isDetecting = false;
      });
      return;
    }
    try {
      // 1. Convert CameraImage to a format suitable for processing
      final inputImage = _convertCameraImage(image);

      // 2. Resize image to match model's expected input size (160x160)
      final resizedImage = img.copyResize(inputImage, width: 160, height: 160);

      // 3. Prepare input tensor data (normalize pixel values 0-1)
      var inputBytes = Float32List(1 * 160 * 160 * 3);
      var inputBuffer = Float32List.view(inputBytes.buffer);

      int pixelIndex = 0;
      for (var y = 0; y < 160; y++) {
        for (var x = 0; x < 160; x++) {
          var pixel = resizedImage.getPixel(x, y);
          int r, g, b;
          if (pixel is int) {
            int pix = pixel as int;
            r = (pix >> 16) & 0xFF;
            g = (pix >> 8) & 0xFF;
            b = pix & 0xFF;
          } else {
            // Pixel object: use .toInt() for each channel
            r = pixel.r.toInt();
            g = pixel.g.toInt();
            b = pixel.b.toInt();
          }
          inputBuffer[pixelIndex++] = r / 255.0;
          inputBuffer[pixelIndex++] = g / 255.0;
          inputBuffer[pixelIndex++] = b / 255.0;
        }
      }

      // 4. Run inference
      var outputBuffer = <int, Object>{};
      outputBuffer[0] = Float32List(1 * labels.length);
      tflite!.runForMultipleInputs([inputBytes], outputBuffer);

      // 5. Get output probabilities
      Float32List outputs = outputBuffer[0] as Float32List;

      // 6. Find prediction with highest probability
      int maxIndex = 0;
      double maxProb = outputs[0];
      for (int i = 1; i < outputs.length; i++) {
        if (outputs[i] > maxProb) {
          maxProb = outputs[i];
          maxIndex = i;
        }
      }

      setState(() {
        if (maxIndex < labels.length) {
          prediction =
              "${labels[maxIndex]} (${(maxProb * 100).toStringAsFixed(1)}%)";
        } else {
          prediction = "Unknown";
        }
        isDetecting = false;
      });
    } catch (e) {
      if (kDebugMode) {
        print('Error classifying image: $e');
      }
      setState(() {
        prediction = "Error: $e";
        isDetecting = false;
      });
    }
  }

  // Helper function to convert CameraImage to Image
  img.Image _convertCameraImage(CameraImage cameraImage) {
    // Handle YUV_420_888 format which is most common
    if (cameraImage.format.group == ImageFormatGroup.yuv420) {
      return _convertYUV420ToImage(cameraImage);
    } else if (cameraImage.format.group == ImageFormatGroup.bgra8888) {
      return _convertBGRA8888ToImage(cameraImage);
    } else {
      throw Exception('Unsupported image format: ${cameraImage.format.group}');
    }
  }

  // Convert YUV420 format to RGB Image
  img.Image _convertYUV420ToImage(CameraImage cameraImage) {
    final width = cameraImage.width;
    final height = cameraImage.height;

    final yBuffer = cameraImage.planes[0].bytes;
    final uBuffer = cameraImage.planes[1].bytes;
    final vBuffer = cameraImage.planes[2].bytes;

    final yRowStride = cameraImage.planes[0].bytesPerRow;
    final uvRowStride = cameraImage.planes[1].bytesPerRow;
    final uvPixelStride = cameraImage.planes[1].bytesPerPixel ?? 1;

    final image = img.Image(width: width, height: height);

    for (int h = 0; h < height; h++) {
      for (int w = 0; w < width; w++) {
        final yIndex = h * yRowStride + w;
        final uvIndex = (h ~/ 2) * uvRowStride + (w ~/ 2) * uvPixelStride;

        final y = yBuffer[yIndex];
        final u = uBuffer[uvIndex];
        final v = vBuffer[uvIndex];

        // Convert YUV to RGB
        final r = (y + 1.402 * (v - 128)).round().clamp(0, 255);
        final g = (y - 0.344136 * (u - 128) - 0.714136 * (v - 128))
            .round()
            .clamp(0, 255);
        final b = (y + 1.772 * (u - 128)).round().clamp(0, 255);

        image.setPixelRgb(w, h, r, g, b);
      }
    }

    return image;
  }

  // Convert BGRA8888 format to RGB Image
  img.Image _convertBGRA8888ToImage(CameraImage cameraImage) {
    final bytes = cameraImage.planes[0].bytes;
    return img.Image.fromBytes(
      width: cameraImage.width,
      height: cameraImage.height,
      bytes: bytes.buffer,
      order: img.ChannelOrder.bgra,
    );
  }

  @override
  Widget build(BuildContext context) {
    if (!controller.value.isInitialized) {
      return Container();
    }
    return Scaffold(
      appBar: AppBar(title: const Text('Garbage Classifier')),
      body: Stack(
        children: <Widget>[
          CameraPreview(controller),
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              padding: const EdgeInsets.all(16),
              color: Colors.black87,
              child: Text(
                prediction,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    controller.dispose();
    tflite?.close();
    super.dispose();
  }
}
