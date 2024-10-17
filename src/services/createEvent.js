import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the path to your Firebase configuration

export const createEvent = async (eventData, eventId) => {
  try {
    console.log('Event Data:', eventData); // Log the event data
    if (eventId) {
      // Update existing event
      await updateDoc(doc(db, 'events', eventId), eventData);
      console.log('Event updated with ID: ', eventId);
      return eventId; // Return the ID of the updated event
    } else {
      // Create new event
      const docRef = await addDoc(collection(db, 'events'), eventData);
      console.log('Event created with ID: ', docRef.id);
      return docRef.id; // Return the ID of the created event
    }
  } catch (error) {
    console.error('Error saving event: ', error);
    throw error; // Rethrow the error for handling in the calling function
  }
};
