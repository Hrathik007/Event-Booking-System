import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  LocalOffer,
  Event,
  AccessTime,
  CheckCircle
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const ComboPasses = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [comboPasses, setComboPasses] = useState([]);
  const [selectedPass, setSelectedPass] = useState(null);
  const [purchaseDialog, setPurchaseDialog] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchComboPasses();
  }, []);

  const fetchComboPasses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/combo-passes');
      setComboPasses(response.data.data);
    } catch (error) {
      toast.error('Failed to load combo passes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    try {
      setPurchasing(true);
      await api.post(`/combo-passes/${selectedPass._id}/purchase`);
      toast.success('Combo pass purchased successfully!');
      setPurchaseDialog(false);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Combo Event Passes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Save big with our exclusive combo passes - enjoy multiple events at discounted rates!
        </Typography>
      </Box>

      {/* Combo Passes Grid */}
      {comboPasses.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <LocalOffer sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No combo passes available at the moment
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {comboPasses.map((comboPass) => (
            <Grid item xs={12} md={6} lg={4} key={comboPass._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Badge */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Chip
                      label={`Save ${comboPass.pricing.discountPercentage}%`}
                      color="success"
                      size="small"
                    />
                    <Chip
                      label={`${comboPass.availablePasses} left`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  {/* Title */}
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {comboPass.name}
                  </Typography>

                  {/* Description */}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {comboPass.description}
                  </Typography>

                  {/* Price */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                    >
                      ₹{comboPass.pricing.originalPrice}
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="primary.main">
                      ₹{comboPass.pricing.discountedPrice}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Events Count */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Event sx={{ fontSize: 20, mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2" fontWeight={600}>
                      {comboPass.events.length} Events Included
                    </Typography>
                  </Box>

                  {/* Validity */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTime sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Valid until {formatDate(comboPass.validity.end)}
                    </Typography>
                  </Box>

                  {/* Benefits */}
                  {comboPass.benefits && comboPass.benefits.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Benefits:
                      </Typography>
                      {comboPass.benefits.slice(0, 3).map((benefit, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'start', mb: 0.5 }}>
                          <CheckCircle sx={{ fontSize: 16, color: 'success.main', mr: 0.5, mt: 0.5 }} />
                          <Typography variant="body2">{benefit}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      setSelectedPass(comboPass);
                      setPurchaseDialog(true);
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => {
                      setSelectedPass(comboPass);
                      setPurchaseDialog(true);
                    }}
                    disabled={comboPass.availablePasses <= 0}
                  >
                    Purchase Now
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Purchase Dialog */}
      <Dialog
        open={purchaseDialog}
        onClose={() => !purchasing && setPurchaseDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedPass && (
          <>
            <DialogTitle>
              <Typography variant="h5" fontWeight={700}>
                {selectedPass.name}
              </Typography>
              <Chip
                label={`Save ${selectedPass.pricing.discountPercentage}%`}
                color="success"
                size="small"
                sx={{ mt: 1 }}
              />
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" paragraph>
                  {selectedPass.description}
                </Typography>

                <Typography variant="h4" fontWeight={800} color="primary.main" gutterBottom>
                  ₹{selectedPass.pricing.discountedPrice}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                  Original Price: ₹{selectedPass.pricing.originalPrice}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" fontWeight={600} gutterBottom>
                Included Events:
              </Typography>
              <List>
                {selectedPass.events.map((event) => (
                  <ListItem key={event._id}>
                    <ListItemText
                      primary={event.title}
                      secondary={`${formatDate(event.date.start)} - ${event.venue?.city}`}
                    />
                  </ListItem>
                ))}
              </List>

              {selectedPass.termsAndConditions && selectedPass.termsAndConditions.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Terms & Conditions:
                  </Typography>
                  <List dense>
                    {selectedPass.termsAndConditions.map((term, index) => (
                      <ListItem key={index}>
                        <Typography variant="caption">• {term}</Typography>
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button onClick={() => setPurchaseDialog(false)} disabled={purchasing}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handlePurchase}
                disabled={purchasing}
                size="large"
              >
                {purchasing ? <CircularProgress size={24} /> : `Purchase for ₹${selectedPass.pricing.discountedPrice}`}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default ComboPasses;
