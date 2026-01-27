import { Keyboard, Pressable, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, ScrollView, SafeAreaView, StatusBar } from "react-native"
import { useRouter } from "expo-router"
import { useLoader } from "../../hooks/use-loader"
import React from "react"
import Toast from "react-native-toast-message";
import { loginUser } from "@/service/authService";
import { DailyForgeLogo } from "../../components/daily-forge-logo";
import Svg, { Path } from 'react-native-svg';

const Login = () => {
    const router = useRouter()
    const [email,setEmail] =  React.useState("")
    const [password,setPassword] =  React.useState("")
    const {hideLoader,showLoader,isLoading} = useLoader();

    const handleSignin = async () => {
        try{
            if(!email || !password || isLoading){
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Please fill all the fields'
                });
                return
            }
            showLoader()
            await loginUser(email,password)
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Logged in successfully'
            });
            router.push("/home")
        }catch(error:any){
            Toast.show({
                type: 'error',
                text1: 'Login Failed',
                text2: error?.message || "Something went wrong"
            });
        }finally{
            hideLoader()
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />
            <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View className="flex-1">
                        {/* Header */}
                        <View className="px-6 pt-12 pb-6 items-center">
            
                        <View>
                            <Text className="text-5xl font-black text-gray-900 ml-3 tracking-tight">
                                DailyForge
                            </Text>
                        </View>

                        {/* Short Tagline */}
                        <Text className="text-orange-600 text-xs font-bold tracking-[3px] uppercase mt-2 mb-8">
                            Forge Your Habits with Us
                        </Text>

                        {/* Compact Welcome */}
                        <Text className="text-xl font-bold text-gray-800 self-start">
                            Welcome Back
                        </Text>
                    </View>

                        {/* Form */}
                        <View className="px-6 flex-1">
                            {/* Email Address */}
                            <View className="mb-2">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                                </Text>
                                <TextInput
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="john@example.com"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    style={{ 
                                        height: 52, // Explicit height for better control
                                        textAlignVertical: 'center',
                                        includeFontPadding: false // Removes extra space at the top of text on Android
                                    }}
                                    className="bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 text-gray-900"
                                />
                            </View>

                            {/* Password */}
                            <View className="mb-2">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </Text>
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Enter your password"
                                    placeholderTextColor="#9CA3AF"
                                    secureTextEntry
                                    style={{ 
                                        height: 52, 
                                        textAlignVertical: 'center',
                                        includeFontPadding: false 
                                    }}
                                    className="bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 text-base text-gray-900"
                                />
                            </View>

                            {/* Forgot Password */}
                            <Pressable className="mb-8">
                                <Text className="text-orange-600 font-semibold text-sm text-right">
                                    Forgot Password?
                                </Text>
                            </Pressable>

                            {/* Sign In Button */}
                            <Pressable
                                onPress={handleSignin}
                                disabled={isLoading}
                                className="bg-orange-500 rounded-full py-3 items-center shadow-lg active:bg-orange-600 mb-4"
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

                            {/* Social Login Buttons */}
                            <View className="gap-3 mb-4">
                                {/* Google Sign In */}
                                <Pressable className="border-2 border-gray-300 rounded-full py-4 items-center flex-row justify-center active:bg-gray-50">
                                    <View className="mr-3">
                                        <Svg width="20" height="20" viewBox="0 0 24 24">
                                            <Path
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                fill="#4285F4"
                                            />
                                            <Path
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                fill="#34A853"
                                            />
                                            <Path
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                fill="#FBBC05"
                                            />
                                            <Path
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                fill="#EA4335"
                                            />
                                        </Svg>
                                    </View>
                                    <Text className="text-gray-700 font-semibold text-base">
                                        Continue with Google
                                    </Text>
                                </Pressable>

                                {/* Facebook Sign In */}
                                <Pressable className="bg-[#030303] rounded-full py-4 items-center flex-row justify-center active:bg-[#166FE5]">
                                    <View className="mr-3">
                                        <Svg width="20" height="20" viewBox="0 0 24 24">
                                            <Path
                                                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                                                fill="#FFFFFF"
                                            />
                                        </Svg>
                                    </View>
                                    <Text className="text-white font-semibold text-base">
                                        Continue with Facebook
                                    </Text>
                                </Pressable>
                            </View>

                            {/* Sign Up Link */}
                            <View className="flex-row justify-center mt-6 mb-8">
                                <Text className="text-gray-600 text-sm">
                                    Don't have an account?{' '}
                                </Text>
                                <TouchableOpacity onPress={() => router.push("/register")}>
                                    <Text className="text-orange-600 font-semibold text-sm">
                                        Sign Up
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>
        </SafeAreaView>
    );
}

export default Login