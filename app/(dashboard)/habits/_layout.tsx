import { Stack } from "expo-router"

const HabitLayout = () => {
    return(
        <Stack screenOptions={{headerShown:false}}>
            <Stack.Screen name="index" />
            <Stack.Screen name="habit-detail" />
            <Stack.Screen name="add-habit" options={{ presentation: 'modal' }}/>
            <Stack.Screen name="[id]" />
        </Stack>
    )
}
export default HabitLayout