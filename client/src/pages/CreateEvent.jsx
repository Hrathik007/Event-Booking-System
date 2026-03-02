import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  CircularProgress
} from '@mui/material';
import { ArrowBack, Add, Delete } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get event ID from URL for editing
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [fetchingEvent, setFetchingEvent] = useState(isEditMode);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    time: '',
    venue: {
      name: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      pincode: ''
    },
    ticketTypes: [
      {
        name: 'General',
        price: '',
        quantity: '',
        description: ''
      }
    ],
    totalSeats: '',
    images: [],
    tags: [],
    status: 'draft'
  });

  const categories = [
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'professional', label: 'Professional' },
    { value: 'social', label: 'Social' }
  ];

  // Fetch event data if editing
  useEffect(() => {
    if (isEditMode) {
      fetchEventData();
    }
  }, [id]);

  const fetchEventData = async () => {
    try {
      setFetchingEvent(true);
      const response = await api.get(`/events/${id}`);
      const event = response.data.data;
      
      // Parse the date
      const eventDate = new Date(event.date?.start || event.date);
      const dateString = eventDate.toISOString().split('T')[0];
      const timeString = eventDate.toTimeString().slice(0, 5);
      
      setFormData({
        title: event.title || '',
        description: event.description || '',
        category: event.category || '',
        date: dateString,
        time: timeString,
        venue: {
          name: event.venue?.name || '',
          address: event.venue?.address || '',
          city: event.venue?.city || '',
          state: event.venue?.state || '',
          country: event.venue?.country || 'India',
          pincode: event.venue?.zipCode || ''
        },
        ticketTypes: event.ticketTypes?.length > 0 
          ? event.ticketTypes.map(ticket => ({
              name: ticket.name || '',
              price: ticket.price?.toString() || '',
              quantity: ticket.totalSeats?.toString() || '',
              description: ticket.benefits?.join(', ') || ''
            }))
          : [{
              name: 'General',
              price: '',
              quantity: '',
              description: ''
            }],
        totalSeats: event.totalSeats?.toString() || '',
        images: event.images || [],
        tags: event.tags || [],
        status: event.status || 'draft'
      });
    } catch (error) {
      toast.error('Failed to load event data');
      console.error(error);
      navigate('/organizer/dashboard');
    } finally {
      setFetchingEvent(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVenueChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      venue: {
        ...prev.venue,
        [name]: value
      }
    }));
  };

  const handleTicketTypeChange = (index, field, value) => {
    const newTicketTypes = [...formData.ticketTypes];
    newTicketTypes[index][field] = value;
    setFormData(prev => ({
      ...prev,
      ticketTypes: newTicketTypes
    }));
  };

  const addTicketType = () => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: [
        ...prev.ticketTypes,
        { name: '', price: '', quantity: '', description: '' }
      ]
    }));
  };

  const removeTicketType = (index) => {
    if (formData.ticketTypes.length === 1) {
      toast.error('At least one ticket type is required');
      return;
    }
    const newTicketTypes = formData.ticketTypes.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      ticketTypes: newTicketTypes
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Combine date and time
      const eventDateTime = new Date(`${formData.date}T${formData.time}`);
      
      // Calculate total seats from ticket types
      const totalSeats = formData.ticketTypes.reduce((sum, ticket) => 
        sum + Number(ticket.quantity), 0
      );

      const eventData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subCategory: formData.category === 'entertainment' ? 'concert' : 
                     formData.category === 'professional' ? 'conference' : 'party',
        date: {
          start: eventDateTime,
          end: new Date(eventDateTime.getTime() + 3 * 60 * 60 * 1000) // Add 3 hours
        },
        venue: {
          ...formData.venue,
          zipCode: formData.venue.pincode
        },
        ticketTypes: formData.ticketTypes.map(ticket => ({
          name: ticket.name,
          price: Number(ticket.price),
          totalSeats: Number(ticket.quantity),
          availableSeats: Number(ticket.quantity),
          benefits: ticket.description ? [ticket.description] : []
        })),
        totalSeats,
        availableSeats: totalSeats,
        status: formData.status,
        images: formData.images.length > 0 ? formData.images : [{
          url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
          alt: 'Event banner'
        }]
      };

      if (isEditMode) {
        await api.put(`/events/${id}`, eventData);
        toast.success('Event updated successfully!');
      } else {
        await api.post('/events', eventData);
        toast.success('Event created successfully!');
      }
      
      navigate('/organizer/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} event`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Loading State */}
      {fetchingEvent ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress />
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Loading event data...
          </Typography>
        </Box>
      ) : (
        <>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/organizer/dashboard')}
              sx={{ mb: 2 }}
            >
              Back to Dashboard
            </Button>
            <Typography variant="h4" fontWeight={800}>
              {isEditMode ? 'Edit Event' : 'Create New Event'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {isEditMode 
                ? 'Update your event details'
                : 'Fill in the details to create your event'
              }
            </Typography>
          </Box>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                  Basic Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Event Title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Summer Music Festival 2026"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      multiline
                      rows={4}
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe your event..."
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Category</InputLabel>
                      <Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        label="Category"
                      >
                        {categories.map((cat) => (
                          <MenuItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Status</InputLabel>
                      <Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        label="Status"
                      >
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="published">Published</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      type="date"
                      label="Event Date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      type="time"
                      label="Event Time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Venue Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                  Venue Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Venue Name"
                      name="name"
                      value={formData.venue.name}
                      onChange={handleVenueChange}
                      placeholder="e.g., City Convention Center"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Address"
                      name="address"
                      value={formData.venue.address}
                      onChange={handleVenueChange}
                      placeholder="Street address"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="City"
                      name="city"
                      value={formData.venue.city}
                      onChange={handleVenueChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="State"
                      name="state"
                      value={formData.venue.state}
                      onChange={handleVenueChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Country"
                      name="country"
                      value={formData.venue.country}
                      onChange={handleVenueChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Pincode"
                      name="pincode"
                      value={formData.venue.pincode}
                      onChange={handleVenueChange}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Ticket Types */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Ticket Types
                  </Typography>
                  <Button
                    startIcon={<Add />}
                    onClick={addTicketType}
                    variant="outlined"
                    size="small"
                  >
                    Add Ticket Type
                  </Button>
                </Box>
                
                {formData.ticketTypes.map((ticket, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Ticket Type {index + 1}
                      </Typography>
                      {formData.ticketTypes.length > 1 && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeTicketType(index)}
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          required
                          label="Ticket Name"
                          value={ticket.name}
                          onChange={(e) => handleTicketTypeChange(index, 'name', e.target.value)}
                          placeholder="e.g., VIP, General"
                        />
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          required
                          type="number"
                          label="Price (₹)"
                          value={ticket.price}
                          onChange={(e) => handleTicketTypeChange(index, 'price', e.target.value)}
                          inputProps={{ min: 0 }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          required
                          type="number"
                          label="Quantity"
                          value={ticket.quantity}
                          onChange={(e) => handleTicketTypeChange(index, 'quantity', e.target.value)}
                          inputProps={{ min: 1 }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          value={ticket.description}
                          onChange={(e) => handleTicketTypeChange(index, 'description', e.target.value)}
                          placeholder="Optional ticket description"
                        />
                      </Grid>
                    </Grid>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Submit Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/organizer/dashboard')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                size="large"
              >
                {loading 
                  ? (isEditMode ? 'Updating...' : 'Creating...') 
                  : (isEditMode ? 'Update Event' : 'Create Event')
                }
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
        </>
      )}
    </Container>
  );
};

export default CreateEvent;
