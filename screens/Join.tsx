import { query, collection, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import React, { useContext, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { RNCamera } from 'react-native-camera';
import db from '../lib/firebase-config';
import UserContext from '../contexts/context';

const Join = () => {
  const [isReadQRCode, setIsReadQRCode] = useState(false)
  const [eventName, seteventName] = useState("event")
  const [isDecision, setIsDecision] = useState(false)
  const [isSelection, setIsSelection] = useState(false)
  const userContext = useContext(UserContext);
  if (!userContext) {
    // Handle the case where the context is null
    throw new Error("UserContext must be used within a UserContextProvider");
  }
  const { userId } = userContext;

  const onBarCodeRead = async(e: any) => {
    try {
        console.log('QR code content: ' + e.data);        
        const eventCollection = collection(db, "Event")
        const eventQuery = query(eventCollection, where('signature', '==', e.data))
        const eventQuerySnapshot = await getDocs(eventQuery)
        if(!eventQuerySnapshot.empty) {
            const event = eventQuerySnapshot.docs[0].data()
            const eventId = eventQuerySnapshot.docs[0].id
            console.log(`The event(${eventId}) is available to start event`)
            console.log(`userId: ${userId}`)
            setIsDecision(true)
            // isSelection
            const participantCollection = collection(db, 'Participant')
            const participantQuery = query(participantCollection, where('eventId', '==', eventId), where('userId', '==', userId), where('selection', '==', true))
            const participantQuerySnapshot = await getDocs(participantQuery)
            if(!participantQuerySnapshot.empty) {
                console.log(`This user(${userId}) is selected.`)
                const participant = participantQuerySnapshot.docs[0].data()
                const participantId = participantQuerySnapshot.docs[0].id
                if(participant.selection) {
                    const participantDocRef = doc(db, 'Participant', participantId)
                    const data = {
                        active: true
                    }
                    await updateDoc(participantDocRef, data)
                    setIsSelection(true)
                }
            }
        }
        setIsReadQRCode(true)
    } catch {
        console.log()
    }
  };

  if(!isReadQRCode) {
    return (
        <View style={{ flex: 1 }}>
        <RNCamera
            style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}
            onBarCodeRead={onBarCodeRead}
        >
            <Text style={{ backgroundColor: 'white' }}>QR Code Scanner</Text>
        </RNCamera>
        <Button title='Test' onPress={() => {
            const element = { data: 'b2686b823190a43540b13791e7546af27647cd738a2799b9bb72cb8829c73ad2' }
            onBarCodeRead(element)
        }}/>
        </View>
    );
  }
  if(!isDecision) {
    return (
        <>
            <Text>存在しないイベントです。</Text>
        </>
    )
  }
  if(!isSelection) {
    return (
        <>
            <Text>このイベントには参加が認められていません。</Text>
        </>
    )
  }
  return (
    <>
      <Text>Joined {eventName}</Text>
    </>
  )
};

export default Join;
