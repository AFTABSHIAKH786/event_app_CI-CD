import { useState, useEffect } from 'react';
import { Typography, Grid, Paper, Button, Card, CardContent, TextField, Autocomplete } from "@mui/material";
import { CalendarToday, Search } from "@mui/icons-material";
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

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
        setFilteredEvents(eventsList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching events: ", err);
        setError("Failed to load events. Please try again later.");
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const filtered = events.filter(event =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);

    const allTerms = events.flatMap(event => [event.title, event.venue]);
    const uniqueTerms = [...new Set(allTerms)];
    const matchingSuggestions = uniqueTerms.filter(term =>
      term.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSuggestions(matchingSuggestions);
  }, [searchTerm, events]);

  const handleSearchChange = (event, value) => {
    setSearchTerm(value);
  };

  const handleViewDetails = (eventId) => {
    navigate(`/event/${eventId}`);
  };


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
            <Typography variant="body1" className="text-gray-600 mb-4">
              Explore and book the event of your choice!
            </Typography>
            <Autocomplete
              className='mt-3'
              freeSolo
              options={suggestions}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search events"
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <Search />
                  }}
                />
              )}
              onInputChange={handleSearchChange}
            />
          </CardContent>
        </Card>
        
        <Grid container spacing={4}>
          {filteredEvents.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <Paper className="h-full">
                <img
                  src={event.mediaUrls && event.mediaUrls.length > 0 ? event.mediaUrls[0] : "/api/placeholder/400/200"}
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
                  <Typography>
                    {event.venue}
                  </Typography>
                  <div className="mt-2 flex justify-between">
                    <Button 
                      variant="outlined" 
                      color="primary"
                      onClick={() => handleViewDetails(event.id)}
                      fullWidth
                    >
                      View Details
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