import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { RootStackParamList } from '../lib/RootStackParamList';
import { QuerySnapshot, addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import db from '../lib/firebase-config';
import UserContext from '../contexts/context';
import { StackNavigationProp } from '@react-navigation/stack';
import { sha256 } from 'react-native-sha256';

export const Detail = () => {
    const route = useRoute<RouteProp<RootStackParamList, "Detail">>();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Detail'>>()
    const event = route.params.item;    
    const [isLoading, setIsLoading] = useState(false);
    const [isUserExisted, setIsUserExisted] = useState(false)    
    const [isDecision, setIsDecision] = useState<boolean>(event.decision)
    const userContext = useContext(UserContext);
    if (!userContext) {
      // Handle the case where the context is null
      throw new Error("UserContext must be used within a UserContextProvider");
    }
    const { userId } = userContext;
    console.log(`userId: ${userId}`)
    console.log(`organizerId: ${event.organizerId}`) 
    const [isOrganizer, setIsOrganizer] = useState<boolean>(userId === event.organizerId)

    const onParticipatePress = async() => {
        console.log("In onParticipatePress");

        try {
            // setIsLoading(true)
            const docRef = await addDoc(collection(db, 'Participant'), {
                userId: userId,
                eventId: event.id,
                selection: false,
                active: false
            });
            console.log('Document successfully written with ID: ', docRef.id);
        } catch (error) {
            console.error("Error writing document: ", error);
        } finally {
            setIsUserExisted(true)
            //setIsLoading(false)
        }
    };

    const onCancelPress = async() => {
        console.log("In onCancelPress");

        try {
            // setIsLoading(true)
            const participantCollection = collection(db, 'Participant');
            const participantQuery = query(participantCollection, where('userId', '==', userId), where('eventId', '==', event.id))
            const querySnapshot = await getDocs(participantQuery)
            // Iterate over the results and delete each document
            querySnapshot.forEach(async (document) => {
                const docRef = doc(db, "Participant", document.id);
                console.log(`Deleted Partipation's ID: ${document.id}`)
                await deleteDoc(docRef);
            });
        } catch (error) {
            console.error("Error writing document: ", error);
        } finally {
            setIsUserExisted(false)
            // setIsLoading(false)
        }
    }

    const onDecisionPress = async() => {
        console.log("In onDecisionPress")

        try {
            // setIsLoading(true)
            const participantCollection = collection(db, 'Participant')
            const participantQuery = query(participantCollection, where('eventId', '==', event.id))
            const querySnapshot = await getDocs(participantQuery)
            // Iterate over the results and delete each document
            var i = 0
            querySnapshot.forEach(async (document) => {
                if(i < event.maxParticipants)
                console.log(`count: ${i}`)
                const participantDocRef = doc(db, 'Participant', document.id)
                const data = {
                    selection: true
                }
                await updateDoc(participantDocRef, data)
                i += 1
            });

            console.log(sha256)
            sha256(userId + event.id).then(async(hash) => {
                console.log(`SHA-256 Hash: ${hash}`);
                const eventDocRef = doc(db, 'Event', event.id)
                // Data to be saved
                const data = {
                    decision: true,
                    signature: hash
                };
                await updateDoc(eventDocRef, data)
            })

            console.log("Document successfully written!");
        } catch (error) {
            console.error("Error writing document: ", error);
        } finally {
            setIsDecision(true)
            // setIsLoading(false)
        }   
    }

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </View>
        );
    }

    async function checkUserExists(userId: string, eventId: string): Promise<boolean> {
        const q = query(
            collection(db, "Participant"),
            where("userId", "==", userId),
            where("eventId", "==", eventId)
          );
          
          const querySnapshot = await getDocs(q);
          
          if (querySnapshot.size > 0) {
            console.log("Document exists!");
            return true
          } else {
            console.log("Document does not exist!");
            return false
          }
    }

    useEffect(() => {
        async function checkData() {
            const isExisted = await checkUserExists(userId, event.id)
            setIsUserExisted(isExisted)
        }
        checkData();
    }, []);  // 依存配列を適切に設定    

    return (
        <View style={styles.detailContainer}>
            {isOrganizer && 
                <View style={styles.organizerMark}>
                    <Text>主催者</Text>
                </View>
            }
            <View style={{flex: 1, justifyContent: 'center'}}>
                <Text>ID: {event.id}</Text>
                <Text>名称: {event.eventName}</Text>
                <Text>説明: {event.description}</Text>
                <Text>主催者: {event.organizer}</Text>
                <Text>参加最大人数: {event.maxParticipants}</Text>
            </View>
            { !isOrganizer && <Button title="参加" onPress={onParticipatePress} disabled={isUserExisted}/> }
            { !isOrganizer && <Button title="キャンセル" onPress={onCancelPress} disabled={!isUserExisted}/> }
            { isOrganizer && <Button title="確定" onPress={onDecisionPress} disabled={isDecision}></Button> }
            { isOrganizer &&  isDecision && 
                <Button 
                    title="開始"
                    onPress={() => navigation.navigate('StartEvent', {item: event})}/>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    detailContainer: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
    },
    organizerMark: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 5,
        backgroundColor: 'green',
        color: "red",  // <-- Here's the change
        borderRadius: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

