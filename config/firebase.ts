// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDuPh3ZF121qJaWci55yigqO9VCu_wxr44",
  authDomain: "jaybliz.firebaseapp.com",
  projectId: "jaybliz",
  storageBucket: "jaybliz.firebasestorage.app",
  messagingSenderId: "963980773975",
  appId: "1:963980773975:web:41dec1e5bd616db7a6f112"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app)

export{db}