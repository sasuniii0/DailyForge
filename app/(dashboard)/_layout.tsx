import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { Tabs } from "expo-router"

const tabs = [
    {name: "home", icon: "home" , title: "Home"},
    {name: "habits", icon: "check-circle" , title: "Habits"},
    {name: "progress", icon: "trending-up" , title: "Progress"},
    {name: "settings", icon: "settings" , title: "Settings"},
] as const;

const DashboardLayout = () => {
    return(
        <Tabs 
            screenOptions={{
                headerShown : false,
                tabBarActiveTintColor:'orange',
                tabBarInactiveTintColor: 'black'}}>
            {tabs.map((tab) => (
                <Tabs.Screen
                    name={tab.name}
                        options={{
                            tabBarIcon: ({ color, size }) => (
                                <MaterialIcons name={tab.icon} color={color} size={size} />
                            ),
                        }}
                    />
                ))}
        </Tabs> 
    )
}

export default DashboardLayout