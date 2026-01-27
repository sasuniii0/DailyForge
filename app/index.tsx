// import "../global.css"; // Make sure NativeWind is installed and configured
// // app/index.tsx
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   Pressable,
//   ScrollView,
//   StatusBar,
//   Animated,
//   Dimensions,
//   SafeAreaView,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';

// // Types
// type Screen = 'loading' | 'signin' | 'home';
// type Habit = {
//   id: string;
//   name: string;
//   icon: string;
//   streak: number;
//   completed: boolean;
//   category: string;
// };

// const { width, height } = Dimensions.get('window');

// export default function Index() {
//   const [currentScreen, setCurrentScreen] = useState<Screen>('loading');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [habits, setHabits] = useState<Habit[]>([
//     { id: '1', name: 'Morning Run', icon: '🏃', streak: 7, completed: true, category: 'Fitness' },
//     { id: '2', name: 'Read 30min', icon: '📚', streak: 12, completed: true, category: 'Learning' },
//     { id: '3', name: 'Meditate', icon: '🧘', streak: 5, completed: false, category: 'Wellness' },
//     { id: '4', name: 'Drink Water', icon: '💧', streak: 3, completed: false, category: 'Health' },
//   ]);

//   // Loading animation
//   const fadeAnim = new Animated.Value(0);
//   const scaleAnim = new Animated.Value(0.3);

//   useEffect(() => {
//     if (currentScreen === 'loading') {
//       Animated.parallel([
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 800,
//           useNativeDriver: true,
//         }),
//         Animated.spring(scaleAnim, {
//           toValue: 1,
//           tension: 50,
//           friction: 7,
//           useNativeDriver: true,
//         }),
//       ]).start();

//       // Auto-navigate to signin after 3 seconds
//       const timer = setTimeout(() => {
//         setCurrentScreen('signin');
//       }, 3000);

//       return () => clearTimeout(timer);
//     }
//   }, [currentScreen]);

//   const toggleHabit = (id: string) => {
//     setHabits(habits.map(h => 
//       h.id === id ? { ...h, completed: !h.completed, streak: !h.completed ? h.streak + 1 : h.streak } : h
//     ));
//   };

//   // ==================== LOADING SCREEN ====================
//   const LoadingScreen = () => (
//     <LinearGradient
//       colors={['#FF6B35', '#E85D04', '#DC2F02']}
//       className="flex-1 justify-center items-center"
//     >
//       <StatusBar barStyle="light-content" />
//       <Animated.View
//         style={{
//           opacity: fadeAnim,
//           transform: [{ scale: scaleAnim }],
//         }}
//         className="items-center"
//       >
//         {/* Fire Icon Animation */}
//         <View className="mb-8">
//           <Text style={{ fontSize: 120 }}>🔥</Text>
//         </View>

//         {/* App Name */}
//         <Text className="text-white text-5xl font-bold mb-3">DailyForge</Text>
//         <Text className="text-orange-100 text-lg tracking-wider">
//           FORGE YOUR FUTURE
//         </Text>

//         {/* Loading Indicator */}
//         <View className="mt-12">
//           <View className="flex-row gap-2">
//             {[0, 1, 2].map((i) => (
//               <View
//                 key={i}
//                 className="w-2 h-2 bg-white rounded-full"
//                 style={{
//                   opacity: 0.3 + (i * 0.3),
//                 }}
//               />
//             ))}
//           </View>
//         </View>
//       </Animated.View>
//     </LinearGradient>
//   );

//   // ==================== SIGN IN SCREEN ====================
//   const SignInScreen = () => (
//     <SafeAreaView className="flex-1 bg-white">
//       <StatusBar barStyle="dark-content" />
//       <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
//         {/* Header */}
//         <View className="px-6 pt-12 pb-8">
//           <View className="items-center mb-8">
//             <Text style={{ fontSize: 80 }}>🔥</Text>
//           </View>
//           <Text className="text-4xl font-bold text-gray-900 mb-3">
//             Welcome Back
//           </Text>
//           <Text className="text-gray-600 text-base">
//             Sign in to continue forging your habits
//           </Text>
//         </View>

//         {/* Form */}
//         <View className="px-6 flex-1">
//           {/* Email Input */}
//           <View className="mb-4">
//             <Text className="text-sm font-semibold text-gray-700 mb-2">
//               Email Address
//             </Text>
//             <TextInput
//               value={email}
//               onChangeText={setEmail}
//               placeholder="john@example.com"
//               placeholderTextColor="#9CA3AF"
//               keyboardType="email-address"
//               autoCapitalize="none"
//               className="bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-4 text-base text-gray-900"
//             />
//           </View>

