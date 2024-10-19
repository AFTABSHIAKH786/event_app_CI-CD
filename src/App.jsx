// src/App.jsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './utils/AuthProvider';
import Navigation from './components/Navigation';
import Home from './components/Home';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Dashboard from './components/Dashboard';
import AdminLoginPage from './components/AdminLoginPage';
import PrivateRoute from './utils/PrivateRoute';
import AdminDashboard from './components/AdminDashboard';
import EventCreation from './components/EventCreation';
import EventUpdate from './components/EventUpdate';
import EventDescriptionPage from './components/EventDesctiption';
import EventBookingPage from './components/EventBookingPage';
import BookingConfirmationPage from './components/BookingConfirmationPage';
import BookedTicketsPage from './components/BookedTicketsPage';
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/event/create" element={<EventCreation />} />
            <Route path="/admin/event/edit/:eventId" element={<EventUpdate />} />
            <Route path="/event/:eventId" element={<EventDescriptionPage />} />
            <Route path="/book-event/:eventId" element={<EventBookingPage />} />
            <Route path="/bookings" element={<BookedTicketsPage />} />
            <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmationPage />} />
            <Route 
              path='/admin/dashboard'
              element={
                <PrivateRoute>
                  <AdminDashboard/>
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
