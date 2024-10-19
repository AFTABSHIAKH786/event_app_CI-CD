import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Card,
  CardContent,
  Grid,
  Box,
  Fade,
  Slide,
} from "@mui/material";
import { db, auth } from "../firebase";
import { doc, getDoc, collection, runTransaction } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

const EventBookingPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setName(currentUser.displayName || "");
        setEmail(currentUser.email || "");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventDoc = await getDoc(doc(db, "events", eventId));
        if (eventDoc.exists()) {
          setEvent({ id: eventDoc.id, ...eventDoc.data() });
        } else {
          setError("Event not found");
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to book tickets");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      let bookingDocRef; // Ensure this is defined
      await runTransaction(db, async (transaction) => {
        const eventRef = doc(db, "events", eventId);
        const eventDoc = await transaction.get(eventRef);

        if (!eventDoc.exists()) {
          throw new Error("Event does not exist!");
        }

        const eventData = eventDoc.data();
        if (eventData.capacity < quantity) {
          throw new Error("Not enough tickets available");
        }

        const newCapacity = eventData.capacity - quantity;

        transaction.update(eventRef, { capacity: newCapacity });

        const bookingRef = collection(db, "bookedTickets");
        bookingDocRef = doc(bookingRef); // Define bookingDocRef here
        transaction.set(bookingDocRef, { // Use bookingDocRef for the booking
          userId: user.uid,
          eventId: event.id,
          eventTitle: event.title,
          eventDate: event.date,
          eventVenue: event.venue,
          userName: name,
          userEmail: email,
          quantity: quantity,
          unitPrice: event.ticketPrice,
          totalPrice: event.ticketPrice * quantity,
          paymentMethod: paymentMethod,
          paymentStatus: "completed",
          bookingStatus: "confirmed",
          bookingDate: new Date(),
        });
      });

      // Redirect to the BookingConfirmationPage with the booking ID
      navigate(`/booking-confirmation/${bookingDocRef.id}`); // Use bookingDocRef.id here
    } catch (err) {
      console.error("Error booking ticket:", err);
      setError(err.message || "Failed to book ticket");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error || !event) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: "center", mt: 4 }}>
        <Typography color="error">
          {error || "No event data available"}
        </Typography>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="sm">
        <Typography variant="h6" gutterBottom>
          Please log in to book tickets
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/signin")}
        >
          Go to Login
        </Button>
      </Container>
    );
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  return (
    <Container maxWidth="md">
      <Fade in={true} timeout={1000}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          Book Tickets for {event.title}
        </Typography>
      </Fade>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Slide
            direction="right"
            in={true}
            mountOnEnter
            unmountOnExit
            timeout={1000}
          >
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Event Details
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <LocationOnIcon sx={{ mr: 1 }} color="primary" />
                  <Typography variant="body1">{event.venue}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <CalendarTodayIcon sx={{ mr: 1 }} color="primary" />
                  <Typography variant="body1">
                    {formatDate(event.date)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <AttachMoneyIcon sx={{ mr: 1 }} color="primary" />
                  <Typography variant="body1">
                    Price: ${event.ticketPrice} per ticket
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Slide>
          <Fade in={true} timeout={1500}>
            <form onSubmit={handleBooking}>
              <TextField
                fullWidth
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value)))
                }
                required
                margin="normal"
                InputProps={{ inputProps: { min: 1, max: event.capacity } }}
              />
              <FormControl component="fieldset" margin="normal">
                <FormLabel component="legend">Payment Method</FormLabel>
                <RadioGroup
                  aria-label="payment method"
                  name="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <FormControlLabel
                    value="credit_card"
                    control={<Radio />}
                    label="Credit Card"
                  />
                  <FormControlLabel
                    value="paypal"
                    control={<Radio />}
                    label="PayPal"
                  />
                </RadioGroup>
              </FormControl>
              <Typography variant="body1" gutterBottom>
                Total Price: ${event.ticketPrice * quantity}
              </Typography>
              {error && (
                <Typography color="error" gutterBottom>
                  {error}
                </Typography>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : "Confirm Booking"}
              </Button>
            </form>
          </Fade>
        </Grid>
        <Grid item xs={12} md={6}>
          <Slide
            direction="left"
            in={true}
            mountOnEnter
            unmountOnExit
            timeout={1000}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Event Description
                </Typography>
                <Typography variant="body1">{event.description}</Typography>
              </CardContent>
            </Card>
          </Slide>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EventBookingPage;
