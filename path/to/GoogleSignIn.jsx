import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

async function handleGoogleSignIn() {
  try {
    // Your existing sign-in code here
    const result = await signInWithPopup(auth, provider);
    // Handle successful sign-in
  } catch (error) {
    console.error('Detailed sign-in error:', {
      code: error.code,
      message: error.message,
      additionalUserInfo: error.additionalUserInfo,
      customData: error.customData
    });
    // Handle error (e.g., show user-friendly message)
  }
}