//           {/* Password Input */}
//           <View className="mb-6">
//             <Text className="text-sm font-semibold text-gray-700 mb-2">
//               Password
//             </Text>
//             <TextInput
//               value={password}
//               onChangeText={setPassword}
//               placeholder="Enter your password"
//               placeholderTextColor="#9CA3AF"
//               secureTextEntry
//               className="bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-4 text-base text-gray-900"
//             />
//           </View>

//           {/* Forgot Password */}
//           <Pressable className="mb-8">
//             <Text className="text-orange-600 font-semibold text-sm text-right">
//               Forgot Password?
//             </Text>
//           </Pressable>

//           {/* Sign In Button */}
//           <Pressable
//             onPress={() => setCurrentScreen('home')}
//             className="bg-orange-500 rounded-full py-4 items-center shadow-lg active:bg-orange-600 mb-4"
//           >
//             <Text className="text-white font-bold text-lg">Sign In</Text>
//           </Pressable>

//           {/* Divider */}
//           <View className="flex-row items-center my-6">
//             <View className="flex-1 h-px bg-gray-300" />
//             <Text className="text-gray-500 mx-4 text-sm">OR</Text>
//             <View className="flex-1 h-px bg-gray-300" />
//           </View>

//           {/* Google Sign In */}
//           <Pressable className="border-2 border-gray-300 rounded-full py-4 items-center flex-row justify-center mb-4 active:bg-gray-50">
//             <Text className="text-xl mr-2">🔍</Text>
//             <Text className="text-gray-700 font-semibold text-base">
//               Continue with Google
//             </Text>
//           </Pressable>

//           {/* Sign Up Link */}
//           <View className="flex-row justify-center mt-6 mb-8">
//             <Text className="text-gray-600 text-sm">
//               Don't have an account?{' '}
//             </Text>
//             <Pressable>
//               <Text className="text-orange-600 font-semibold text-sm">
//                 Sign Up
//               </Text>
//             </Pressable>
//           </View>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );

//   // ==================== HOME SCREEN ====================
//   const HomeScreen = () => {
//     const completedToday = habits.filter(h => h.completed).length;
//     const totalHabits = habits.length;
//     const todayProgress = Math.round((completedToday / totalHabits) * 100);

//     return (
//       <SafeAreaView className="flex-1 bg-orange-50">
//         <StatusBar barStyle="dark-content" />
//         <ScrollView className="flex-1">
//           {/* Header */}
//           <View className="bg-white px-6 py-4 shadow-sm">
//             <View className="flex-row items-center justify-between">
//               <View>
//                 <Text className="text-3xl font-bold text-gray-900">
//                   DailyForge
//                 </Text>
//                 <Text className="text-sm text-gray-600">
//                   Monday, Jan 27, 2026
//                 </Text>
//               </View>
//               <Pressable className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
//                 <Text className="text-xl">⚙️</Text>
//               </Pressable>
//             </View>
//           </View>

//           {/* Main Content */}
//           <View className="px-6 py-6">
//             {/* Progress Card */}
//             <LinearGradient
//               colors={['#FF6B35', '#E85D04']}
//               className="rounded-3xl p-6 mb-6 shadow-lg"
//             >
//               <View className="flex-row items-center justify-between mb-4">
//                 <View>
//                   <Text className="text-orange-100 text-sm mb-1">
//                     Today's Progress
//                   </Text>
//                   <Text className="text-white text-4xl font-bold">
//                     {completedToday}/{totalHabits}
//                   </Text>
//                 </View>
//                 <View className="bg-white/20 rounded-full p-4">
//                   <Text style={{ fontSize: 32 }}>🔥</Text>
//                 </View>
//               </View>

//               {/* Progress Bar */}
//               <View className="bg-white/20 rounded-full h-3 overflow-hidden">
//                 <View
//                   className="bg-yellow-300 h-full rounded-full"
//                   style={{ width: `${todayProgress}%` }}
//                 />
//               </View>
//               <Text className="text-orange-100 text-sm mt-2">
//                 {todayProgress}% Complete
//               </Text>
//             </LinearGradient>

//             {/* Today's Habits */}
//             <View className="mb-6">
//               <View className="flex-row items-center justify-between mb-4">
//                 <Text className="text-xl font-bold text-gray-900">
//                   Today's Habits
//                 </Text>
//                 <Pressable>
//                   <Text className="text-orange-600 font-semibold text-sm">
//                     + Add New
//                   </Text>
//                 </Pressable>
//               </View>

//               {/* Habit Cards */}
//               <View className="gap-3">
//                 {habits.map((habit) => (
//                   <Pressable
//                     key={habit.id}
//                     onPress={() => toggleHabit(habit.id)}
//                     className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex-row items-center justify-between active:bg-gray-50"
//                   >
//                     <View className="flex-row items-center gap-4">
//                       {/* Checkbox */}
//                       <View
//                         className={`w-12 h-12 rounded-full items-center justify-center ${
//                           habit.completed ? 'bg-orange-500' : 'bg-gray-100'
//                         }`}
//                       >
//                         {habit.completed ? (
//                           <Text className="text-white text-2xl">✓</Text>
//                         ) : (
//                           <View className="w-6 h-6 border-2 border-gray-300 rounded-full" />
//                         )}
//                       </View>

