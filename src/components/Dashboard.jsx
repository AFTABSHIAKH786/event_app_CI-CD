import { useState, useEffect } from 'react';
import { Typography, Grid, Paper, Button, Card, CardContent } from "@mui/material";
import { CalendarToday } from "@mui/icons-material";
import { db } from '../firebase'; // Import the Firestore instance
import { collection, getDocs } from 'firebase/firestore';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsCollection = collection(db, 'events');
        const eventsSnapshot = await getDocs(eventsCollection);
        const eventsList = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEvents(eventsList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching events: ", err);
        setError("Failed to load events. Please try again later.");
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <div className="text-center p-4">Loading events...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-6">
        <Card className="mb-6">
          <CardContent>
            <Typography variant="h4" className="mb-2">
              Ongoing Events
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              Explore and book the event of your choice!
            </Typography>
          </CardContent>
        </Card>
        
        <Grid container spacing={4}>
          {events.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <Paper className="h-full">
                <img
                  src={event.mediaUrls && event.mediaUrls.length > 0 ? event.mediaUrls[0] : "/api/placeholder/400/200"} // Use the first URL in mediaUrls or a placeholder
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <Typography variant="h6" className="mb-2">
                    {event.title}
                  </Typography>
                  <Typography variant="body2" className="flex items-center mb-2 text-gray-600">
                    <CalendarToday className="mr-2 text-sm" />
                    {formatDate(event.date)} at {formatTime(event.date)}
                  </Typography>
                  
                  <div className="mt-2 flex justify-between">
                    <Button variant="outlined" color="primary">
                      View Details
                    </Button>
                    <Button variant="contained" color="primary">
                      Book Now
                    </Button>
                  </div>
                </div>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  );
};

export default Dashboard;
