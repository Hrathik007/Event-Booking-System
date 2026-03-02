import { Card, CardContent, CardMedia, Typography, Box, Chip, IconButton } from '@mui/material';
import { LocationOn, CalendarToday, Favorite, FavoriteBorder } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/events/${event._id}`);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'entertainment':
        return '#ec4899';
      case 'professional':
        return '#3b82f6';
      case 'social':
        return '#10b981';
      default:
        return '#6366f1';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        onClick={handleClick}
        sx={{
          height: '100%',
          cursor: 'pointer',
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          '&:hover': {
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          },
          transition: 'box-shadow 0.3s ease',
        }}
      >
        {/* Image */}
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="200"
            image={event.bannerImage || 'https://via.placeholder.com/400x200'}
            alt={event.title}
            sx={{ objectFit: 'cover' }}
          />
          
          {/* Category Badge */}
          <Chip
            label={event.category}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              bgcolor: getCategoryColor(event.category),
              color: 'white',
              fontWeight: 600,
              textTransform: 'capitalize',
            }}
          />

          {/* Featured Badge */}
          {event.isFeatured && (
            <Chip
              label="Featured"
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                bgcolor: '#fbbf24',
                color: 'white',
                fontWeight: 600,
              }}
            />
          )}

          {/* Favorite Button */}
          <IconButton
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': {
                bgcolor: 'white',
              },
            }}
            onClick={(e) => {
              e.stopPropagation();
              // Handle favorite
            }}
          >
            <FavoriteBorder fontSize="small" />
          </IconButton>
        </Box>

        {/* Content */}
        <CardContent sx={{ p: 2.5 }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 700,
              mb: 1.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              minHeight: '3.6em',
            }}
          >
            {event.title}
          </Typography>

          {/* Date */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
            <CalendarToday sx={{ fontSize: 16, mr: 1 }} />
            <Typography variant="body2">
              {format(new Date(event.date.start), 'MMM dd, yyyy')}
            </Typography>
          </Box>

          {/* Location */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
            <LocationOn sx={{ fontSize: 16, mr: 1 }} />
            <Typography variant="body2" noWrap>
              {event.venue?.city || 'Online Event'}
            </Typography>
          </Box>

          {/* Price and Availability */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                From
              </Typography>
              <Typography variant="h6" fontWeight={700} color="primary">
                ₹{event.pricing?.min || 0}
              </Typography>
            </Box>
            <Chip
              label={event.availableSeats > 0 ? `${event.availableSeats} seats left` : 'Sold Out'}
              size="small"
              color={event.availableSeats > 0 ? 'success' : 'error'}
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EventCard;
