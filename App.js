// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./src/screens/HomeScreen";

import SettingsScreen from "./src/screens/SettingsScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import { Ionicons } from "@expo/vector-icons";
import { AuthProvider } from "./src/context/AuthContext";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
     <AuthProvider>
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === "Home") iconName = "swap-horizontal";
            else if (route.name === "History") iconName = "time-outline";
            else if (route.name === "Settings") iconName = "settings-outline";

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
    </AuthProvider>
  );
}
