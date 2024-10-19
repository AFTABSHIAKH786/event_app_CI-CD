import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth'; // Import Firebase Auth
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom'; // Import Link for navigation
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Paper } from '@mui/material'; // Import Material-UI components

const BookedTicketsPage = () => {
  const [bookedTickets, setBookedTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const auth = getAuth(); // Get the Firebase Auth instance
  const user = auth.currentUser; // Get the currently logged-in user
  const userEmail = user ? user.email : null; // Get the user's email

  useEffect(() => {
    const fetchBookedTickets = async () => {
      if (!userEmail) {
        setError('User is not logged in.'); // Handle case where user is not logged in
        setLoading(false);
        return;
      }

      try {
        const db = getFirestore();
        const ticketsRef = collection(db, 'bookedTickets');
        const q = query(ticketsRef, where('userEmail', '==', userEmail)); // Query to find tickets by userEmail
        const querySnapshot = await getDocs(q);

        const tickets = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          tickets.push({ id: doc.id, ...data, eventDate: data.eventDate.toDate() }); // Convert Firestore timestamp to Date
        });

        console.log("Fetched tickets:", tickets); // Debugging: log fetched tickets
        setBookedTickets(tickets); // Set the booked tickets state
      } catch (err) {
        console.error("Error fetching booked tickets:", err); // Debugging: log error
        setError('Error fetching booked tickets: ' + err.message); // Handle errors
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchBookedTickets(); // Call the function to fetch tickets
  }, [userEmail]); // Dependency array includes userEmail

  if (loading) {
    return <div>Loading...</div>; // Loading state
  }

  if (error) {
    return <div>{error}</div>; // Error state
  }

  return (
    <div>
      <h1 className='text-xl text-center p-4 '>Booked Tickets</h1>
      {bookedTickets.length === 0 ? (
        <p>No tickets found.</p> // Message if no tickets are found
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Event Title</TableCell>
                <TableCell>Event Date</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Total Price</TableCell>
                <TableCell>User Name</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookedTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.eventTitle}</TableCell>
                  <TableCell>{ticket.eventDate.toLocaleString()}</TableCell>
                  <TableCell>{ticket.quantity}</TableCell>
                  <TableCell>${ticket.totalPrice}</TableCell>
                  <TableCell>{ticket.userName}</TableCell>
                  <TableCell>
                    <Link to={`/booking-confirmation/${ticket.id}`}>
                      <Button variant="contained" color="primary">
                        View Confirmation
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default BookedTicketsPage;
