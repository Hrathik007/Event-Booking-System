import { useState, useEffect } from 'react';
import { Container, Typography, Grid, Box, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import Hero from '../components/home/Hero';
import EventCard from '../components/events/EventCard';
import api from '../services/api';
import toast from 'react-hot-toast';

const Home = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch featured events
      const featuredRes = await api.get('/events?featured=true&limit=8');
      setFeaturedEvents(featuredRes.data.data);

      // Fetch recommendations if user is logged in
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const recommendRes = await api.get('/ai/recommendations');
          setRecommendations(recommendRes.data.data.slice(0, 8));
        } catch (error) {
          console.log('Recommendations not available');
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load events');
      setLoading(false);
    }
  };

  return (
    <>
      <Hero />

      {/* Featured Events */}
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h3"
            component="h2"
            fontWeight={800}
            sx={{ mb: 1, fontSize: { xs: '2rem', md: '3rem' } }}
          >
            Featured Events
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Discover the most popular events happening near you
          </Typography>
        </motion.div>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {featuredEvents.map((event, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={event._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <EventCard event={event} />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}

        {featuredEvents.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No featured events available at the moment
            </Typography>
          </Box>
        )}
      </Container>

      {/* Recommended Events */}
      {recommendations.length > 0 && (
        <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
          <Container maxWidth="xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Typography
                variant="h3"
                component="h2"
                fontWeight={800}
                sx={{ mb: 1, fontSize: { xs: '2rem', md: '3rem' } }}
              >
                Recommended for You
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                AI-powered suggestions based on your interests
              </Typography>
            </motion.div>

            <Grid container spacing={3}>
              {recommendations.map((event, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={event._id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                  >
                    <EventCard event={event} />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* Categories */}
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          fontWeight={800}
          sx={{ mb: 4, fontSize: { xs: '2rem', md: '3rem' } }}
        >
          Browse by Category
        </Typography>

        <Grid container spacing={3}>
          {[
            { name: 'Entertainment', color: '#ec4899', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819' },
            { name: 'Professional', color: '#3b82f6', image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678' },
            { name: 'Social', color: '#10b981', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622' },
          ].map((category, index) => (
            <Grid item xs={12} sm={4} key={category.name}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Box
                  sx={{
                    height: 200,
                    borderRadius: 3,
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${category.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                  }}
                >
                  <Typography
                    variant="h4"
                    fontWeight={800}
                    color="white"
                    sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                  >
                    {category.name}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default Home;
