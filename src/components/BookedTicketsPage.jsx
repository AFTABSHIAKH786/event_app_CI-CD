import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Button, 
  CircularProgress,
  Paper,
  Box,
  Container,
  Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';

const AnimatedListItem = styled(ListItem)(({ theme }) => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
    backgroundColor: theme.palette.action.hover,
  },
}));

const EventImage = styled('img')({
  width: '100%',
  height: '100px',
  objectFit: 'cover',
  borderRadius: '4px',
});

const BookedTicketsPage = () => {
  const [bookedTickets, setBookedTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const auth = getAuth();
  const user = auth.currentUser;
  const userEmail = user ? user.email : null;

  useEffect(() => {
    const fetchBookedTickets = async () => {
      if (!userEmail) {
        setError('User is not logged in.');
        setLoading(false);
        return;
      }

      try {
        const db = getFirestore();
        const ticketsRef = collection(db, 'bookedTickets');
        const q = query(ticketsRef, where('userEmail', '==', userEmail));
        const querySnapshot = await getDocs(q);

        const tickets = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          tickets.push({ id: doc.id, ...data, eventDate: data.eventDate.toDate() });
        });

        // Sort tickets by date, most recent first
        tickets.sort((a, b) => b.eventDate - a.eventDate);

        setBookedTickets(tickets);
      } catch (err) {
        console.error("Error fetching booked tickets:", err);
        setError('Error fetching booked tickets: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookedTickets();
  }, [userEmail]);

  if (loading) {
    return <CircularProgress style={{ display: 'block', margin: '20px auto' }} />;
  }

  if (error) {
    return <Typography color="error" align="center" style={{ margin: '20px' }}>{error}</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Booked Tickets
      </Typography>
      {bookedTickets.length === 0 ? (
        <Typography align="center" color="textSecondary">No tickets found.</Typography>
      ) : (
        <Paper elevation={3}>
          <List>
            {bookedTickets.map((ticket, index) => (
              <React.Fragment key={ticket.id}>
                {index > 0 && <Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}
                <AnimatedListItem>
                  <Grid container spacing={2} alignItems="center">
                    
                    <Grid item xs={12} sm={6}>
                      <ListItemText
                        primary={ticket.eventTitle}
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="textPrimary">
                              Date: {ticket.eventDate.toLocaleString()}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2" color="textPrimary">
                              Quantity: {ticket.quantity}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2" color="textPrimary">
                              Total Price: ₹{ticket.totalPrice}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2" color="textPrimary">
                              Booked by: {ticket.userName}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Button 
                        component={Link} 
                        to={`/booking-confirmation/${ticket.id}`}
                        variant="contained" 
                        color="primary" 
                        fullWidth
                      >
                        View Confirmation
                      </Button>
                    </Grid>
                  </Grid>
                </AnimatedListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
};

export default BookedTicketsPage;