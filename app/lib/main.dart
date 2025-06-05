// lib/main.dart
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:tflite_flutter/tflite_flutter.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final cameras = await availableCameras();
  runApp(MaterialApp(home: CameraScreen(cameras: cameras)));
}

class CameraScreen extends StatefulWidget {
  final List<CameraDescription> cameras;
  const CameraScreen({Key? key, required this.cameras}) : super(key: key);

  @override
  _CameraScreenState createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen> {
  late CameraController controller;
  late Interpreter tflite;
  String prediction = "Analyzing...";
  bool isDetecting = false;
  List<String> labels = [];

  @override
  void initState() {
    super.initState();
    controller = CameraController(widget.cameras[0], ResolutionPreset.medium);
    controller.initialize().then((_) {
      if (!mounted) return;
      setState(() {});
      loadModel();
      controller.startImageStream((image) => {
        if (!isDetecting) {
          isDetecting = true,
          classifyImage(image),
        }
      });
    });
  }

  loadModel() async {
    // Load your TFLite model
    tflite = await Interpreter.fromAsset('assets/garbage_classifier.tflite');
    
    // Load labels
    final labelData = await rootBundle.loadString('assets/class_names.json');
    labels = labelData.split('\n');
  }

  classifyImage(CameraImage image) async {
    // Process image and run inference
    // ...

    setState(() {
      prediction = "Detected: Class Name";
      isDetecting = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!controller.value.isInitialized) {
      return Container();
    }
    return Scaffold(
      appBar: AppBar(title: Text('Garbage Classifier')),
      body: Stack(
        children: <Widget>[
          CameraPreview(controller),
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              padding: EdgeInsets.all(10),
              color: Colors.black54,
              child: Text(
                prediction,
                style: TextStyle(color: Colors.white, fontSize: 20),
              ),
            ),
          )
        ],
      ),
    );
  }

  @override
  void dispose() {
    controller.dispose();
    tflite.close();
    super.dispose();
  }
}