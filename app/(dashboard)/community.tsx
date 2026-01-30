import React, { useEffect, useState, useRef } from "react";
import { 
  View, Text, SafeAreaView, FlatList, TouchableOpacity, RefreshControl, 
  ActivityIndicator, Modal, TextInput, Image, KeyboardAvoidingView, Platform 
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { auth } from "@/service/firebase.config";
import { CommunityService } from "@/service/communityService";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const Community = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal & Camera States
  const [isModalVisible, setIsModalVisible] = useState(false);
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
      if (result) setPhoto(`data:image/jpg;base64,${result.base64}`);
    }
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
      loadFeed();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
    }
  };

  if (!permission?.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <MaterialIcons name="camera-alt" size={60} color="#F97316" />
        <Text className="text-center my-4 font-bold text-gray-700">The Forge needs Camera Access to show proof!</Text>
        <TouchableOpacity className="bg-orange-600 p-4 rounded-2xl" onPress={requestPermission}>
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
                <Image source={{ uri: item.imageUrl }} className="w-full h-48 rounded-2xl mb-4 bg-gray-200" />
              )}
              <View className="bg-gray-50 p-4 rounded-2xl border-l-4 border-orange-500">
                <Text className="text-gray-800 italic">"{item.content}"</Text>
              </View>
            </View>
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadFeed} />}
        />
      </View>

      {/* CREATE POST MODAL */}
      <Modal visible={isModalVisible} animationType="slide">
        <View className="flex-1 bg-black">
          {!photo ? (
            <CameraView ref={cameraRef} className="flex-1" facing="back">
              <SafeAreaView className="flex-1 justify-between p-6">
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  <MaterialIcons name="close" size={30} color="white" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleCapture}
                  className="w-20 h-20 bg-white/30 rounded-full self-center border-4 border-white items-center justify-center"
                >
                  <View className="w-14 h-14 bg-white rounded-full" />
                </TouchableOpacity>
              </SafeAreaView>
            </CameraView>
          ) : (
            <SafeAreaView className="flex-1 bg-white">
              <KeyboardAvoidingView behavior="padding" className="flex-1 p-6">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-2xl font-black">Verify Proof</Text>
                  <TouchableOpacity onPress={() => setPhoto(null)}>
                    <Text className="text-orange-600 font-bold">Retake</Text>
                  </TouchableOpacity>
                </View>
                
                <Image source={{ uri: photo }} className="w-full h-64 rounded-3xl mb-4" />
                
                <TextInput
                  placeholder="Describe your strike..."
                  multiline
                  value={content}
                  onChangeText={setContent}
                  className="bg-gray-100 rounded-2xl p-4 h-32 text-lg"
                />

                <TouchableOpacity 
                  onPress={handlePost}
                  disabled={isUploading}
                  className="bg-orange-600 p-5 rounded-2xl mt-auto items-center"
                >
                  {isUploading ? <ActivityIndicator color="white" /> : <Text className="text-white font-black text-lg">STRIKE THE ANVIL</Text>}
                </TouchableOpacity>
              </KeyboardAvoidingView>
            </SafeAreaView>
          )}
        </View>
      </Modal>

      <TouchableOpacity 
        className="absolute bottom-10 right-8 bg-orange-600 w-16 h-16 rounded-full items-center justify-center shadow-xl"
        onPress={() => setIsModalVisible(true)}
      >
        <MaterialIcons name="add-a-photo" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Community;