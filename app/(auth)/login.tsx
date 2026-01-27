import { useRouter } from "expo-router"
import { useLoader } from "../../hooks/use-loader"
import React from "react"
import Toast from "react-native-toast-message";
import { Keyboard, Pressable, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native"
import { loginUser } from "@/service/authService";

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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 justify-center items-center bg-gray-50 px-6">
                <View className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-md">
                
                    {/* Title */}
                    <Text className="text-2xl font-bold text-center text-gray-800 mb-6">
                        Login
                    </Text>

                    {/* Email */}
                    <TextInput
                        placeholder="email"
                        placeholderTextColor="#6B7280"
                        className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-gray-800"
                        onChangeText={(text) => setEmail(text)}
                    />

                    {/* Password */}
                    <TextInput
                        placeholder="password"
                        placeholderTextColor="#6B7280"
                        secureTextEntry
                        className="border border-gray-300 rounded-xl px-4 py-3 mb-6 text-gray-800"
                        onChangeText={(text) => setPassword(text)}
                    />

                    {/* Login Button */}
                    <Pressable className="bg-black py-3 rounded-xl active:opacity-80">
                        <Text className="text-white text-center font-semibold text-lg" onPress={() => handleSignin()}>
                        Login
                        </Text>
                    </Pressable>

                    {/* Register */}
                    <View className="flex-row justify-center mt-5">
                        <Text className="text-gray-600 mr-1">
                        Don’t have an account?
                        </Text>
                        <TouchableOpacity onPress={() => router.push("/register")}>
                        <Text className="text-black font-semibold">
                            Register
                        </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

export default Login