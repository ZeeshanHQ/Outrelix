import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDWWmUEb-SrTN_BUP_s50mOB2RdL1tShIk",
  authDomain: "email-outreach-bot-452dd.firebaseapp.com",
  projectId: "email-outreach-bot-452dd",
  storageBucket: "email-outreach-bot-452dd.firebasestorage.app",
  messagingSenderId: "38268266565",
  appId: "1:38268266565:web:8062314ae11728e70c5b2c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Add scopes for Google Auth
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Debug: Log Firebase initialization
console.log('Firebase initialized with config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  appId: firebaseConfig.appId
});

// Debug: Check if auth is properly initialized
if (auth) {
  console.log('Firebase Auth initialized successfully');
} else {
  console.error('Firebase Auth failed to initialize');
}

export { auth, googleProvider };
export default app; 