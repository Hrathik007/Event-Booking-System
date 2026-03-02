import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Chip,
  Paper,
  Divider
} from '@mui/material';
import { EventSeat, Chair } from '@mui/icons-material';

const SeatSelector = ({ ticketType, maxSeats, onSelectionChange }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Generate seat layout (10 seats per row)
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsPerRow = 10;

  const handleSeatClick = (seatNumber) => {
    setSelectedSeats(prev => {
      let newSelection;
      if (prev.includes(seatNumber)) {
        // Deselect
        newSelection = prev.filter(s => s !== seatNumber);
      } else {
        // Check if max seats reached
        if (prev.length >= maxSeats) {
          return prev;
        }
        // Select
        newSelection = [...prev, seatNumber];
      }
      
      // Notify parent component
      if (onSelectionChange) {
        onSelectionChange(newSelection);
      }
      
      return newSelection;
    });
  };

  const getSeatStatus = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) return 'selected';
    // Randomly mark some as booked for demo (in real app, this would come from backend)
    const hash = seatNumber.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    if (hash % 7 === 0) return 'booked';
    return 'available';
  };

  const getSeatColor = (status) => {
    switch (status) {
      case 'selected':
        return 'primary.main';
      case 'booked':
        return 'text.disabled';
      case 'available':
      default:
        return 'success.light';
    }
  };

  return (
    <Box>
      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EventSeat sx={{ color: 'success.light' }} />
          <Typography variant="body2">Available</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EventSeat sx={{ color: 'primary.main' }} />
          <Typography variant="body2">Selected</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EventSeat sx={{ color: 'text.disabled' }} />
          <Typography variant="body2">Booked</Typography>
        </Box>
      </Box>

      {/* Screen/Stage */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 4,
          textAlign: 'center',
          background: 'linear-gradient(180deg, #e0e0e0 0%, #f5f5f5 100%)',
          borderRadius: 2
        }}
      >
        <Typography variant="h6" fontWeight={600} color="text.secondary">
          STAGE / SCREEN
        </Typography>
      </Paper>

      {/* Seat Map */}
      <Box sx={{ mb: 3 }}>
        {rows.map((row) => (
          <Box
            key={row}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1,
              mb: 1.5
            }}
          >
            {/* Row Label */}
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ width: 30, textAlign: 'center' }}
            >
              {row}
            </Typography>

            {/* Seats */}
            {[...Array(seatsPerRow)].map((_, index) => {
              const seatNumber = `${row}${index + 1}`;
              const status = getSeatStatus(seatNumber);
              const isDisabled = status === 'booked';

              return (
                <Button
                  key={seatNumber}
                  onClick={() => !isDisabled && handleSeatClick(seatNumber)}
                  disabled={isDisabled}
                  sx={{
                    minWidth: 35,
                    width: 35,
                    height: 35,
                    p: 0,
                    borderRadius: 1,
                    backgroundColor: getSeatColor(status),
                    '&:hover': {
                      backgroundColor: !isDisabled
                        ? status === 'selected'
                          ? 'primary.dark'
                          : 'success.main'
                        : 'text.disabled',
                      transform: !isDisabled ? 'scale(1.1)' : 'none'
                    },
                    transition: 'all 0.2s',
                    cursor: isDisabled ? 'not-allowed' : 'pointer'
                  }}
                >
                  <EventSeat
                    sx={{
                      fontSize: 20,
                      color: status === 'selected' ? 'white' : 'inherit'
                    }}
                  />
                </Button>
              );
            })}
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Selected Seats Display */}
      <Box>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Selected Seats ({selectedSeats.length}/{maxSeats})
        </Typography>
        {selectedSeats.length > 0 ? (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {selectedSeats.map((seat) => (
              <Chip
                key={seat}
                label={seat}
                onDelete={() => handleSeatClick(seat)}
                color="primary"
                icon={<EventSeat />}
              />
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No seats selected. Click on available seats to select.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default SeatSelector;
