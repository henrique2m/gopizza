import React from "react";

import { TextInputProps } from "react-native";

import { Container, TypesProps } from "./styles";

type Props = TextInputProps & {
  type?: TypesProps;
};

export function Input({ type = "primary", ...rest }: Props) {
  return <Container type={type} {...rest} />;
}
