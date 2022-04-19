import React from "react";
import AppLoading from "expo-app-loading";
import { useFonts, DMSans_400Regular } from "@expo-google-fonts/dm-sans";
import { DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";
import { ThemeProvider } from "styled-components";

import theme from "./src/theme";

import { SignIn } from "@screens/SignIn";
import { Home } from "@screens/Home";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@hooks/auth";
import { LogBox } from "react-native";

LogBox.ignoreLogs([`Setting a timer for a long period`]);

export default function App() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSerifDisplay_400Regular,
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <ThemeProvider theme={theme}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <AuthProvider>
        <Home></Home>
      </AuthProvider>
    </ThemeProvider>
  );
}
