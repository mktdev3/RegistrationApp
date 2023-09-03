import React from 'react';
import { Text, View } from 'react-native';
import appleAuth, {
  AppleButton,
} from '@invertase/react-native-apple-authentication';
import db from '../lib/firebase-config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserData = {
    userId: string;
    email: string;
    familyName: string;
    givenName: string;
    nickName: string;
}

export type AppleSignInButtonProps = {
  onLogin: (isLogin: Boolean, userId: string) => void;
  setIsLoading: (loading: boolean) => void;
}

const cacheUserData = async (userData: UserData) => {
  try {
    await AsyncStorage.setItem('cachedUserData', JSON.stringify(userData));
  } catch (error) {
    console.error("Error caching user data:", error);
  }
};

const removeCachedUserData = async () => {
  try {
    await AsyncStorage.removeItem('cachedUserData');
  } catch (error) {
    console.error("Error removing cached user data:", error);
  }
};

// 一時保存したユーザーデータを取得
const getCachedUserData = async () => {
  try {
    const cachedData = await AsyncStorage.getItem('cachedUserData');
    if (cachedData !== null) {
      return JSON.parse(cachedData);
    }
  } catch (error) {
    console.error("Error retrieving cached user data:", error);
  }
  return null;
};

async function addUserIfNotExists(userId: string, userData: UserData): Promise<Boolean> {
  console.log("In addUserIfNotExists")
    // Reference to the document
    const userDocRef = doc(db, "User", userId);
  
    // Get the document
    const docSnap = await getDoc(userDocRef);
  
    // Check if the document exists
    if (!docSnap.exists()) {
      // If the document doesn't exist, create it with the provided data
      try {
        const cachedUserData: UserData = await getCachedUserData()
        if(cachedUserData != null && cachedUserData.userId == userId) {
          console.log("chachedUserData existed.")
          await setDoc(userDocRef, cachedUserData)
        } else {
          console.log("add new user.")
          await setDoc(userDocRef, userData);
        }
        console.log("User added!");
        removeCachedUserData()
        return true;
      } catch (error) {
        console.error("Error adding user:", error);
        cacheUserData(userData)
        return false;
      }
    } else {
      console.log("User already exists!");
      return true;
    }
}

function AppleSignInButton({ onLogin, setIsLoading }: AppleSignInButtonProps) {
  const onAppleButtonPress = async () => {
    setIsLoading(true)
    // Performs login request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    // Get credential state for user
    const credentialState = await appleAuth.getCredentialStateForUser(
      appleAuthRequestResponse.user
    );

    // Use credentialState response to ensure the user is authenticated
    if (credentialState === appleAuth.State.AUTHORIZED) {
      // User is authenticated
      const userId = appleAuthRequestResponse.user;
      const email = appleAuthRequestResponse.email;
      const fullName = appleAuthRequestResponse.fullName;
  
      console.log("User ID:", userId);
      console.log("Email:", email);
      console.log("Full Name:", fullName);

      const userData: UserData = {
        userId: userId && "",
        email: email ?? "",
        familyName: fullName?.familyName ?? "",
        givenName: fullName?.givenName ?? "",
        nickName: fullName?.nickname ?? ""
      };
      const result = await addUserIfNotExists(userId, userData)
      if(result) {
        setIsLoading(false)
        onLogin(true, userId)
      }
    }
  };

  return (
    <View>
      {appleAuth.isSupported ? (
        <AppleButton
          buttonStyle={AppleButton.Style.BLACK}
          buttonType={AppleButton.Type.SIGN_IN}
          style={{ width: 140, height: 30 }}
          onPress={() => onAppleButtonPress()}
        />
      ) : (
        <Text>Apple Auth is not supported on this device</Text>
      )}
    </View>
  );
}

export default AppleSignInButton;
