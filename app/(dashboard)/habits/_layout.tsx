import { Stack } from "expo-router"

const HabitLayout = () => {
    return(
        <Stack screenOptions={{headerShown:false}}>
            <Stack.Screen name="index" />
            <Stack.Screen name="habit-detail" />
            <Stack.Screen name="add-habit" />
            <Stack.Screen name="edit-habit" />
        </Stack>
    )
}
export default HabitLayout