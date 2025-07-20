import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; 

const firebaseConfig = {
  apiKey: "AIzaSyCu7JW1BsGC7qHGc65HjVgfdbX4bPQx9xM",
  authDomain: "ecommerceapputn.firebaseapp.com",
  projectId: "ecommerceapputn",
  storageBucket: "ecommerceapputn.firebasestorage.app",
  messagingSenderId: "765599617679",
  appId: "1:765599617679:web:fa1e2a21b19f55390d96fa"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 
export const storage = getStorage(app);