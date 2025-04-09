import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Box, Paper, Typography, FormGroup, FormControlLabel, Checkbox, Card, CardMedia, CardContent, Modal } from '@mui/material';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const API_URL = process.env.REACT_APP_API_URL;
const locationTypes = {
  stadium: { color: '#e74c3c', label: 'Stadiums' },
  hotel: { color: '#3498db', label: 'Hotels' },
  attraction: { color: '#2ecc71', label: 'Attractions' },
  restaurant: { color: '#f39c12', label: 'Restaurants' }
};

const MapPage = ({ currentDate, selectedFan }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(45);
  const [lat, setLat] = useState(24);
  const [zoom, setZoom] = useState(5);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [filters, setFilters] = useState(Object.keys(locationTypes).reduce((acc, type) => {
    acc[type] = true;
    return acc;
  }, {}));

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const stadiumsRes = await axios.get(`${API_URL}/stadiums`);
        const stadiums = stadiumsRes.data.map(stadium => ({
          ...stadium,
          type: 'stadium',
          image: `https://source.unsplash.com/featured/300x200/?stadium,${stadium.name}`
        }));
        
        const hotelsRes = await axios.get(`${API_URL}/hotels`);
        const hotels = hotelsRes.data.map(hotel => ({
          ...hotel,
          type: 'hotel',
          image: `https://source.unsplash.com/featured/300x200/?hotel,${hotel.name}`
        }));
        
        const restaurantsRes = await axios.get(`${API_URL}/restaurants`);
        const restaurants = restaurantsRes.data.map(restaurant => ({
          ...restaurant,
          type: 'restaurant',
          lat: restaurant.location.latitude,
          lon: restaurant.location.longitude,
          image: restaurant.image_url || `https://source.unsplash.com/featured/300x200/?restaurant,${restaurant.cuisine}`
        }));
        
        const attractionsRes = await axios.get(`${API_URL}/attractions`);
        const attractions = attractionsRes.data.map(attraction => ({
          ...attraction,
          type: 'attraction',
          lat: attraction.location.latitude,
          lon: attraction.location.longitude,
          image: attraction.image_url || `https://source.unsplash.com/featured/300x200/?attraction,${attraction.name}`
        }));
        
        const allLocations = [...stadiums, ...hotels, ...restaurants, ...attractions];
        
        setLocations(allLocations);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    
    fetchLocations();
  }, []);

  useEffect(() => {
    if (map.current) return;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom
    });
    
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  }, [lng, lat, zoom]);
  
  useEffect(() => {
    if (!map.current || locations.length === 0) return;
    
    const existingMarkers = document.getElementsByClassName('mapboxgl-marker');
    while(existingMarkers[0]) {
      existingMarkers[0].parentNode.removeChild(existingMarkers[0]);
    }
    
    const filteredLocations = locations.filter(location => filters[location.type]);
    
    filteredLocations.forEach(location => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundColor = locationTypes[location.type].color;
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';
      
      new mapboxgl.Marker(el)
        .setLngLat([location.lon, location.lat])
        .addTo(map.current)
        .getElement()
        .addEventListener('click', () => {
          setSelectedLocation(location);
        });
    });
  }, [locations, filters]);

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.checked
    });
  };

  const handleCloseModal = () => {
    setSelectedLocation(null);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Paper sx={{ p: 2, flexGrow: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Filters</Typography>
          <FormGroup row>
            {Object.entries(locationTypes).map(([type, { label, color }]) => (
              <FormControlLabel
                key={type}
                control={
                  <Checkbox
                    checked={filters[type]}
                    onChange={handleFilterChange}
                    name={type}
                    sx={{
                      color,
                      '&.Mui-checked': {
                        color,
                      },
                    }}
                  />
                }
                label={label}
              />
            ))}
          </FormGroup>
        </Paper>
      </Box>
      
      <Paper 
        ref={mapContainer} 
        sx={{ 
          flexGrow: 1, 
          minHeight: '500px',
          width: '100%',
          borderRadius: 1,
          overflow: 'hidden'
        }} 
      />
      
      <Modal
        open={Boolean(selectedLocation)}
        onClose={handleCloseModal}
        aria-labelledby="location-modal-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 0,
          borderRadius: 2,
          outline: 'none'
        }}>
          {selectedLocation && (
            <Card sx={{ width: '100%' }}>
              <CardMedia
                component="img"
                height="200"
                image={selectedLocation.image}
                alt={selectedLocation.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {selectedLocation.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {selectedLocation.city}
                </Typography>
                <Typography variant="body2" color="text.primary">
                  {selectedLocation.description}
                </Typography>
                
                {selectedLocation.type === 'stadium' && (
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Capacity: {selectedLocation.capacity.toLocaleString()} seats
                  </Typography>
                )}
                
                {selectedLocation.type === 'hotel' && (
                  <>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Rating: {selectedLocation.rating} / 5
                    </Typography>
                    <Typography variant="body2">
                      Amenities: {selectedLocation.amenities.join(', ')}
                    </Typography>
                  </>
                )}
                
                {selectedLocation.type === 'restaurant' && (
                  <>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Cuisine: {selectedLocation.cuisine}
                    </Typography>
                    <Typography variant="body2">
                      Rating: {selectedLocation.rating} / 5
                    </Typography>
                    <Typography variant="body2">
                      Price Range: {selectedLocation.price_range}
                    </Typography>
                    <Typography variant="body2">
                      Hours: {selectedLocation.hours}
                    </Typography>
                    {selectedLocation.popular_dishes && (
                      <Typography variant="body2">
                        Popular Dishes: {selectedLocation.popular_dishes.join(', ')}
                      </Typography>
                    )}
                    {selectedLocation.near_stadium && (
                      <Typography variant="body2">
                        Near: {selectedLocation.near_stadium}
                      </Typography>
                    )}
                  </>
                )}
                
                {selectedLocation.type === 'attraction' && (
                  <>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Type: {selectedLocation.type_name || selectedLocation.type}
                    </Typography>
                    <Typography variant="body2">
                      Rating: {selectedLocation.rating} / 5
                    </Typography>
                    {selectedLocation.hours && (
                      <Typography variant="body2">
                        Hours: {selectedLocation.hours}
                      </Typography>
                    )}
                    {selectedLocation.price_range && (
                      <Typography variant="body2">
                        Price Range: {selectedLocation.price_range}
                      </Typography>
                    )}
                    {selectedLocation.suggested_visit_length && (
                      <Typography variant="body2">
                        Suggested Visit: {selectedLocation.suggested_visit_length}
                      </Typography>
                    )}
                    {selectedLocation.near_stadium && (
                      <Typography variant="body2">
                        Near: {selectedLocation.near_stadium}
                      </Typography>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default MapPage; 