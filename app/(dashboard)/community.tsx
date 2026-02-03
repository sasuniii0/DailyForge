import React, { useEffect, useState, useRef } from "react";
import { 
  View, Text, SafeAreaView, FlatList, TouchableOpacity, RefreshControl, 
  ActivityIndicator, Modal, TextInput, Image, KeyboardAvoidingView, Platform,
  Alert
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from 'expo-image-picker';
import { auth } from "@/service/firebase.config";
import { CommunityService } from "@/service/communityService";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const Community = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal & Camera States
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [content, setContent] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const cameraRef = useRef<CameraView>(null);
  const userId = auth.currentUser?.uid;

  useEffect(() => { loadFeed(); }, []);

  const loadFeed = async () => {
    const data = await CommunityService.getFeed();
    setPosts(data);
    setLoading(false);
    setRefreshing(false);
  };

  const handleCapture = async () => {
    if (cameraRef.current) {
      const result = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.2, // LOW QUALITY to stay under 1MB Firestore limit
      });
      if (result) {
        setPhoto(`data:image/jpg;base64,${result.base64}`);
        setShowCamera(false);
      }
    }
  };

  const handlePickImage = async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant access to your photo library to select images.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.2, // Low quality to stay under 1MB
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setPhoto(`data:image/jpg;base64,${result.assets[0].base64}`);
        setShowCamera(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleOpenModal = () => {
    setIsModalVisible(true);
    setShowCamera(false);
    setPhoto(null);
    setContent("");
  };

  const handlePost = async () => {
    if (!content.trim() || !userId) return;
    setIsUploading(true);
    try {
      await CommunityService.createPost(
        userId, 
        auth.currentUser?.displayName || "Smith", 
        content, 
        photo
      );
      setIsModalVisible(false);
      setPhoto(null);
      setContent("");
      setShowCamera(false);
      loadFeed();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!permission?.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <MaterialIcons name="camera-alt" size={60} color="#F97316" />
        <Text className="text-center my-4 font-bold text-gray-700">
          The Forge needs Camera Access to show proof!
        </Text>
        <TouchableOpacity 
          className="bg-orange-600 p-4 rounded-2xl" 
          onPress={requestPermission}
        >
          <Text className="text-white font-black">GRANT ACCESS</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 pt-10 flex-1">
        <Text className="text-3xl font-black text-gray-900 mb-2">Public Anvil</Text>
        
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-4">
              <Text className="font-bold text-gray-900 mb-2">{item.userName}</Text>
              {item.imageUrl && (
                <Image 
                  source={{ uri: item.imageUrl }} 
                  className="w-full h-48 rounded-2xl mb-4 bg-gray-200" 
                />
              )}
              <View className="bg-gray-50 p-4 rounded-2xl border-l-4 border-orange-500">
                <Text className="text-gray-800 italic">"{item.content}"</Text>
              </View>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadFeed} />
          }
        />
      </View>

      {/* CREATE POST MODAL */}
      <Modal visible={isModalVisible} animationType="slide">
        <View className="flex-1 bg-black">
          {showCamera ? (
            // CAMERA VIEW
            <CameraView ref={cameraRef} className="flex-1" facing="back">
              <SafeAreaView className="flex-1 justify-between p-6">
                <TouchableOpacity onPress={() => setShowCamera(false)}>
                  <MaterialIcons name="arrow-back" size={30} color="white" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleCapture}
                  className="w-20 h-20 bg-white/30 rounded-full self-center border-4 border-white items-center justify-center"
                >
                  <View className="w-14 h-14 bg-white rounded-full" />
                </TouchableOpacity>
              </SafeAreaView>
            </CameraView>
          ) : photo ? (
            // PREVIEW & POST VIEW
            <SafeAreaView className="flex-1 bg-white">
              <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                className="flex-1 p-6"
              >
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-2xl font-black">Verify Proof</Text>
                  <TouchableOpacity onPress={() => setPhoto(null)}>
                    <Text className="text-orange-600 font-bold">Retake</Text>
                  </TouchableOpacity>
                </View>
                
                <Image 
                  source={{ uri: photo }} 
                  className="w-full h-64 rounded-3xl mb-4" 
                />
                
                <TextInput
                  placeholder="Describe your strike..."
                  multiline
                  value={content}
                  onChangeText={setContent}
                  className="bg-gray-100 rounded-2xl p-4 h-32 text-lg"
                />

                <TouchableOpacity 
                  onPress={handlePost}
                  disabled={isUploading || !content.trim()}
                  className={`p-5 rounded-2xl mt-auto items-center ${
                    isUploading || !content.trim() ? 'bg-gray-400' : 'bg-orange-600'
                  }`}
                >
                  {isUploading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-black text-lg">
                      STRIKE THE ANVIL
                    </Text>
                  )}
                </TouchableOpacity>
              </KeyboardAvoidingView>
            </SafeAreaView>
          ) : (
            // SELECTION VIEW (Camera or Gallery)
            <SafeAreaView className="flex-1 bg-white">
              <View className="flex-1 p-6">
                <View className="flex-row justify-between items-center mb-8">
                  <Text className="text-2xl font-black">Add Proof</Text>
                  <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                    <MaterialIcons name="close" size={28} color="#1F2937" />
                  </TouchableOpacity>
                </View>

                <Text className="text-gray-600 mb-6 text-center">
                  Choose how you want to add your proof
                </Text>

                {/* Camera Option */}
                <TouchableOpacity 
                  onPress={() => setShowCamera(true)}
                  className="bg-orange-600 p-6 rounded-3xl mb-4 flex-row items-center shadow-lg"
                >
                  <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center mr-4">
                    <MaterialIcons name="camera-alt" size={32} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-black text-lg mb-1">
                      Take Photo
                    </Text>
                    <Text className="text-white/80 text-sm">
                      Capture a new photo with camera
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={28} color="white" />
                </TouchableOpacity>

                {/* Gallery Option */}
                <TouchableOpacity 
                  onPress={handlePickImage}
                  className="bg-gray-800 p-6 rounded-3xl flex-row items-center shadow-lg"
                >
                  <View className="w-16 h-16 bg-white/10 rounded-2xl items-center justify-center mr-4">
                    <MaterialIcons name="photo-library" size={32} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-black text-lg mb-1">
                      Choose from Gallery
                    </Text>
                    <Text className="text-white/80 text-sm">
                      Select an existing photo
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={28} color="white" />
                </TouchableOpacity>

                <View className="mt-8 bg-orange-50 p-4 rounded-2xl border border-orange-200">
                  <View className="flex-row items-start">
                    <MaterialIcons name="info-outline" size={20} color="#F97316" />
                    <Text className="text-orange-800 text-sm ml-2 flex-1">
                      Images are compressed to ensure fast loading and stay within storage limits.
                    </Text>
                  </View>
                </View>
              </View>
            </SafeAreaView>
          )}
        </View>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-10 right-8 bg-orange-600 w-16 h-16 rounded-full items-center justify-center shadow-xl"
        onPress={handleOpenModal}
      >
        <MaterialIcons name="add-a-photo" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Community;