import React, { useState, useEffect } from "react";
import { 
  Keyboard, 
  Pressable, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  TouchableWithoutFeedback, 
  View, 
  ScrollView, 
  SafeAreaView, 
  StatusBar 
} from "react-native";
import { useRouter } from "expo-router";
import { useLoader } from "../../hooks/use-loader";
import Toast from "react-native-toast-message";
import { loginUser } from "@/service/authService";
import Svg, { Path } from 'react-native-svg';
import { useGoogleSignIn, signInWithGoogle } from "@/service/googleAuthService";

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { hideLoader, showLoader, isLoading } = useLoader();
    const { response, promptAsync } = useGoogleSignIn();

    // Handle Google Sign-In response
    useEffect(() => {
        if (response?.type === 'success') {
            handleGoogleResponse(response);
        }
    }, [response]);

    const handleGoogleResponse = async (response: any) => {
        try {
            showLoader();
            const { authentication } = response;
            
            if (!authentication?.idToken) {
                throw new Error('No ID token received');
            }

            // Sign in to Firebase with Google credentials
            const user = await signInWithGoogle(authentication.idToken);
            
            console.log('✅ Google sign-in successful:', user.email);
            
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: `Welcome ${user.displayName || 'User'}!`
            });
            
            // Navigate to home screen
            router.replace("/home");
            
        } catch (error: any) {
            console.error('❌ Google sign-in error:', error);
            Toast.show({
                type: 'error',
                text1: 'Authentication error',
                text2: error?.message || 'Something went wrong. Try again.'
            });
        } finally {
            hideLoader();
        }
    };

    const handleGooglePress = async () => {
        if (isLoading) return;
        
        try {
            showLoader();
            // This will open the Google Sign-In popup
            await promptAsync();
        } catch (error: any) {
            console.error('Google login error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to open Google Sign-In'
            });
            hideLoader();
        }
    };

    const handleSignin = async () => {
        if (!email || !password || isLoading) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please fill all the fields'
            });
            return;
        }

        try {
            showLoader();
            await loginUser(email, password);
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Logged in successfully'
            });
            router.push("/home");
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Login Failed',
                text2: error?.message || "Something went wrong"
            });
        } finally {
            hideLoader();
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />
            <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View className="flex-1">
                        {/* Header */}
                        <View className="px-6 pt-12 pb-6 items-center">
                            <Text className="text-5xl font-black text-gray-900 tracking-tight">
                                DailyForge
                            </Text>
                            <Text className="text-orange-600 text-xs font-bold tracking-[3px] uppercase mt-2 mb-8">
                                Forge Your Habits with Us
                            </Text>
                            <Text className="text-xl font-bold text-gray-800 self-start">
                                Welcome Back
                            </Text>
                        </View>

                        {/* Form */}
                        <View className="px-6 flex-1">
                            <View className="mb-4">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">Email Address</Text>
                                <TextInput
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="john@example.com"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    className="bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 h-[52px] text-gray-900"
                                />
                            </View>

                            <View className="mb-2">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">Password</Text>
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Enter your password"
                                    placeholderTextColor="#9CA3AF"
                                    secureTextEntry
                                    className="bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 h-[52px] text-base text-gray-900"
                                />
                            </View>

                            <Pressable className="mb-8">
                                <Text className="text-orange-600 font-semibold text-sm text-right">Forgot Password?</Text>
                            </Pressable>

                            <Pressable
                                onPress={handleSignin}
                                disabled={isLoading}
                                className={`rounded-full py-4 items-center shadow-lg mb-4 ${isLoading ? 'bg-gray-400' : 'bg-orange-500 active:bg-orange-600'}`}
                            >
                                <Text className="text-white font-bold text-lg">
                                    {isLoading ? "Signing In..." : "Sign In"}
                                </Text>
                            </Pressable>

                            {/* Divider */}
                            <View className="flex-row items-center my-6">
                                <View className="flex-1 h-px bg-gray-300" />
                                <Text className="text-gray-500 mx-4 text-sm">OR CONTINUE WITH</Text>
                                <View className="flex-1 h-px bg-gray-300" />
                            </View>

                            {/* Social Buttons */}
                            <View className="gap-3 mb-4">
                                <Pressable 
                                    onPress={handleGooglePress}
                                    disabled={isLoading}
                                    className="border-2 border-gray-300 rounded-full py-4 items-center flex-row justify-center active:bg-gray-50"
                                >
                                    <View className="mr-3">
                                        <Svg width="20" height="20" viewBox="0 0 24 24">
                                            <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </Svg>
                                    </View>
                                    <Text className="text-gray-700 font-semibold text-base">
                                        Continue with Google
                                    </Text>
                                </Pressable>
                            </View>

                            {/* Sign Up Link */}
                            <View className="flex-row justify-center mt-6 mb-8">
                                <Text className="text-gray-600 text-sm">Don't have an account? </Text>
                                <TouchableOpacity onPress={() => router.push("/register")}>
                                    <Text className="text-orange-600 font-semibold text-sm">Sign Up</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>
        </SafeAreaView>
    );
}