import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import {
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Box,
  Divider,
  Snackbar,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import EmailIcon from '@mui/icons-material/Email';

const BookingConfirmationPage = () => {
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const { bookingId } = useParams();

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const db = getFirestore();
        const bookingRef = doc(db, 'bookedTickets', bookingId);
        const bookingSnap = await getDoc(bookingRef);

        if (bookingSnap.exists()) {
          setBookingDetails({ id: bookingSnap.id, ...bookingSnap.data() });
        } else {
          setError('No booking found with this ID.');
        }
      } catch (err) {
        setError('Error fetching booking details: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const formatDate = (date) => {
    return new Date(date.seconds * 1000).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (!bookingDetails) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 4 }}>
        <Typography>No booking details available.</Typography>
      </Container>
    );
  }

  // Generate QR code URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BookingID:${bookingDetails.id}%0AEvent:${bookingDetails.eventTitle}%0ADate:${formatDate(bookingDetails.eventDate)}%0AName:${bookingDetails.userName}`;

  const sendConfirmationEmail = async () => {
    try {
      const response = await fetch('/api/send-confirmation-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: bookingDetails.userEmail,
          bookingDetails: {
            id: bookingDetails.id,
            eventTitle: bookingDetails.eventTitle,
            eventDate: formatDate(bookingDetails.eventDate),
            quantity: bookingDetails.quantity,
            totalPrice: bookingDetails.totalPrice,
            userName: bookingDetails.userName,
          },
        }),
      });

      if (response.ok) {
        setSnackbar({ open: true, message: 'Confirmation email sent successfully!' });
      } else {
        throw new Error('Failed to send confirmation email');
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Error sending confirmation email: ' + error.message });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ my: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center" className='underline'>
          Booking Confirmation
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {bookingDetails.eventTitle}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Date: {formatDate(bookingDetails.eventDate)}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Tickets: {bookingDetails.quantity}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Total Price: ${bookingDetails.totalPrice.toFixed(2)}
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            Name: {bookingDetails.userName}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Email: {bookingDetails.userEmail}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Payment Method: {bookingDetails.paymentMethod}
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Booking ID: {bookingDetails.id}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Booked on: {formatDate(bookingDetails.bookingDate)}
          </Typography>
        </Box>
        {/* QR Code Section */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            Scan the QR code for booking details:
          </Typography>
          <img src={qrCodeUrl} alt="QR Code" className='m-auto' />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
          >
            Print Confirmation
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<EmailIcon />}
            onClick={sendConfirmationEmail}
          >
            Send Email Confirmation
          </Button>
        </Box>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
};

export default BookingConfirmationPage;
