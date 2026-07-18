import { Drawer } from "expo-router/drawer";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAppTheme } from "../../context/ThemeContext";

export default function DrawerLayout() {
  const { theme } = useAppTheme();

  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: theme.accent,
        drawerInactiveTintColor: theme.muted,
        drawerStyle: {
          backgroundColor: theme.surface,
          width: 280,
        },
        drawerLabelStyle: {
          fontSize: 15,
          fontWeight: '600',
        },
      }}
    >
      {/* Dashboard & Tabs */}
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: "Dashboard",
          title: "Dashboard",
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" size={size} color={color} />
          ),
        }}
      />

      {/* Camera */}
      <Drawer.Screen
        name="camera"
        options={{
          drawerLabel: "Camera",
          title: "Camera",
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="photo-camera" size={size} color={color} />
          ),
        }}
      />

      {/* Contacts */}
      <Drawer.Screen
        name="contacts"
        options={{
          drawerLabel: "Contacts",
          title: "Contacts",
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="contacts" size={size} color={color} />
          ),
        }}
      />

      {/* Location */}
      <Drawer.Screen
        name="location"
        options={{
          drawerLabel: "Location",
          title: "Location",
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="my-location" size={size} color={color} />
          ),
        }}
      />

      {/* Clipboard */}
      <Drawer.Screen
        name="clipboard"
        options={{
          drawerLabel: "Clipboard",
          title: "Clipboard",
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="assignment" size={size} color={color} />
          ),
        }}
      />

      {/* Settings */}
      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: "Settings",
          title: "Settings",
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}