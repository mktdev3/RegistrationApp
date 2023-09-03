import { StackNavigationProp } from "@react-navigation/stack";
import { useContext, useState } from "react";
import { ActivityIndicator, Button, StyleSheet, Text, View } from "react-native"
import { TextInput } from "react-native-gesture-handler"
import db from "../lib/firebase-config";
import { GeoPoint, addDoc, collection } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../lib/RootStackParamList";
import UserContext from "../contexts/context";

export const RegisterEvent = () => {
    const [eventName, setEventName] = useState('');
    const [description, setDescription] = useState('');
    const [organizer, setOrganizer] = useState('');
    const [latitude, setLatitude] = useState<number>(0);
    const [longitude, setLongitude] = useState<number>(0);
    const [maxParticipants, setMaxParticipants] = useState<number>(10);
    const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'RegisterEvent'>>()
    const [isLoading, setIsLoading] = useState(false);
    const userContext = useContext(UserContext);
    if (!userContext) {
      // Handle the case where the context is null
      throw new Error("UserContext must be used within a UserContextProvider");
    }
    const { userId } = userContext;

    const handleRegisterEvent = async() => {
        try {
            setIsLoading(true)
            const docRef = await addDoc(collection(db, 'Event'), {
                eventName: eventName,
                description: description,
                organizer: organizer,
                organizerId: userId,
                location: new GeoPoint(latitude, longitude),
                maxParticipants: maxParticipants,
                decision: false,
                signature: ""
            });
            console.log('Document successfully written with ID: ', docRef.id);
            setIsLoading(false)
        } catch (error) {
            console.error("Error writing document: ", error);
        }
        navigation.goBack()
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
    <View style={styles.container}>
        <TextInput placeholder="イベント名" value={eventName} onChangeText={setEventName} style={styles.input} />
        <TextInput placeholder="内容" value={description} onChangeText={setDescription} style={styles.input} />
        <TextInput placeholder="開催者名" value={organizer} onChangeText={setOrganizer} style={styles.input} />
        <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Latitude"
            value={String(latitude)}
            onChangeText={(text) => setLatitude(Number(text))}
        />
        <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Longitude"
            value={String(longitude)}
            onChangeText={(text) => setLongitude(Number(text))}
        />
        <TextInput 
            style={styles.input} 
            keyboardType="numeric"
            placeholder="最大参加人数" 
            value={String(maxParticipants)} 
            onChangeText={(text) => setMaxParticipants(Number(text))}  
        />
        <Button title="登録" onPress={handleRegisterEvent} 
        />
    </View>
    )
}

// スタイルの定義
const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 16,
    },
    input: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      marginBottom: 8,
      paddingHorizontal: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})