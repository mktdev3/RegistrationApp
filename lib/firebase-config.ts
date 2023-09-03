import { getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyDqE4OP19bF-y_2qpLh6Q56F7V9be2J840",
    authDomain: "registrationapp-e46b3.firebaseapp.com",
    projectId: "registrationapp-e46b3",
    storageBucket: "registrationapp-e46b3.appspot.com",
    messagingSenderId: "418019764065",
    appId: "1:418019764065:web:51e878613b232bee438720",
    measurementId: "G-K4B368V8VV"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export default db;