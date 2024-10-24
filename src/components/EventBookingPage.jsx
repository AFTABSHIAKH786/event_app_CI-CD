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
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [user, setUser] = useState(null);
  const [orderId, setOrderId] = useState(null);

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

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = async () => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    };
    loadRazorpayScript();
  }, []);

  const createRazorpayOrder = async (totalAmount) => {
    try {
      const response = await fetch("http://localhost:5000/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: totalAmount * 100, // Convert to paise
        }),
      });
      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      throw error;
    }
  };

  const handlePayment = async (bookingData) => {
    try {
      const totalAmount = event.ticketPrice * quantity;
      const orderID = await createRazorpayOrder(totalAmount);
      setOrderId(orderID);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: totalAmount * 100,
        currency: "INR",
        name: "Event Booking",
        description: `Booking for ${event.title}`,
        order_id: orderID,
        handler: async function (response) {
          try {
            console.log("Payment response:", response); // Log the response for debugging

            // Directly complete the booking process without verification
            await completeBooking(bookingData, response.razorpay_payment_id);
          } catch (error) {
            console.error("Error completing booking:", error);
            setError("Failed to complete booking");
          }
        },
        prefill: {
          name: name,
          email: email,
        },
        theme: {
          color: "#3f51b5",
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error("Payment initiation error:", error);
      setError("Failed to initiate payment");
    }
  };

  const completeBooking = async (bookingData, paymentId) => {
    try {
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

        const bookingRef = doc(collection(db, "bookedTickets"));
        transaction.set(bookingRef, {
          ...bookingData,
          paymentId: paymentId,
          paymentStatus: "completed",
          bookingStatus: "confirmed",
        });

        // Navigate to confirmation page after successful booking
        navigate(`/booking-confirmation/${bookingRef.id}`);
      });
    } catch (error) {
      console.error("Error completing booking:", error);
      setError("Failed to complete booking");
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to book tickets");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const bookingData = {
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
        bookingDate: new Date(),
      };

      await handlePayment(bookingData);
    } catch (err) {
      console.error("Error initiating booking:", err);
      setError(err.message || "Failed to initiate booking");
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
                    value="razorpay"
                    control={<Radio />}
                    label="Razorpay"
                  />
                </RadioGroup>
              </FormControl>
              <Typography variant="body1" gutterBottom>
                Total Price: Rs.{event.ticketPrice * quantity}
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
