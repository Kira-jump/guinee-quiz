import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBgTlUCy-SHT_WazR0osyogJn-EJQMKwsY",
  authDomain: "guinee-quiz.firebaseapp.com",
  projectId: "guinee-quiz",
  storageBucket: "guinee-quiz.firebasestorage.app",
  messagingSenderId: "444107754687",
  appId: "1:444107754687:web:82b0f62512e67d287cca0a"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
