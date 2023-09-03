import { ActivityIndicator, Button, Platform, StyleSheet, Text, View } from "react-native"
import AppleSignInButton from "./AppleSignInButton";
import { useState } from "react";
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID',
});

export type LoginProps = {
  onLogin: (isLogin: Boolean, userId: string) => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text>Loading...</Text>
        </View>
    );
  }

  if (Platform.OS === 'ios') {
    return (
      <View style={styles.container}>
        <AppleSignInButton onLogin={onLogin} setIsLoading={setIsLoading}/>
      </View>
    )
  } else {
    return (
      <View>
        <Button title="Sign in with Google" />
      </View>
    )    
  }
}

// スタイルの定義
const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
})