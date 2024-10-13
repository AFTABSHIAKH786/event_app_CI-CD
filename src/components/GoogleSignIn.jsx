import { getAuth, signInWithPopup, signInWithRedirect, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { Button, Typography } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

const GoogleSignIn = () => {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    
    const popupWindow = window.open('about:blank', '_blank', 'width=600,height=600');
    
    if (popupWindow) {
      try {
        await signInWithPopup(auth, provider);
        navigate('/dashboard');
        if (!popupWindow.closed) {
          popupWindow.close();
        }
      } catch (error) {
        console.warn("Popup sign-in failed, trying redirect:", error);
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectError) {
          console.error("Redirect sign-in also failed:", redirectError);
        }
        if (!popupWindow.closed) {
          popupWindow.close();
        }
      }
    } else {
      // Fallback to redirect method if popup was blocked
      try {
        await signInWithRedirect(auth, provider);
      } catch (redirectError) {
        console.error("Redirect sign-in also failed:", redirectError);
      }
    }
  };

  return (
    <Button
      variant="outlined"
      startIcon={<GoogleIcon />}
      onClick={handleGoogleSignIn}
      fullWidth
      sx={{
        justifyContent: 'flex-start',
        backgroundColor: '#ffffff',
        color: '#757575',
        border: '1px solid #dadce0',
        borderRadius: '4px',
        padding: '10px 24px',
        textTransform: 'none',
        '&:hover': {
          backgroundColor: '#f1f3f4',
          border: '1px solid #dadce0',
        },
      }}
    >
      <Typography
        variant="body1"
        sx={{
          flexGrow: 1,
          textAlign: 'center',
          fontWeight: 500,
        }}
      >
        Sign in with Google
      </Typography>
    </Button>
  );
};

export default GoogleSignIn;
