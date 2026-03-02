import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import api from '../services/api';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      setBooking(response.data.data);
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);

    try {
      // Create Razorpay order
      const orderRes = await api.post('/payments/create-order', { bookingId });
      const { order, payment, isDemoMode: demoMode } = orderRes.data;
      
      setIsDemoMode(demoMode);

      if (demoMode) {
        // DEMO MODE: Simulate payment without Razorpay
        toast.loading('Processing demo payment...', { duration: 1500 });
        
        setTimeout(async () => {
          try {
            // Verify demo payment
            await api.post('/payments/verify', {
              razorpay_order_id: order.id,
              razorpay_payment_id: `pay_DEMO${Date.now()}`,
              razorpay_signature: 'demo_signature',
              paymentId: payment.id,
              isDemoPayment: true
            });

            // Confirm booking
            await api.put(`/bookings/${bookingId}/confirm`);

            toast.success('Demo payment successful! 🎉');
            navigate('/dashboard');
          } catch (error) {
            console.error('Demo payment error:', error);
            toast.error('Demo payment verification failed');
            setProcessing(false);
          }
        }, 2000);
      } else {
        // PRODUCTION MODE: Use real Razorpay
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'EventHub',
          description: booking.event.title,
          order_id: order.id,
          handler: async function (response) {
            try {
              await api.post('/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentId: payment.id,
                isDemoPayment: false
              });

              await api.put(`/bookings/${bookingId}/confirm`);

              toast.success('Payment successful!');
              navigate('/dashboard');
            } catch (error) {
              toast.error('Payment verification failed');
            } finally {
              setProcessing(false);
            }
          },
          prefill: {
            name: booking.attendeeInfo.name,
            email: booking.attendeeInfo.email,
            contact: booking.attendeeInfo.phone,
          },
          theme: {
            color: '#4f46e5',
          },
          modal: {
            ondismiss: function() {
              setProcessing(false);
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!booking) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5">Booking not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Card>
        <CardContent sx={{ p: 5 }}>
          <Typography variant="h4" fontWeight={800} sx={{ mb: 4, textAlign: 'center' }}>
            Complete Your Booking
          </Typography>

          {/* Demo Mode Alert */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight={600}>
              Demo Mode Active
            </Typography>
            <Typography variant="body2">
              This is a demo payment. No real transaction will be processed. 
              Click "Proceed to Payment" to simulate a successful payment.
            </Typography>
          </Alert>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Order Summary
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                <strong>Event:</strong> {booking.event.title}
              </Typography>
              <Typography variant="body1">
                <strong>Booking ID:</strong> {booking.bookingId}
              </Typography>
            </Box>

            {booking.tickets.map((ticket, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography>
                  {ticket.ticketType} x {ticket.quantity}
                </Typography>
                <Typography>₹{ticket.price * ticket.quantity}</Typography>
              </Box>
            ))}

            {booking.discount > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 1,
                  color: 'success.main',
                }}
              >
                <Typography>Discount</Typography>
                <Typography>-₹{booking.discount}</Typography>
              </Box>
            )}

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mt: 2,
                pt: 2,
                borderTop: '2px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                Total Amount
              </Typography>
              <Typography variant="h6" fontWeight={700} color="primary">
                ₹{booking.finalAmount}
              </Typography>
            </Box>
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handlePayment}
            disabled={processing}
            sx={{
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 700,
            }}
          >
            {processing ? 'Processing...' : 'Proceed to Payment'}
          </Button>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, textAlign: 'center' }}
          >
            You will be redirected to a secure payment gateway
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Checkout;
