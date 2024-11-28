# Plant Species Identification and Description Extraction

This project aims to identify and extract descriptions of plant species using a combination of YOLO for detection and CNN models for classification. The application interface is implemented using Expo React Native for Android devices.

## Project Overview

The project is divided into the following main components:

1. **YOLO Model**: Detects flowers, leaves, and fruits in the input images.
2. **CNN Models**: Classifies the detected regions into specific plant species.
   - **FruitModel**: CNN model for fruit classification.
   - **FlowerModel**: CNN model for flower classification.
3. **Description Extractor**: Extracts detailed descriptions of the identified plant species.

## Workflow

1. **Detection**: The input image is processed by the main YOLO model to detect flowers, leaves, and fruits.
2. **Classification**: Based on the highest confidence score of the bounding boxes from YOLO, the detected region is fed into the respective CNN model (FruitModel or FlowerModel).
3. **Description Extraction**: The identified plant species are passed to the Description Extractor to derive detailed descriptions.

## Technology Stack

- **Deep Learning**: DL4j (Deeplearning4j) for implementing the CNN models.
- **Object Detection**: YOLO (You Only Look Once) model.
- **Mobile Development**: Expo React Native for the Android application.

## Repository Links

- [CNN Models (ND4j)](https://github.com/Se00n00/CNN-Using-Java-ND4J)
- [CNN Models (DL4j)](https://github.com/rishabh-108272/Plant_Species_Identification/tree/main)
- [Description Extractor](https://github.com/Sauravsingh44/Plant_Texonomy_And_Description_Manager)
- [YOLO Model](https://github.com/Se00n00/model)

## Setup and Installation

### Prerequisites

- Java Development Kit (JDK)
- Node.js and npm (for React Native)
- Expo CLI


### Running the Deep Learning Models

Follow the instructions in the respective repositories to set up and run the CNN models and the Description Extractor.

## Usage

1. **Launch the React Native app** on your Android device.
2. **Capture or upload an image** of the plant.
3. **The app detects the plant parts** (flowers, leaves, fruits) using the YOLO model.
4. **The detected parts are classified** using the CNN models.
5. **Descriptions are extracted** for the identified plant species.

## Dataset References

- **YOLO model dataset**: [Nature3 Leaf, Flower, and Fruit Detection](https://www.kaggle.com/datasets/se00n00/nature3-leaf-flower-and-fruit-detection)
- **Flower Dataset**: Self-created.
- **Fruit Dataset**: [Fruits](https://www.kaggle.com/datasets/moltean/fruits)
