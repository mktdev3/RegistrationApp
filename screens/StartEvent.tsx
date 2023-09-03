import { View } from "react-native"
import QRCode from "react-native-qrcode-svg"
import { RootStackParamList } from "../lib/RootStackParamList";
import { RouteProp, useRoute } from "@react-navigation/native";

export const StartEvent = () => {
    const route = useRoute<RouteProp<RootStackParamList, "StartEvent">>();
    const event = route.params.item;    
    const hashValue = event.signature;

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <QRCode
            value={hashValue}
            size={200}
            color="black"
            backgroundColor="white"
            />
        </View>
    )
}