//                       {/* Habit Info */}
//                       <View>
//                         <View className="flex-row items-center gap-2">
//                           <Text style={{ fontSize: 24 }}>{habit.icon}</Text>
//                           <Text className="font-semibold text-gray-900 text-base">
//                             {habit.name}
//                           </Text>
//                         </View>
//                         <View className="flex-row items-center gap-2 mt-1">
//                           <Text className="text-base">🔥</Text>
//                           <Text className="text-sm text-gray-600">
//                             {habit.streak} day streak
//                           </Text>
//                         </View>
//                       </View>
//                     </View>

//                     {/* Chevron */}
//                     <Text className="text-gray-400 text-lg">›</Text>
//                   </Pressable>
//                 ))}
//               </View>
//             </View>

//             {/* Quick Stats */}
//             <View className="flex-row gap-3">
//               <View className="flex-1 bg-white rounded-xl p-4 items-center shadow-sm border border-gray-100">
//                 <Text style={{ fontSize: 24 }} className="mb-2">
//                   🔥
//                 </Text>
//                 <Text className="text-2xl font-bold text-gray-900">12</Text>
//                 <Text className="text-xs text-gray-600">Best Streak</Text>
//               </View>

//               <View className="flex-1 bg-white rounded-xl p-4 items-center shadow-sm border border-gray-100">
//                 <Text style={{ fontSize: 24 }} className="mb-2">
//                   🏆
//                 </Text>
//                 <Text className="text-2xl font-bold text-gray-900">45</Text>
//                 <Text className="text-xs text-gray-600">Total Days</Text>
//               </View>

//               <View className="flex-1 bg-white rounded-xl p-4 items-center shadow-sm border border-gray-100">
//                 <Text style={{ fontSize: 24 }} className="mb-2">
//                   📈
//                 </Text>
//                 <Text className="text-2xl font-bold text-gray-900">87%</Text>
//                 <Text className="text-xs text-gray-600">Success</Text>
//               </View>
//             </View>
//           </View>
//         </ScrollView>

//         {/* Bottom Navigation */}
//         <View className="bg-white border-t border-gray-200 px-6 py-3">
//           <View className="flex-row items-center justify-around">
//             <Pressable className="items-center">
//               <Text style={{ fontSize: 24 }}>🔥</Text>
//               <Text className="text-orange-500 text-xs font-medium mt-1">
//                 Home
//               </Text>
//             </Pressable>

//             <Pressable className="items-center">
//               <Text style={{ fontSize: 24 }}>📈</Text>
//               <Text className="text-gray-400 text-xs font-medium mt-1">
//                 Progress
//               </Text>
//             </Pressable>

//             <Pressable className="bg-orange-500 w-14 h-14 rounded-full items-center justify-center -mt-8 shadow-lg">
//               <Text style={{ fontSize: 28 }}>➕</Text>
//             </Pressable>

//             <Pressable className="items-center">
//               <Text style={{ fontSize: 24 }}>👥</Text>
//               <Text className="text-gray-400 text-xs font-medium mt-1">
//                 Community
//               </Text>
//             </Pressable>

//             <Pressable className="items-center">
//               <Text style={{ fontSize: 24 }}>⚙️</Text>
//               <Text className="text-gray-400 text-xs font-medium mt-1">
//                 Settings
//               </Text>
//             </Pressable>
//           </View>
//         </View>
//       </SafeAreaView>
//     );
//   };

//   // ==================== SCREEN ROUTER ====================
//   const renderScreen = () => {
//     switch (currentScreen) {
//       case 'loading':
//         return <LoadingScreen />;
//       case 'signin':
//         return <SignInScreen />;
//       case 'home':
//         return <HomeScreen />;
//       default:
//         return <LoadingScreen />;
//     }
//   };

//   return <View className="flex-1">{renderScreen()}</View>;
// }

import { useAuth } from "../hooks/use-auth";
import "../global.css";
import { Redirect } from "expo-router";
import Toast from "react-native-toast-message";
import { ActivityIndicator, View } from "react-native";

const Index = () => {
  const {user, loading} = useAuth();

  if(loading){
    return(
      <View style={{flex:1, justifyContent:"center", alignItems:"center"}}>
        <ActivityIndicator size="large" color="#0f0f52"/>
      </View>
    )
  }
  if(user){
    return <Redirect href="/home"/>;
  } else {
    Toast.show({
      type: 'info',
      text1: "Please log in to continue",
    });
    return <Redirect href="/login"/>;
  }
}

export default Index;