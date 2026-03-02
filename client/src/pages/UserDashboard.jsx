import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Tab,
  Tabs,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  ConfirmationNumber, 
  History, 
  Recommend, 
  QrCode2,
  Receipt,
  Description
} from '@mui/icons-material';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, recommendationsRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/ai/recommendations').catch(() => ({ data: { data: [] } })),
      ]);

      setBookings(bookingsRes.data.data);
      setRecommendations(recommendationsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await api.put(`/bookings/${bookingId}/cancel`, {
        reason: 'User requested cancellation',
      });
      toast.success('Booking cancelled successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleDownloadInvoice = async (bookingId) => {
    try {
      const response = await api.get(`/bookings/${bookingId}/invoice`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice downloaded');
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  const handleDownloadReceipt = async (bookingId) => {
    try {
      const response = await api.get(`/bookings/${bookingId}/receipt`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${bookingId}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Receipt downloaded');
    } catch (error) {
      toast.error('Failed to download receipt');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const upcomingBookings = bookings.filter(
    (b) => b.status === 'confirmed' && new Date(b.event.date.start) > new Date()
  );
  
  const pastBookings = bookings.filter(
    (b) => b.status === 'confirmed' && new Date(b.event.date.start) <= new Date()
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography variant="h3" fontWeight={800} sx={{ mb: 1 }}>
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Manage your bookings and discover new events
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ConfirmationNumber sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {upcomingBookings.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Upcoming Events
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <History sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {pastBookings.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Past Events
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Recommend sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {recommendations.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Recommendations
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
            <Tab label="Upcoming Bookings" />
            <Tab label="Past Bookings" />
            <Tab label="Recommended for You" />
          </Tabs>
        </Box>

        {/* Upcoming Bookings */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => (
                <Grid item xs={12} key={booking._id}>
                  <Card>
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={3}>
                          <Box
                            component="img"
                            src={booking.event.bannerImage}
                            alt={booking.event.title}
                            sx={{
                              width: '100%',
                              height: 200,
                              objectFit: 'cover',
                              borderRadius: 2,
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                            {booking.event.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {format(new Date(booking.event.date.start), 'EEEE, MMMM dd, yyyy • hh:mm a')}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            Booking ID: {booking.bookingId}
                          </Typography>
                          <Chip
                            label={booking.status}
                            color={getStatusColor(booking.status)}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h5" fontWeight={700} color="primary" sx={{ mb: 2 }}>
                              ₹{booking.finalAmount}
                            </Typography>
                            <Button
                              variant="outlined"
                              startIcon={<QrCode2 />}
                              fullWidth
                              sx={{ mb: 1 }}
                              onClick={() => window.open(`/api/bookings/${booking._id}/qrcode`, '_blank')}
                            >
                              View Ticket
                            </Button>
                            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                              <Tooltip title="Download Invoice">
                                <IconButton
                                  onClick={() => handleDownloadInvoice(booking._id)}
                                  sx={{ border: '1px solid', borderColor: 'divider', flex: 1 }}
                                >
                                  <Description />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Download Receipt">
                                <IconButton
                                  onClick={() => handleDownloadReceipt(booking._id)}
                                  sx={{ border: '1px solid', borderColor: 'divider', flex: 1 }}
                                >
                                  <Receipt />
                                </IconButton>
                              </Tooltip>
                            </Box>
                            <Button
                              variant="outlined"
                              color="error"
                              fullWidth
                              onClick={() => handleCancelBooking(booking._id)}
                              disabled={booking.status !== 'confirmed'}
                            >
                              Cancel Booking
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    No upcoming bookings
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        )}

        {/* Past Bookings */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            {pastBookings.length > 0 ? (
              pastBookings.map((booking) => (
                <Grid item xs={12} key={booking._id}>
                  <Card>
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={3}>
                          <Box
                            component="img"
                            src={booking.event.bannerImage}
                            alt={booking.event.title}
                            sx={{
                              width: '100%',
                              height: 200,
                              objectFit: 'cover',
                              borderRadius: 2,
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={9}>
                          <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                            {booking.event.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {format(new Date(booking.event.date.start), 'EEEE, MMMM dd, yyyy')}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            Booking ID: {booking.bookingId}
                          </Typography>
                          <Typography variant="h6" fontWeight={700} color="primary">
                            ₹{booking.finalAmount}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    No past bookings
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        )}

        {/* Recommendations */}
        {activeTab === 2 && (
          <Grid container spacing={3}>
            {recommendations.length > 0 ? (
              recommendations.map((event) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={event._id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 6 },
                    }}
                    onClick={() => window.location.href = `/events/${event._id}`}
                  >
                    <Box
                      component="img"
                      src={event.bannerImage}
                      alt={event.title}
                      sx={{ width: '100%', height: 200, objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Typography variant="h6" fontWeight={700} noWrap>
                        {event.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        From ₹{event.pricing?.min}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    No recommendations available
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </motion.div>
    </Container>
  );
};

export default UserDashboard;
