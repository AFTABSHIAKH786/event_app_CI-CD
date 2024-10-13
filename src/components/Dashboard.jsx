import  { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { CalendarToday, LocationOn, Person } from "@mui/icons-material";
import { auth } from '../firebase';
// Mock events data
const events = [
  {
    id: 1,
    title: "Summer Music Festival",
    date: "2023-07-15",
    location: "Central Park",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 2,
    title: "Tech Conference 2023",
    date: "2023-08-22",
    location: "Convention Center",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 3,
    title: "Food & Wine Expo",
    date: "2023-09-10",
    location: "City Hall",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 4,
    title: "Marathon for Charity",
    date: "2023-10-05",
    location: "Downtown",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 5,
    title: "Art Gallery Opening",
    date: "2023-11-12",
    location: "Modern Art Museum",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 6,
    title: "Winter Wonderland Fair",
    date: "2023-12-20",
    location: "City Square",
    image: "/placeholder.svg?height=200&width=400",
  },
];

const Dashboard = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setAvatarError(false); // Reset error state when user changes
      // console.log("User photo URL", currentUser?.photoURL)
    });

    return () => unsubscribe();
  }, []);

  const handleAvatarError = () => {
    console.error("Failed to load user avatar");
    setAvatarError(true);
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          {user && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <Avatar 
                src={avatarError ? null : user.photoURL} 
                alt={user.displayName}
                onError={handleAvatarError}
              >
                {avatarError ? (user.displayName ? user.displayName[0].toUpperCase() : <Person />) : null}
              </Avatar>
              <div style={{ marginLeft: "10px" }}>
                <Typography variant="subtitle1">{user.displayName}</Typography>
                <Typography variant="caption">{user.email}</Typography>
              </div>
            </div>
          )}
        </Toolbar>
      </AppBar>
      <div style={{ padding: "20px" }}>
        <Card style={{ marginBottom: "20px" }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Upcoming Events
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Explore and manage your events
            </Typography>
          </CardContent>
          <CardContent>
            <Grid container spacing={3}>
              {events.map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event.id}>
                  <Paper elevation={3} style={{ height: "100%" }}>
                    <img
                      src={event.image}
                      alt={event.title}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                      }}
                    />
                    <div style={{ padding: "16px" }}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {event.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <CalendarToday
                          style={{ marginRight: "8px", fontSize: "1rem" }}
                        />{" "}
                        {event.date}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        <LocationOn
                          style={{ marginRight: "8px", fontSize: "1rem" }}
                        />{" "}
                        {event.location}
                      </Typography>
                    </div>
                    <CardActions>
                      <Button size="small" color="primary" fullWidth>
                        View Details
                      </Button>
                    </CardActions>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
          <CardActions>
            <Button color="primary" fullWidth>
              Create New Event
            </Button>
          </CardActions>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
