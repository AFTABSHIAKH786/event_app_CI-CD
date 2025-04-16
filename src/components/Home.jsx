import { useState, useEffect } from "react";
import {
  AppBar,
  Typography,
  Container,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Box,
  Paper,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { Search, Event, People, LocationOn } from "@mui/icons-material";
import { styled } from "@mui/system";
import { auth, db } from "../firebase"; // Import Firestore instance
import { collection, getDocs } from 'firebase/firestore';
import { Link, useNavigate } from "react-router-dom";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#ff4081",
    },
    secondary: {
      main: "#3f51b5",
    },
    background: {
      default: "transparent",
      paper: "rgba(0, 0, 0, 0.5)",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 30,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.23)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(255, 255, 255, 0.5)",
            },
          },
        },
      },
    },
  },
});

const BackgroundContainer = styled("div")({
  backgroundImage: `
    linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)),
    url("../../image.jpg")
  `,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "fixed",
  minHeight: "100vh",
  color: "white",
});

const ContentContainer = styled(Container)( {
  position: "relative",
  zIndex: 1,
});

const howItWorks = [
  {
    icon: <Search />,
    title: "Find Events",
    description: "Search for events that match your interests",
  },
  {
    icon: <Event />,
    title: "Choose Date",
    description: "Select the perfect date and time for you",
  },
  {
    icon: <People />,
    title: "Book Tickets",
    description: "Secure your spot with easy online booking",
  },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser); // Update user state
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsCollection = collection(db, 'events');
        const eventsSnapshot = await getDocs(eventsCollection);
        const eventsList = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFeaturedEvents(eventsList.slice(0, 3)); // Limit to 3 events
        setLoading(false);
      } catch (err) {
        console.error("Error fetching events: ", err);
        setError("Failed to load events. Please try again later.");
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  const handleViewDetails = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <BackgroundContainer>
        <AppBar
          position="static"
          sx={{ backgroundColor: "transparent", boxShadow: "none" }}
        >
        </AppBar>
        <ContentContainer>
          {/* Hero Section */}
          <Box sx={{ my: 8, textAlign: "center" }}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              Discover Amazing  Events Aftab
            </Typography>
            <Typography variant="h5" component="p" gutterBottom>
              Find and book the perfect event for any occasion
            </Typography>
            <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
              <TextField
                variant="outlined"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ width: "50%", mr: 2, input: { color: "white" } }}
              />
              <Button variant="contained" size="large" color="primary">
                Search Events
              </Button>
            </Box>
          </Box>

          {/* Featured Events Section */}
          <Box sx={{ my: 8 }}>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              align="center"
              sx={{ fontWeight: "bold" }}
            >
              Featured Events
            </Typography>
            <Grid container spacing={4}>
              {featuredEvents.map((event) => (
                <Grid item key={event.id} xs={12} sm={6} md={4}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      backgroundColor: "background.paper",
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image={event.mediaUrls && event.mediaUrls.length > 0 ? event.mediaUrls[0] : "/api/placeholder/400/200"}
                      alt={event.title}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h5" component="div">
                        {event.title}
                      </Typography>
                      <Typography variant="body2">
                        {event.description}
                      </Typography>
                      <Box
                        sx={{ mt: 2, display: "flex", alignItems: "center" }}
                      >
                        <Event fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2">{formatDate(event.date)}</Typography>
                      </Box>
                      <Box
                        sx={{ mt: 1, display: "flex", alignItems: "center" }}
                      >
                        <LocationOn fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          {event.venue}
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button size="small" color="primary"
                        onClick={() => handleViewDetails(event.id)}
                        >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* How It Works Section */}
          <Box sx={{ my: 8 }}>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              align="center"
              sx={{ fontWeight: "bold" }}
            >
              How It Works
            </Typography>
            <Grid container spacing={4}>
              {howItWorks.map((step, index) => (
                <Grid item key={index} xs={12} sm={4}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      textAlign: "center",
                      height: "100%",
                      backgroundColor: "background.paper",
                    }}
                  >
                    <Box sx={{ mb: 2, color: "primary.main" }}>{step.icon}</Box>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {step.title}
                    </Typography>
                    <Typography variant="body2">{step.description}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Call-to-Action Section */}
          <Box className="pb-10" sx={{ textAlign: "center" }}>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              Ready to Experience Amazing Events?
            </Typography>
            <Typography variant="h6" component="p" gutterBottom>
              Join thousands of event-goers and start your journey today!
            </Typography>
            <Button
              variant="contained"
              size="large"
              color="primary"
              sx={{ mt: 2 }}
            >
              {user ? (
                <Link to="/dashboard">Explore</Link>
              ) : (
                <Link to="/signup">Sign-up</Link>
              )}{" "}
              {/* Conditional rendering */}
            </Button>
          </Box>
        </ContentContainer>
      </BackgroundContainer>
    </ThemeProvider>
  );
}
