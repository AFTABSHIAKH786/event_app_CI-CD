import { useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, doc, deleteDoc } from "firebase/firestore";
import TicketVerification from "./TicketVerification";
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("events");
  const navigate = useNavigate();

  // Fetch collections from Firestore
  const [events] = useCollection(collection(db, "events"));
  const [bookings] = useCollection(collection(db, "bookings"));


  // Fetch booked tickets from 'bookedTickets' collection
  const [bookedTickets] = useCollection(collection(db, "bookedTickets"));

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCreateEvent = () => {
    navigate("/admin/event/create");
  };

  const handleEditEvent = (eventId) => {
    navigate(`/admin/event/edit/${eventId}`);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteDoc(doc(db, "events", eventId));
        alert("Event deleted successfully");
      } catch (error) {
        console.error("Error deleting event: ", error);
        alert("Failed to delete event");
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
              <th className="border border-gray-300 p-2">Venue</th>
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
                  <td className="border border-gray-300 p-2">
                    {eventData.title}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {eventData.date.toDate().toLocaleString()}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {eventData.venue}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {eventData.capacity}
                  </td>
                  <td className="border border-gray-300 p-2">
                    ${eventData.ticketPrice}
                  </td>
                  <td className="border border-gray-300 p-2">
                    <button
                      onClick={() => handleEditEvent(doc.id)}
                      className="text-blue-500 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(doc.id)}
                      className="text-red-500 hover:underline ml-2"
                    >
                      Delete
                    </button>
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

  const renderTicketsList = () => (
    <div>
      <h2 className="text-xl font-semibold mb-2">Booked Tickets</h2>
      {bookedTickets && bookedTickets.docs.length > 0 ? (
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">User</th>
              <th className="border border-gray-300 p-2">Event</th>
              <th className="border border-gray-300 p-2">Ticket Count</th>
              <th className="border border-gray-300 p-2">Booking Date</th>
              <th className="border border-gray-300 p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {bookedTickets.docs.map((doc) => {
              const ticketData = doc.data();
              return (
                <tr key={doc.id}>
                  <td className="border border-gray-300 p-2">
                    {ticketData.userName}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {ticketData.eventTitle}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {ticketData.quantity}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {ticketData.bookingDate.toDate().toLocaleString()}
                  </td>
                  <td className="border border-gray-300 p-2">
                  ₹{ticketData.totalPrice}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>No tickets found.</p>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "events":
        return renderEventsList();
      case "tickets": // Keep only the tickets case
        return renderTicketsList();
      case "verify":
        return <TicketVerification/>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-4">
        Welcome to the admin dashboard. Here you can manage events and users.
      </p>

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
          onClick={() => handleTabChange("events")}
          className={`mr-2 px-4 py-2 ${
            activeTab === "events" ? "bg-gray-300" : "bg-gray-200"
          }`}
        >
          All Events
        </button>
        <button
          onClick={() => handleTabChange("tickets")} // Keep only the tickets button
          className={`px-4 py-2 ${
            activeTab === "tickets" ? "bg-gray-300" : "bg-gray-200"
          }`}
        >
          Booked Tickets
        </button>
        <button
          onClick={() => handleTabChange("verify")}
          className={`px-4 py-2 ml-2 ${
            activeTab === "verify" ? "bg-gray-300" : "bg-gray-200"
          }`}
        >
          Check Tickets
        </button>
      </div>

      {renderTabContent()}
    </div>
  );
};

export default AdminDashboard;
