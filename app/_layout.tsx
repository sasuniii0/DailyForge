import { LoaderContext, LoaderProvider } from "../context/LoaderContext"
import { Slot } from "expo-router"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Toast , { BaseToast, ErrorToast } from "react-native-toast-message"

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "#4CAF50" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 18, fontWeight: "bold" }} // increase font size
      text2Style={{ fontSize: 16 }} // optional: increase subtext font size
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: "#F44336" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 18, fontWeight: "bold" }}
      text2Style={{ fontSize: 16 }}
    />
  ),
};

// similar to app.tsxx in a standard React Native app
const RootLayout = () => {
    const insets = useSafeAreaInsets()

    return(
        <LoaderProvider>
            <View style= {{flex:1}}>
                <Slot/>
                <Toast config={toastConfig}/>
            </View>
        </LoaderProvider>
    )
}

export default RootLayout