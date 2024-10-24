import { useState } from 'react';
import QrScanner from 'react-qr-scanner';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  AlertTitle,
  IconButton,
  Divider,
  Box,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  Close as CloseIcon,
  ConfirmationNumber as TicketIcon,
  Send as SendIcon
} from '@mui/icons-material';

const TicketVerification = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Parse QR code data
  const parseQRData = (qrText) => {
    try {
      const lines = qrText.split('\n');
      const bookingIdLine = lines.find(line => line.startsWith('BookingID:'));
      const eventLine = lines.find(line => line.startsWith('Event:'));
      const dateLine = lines.find(line => line.startsWith('Date:'));
      const nameLine = lines.find(line => line.startsWith('Name:'));

      return {
        bookingId: bookingIdLine ? bookingIdLine.replace('BookingID:', '').trim() : null,
        event: eventLine ? eventLine.replace('Event:', '').trim() : null,
        date: dateLine ? dateLine.replace('Date:', '').trim() : null,
        name: nameLine ? nameLine.replace('Name:', '').trim() : null
      };
    } catch (error) {
      console.error('Error parsing QR data:', error);
      return null;
    }
  };

  const verifyTicket = async (id) => {
    setIsVerifying(true);
    try {
      const ticketRef = doc(db, 'bookedTickets', id);
      const ticketSnap = await getDoc(ticketRef);

      if (ticketSnap.exists()) {
        const ticketData = ticketSnap.data();
        setVerificationResult({
          isValid: true,
          data: {
            eventTitle: ticketData.eventTitle,
            userName: ticketData.userName,
            quantity: ticketData.quantity,
            bookingDate: ticketData.bookingDate.toDate().toLocaleString(),
          }
        });
      } else {
        setVerificationResult({
          isValid: false,
          message: 'Invalid ticket. No booking found with this ID.'
        });
      }
    } catch (error) {
      setVerificationResult({
        isValid: false,
        message: 'Error verifying ticket. Please try again.'
      });
    }
    setIsVerifying(false);
  };

  const handleScan = (data) => {
    if (data) {
      const parsedData = parseQRData(data.text);
      if (parsedData && parsedData.bookingId) {
        setShowScanner(false);
        verifyTicket(parsedData.bookingId);
      }
    }
  };

  const handleError = (error) => {
    console.error(error);
    setVerificationResult({
      isValid: false,
      message: 'Error accessing camera. Please try manual entry.'
    });
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (bookingId.trim()) {
      verifyTicket(bookingId.trim());
    }
  };

  const scannerStyles = {
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto'
  };

  return (
    <Card elevation={3} sx={{ maxWidth: 600, mx: 'auto', mt: 2 }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <TicketIcon />
            <Typography variant="h5">Ticket Verification</Typography>
          </Box>
        }
      />
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {!showScanner ? (
            <Button 
              variant="contained" 
              startIcon={<CameraIcon />}
              onClick={() => setShowScanner(true)}
              fullWidth
            >
              Scan QR Code
            </Button>
          ) : (
            <Paper sx={{ position: 'relative', p: 2 }}>
              <IconButton
                size="small"
                sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}
                onClick={() => setShowScanner(false)}
              >
                <CloseIcon />
              </IconButton>
              <Box sx={{ maxWidth: 400, mx: 'auto' }}>
                <QrScanner
                  delay={300}
                  style={scannerStyles}
                  onError={handleError}
                  onScan={handleScan}
                  constraints={{
                    video: { facingMode: 'environment' }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                  Position the QR code within the camera view
                </Typography>
              </Box>
            </Paper>
          )}

          <Box sx={{ position: 'relative', textAlign: 'center', my: 2 }}>
            <Divider>
              <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                OR ENTER BOOKING ID MANUALLY
              </Typography>
            </Divider>
          </Box>

          <Box component="form" onSubmit={handleManualSubmit} sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="Enter Booking ID"
              variant="outlined"
            />
            <Button 
              type="submit" 
              variant="contained" 
              disabled={isVerifying}
              endIcon={isVerifying ? <CircularProgress size={20} /> : <SendIcon />}
            >
              Verify
            </Button>
          </Box>

          {verificationResult && (
            <Alert 
              severity={verificationResult.isValid ? "success" : "error"}
              sx={{ mt: 2 }}
            >
              <AlertTitle>
                {verificationResult.isValid ? "Valid Ticket" : "Invalid Ticket"}
              </AlertTitle>
              {verificationResult.isValid ? (
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Event"
                      secondary={verificationResult.data.eventTitle}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Attendee"
                      secondary={verificationResult.data.userName}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Quantity"
                      secondary={verificationResult.data.quantity}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Booked on"
                      secondary={verificationResult.data.bookingDate}
                    />
                  </ListItem>
                </List>
              ) : (
                verificationResult.message
              )}
            </Alert>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TicketVerification;