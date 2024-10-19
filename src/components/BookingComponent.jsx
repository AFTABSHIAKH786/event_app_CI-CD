import { useState, useEffect } from 'react';
import { TextField, Button, CircularProgress, Typography, Box } from '@mui/material';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types'; // Add this import

const BookingComponent = ({ event, userId }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (event === undefined) {
      setError("Event data is not available. Please try again later.");
    } else {
      setError(null);
    }
  }, [event]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!event) {
      setError("Cannot book: Event data is not available.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const bookingData = {
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventVenue: event.venue,
        userId: userId,
        userName: name,
        userEmail: email,
        ticketType: "General Admission", // You can make this dynamic if you have multiple ticket types
        quantity: quantity,
        unitPrice: event.ticketPrice,
        totalPrice: event.ticketPrice * quantity,
        paymentStatus: "pending", // You'll update this after processing payment
        bookingStatus: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'bookedTickets'), bookingData);
      
      // Here you would typically redirect to a payment page or process payment
      // For now, we'll just redirect to a confirmation page
      navigate(`/booking-confirmation/${docRef.id}`);
    } catch (err) {
      console.error("Error booking ticket: ", err);
      setError("Failed to book ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!event) {
    return (
      <Box sx={{ mt: 2 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading event details...
        </Typography>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleBooking} sx={{ mt: 2 }}>
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
        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
        required
        margin="normal"
        InputProps={{ inputProps: { min: 1 } }}
      />
      <Typography variant="body1" sx={{ mt: 2 }}>
        Total Price: ${event.ticketPrice * quantity}
      </Typography>
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 3 }}
        disabled={loading || !event}
      >
        {loading ? <CircularProgress size={24} /> : "Book Now"}
      </Button>
    </Box>
  );
};

// Add PropTypes validation
BookingComponent.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    venue: PropTypes.string.isRequired,
    ticketPrice: PropTypes.number.isRequired,
  }).isRequired,
  userId: PropTypes.string.isRequired,
};

export default BookingComponent;
