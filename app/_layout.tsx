import { Slot } from "expo-router";
import { View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import { LoaderProvider } from "../context/LoaderContext";

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "#4CAF50", backgroundColor: '#1A1A1A' }} // Blacksmith dark theme hint
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 18, fontWeight: "bold", color: '#FFFFFF' }}
      text2Style={{ fontSize: 16, color: '#CCCCCC' }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: "#F44336", backgroundColor: '#1A1A1A' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 18, fontWeight: "bold", color: '#FFFFFF' }}
      text2Style={{ fontSize: 16, color: '#CCCCCC' }}
    />
  ),
};

// Internal component to safely use hooks like useSafeAreaInsets
const AppContent = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, paddingTop: insets.top , paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }}>
      <Slot />
      <Toast config={toastConfig} />
    </View>
  );
};

const RootLayout = () => {
  return (
    <SafeAreaProvider>
      <LoaderProvider>
        <AppContent />
      </LoaderProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;