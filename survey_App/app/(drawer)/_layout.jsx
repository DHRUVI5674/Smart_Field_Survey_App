import { Drawer } from "expo-router/drawer";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: "#2563EB",
        drawerLabelStyle: {
          fontSize: 15,
        },
      }}
    >

      {/* =========================
          DASHBOARD + BOTTOM TABS
      ========================== */}

      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: "Dashboard",
          title: "Dashboard",
        }}
      />


      {/* =========================
          CAMERA
      ========================== */}

      <Drawer.Screen
        name="camera"
        options={{
          drawerLabel: "Camera",
          title: "Camera",
        }}
      />


      {/* =========================
          CONTACTS
      ========================== */}

      <Drawer.Screen
        name="contacts"
        options={{
          drawerLabel: "Contacts",
          title: "Contacts",
        }}
      />


      {/* =========================
          LOCATION
      ========================== */}

      <Drawer.Screen
        name="location"
        options={{
          drawerLabel: "Location",
          title: "Location",
        }}
      />


      {/* =========================
          CLIPBOARD
      ========================== */}

      <Drawer.Screen
        name="clipboard"
        options={{
          drawerLabel: "Clipboard",
          title: "Clipboard",
        }}
      />


      {/* =========================
          SETTINGS
      ========================== */}

      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: "Settings",
          title: "Settings",
        }}
      />

    </Drawer>
  );
}