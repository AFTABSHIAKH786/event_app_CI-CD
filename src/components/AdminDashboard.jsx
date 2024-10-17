import { useState } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('events');
  const navigate = useNavigate();

  // Fetch collections from Firestore
  const [events] = useCollection(collection(db, 'events'));
  const [bookings] = useCollection(collection(db, 'bookings'));
  const [users] = useCollection(collection(db, 'users'));

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCreateEvent = () => {
    navigate('/admin/event/create');
  };

  const handleEditEvent = (eventId) => {
    navigate(`/admin/event/edit/${eventId}`);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDoc(doc(db, 'events', eventId));
        alert('Event deleted successfully');
      } catch (error) {
        console.error('Error deleting event: ', error);
        alert('Failed to delete event');
      }
    }
  };

  const renderEventsList = () => (
    <div>
      <h2 className="text-xl font-semibold mb-2">All Events</h2>
      {events && events.docs.length > 0 ? (
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Title</th>
              <th className="border border-gray-300 p-2">Date</th>
              <th className="border border-gray-300 p-2">Capacity</th>
              <th className="border border-gray-300 p-2">Ticket Price</th>
              <th className="border border-gray-300 p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.docs.map((doc) => {
              const eventData = doc.data();
              return (
                <tr key={doc.id}>
                  <td className="border border-gray-300 p-2">{eventData.title}</td>
                  <td className="border border-gray-300 p-2">{eventData.date.toDate().toLocaleString()}</td>
                  <td className="border border-gray-300 p-2">{eventData.capacity}</td>
                  <td className="border border-gray-300 p-2">${eventData.ticketPrice}</td>
                  <td className="border border-gray-300 p-2">
                    <button onClick={() => handleEditEvent(doc.id)} className="text-blue-500 hover:underline">Edit</button>
                    <button onClick={() => handleDeleteEvent(doc.id)} className="text-red-500 hover:underline ml-2">Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>No events found.</p>
      )}
    </div>
  );

  const renderBookingsList = () => (
    <div>
      <h2 className="text-xl font-semibold mb-2">Event Bookings</h2>
      {bookings && bookings.docs.length > 0 ? (
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">User</th>
              <th className="border border-gray-300 p-2">Event</th>
              <th className="border border-gray-300 p-2">Booking Date</th>
              <th className="border border-gray-300 p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.docs.map((doc) => {
              const bookingData = doc.data();
              return (
                <tr key={doc.id}>
                  <td className="border border-gray-300 p-2">{bookingData.user}</td>
                  <td className="border border-gray-300 p-2">{bookingData.eventTitle}</td>
                  <td className="border border-gray-300 p-2">{bookingData.bookingDate.toDate().toLocaleString()}</td>
                  <td className="border border-gray-300 p-2">{bookingData.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>No bookings found.</p>
      )}
    </div>
  );

  const renderUsersList = () => (
    <div>
      <h2 className="text-xl font-semibold mb-2">User Details</h2>
      {users && users.docs.length > 0 ? (
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Name</th>
              <th className="border border-gray-300 p-2">Email</th>
              <th className="border border-gray-300 p-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.docs.map((doc) => {
              const userData = doc.data();
              return (
                <tr key={doc.id}>
                  <td className="border border-gray-300 p-2">{userData.name}</td>
                  <td className="border border-gray-300 p-2">{userData.email}</td>
                  <td className="border border-gray-300 p-2">{userData.role}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'events':
        return renderEventsList();
      case 'bookings':
        return renderBookingsList();
      case 'users':
        return renderUsersList();
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-4">Welcome to the admin dashboard. Here you can manage events and users.</p>
      
      <div className="mb-4">
        <button 
          onClick={handleCreateEvent}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create New Event
        </button>
      </div>

      <div className="mb-4">
        <button 
          onClick={() => handleTabChange('events')}
          className={`mr-2 px-4 py-2 ${activeTab === 'events' ? 'bg-gray-300' : 'bg-gray-200'}`}
        >
          All Events
        </button>
        <button 
          onClick={() => handleTabChange('bookings')}
          className={`mr-2 px-4 py-2 ${activeTab === 'bookings' ? 'bg-gray-300' : 'bg-gray-200'}`}
        >
          Event Bookings
        </button>
        <button 
          onClick={() => handleTabChange('users')}
          className={`px-4 py-2 ${activeTab === 'users' ? 'bg-gray-300' : 'bg-gray-200'}`}
        >
          User Details
        </button>
      </div>

      {renderTabContent()}
    </div>
  );
};

export default AdminDashboard;
