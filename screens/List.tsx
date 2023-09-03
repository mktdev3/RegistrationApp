import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { ActivityIndicator, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import db from "../lib/firebase-config";
import { useContext, useEffect, useState } from "react";
import { FlatList } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../lib/RootStackParamList";
import DropDownPicker from 'react-native-dropdown-picker';
import UserContext from "../contexts/context";

const DropdownStatus = {
    All: 'all',
    Applied: 'applied',
    Selected: 'selected',
    Organizer: 'organizer'
} as const;

export const List = () => {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Detail'>>();
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(DropdownStatus.All);
    const [items, setItems] = useState([
        {label: 'すべて', value: DropdownStatus.All},
        {label: '申込済み', value: DropdownStatus.Applied},
        {label: '当選', value: DropdownStatus.Selected},
        {label: '主催者', value: DropdownStatus.Organizer},
    ]);
    const userContext = useContext(UserContext);
    if (!userContext) {
      // Handle the case where the context is null
      throw new Error("UserContext must be used within a UserContextProvider");
    }
    const { userId } = userContext;
    
    useEffect(() => {
        fetchAllDocuments();
        setIsLoading(false)
    }, []);

    async function fetchAllDocuments() {
        console.log("In fetchAllDocuments")
        const dataList: any[] = [];
        const eventCollection = collection(db, "Event");
        if((value as string) === DropdownStatus.All ||  DropdownStatus.Applied || DropdownStatus.Selected) {
            console.log("status: all")
            const querySnapshot = await getDocs(eventCollection);
            const documents = querySnapshot.docs;
            for (const document of documents) {
                if ((value as string) === DropdownStatus.Applied) {
                    console.log(`eventId: ${document.id}`);
                    console.log(`userId: ${userId}`);
                    const participantCollection = collection(db, "Participant");
                    const paricipantQuerry = query(
                        participantCollection,
                        where("eventId", "==", document.id),
                        where("userId", "==", userId)
                    );
                    const innerQuerySnapshot = await getDocs(paricipantQuerry);
                    console.log(`size: ${innerQuerySnapshot.size}`);
                    if (innerQuerySnapshot.size > 0) {
                        console.log("hoge");
                        dataList.push({
                            id: document.id,
                            ...document.data()
                        });
                    }
                } else if ((value as string) === DropdownStatus.Selected) {
                    console.log(`eventId: ${document.id}`);
                    console.log(`userId: ${userId}`);
                    const participantCollection = collection(db, "Participant");
                    const paricipantQuerry = query(
                        participantCollection,
                        where("eventId", "==", document.id),
                        where("userId", "==", userId),
                        where('selection', '==', true)
                    );
                    const innerQuerySnapshot = await getDocs(paricipantQuerry);
                    console.log(`size: ${innerQuerySnapshot.size}`);
                    if (innerQuerySnapshot.size > 0) {
                        console.log("hoge");
                        dataList.push({
                            id: document.id,
                            ...document.data()
                        });
                    }
                } else {
                    dataList.push({
                        id: document.id,
                        ...document.data()
                    });
                }
            }            
        } else if((value as string) === DropdownStatus.Organizer) {
            console.log("status: organizer")
            console.log(`userId: ${userId}`)
            const eventQuery = query(eventCollection, where("organizerId", "==", userId));
            const querySnapshot = await getDocs(eventQuery);        
            querySnapshot.forEach((doc) => {
                dataList.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
        }
        
        setData(dataList)
        setIsRefreshing(false); // Set refreshing to false once data fetching is done
    }

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
            <DropDownPicker
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
            onChangeValue={() => {
                console.log(`selected status: ${value}`)
                fetchAllDocuments()
            }}
            />
            <FlatList
                data={data}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={styles.listItem}
                        onPress={() => navigation.navigate('Detail', { item: item })}
                    >
                        <Text>{item.eventName}</Text>
                        {/* Add other fields if needed */}
                    </TouchableOpacity>
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={fetchAllDocuments}
                    />
                }
            />
        </View>
    )
}

// スタイルの定義
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
});