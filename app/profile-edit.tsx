import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "@/service/firebase.config";
import { updateProfile, updateEmail, updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Toast from "react-native-toast-message";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const ProfileEdit = () => {
  const router = useRouter();
  const user = auth.currentUser;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile fields
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // User data from Firestore
  const [role, setRole] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      // Get data from Firebase Auth
      setDisplayName(user.displayName || "");
      setEmail(user.email || "");

      // Get additional data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setRole(userData.role || "user");
        
        // Format created date
        if (userData.createdAt) {
          const date = userData.createdAt.toDate?.() || new Date(userData.createdAt);
          setCreatedAt(date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }));
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      Toast.show({
        type: 'error',
        text1: 'Load Error',
        text2: 'Failed to load profile data'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    // Validation
    if (!displayName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Name',
        text2: 'Display name cannot be empty'
      });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Password Mismatch',
        text2: 'Passwords do not match'
      });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Weak Password',
        text2: 'Password must be at least 6 characters'
      });
      return;
    }

    setSaving(true);

    try {
      // Update display name in Firebase Auth
      if (displayName !== user.displayName) {
        await updateProfile(user, {
          displayName: displayName.trim()
        });
      }

      // Update email in Firebase Auth (requires recent authentication)
      if (email !== user.email) {
        try {
          await updateEmail(user, email);
          Toast.show({
            type: 'info',
            text1: 'Email Updated',
            text2: 'Please verify your new email address'
          });
        } catch (emailError: any) {
          if (emailError.code === 'auth/requires-recent-login') {
            Toast.show({
              type: 'error',
              text1: 'Re-authentication Required',
              text2: 'Please log out and log back in to change your email'
            });
          } else {
            throw emailError;
          }
        }
      }

      // Update password if provided
      if (newPassword) {
        try {
          await updatePassword(user, newPassword);
          setNewPassword("");
          setConfirmPassword("");
          Toast.show({
            type: 'success',
            text1: 'Password Updated',
            text2: 'Your password has been changed successfully'
          });
        } catch (passwordError: any) {
          if (passwordError.code === 'auth/requires-recent-login') {
            Toast.show({
              type: 'error',
              text1: 'Re-authentication Required',
              text2: 'Please log out and log back in to change your password'
            });
          } else {
            throw passwordError;
          }
        }
      }

      // Update Firestore user document
      await updateDoc(doc(db, "users", user.uid), {
        name: displayName.trim(),
        email: email,
        updatedAt: new Date()
      });

      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your forge profile has been saved'
      });

      // Refresh the current user
      await user.reload();
      
      // Go back after a short delay
      setTimeout(() => {
        router.back();
      }, 1000);

    } catch (error: any) {
      console.error("Error updating profile:", error);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error.message || 'Failed to update profile'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#F97316" />
          <Text className="text-gray-600 mt-4">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        className="flex-1"
      >
        {/* Header */}
        <View className="px-6 pt-10 pb-4 border-b border-gray-100 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <MaterialIcons name="arrow-back" size={28} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-black">Edit Profile</Text>
        </View>

        <ScrollView className="flex-1 px-6 pt-6">
          {/* Profile Avatar */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 bg-orange-500 rounded-full items-center justify-center border-4 border-orange-200 shadow-lg">
              <Text className="text-white text-4xl font-black">
                {displayName?.charAt(0).toUpperCase() || "S"}
              </Text>
            </View>
            <Text className="text-gray-500 text-sm mt-3">Member since {createdAt}</Text>
            <View className="bg-orange-100 px-3 py-1 rounded-full mt-2">
              <Text className="text-orange-700 text-xs font-bold uppercase">{role}</Text>
            </View>
          </View>

          {/* Display Name */}
          <Text className="text-gray-500 font-bold mb-2">DISPLAY NAME</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name"
            className="bg-gray-100 p-4 rounded-2xl text-lg mb-6"
          />

          {/* Email */}
          <Text className="text-gray-500 font-bold mb-2">EMAIL</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            className="bg-gray-100 p-4 rounded-2xl text-lg mb-6"
          />

          {/* Password Section */}
          <View className="bg-orange-50 p-4 rounded-2xl mb-6 border border-orange-200">
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="lock" size={20} color="#F97316" />
              <Text className="text-orange-700 font-bold ml-2">Change Password</Text>
            </View>
            <Text className="text-gray-600 text-xs mb-4">
              Leave blank to keep your current password
            </Text>

            <Text className="text-gray-500 font-bold mb-2 text-xs">NEW PASSWORD</Text>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              secureTextEntry
              className="bg-white p-4 rounded-xl text-base mb-4 border border-gray-200"
            />

            <Text className="text-gray-500 font-bold mb-2 text-xs">CONFIRM PASSWORD</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              secureTextEntry
              className="bg-white p-4 rounded-xl text-base border border-gray-200"
            />
          </View>

          {/* Info Box */}
          <View className="bg-blue-50 p-4 rounded-2xl mb-6 border border-blue-200">
            <View className="flex-row">
              <MaterialIcons name="info" size={20} color="#3B82F6" />
              <View className="flex-1 ml-3">
                <Text className="text-blue-700 font-bold text-sm">Security Note</Text>
                <Text className="text-blue-600 text-xs mt-1">
                  Changing your email or password may require you to log in again for security reasons.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View className="p-6 border-t border-gray-100">
          <TouchableOpacity 
            onPress={handleSaveProfile}
            disabled={saving}
            className={`p-5 rounded-2xl items-center shadow-lg ${
              saving ? 'bg-gray-400' : 'bg-orange-600'
            }`}
          >
            {saving ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#fff" />
                <Text className="text-white font-bold text-lg ml-2">Saving...</Text>
              </View>
            ) : (
              <Text className="text-white font-bold text-lg">Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ProfileEdit;