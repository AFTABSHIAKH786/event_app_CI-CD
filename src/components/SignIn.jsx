import { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  CircularProgress,
  Divider
} from "@mui/material";

import GoogleSignIn from "./GoogleSignIn";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error signing in:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  //   const handleGoogleSignIn = async () => {
  //     setError(null);
  //     const provider = new GoogleAuthProvider();
  //     try {
  //       await signInWithPopup(auth, provider);
  //       navigate("/dashboard");
  //     } catch (error) {
  //       console.error("Error signing in with Google:", error.message);
  //       setError(error.message);
  //     }
  //   };

  const AnimatedLink = styled(RouterLink)(({ theme }) => ({
    position: "relative",
    textDecoration: "none",
    color: theme.palette.primary.main,
    fontSize: "1rem",
    transition: "color 0.3s, font-size 0.3s",
    "&::after": {
      content: '""',
      position: "absolute",
      width: "0",
      height: "2px",
      bottom: "-2px",
      left: "0",
      backgroundColor: theme.palette.primary.main,
      transition: "width 0.3s",
    },
    "&:hover": {
      color: theme.palette.primary.dark,
      "&::after": {
        width: "100%",
      },
    },
  }));

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          mt: 8,
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>
        <Box
          component="form"
          onSubmit={handleSignIn}
          sx={{ mt: 1, width: "100%" }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Sign In"}
          </Button>
          {error && (
            <Typography color="error" align="center">
              <p>Error while signing with Google</p>
            </Typography>
          )}
          <Divider sx={{ mt: 2, mb: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Sign-in option
            </Typography>
          </Divider>
          <GoogleSignIn />
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2">
              New User? <AnimatedLink to="/signup">Sign-up</AnimatedLink>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignIn;
