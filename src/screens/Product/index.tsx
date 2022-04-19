import React, { useState } from "react";
import { Alert, Platform, ScrollView, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ButtonBack } from "@components/ButtonBack";
import { Photo } from "@components/Photo";
import { InputPrice } from "@components/InputPrice";
import { Input } from "@components/Input";
import { Button } from "@components/Button";
import { storage, db } from "@hooks/auth";
import { doc, collection, addDoc } from "firebase/firestore";
import {
  ref,
  getDownloadURL,
  uploadBytes,
  StorageReference,
} from "firebase/storage";

import {
  Container,
  Header,
  Title,
  DeleteLabel,
  Upload,
  PickImageButton,
  Form,
  Label,
  InputGroup,
  InputGroupHeader,
  MaxCharacters,
} from "./style";
import { async } from "@firebase/util";

export function Product() {
  const [image, setImage] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceSizeP, setPriceSizeP] = useState("");
  const [priceSizeM, setPriceSizeM] = useState("");
  const [priceSizeG, setPriceSizeG] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handlePickerImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status === "granted") {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [4, 4],
      });

      if (!result.cancelled) {
        setImage(result.uri);
      }
    }
  }

  async function handleAdd() {
    if (!validateAddPizza()) return;

    setIsLoading(true);

    const chunks = image.split(".");

    if (chunks.length === 0) {
      return Alert.alert(
        "Cadastro",
        "Ocorreu um problema com o carregamento da imagem."
      );
    }

    const fileName = new Date().getTime();

    const extensionImage = chunks[chunks.length - 1];

    const referenceImage = ref(
      storage,
      `/pizzas/${fileName}.${extensionImage}`
    );

    await uploadFile(referenceImage, image);

    await addPizza(referenceImage);

    setIsLoading(false);
  }

  async function uploadFile(referenceFile: StorageReference, pathFile: string) {
    const blob: Blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.onload = function () {
        resolve(xhr.response);
      };

      xhr.onerror = function (e) {
        reject(new TypeError("Network request failed"));
      };

      xhr.responseType = "blob";

      xhr.open("GET", pathFile, true);
      xhr.send(null);
    });

    try {
      await uploadBytes(referenceFile, blob);
    } catch (error) {
      Alert.alert("Upload", "Não foi possível cadastrar uma image da pizza.");
    }
  }

  async function addPizza(referenceFile: StorageReference) {
    const photo_url = await getDownloadURL(referenceFile);

    const referenceCollection = collection(db, "pizzas");

    const newPizza = {
      name,
      mame_insensitive: name.toLowerCase().trim(),
      description,
      prices_sizes: {
        p: priceSizeP,
        m: priceSizeM,
        g: priceSizeG,
      },
      photo_url,
      photo_path: referenceFile.fullPath,
    };

    try {
      await addDoc(referenceCollection, newPizza);
    } catch (error) {
      Alert.alert("Upload", "Não foi possível cadastrar os dados da pizza.");
    }
  }

  function validateAddPizza(): boolean {
    if (!name.trim()) {
      Alert.alert("Cadastro", "Informe o nome da pizza.");
      return false;
    }

    if (!description.trim()) {
      Alert.alert("Cadastro", "Faça uma breve descrição sobre a pizza.");

      return false;
    }

    if (!image) {
      Alert.alert("Cadastro", "Adicione um imagem da pizza.");
      return false;
    }

    if (!priceSizeP || !priceSizeM || !priceSizeG) {
      Alert.alert(
        "Cadastro",
        "Informe o preço de todos os tamanhos das pizzas."
      );

      return false;
    }

    return true;
  }

  return (
    <Container behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header>
          <ButtonBack />

          <Title>Cadastrar</Title>

          <TouchableOpacity>
            <DeleteLabel>Delete</DeleteLabel>
          </TouchableOpacity>
        </Header>

        <Upload>
          <Photo uri={image} />
          <PickImageButton
            title="Carregar"
            type="secondary"
            onPress={handlePickerImage}
          />
        </Upload>

        <Form>
          <InputGroup>
            <Label>Nome</Label>
            <Input onChangeText={setName} value={name} />
          </InputGroup>

          <InputGroup>
            <InputGroupHeader>
              <Label>Descrição</Label>
              <MaxCharacters> 0 de 60 caracteries</MaxCharacters>
            </InputGroupHeader>

            <Input
              multiline
              maxLength={60}
              style={{ height: 80 }}
              onChangeText={setDescription}
              value={description}
            />
          </InputGroup>

          <InputGroup>
            <InputPrice
              size="P"
              onChangeText={setPriceSizeP}
              value={priceSizeP}
            />
            <InputPrice
              size="M"
              onChangeText={setPriceSizeM}
              value={priceSizeM}
            />
            <InputPrice
              size="G"
              onChangeText={setPriceSizeG}
              value={priceSizeG}
            />
          </InputGroup>

          <Button
            title="Cadastrar pizza"
            isLoading={isLoading}
            onPress={handleAdd}
          />
        </Form>
      </ScrollView>
    </Container>
  );
}
