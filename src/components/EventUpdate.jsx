import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';

const EventUpdate = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    capacity: '',
    ticketPrice: '',
    images: []
  });
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        if (eventDoc.exists()) {
          const eventData = eventDoc.data();
          setFormData({
            title: eventData.title,
            date: eventData.date.toDate().toISOString().split('T')[0],
            capacity: eventData.capacity,
            ticketPrice: eventData.ticketPrice,
            images: eventData.images || []
          });
        } else {
          setError('Event not found');
        }
      } catch (err) {
        setError('Error fetching event');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(prevImages => [...prevImages, ...files]);
  };

  const handleRemoveNewImage = (index) => {
    setNewImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index) => {
    setFormData(prevData => ({
      ...prevData,
      images: prevData.images.filter((_, i) => i !== index)
    }));
  };

  const uploadImages = async () => {
    const uploadedUrls = [];
    for (const image of newImages) {
      const imageRef = ref(storage, `events/${eventId}/${image.name}`);
      await uploadBytes(imageRef, image);
      const url = await getDownloadURL(imageRef);
      uploadedUrls.push(url);
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const uploadedImageUrls = await uploadImages();
      const updatedImages = [...formData.images, ...uploadedImageUrls];
      
      await updateDoc(doc(db, 'events', eventId), {
        title: formData.title,
        date: new Date(formData.date),
        capacity: Number(formData.capacity),
        ticketPrice: Number(formData.ticketPrice),
        images: updatedImages
      });

      alert('Event updated successfully');
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Error updating event');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Update Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block mb-1">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="date" className="block mb-1">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="capacity" className="block mb-1">Capacity</label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="ticketPrice" className="block mb-1">Ticket Price</label>
          <input
            type="number"
            id="ticketPrice"
            name="ticketPrice"
            value={formData.ticketPrice}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Existing Images</label>
          <div className="flex flex-wrap gap-2">
            {formData.images.map((url, index) => (
              <div key={index} className="relative">
                <img src={url} alt={`Event ${index}`} className="w-24 h-24 object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveExistingImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="newImages" className="block mb-1">Add New Images</label>
          <input
            type="file"
            id="newImages"
            onChange={handleImageUpload}
            multiple
            accept="image/*"
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">New Images to Upload</label>
          <div className="flex flex-wrap gap-2">
            {newImages.map((file, index) => (
              <div key={index} className="relative">
                <img src={URL.createObjectURL(file)} alt={`New ${index}`} className="w-24 h-24 object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveNewImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Update Event
        </button>
      </form>
    </div>
  );
};

export default EventUpdate;