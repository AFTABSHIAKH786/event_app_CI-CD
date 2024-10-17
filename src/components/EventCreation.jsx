import { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Paper,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { storage } from '../firebase'; // Firebase imports
import { Timestamp } from 'firebase/firestore'; // Firestore functions
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Storage functions
import { createEvent } from '../services/createEvent'; // Import the createEvent function
import { getAuth } from 'firebase/auth'; // Firebase Auth function
import { useNavigate } from 'react-router-dom';
export default function EventCreation() {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date(),
    description: '',
    capacity: '',
    ticketPrice: '',
  });
  
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Track if the user is an admin
  const [error, setError] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const checkAdmin = async () => {
      const user = getAuth().currentUser;
      if (user) {
        // Check if the user's email ends with "@eventbroker.com"
        if (user.email && user.email.endsWith('@eventbroker.com')) {
          setIsAdmin(true); // User is an admin
        } else {
          setError('You do not have permission to create an event.');
        }
      } else {
        setError('User not authenticated');
      }
    };

    checkAdmin();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, date }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    if (!isAdmin) {
      setError('You do not have permission to create an event.');
      setIsLoading(false);
      return;
    }

    try {
      // Upload files to Firebase Storage
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const storageRef = ref(storage, `event-media/${Date.now()}-${file.name}`);
          await uploadBytes(storageRef, file);
          return getDownloadURL(storageRef);
        })
      );

      // Add event to Firestore
      const eventData = {
        ...formData,
        date: Timestamp.fromDate(formData.date),
        capacity: Number(formData.capacity),
        ticketPrice: Number(formData.ticketPrice),
        mediaUrls: uploadedFiles,
      };

      console.log('Event Data:', eventData); // Log the event data

      // Attempt to create the event
      await createEvent(eventData);

      //navigate admin back to dashboard
      navigate("/admin/dashboard")
    } catch (error) {
      console.error("Error creating event:", error); // Log the error
      alert("Failed to create event: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='mt-10'>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, margin: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          Create Event
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
        {isAdmin ? (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <DatePicker
                  selected={formData.date}
                  onChange={handleDateChange}
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  customInput={<TextField fullWidth label="Event Date and Time" required />}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Capacity"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  InputProps={{ inputProps: { min: 0 } }}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Ticket Price"
                  name="ticketPrice"
                  type="number"
                  value={formData.ticketPrice}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    inputProps: { min: 0, step: 0.01 },
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <input
                  accept="image/*,video/*"
                  style={{ display: 'none' }}
                  id="file-upload"
                  multiple
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload">
                  <Button variant="contained" component="span">
                    Upload Photos/Videos
                  </Button>
                </label>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {files.map((file, index) => (
                    <Box key={index} sx={{ width: 100, height: 100, position: 'relative' }}>
                      {file.type.startsWith('image/') ? (
                        <img
                          src={file.preview}
                          alt={file.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <video
                          src={file.preview}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                      <Button
                        size="small"
                        color="error"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          minWidth: 'auto',
                          padding: '2px',
                          backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        }}
                        onClick={() => handleRemoveFile(index)}
                      >
                        X
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Submit Event'}
                </Button>
              </Grid>
            </Grid>
          </form>
        ) : (
          <Typography color="error">You do not have permission to create an event.</Typography>
        )}
      </Paper>
    </div>
  );
}
