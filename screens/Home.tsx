import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useContext } from "react";
import { Button, StyleSheet, Text, View } from "react-native"
import { RootStackParamList } from "../lib/RootStackParamList";
import UserContext from "../contexts/context";

export const Home = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Home'>>()
  const route = useRoute<RouteProp<RootStackParamList, "Home">>()
  const userContext = useContext(UserContext);
  if (!userContext) {
    // Handle the case where the context is null
    throw new Error("UserContext must be used within a UserContextProvider");
  }
  const { userId } = userContext;

  return (
    <>
      <Text>User ID: {userId}</Text>
      <View style={styles.container}>      
        <Button title="登録" onPress={() => navigation.navigate('RegisterEvent')} />
        <View style={styles.buttonMargin} />
        <Button title="一覧" onPress={() => navigation.navigate('List')} />
        <View style={styles.buttonMargin} />
        <Button title="参加" onPress={() => navigation.navigate('Join')} />
      </View>
    </>
  )
}

// スタイルの定義                                                                                     
const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 16,
    },
    buttonMargin: {
        marginTop: 10,
    },
})

export default Home;
