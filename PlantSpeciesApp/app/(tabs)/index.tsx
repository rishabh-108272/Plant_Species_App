import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface ImageInfo {
  uri: string;
  prediction: string | null;
}

export default function PlantSpeciesIdentifier() {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(width)).current;
  const scanLineAnims = useRef<Animated.Value[]>([]).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 12,
        bounciness: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startScanAnimation = (index: number) => {
    if (!scanLineAnims[index]) {
      scanLineAnims[index] = new Animated.Value(0);
    }
    scanLineAnims[index].setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnims[index], {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnims[index], {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const pickImagesFromGallery = async () => {
    try {
      // Request permissions first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow access to your photo library to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 5,
        aspect: [4, 3],
        quality: 1,
      });

      console.log('Image picker result:', result); // Add this for debugging

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => ({
          uri: asset.uri,
          prediction: null,
        }));
        
        console.log('New images:', newImages); // Add this for debugging
        
        setImages(prevImages => {
          const updatedImages = [...prevImages, ...newImages];
          console.log('Updated images state:', updatedImages); // Add this for debugging
          return updatedImages;
        });
        
        animateIn();
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to load images. Please try again.');
    }
  };

  const captureImageWithCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required to capture an image.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      console.log('Camera result:', result); // Add this for debugging

      if (!result.canceled && result.assets) {
        const newImage = {
          uri: result.assets[0].uri,
          prediction: null,
        };
        
        setImages(prevImages => [...prevImages, newImage]);
        animateIn();
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  const handlePrediction = async () => {
    if (images.length === 0) {
      Alert.alert('No Images Selected', 'Please upload or capture images first.');
      return;
    }

    setLoading(true);
    
    try {
      const predictions = await Promise.all(
        images.map(async (image, index) => {
          if (image.prediction) return image; // Skip if already predicted

          startScanAnimation(index);
          const formData = new FormData();
          formData.append('image', {
            uri: image.uri,
            name: `plant${index}.jpg`,
            type: 'image/jpeg',
          } as any);

          try {
            const response = await fetch('http://<YOUR_BACKEND_URL>/predict', {
              method: 'POST',
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              body: formData,
            });

            const result = await response.json();
            return {
              ...image,
              prediction: result.prediction,
            };
          } catch (error) {
            console.error('Error predicting image:', error);
            return {
              ...image,
              prediction: 'Error analyzing image',
            };
          }
        })
      );

      // For demo purposes, add a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      setImages(predictions);
    } catch (error) {
      console.error('Error in prediction:', error);
      Alert.alert('Error', 'Something went wrong while predicting.');
    } finally {
      setLoading(false);
      scanLineAnims.forEach(anim => anim?.stopAnimation());
    }
  };

  const removeImage = (index: number) => {
    setImages(prevImages => {
      const newImages = [...prevImages];
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Add this debug render to check the images state
  console.log('Current images in state:', images);

  return (
    <LinearGradient
      colors={['#1B4332', '#2D6A4F', '#40916C']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <BlurView intensity={20} style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.headerContainer}>
            <MaterialCommunityIcons name="leaf" size={32} color="#B7E4C7" />
            <Text style={styles.title}>Plant Species Identifier</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.galleryButton]}
              onPress={pickImagesFromGallery}
            >
              <MaterialCommunityIcons name="image-multiple" size={24} color="white" />
              <Text style={styles.buttonText}>Upload Images</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cameraButton]}
              onPress={captureImageWithCamera}
            >
              <MaterialCommunityIcons name="camera" size={24} color="white" />
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>

          {images.length > 0 && (
            <Animated.View
              style={[
                styles.imagesContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              {images.map((image, index) => (
                <View key={`${image.uri}-${index}`} style={styles.imageItemContainer}>
                  <View style={styles.imageWrapper}>
                    <Image 
                      source={{ uri: image.uri }} 
                      style={styles.image}
                      resizeMode="cover"
                    />
                    {loading && !image.prediction && (
                      <Animated.View
                        style={[
                          styles.scanLine,
                          {
                            transform: [{
                              translateY: scanLineAnims[index]?.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 300],
                              }) || 0,
                            }],
                          },
                        ]}
                      />
                    )}
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeImage(index)}
                    >
                      <MaterialCommunityIcons name="close" size={20} color="white" />
                    </TouchableOpacity>
                  </View>

                  {image.prediction && (
                    <View style={styles.predictionContainer}>
                      <Text style={styles.predictionText}>
                        Identified as: {image.prediction}
                      </Text>
                    </View>
                  )}
                </View>
              ))}

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.predictButton,
                  loading && styles.predictButtonLoading,
                ]}
                onPress={handlePrediction}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="white" />
                    <Text style={[styles.buttonText, styles.loadingText]}>
                      Analyzing...
                    </Text>
                  </View>
                ) : (
                  <>
                    <MaterialCommunityIcons 
                      name="leaf-maple" 
                      size={24} 
                      color="white" 
                    />
                    <Text style={styles.buttonText}>
                      Identify Plants
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          )}
        </ScrollView>
      </BlurView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  scrollViewContent: {
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#B7E4C7',
    marginLeft: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  galleryButton: {
    backgroundColor: '#2D6A4F',
    flex: 1,
    marginRight: 10,
  },
  cameraButton: {
    backgroundColor: '#40916C',
    flex: 1,
    marginLeft: 10,
  },
  predictButton: {
    backgroundColor: '#52B788',
    width: '100%',
    marginTop: 20,
    height: 50,
  },
  predictButtonLoading: {
    backgroundColor: '#2D6A4F',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 10,
  },
  imagesContainer: {
    width: '100%',
  },
  imageItemContainer: {
    marginBottom: 20,
  },
  imageWrapper: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    padding: 5,
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: '#52B788',
    shadowColor: '#52B788',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  predictionContainer: {
    backgroundColor: 'rgba(45, 106, 79, 0.9)',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    width: '100%',
  },
  predictionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
});