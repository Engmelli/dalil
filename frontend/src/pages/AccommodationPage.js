import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO, isWithinInterval, addDays } from 'date-fns';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Chip,
  Paper,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Rating,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HotelIcon from '@mui/icons-material/Hotel';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WifiIcon from '@mui/icons-material/Wifi';
import PoolIcon from '@mui/icons-material/Pool';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SpaIcon from '@mui/icons-material/Spa';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';

const API_URL = process.env.REACT_APP_API_URL;

const amenityIcons = {
  wifi: <WifiIcon fontSize="small" />,
  pool: <PoolIcon fontSize="small" />,
  gym: <FitnessCenterIcon fontSize="small" />,
  restaurant: <RestaurantIcon fontSize="small" />,
  spa: <SpaIcon fontSize="small" />,
  room_service: <RoomServiceIcon fontSize="small" />,
  business_center: <BusinessCenterIcon fontSize="small" />,
  beach_access: <BeachAccessIcon fontSize="small" />
};

const HotelCard = ({ hotel, stay, isActive }) => {
  const checkIn = parseISO(stay.check_in);
  const checkOut = parseISO(stay.check_out);
  const formattedCheckIn = format(checkIn, 'EEE, MMM d, yyyy');
  const formattedCheckOut = format(checkOut, 'EEE, MMM d, yyyy');
  const nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  
  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      border: isActive ? '2px solid #1976d2' : 'none'
    }}>
      {isActive && (
        <Box sx={{ 
          backgroundColor: '#1976d2', 
          color: 'white', 
          py: 0.5, 
          px: 2, 
          display: 'flex',
          alignItems: 'center'
        }}>
          <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">Currently Staying Here</Typography>
        </Box>
      )}
      
      <CardMedia
        component="img"
        height="160"
        image={`https://source.unsplash.com/featured/300x200/?hotel,${hotel.name}`}
        alt={hotel.name}
      />
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="div">
            {hotel.name}
          </Typography>
          <Rating value={hotel.rating} readOnly size="small" />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {hotel.city}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Check-in:</strong> {formattedCheckIn}
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Check-out:</strong> {formattedCheckOut}
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 2 }}>
          <strong>Duration:</strong> {nights} {nights === 1 ? 'night' : 'nights'}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Amenities:</strong>
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {hotel.amenities.slice(0, 5).map(amenity => (
              <Chip 
                key={amenity}
                icon={amenityIcons[amenity] || <HotelIcon fontSize="small" />}
                label={amenity.replace('_', ' ')}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
        
        <Button 
          variant="outlined" 
          fullWidth
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

const BookDialog = ({ open, handleClose, hotels }) => {
  const [selectedHotel, setSelectedHotel] = useState('');
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  
  const handleSubmit = () => {
    handleClose();
  };
  
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Book Accommodation</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Select a hotel and dates for your stay. This is a demo feature, no actual booking will be made.
        </DialogContentText>
        
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Hotel</InputLabel>
          <Select
            value={selectedHotel}
            label="Hotel"
            onChange={(e) => setSelectedHotel(e.target.value)}
          >
            {hotels.map((hotel) => (
              <MenuItem key={hotel.id} value={hotel.id}>
                {hotel.name} ({hotel.city}) - {hotel.rating} ★
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Grid container spacing={2}>
          <Grid xs={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Check-in Date"
                value={checkIn}
                onChange={setCheckIn}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid xs={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Check-out Date"
                value={checkOut}
                onChange={setCheckOut}
                slotProps={{ textField: { fullWidth: true } }}
                minDate={checkIn ? addDays(checkIn, 1) : undefined}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!selectedHotel || !checkIn || !checkOut}
        >
          Book Now
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AccommodationPage = ({ selectedFan }) => {
  const [hotels, setHotels] = useState([]);
  const [hotelStays, setHotelStays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [openBookDialog, setOpenBookDialog] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const hotelsRes = await axios.get(`${API_URL}/hotels`);
        setHotels(hotelsRes.data);
        
        const dateRes = await axios.get(`${API_URL}/date`);
        setCurrentDate(parseISO(dateRes.data.date));
        
        if (selectedFan && selectedFan.hotel_stays) {
          const stays = selectedFan.hotel_stays.map(stay => {
            const hotel = hotelsRes.data.find(h => h.id === stay.hotel_id);
            const checkIn = parseISO(stay.check_in);
            const checkOut = parseISO(stay.check_out);
            
            return {
              ...stay,
              hotel,
              isActive: currentDate && isWithinInterval(parseISO(dateRes.data.date), {
                start: checkIn,
                end: addDays(checkOut, -1)
              })
            };
          });
          
          stays.sort((a, b) => parseISO(a.check_in) - parseISO(b.check_in));
          setHotelStays(stays);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedFan]);
  
  const handleOpenBookDialog = () => {
    setOpenBookDialog(true);
  };
  
  const handleCloseBookDialog = () => {
    setOpenBookDialog(false);
  };
  
  if (loading) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography>Loading accommodation data...</Typography>
      </Box>
    );
  }
  
  if (!selectedFan) {
    return (
      <Alert severity="info">
        Please select a fan to view their accommodation.
      </Alert>
    );
  }
  
  const activeStay = hotelStays.find(stay => stay.isActive);
  
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          My Accommodation
        </Typography>
        <Typography variant="body1" paragraph>
          {selectedFan.name}'s accommodation bookings for the World Cup 2034.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            onClick={handleOpenBookDialog}
            startIcon={<HotelIcon />}
          >
            Book Accommodation
          </Button>
        </Box>
      </Paper>
      
      {activeStay && (
        <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
          <Typography variant="h6" gutterBottom>
            Current Stay
          </Typography>
          <Typography variant="body2" paragraph>
            You're currently staying at {activeStay.hotel.name} in {activeStay.hotel.city}.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2">
              Checking out on {format(parseISO(activeStay.check_out), 'EEEE, MMMM d, yyyy')}
            </Typography>
          </Box>
        </Paper>
      )}
      
      {hotelStays.length > 0 ? (
        <>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Accommodation Timeline
          </Typography>
          
          <Stepper orientation="vertical" sx={{ mb: 3 }}>
            {hotelStays.map((stay, index) => (
              <Step key={index} active={stay.isActive} completed={parseISO(stay.check_out) < currentDate}>
                <StepLabel 
                  StepIconProps={{ 
                    icon: <HotelIcon />,
                  }}
                >
                  <Typography variant="subtitle1">
                    {stay.hotel.name}, {stay.hotel.city}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {format(parseISO(stay.check_in), 'MMM d')} - {format(parseISO(stay.check_out), 'MMM d, yyyy')}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Hotel Details
          </Typography>
          
          <Grid container spacing={3}>
            {hotelStays.map((stay, index) => (
              <Grid xs={12} sm={6} md={4} key={index}>
                <HotelCard 
                  hotel={stay.hotel} 
                  stay={stay} 
                  isActive={stay.isActive} 
                />
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <Alert severity="info">
          No accommodation bookings found. Book hotels for your stay.
        </Alert>
      )}
      
      <BookDialog 
        open={openBookDialog} 
        handleClose={handleCloseBookDialog} 
        hotels={hotels}
      />
    </Box>
  );
};

export default AccommodationPage; 