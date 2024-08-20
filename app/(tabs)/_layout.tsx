import { Tabs } from "expo-router";
import React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Practice",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              size={24}
              name={focused ? "baseball-diamond" : "baseball-diamond-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="players"
        options={{
          title: "Players",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              size={24}
              name={focused ? "account-group" : "account-group"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
