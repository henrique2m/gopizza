import React from "react";

import { TouchableOpacityProps } from "react-native";
import {} from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";

import { useTheme } from "styled-components/native";

import { Container } from "./style";

export function ButtonBack({ ...rest }: TouchableOpacityProps) {
  const { COLORS } = useTheme();

  return (
    <Container>
      <MaterialIcons name="chevron-left" size={18} color={COLORS.TITLE} />
    </Container>
  );
}
