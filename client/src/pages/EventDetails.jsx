import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  LocationOn,
  CalendarToday,
  AccessTime,
  Person,
  Star,
  Add,
  Remove,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import SeatSelector from '../components/events/SeatSelector';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [selectedSeats, setSelectedSeats] = useState({});

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data.data);
      
      // Initialize ticket selection
      const initial = {};
      response.data.data.ticketTypes.forEach(ticket => {
        initial[ticket.name] = 0;
      });
      setSelectedTickets(initial);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleTicketChange = (ticketName, delta) => {
    setSelectedTickets(prev => ({
      ...prev,
      [ticketName]: Math.max(0, (prev[ticketName] || 0) + delta),
    }));
  };

  const handleSeatSelection = (ticketName, seats) => {
    setSelectedSeats(prev => ({
      ...prev,
      [ticketName]: seats
    }));
    // Also update quantity based on seats selected
    setSelectedTickets(prev => ({
      ...prev,
      [ticketName]: seats.length
    }));
  };

  const calculateTotal = () => {
    let total = 0;
    Object.entries(selectedTickets).forEach(([ticketName, quantity]) => {
      const ticket = event.ticketTypes.find(t => t.name === ticketName);
      if (ticket) {
        total += ticket.price * quantity;
      }
    });
    return total;
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to book tickets');
      navigate('/login');
      return;
    }

    const tickets = Object.entries(selectedTickets)
      .filter(([_, quantity]) => quantity > 0)
      .map(([ticketType, quantity]) => {
        const ticket = event.ticketTypes.find(t => t.name === ticketType);
        return {
          ticketType,
          quantity,
          price: ticket.price,
          seatNumbers: selectedSeats[ticketType] || []
        };
      });

    if (tickets.length === 0) {
      toast.error('Please select at least one ticket');
      return;
    }

    try {
      const response = await api.post('/bookings', {
        eventId: event._id,
        tickets,
      });

      toast.success('Booking created! Redirecting to payment...');
      navigate(`/checkout/${response.data.data._id}`);
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || 'Booking failed');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!event) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5">Event not found</Typography>
      </Container>
    );
  }

  return (
    <>
      {/* Banner */}
      <Box
        sx={{
          height: 400,
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${event.bannerImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <Container maxWidth="lg" sx={{ pb: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Chip
              label={event.category}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                mb: 2,
                fontWeight: 600,
              }}
            />
            <Typography variant="h2" fontWeight={800} color="white" sx={{ mb: 1 }}>
              {event.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                <Star sx={{ mr: 0.5, color: '#fbbf24' }} />
                <Typography>{event.rating?.average || 0} ({event.rating?.count || 0} reviews)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                <Person sx={{ mr: 0.5 }} />
                <Typography>{event.bookingCount || 0} bookings</Typography>
              </Box>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            {/* Event Info */}
            <Card sx={{ mb: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
                  About This Event
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
                  {event.description}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarToday sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Date
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {format(new Date(event.date.start), 'EEEE, MMMM dd, yyyy')}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTime sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Time
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {format(new Date(event.date.start), 'hh:mm a')} - {format(new Date(event.date.end), 'hh:mm a')}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOn sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Location
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {event.venue.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.venue.address}, {event.venue.city}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Booking */}
          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: 80 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
                  Select Tickets
                </Typography>

                {event.ticketTypes.map((ticket) => (
                  <Box
                    key={ticket.name}
                    sx={{
                      mb: 3,
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {ticket.name}
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="primary">
                        ₹{ticket.price}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {ticket.availableSeats} seats available
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleTicketChange(ticket.name, -1)}
                          disabled={!selectedTickets[ticket.name]}
                        >
                          <Remove />
                        </Button>
                        <Typography variant="h6" sx={{ minWidth: 30, textAlign: 'center' }}>
                          {selectedTickets[ticket.name] || 0}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleTicketChange(ticket.name, 1)}
                          disabled={selectedTickets[ticket.name] >= ticket.availableSeats}
                        >
                          <Add />
                        </Button>
                      </Box>
                    </Box>

                    {/* Selected Seats Display */}
                    {selectedSeats[ticket.name] && selectedSeats[ticket.name].length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Selected Seats:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {selectedSeats[ticket.name].map(seat => (
                            <Chip key={seat} label={seat} size="small" color="primary" />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Select Seats Button */}
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={() => setBookingDialog(ticket.name)}
                      sx={{ mt: 1 }}
                    >
                      Select Specific Seats
                    </Button>
                  </Box>
                ))}

                <Box
                  sx={{
                    mt: 3,
                    pt: 3,
                    borderTop: '2px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" fontWeight={700}>
                      Total
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="primary">
                      ₹{calculateTotal()}
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleBooking}
                    disabled={calculateTotal() === 0}
                    sx={{
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                    }}
                  >
                    Book Now
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Seat Selection Dialog */}
      <Dialog
        open={!!bookingDialog}
        onClose={() => setBookingDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight={700}>
            Select Your Seats - {bookingDialog}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click on seats to select/deselect
          </Typography>
        </DialogTitle>
        <DialogContent>
          <SeatSelector
            ticketType={bookingDialog}
            maxSeats={
              event?.ticketTypes.find(t => t.name === bookingDialog)?.availableSeats || 10
            }
            onSelectionChange={(seats) => handleSeatSelection(bookingDialog, seats)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => setBookingDialog(false)}
            disabled={!selectedSeats[bookingDialog] || selectedSeats[bookingDialog].length === 0}
          >
            Confirm Seats
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EventDetails;
