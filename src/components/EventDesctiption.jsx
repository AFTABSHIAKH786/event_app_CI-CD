import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Container,
  CircularProgress,
  styled,
} from '@mui/material';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { keyframes } from '@mui/system';

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const AnimatedButton = styled(Button)(({ theme }) => ({
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: theme.shadows[4],
    animation: `${pulse} 1s infinite`,
  },
}));

export default function EventDescriptionPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [similarEvents, setSimilarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchEventAndSimilar = async () => {
      try {
        const eventDoc = doc(db, 'events', eventId);
        const eventSnapshot = await getDoc(eventDoc);
        
        if (eventSnapshot.exists()) {
          const eventData = { id: eventSnapshot.id, ...eventSnapshot.data() };
          setEvent(eventData);

          // Fetch similar events
          const titleWords = eventData.title.toLowerCase().split(' ');
          const eventsRef = collection(db, 'events');
          const similarEventsQuery = query(
            eventsRef,
            where('titleLowerCase', 'array-contains-any', titleWords),
            limit(3)
          );
          const similarEventsSnapshot = await getDocs(similarEventsQuery);
          const similarEventsList = similarEventsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(e => e.id !== eventId); // Exclude the current event

          setSimilarEvents(similarEventsList);
        } else {
          setError('Event not found');
        }
      } catch (err) {
        console.error("Error fetching event: ", err);
        setError("Failed to load event details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndSimilar();
  }, [eventId]);

  //redirecting to booking page 
  const handleBookNow = ()  => {
    navigate(`/book-event/${eventId}`);
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: 'center', mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: 'center', mt: 4 }}>
        <Typography>No event data available</Typography>
      </Container>
    );
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {event.title}
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Card sx={{ mb: 4 }}>
              <Carousel showThumbs={false} infiniteLoop useKeyboardArrows autoPlay>
                {event.mediaUrls.map((img, index) => (
                  <CardMedia
                    key={index}
                    component="img"
                    height="400"
                    image={img}
                    alt={`Event image ${index + 1}`}
                  />
                ))}
              </Carousel>
            </Card>
            <Typography variant="body1" paragraph>
              {event.description}
            </Typography>
          </Grid>
          <Grid item xs={12} md={5}>
            <Card sx={{ position: 'sticky', top: '20px' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Event Details
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOnIcon sx={{ mr: 1 }} color="primary" />
                  <Typography variant="body1">{event.venue}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarTodayIcon sx={{ mr: 1 }} color="primary" />
                  <Typography variant="body1">{formatDate(event.date)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PeopleIcon sx={{ mr: 1 }} color="primary" />
                  <Typography variant="body1">Available Tickets: {event.capacity}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <AttachMoneyIcon sx={{ mr: 1 }} color="primary" />
                  <Typography variant="body1">Price: ${event.ticketPrice}</Typography>
                </Box>
                
                <AnimatedButton
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleBookNow}
                  fullWidth
                >
                  BOOK NOW
                </AnimatedButton>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Similar Events Section */}
        {similarEvents.length > 0 && (
          <Box sx={{ mt: 8 }}>
            <Typography variant="h4" gutterBottom>
              Similar Events
            </Typography>
            <Grid container spacing={4}>
              {similarEvents.map((similarEvent) => (
                <Grid item xs={12} sm={6} md={4} key={similarEvent.id}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="200"
                      image={similarEvent.mediaUrls[0]}
                      alt={similarEvent.title}
                    />
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {similarEvent.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {formatDate(similarEvent.date)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {similarEvent.venue}
                      </Typography>
                      <Button
                        component={Link}
                        to={`/event/${similarEvent.id}`}
                        variant="outlined"
                        color="primary"
                        fullWidth
                        sx={{ mt: 2 }}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Container>
  );
}