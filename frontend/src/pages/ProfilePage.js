import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Avatar, 
  Chip,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert
} from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import HotelIcon from '@mui/icons-material/Hotel';
import LanguageIcon from '@mui/icons-material/Language';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';

const ProfilePage = ({ selectedFan }) => {
  if (!selectedFan) {
    return (
      <Alert severity="info">
        Please select a fan to view their profile.
      </Alert>
    );
  }
  
  const getRandomColor = (seed) => {
    const colors = [
      '#1976d2', '#dc004e', '#9c27b0', '#2e7d32', 
      '#ed6c02', '#0288d1', '#5d4037', '#455a64'
    ];
    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  
  const getFanInitials = (name) => {
    return name.split(' ').map(part => part[0]).join('');
  };
  
  const getCountryFlag = (nationality) => {
    const countryMapping = {
      'Saudi Arabia': '🇸🇦',
      'England': '🇬🇧',
      'Spain': '🇪🇸',
      'Japan': '🇯🇵',
      'France': '🇫🇷',
      'Germany': '🇩🇪',
      'Brazil': '🇧🇷',
      'Mexico': '🇲🇽',
      'United States': '🇺🇸',
      'USA': '🇺🇸',
    };
    
    return countryMapping[nationality] || '🏳️';
  };
  
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                width: 120, 
                height: 120, 
                mb: 2,
                bgcolor: getRandomColor(selectedFan.name),
                fontSize: '2.5rem'
              }}
            >
              {getFanInitials(selectedFan.name)}
            </Avatar>
            <Typography variant="h5" gutterBottom>{selectedFan.name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ mr: 1 }}>
                {getCountryFlag(selectedFan.nationality)}
              </Typography>
              <Typography variant="subtitle1">
                {selectedFan.nationality}
              </Typography>
            </Box>
            <Chip 
              icon={<SportsSoccerIcon />} 
              label={`Supporting ${selectedFan.team_supported}`}
              color="primary"
              sx={{ mt: 1 }}
            />
          </Grid>
          
          <Grid xs={12} md={8}>
            <Typography variant="h6" gutterBottom>Fan Information</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid xs={12}>
                <List disablePadding>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Name" 
                      secondary={selectedFan.name} 
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <FlagIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Nationality" 
                      secondary={selectedFan.nationality} 
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <LanguageIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Language" 
                      secondary={selectedFan.language} 
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <SportsSoccerIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Team Supported" 
                      secondary={selectedFan.team_supported} 
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      
      <Typography variant="h6" sx={{ mb: 2 }}>Preferences</Typography>
      
      <Grid container spacing={3}>
        {selectedFan.preferences && Object.entries(selectedFan.preferences).map(([category, values]) => (
          <Grid xs={12} sm={6} md={4} key={category}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Array.isArray(values) ? (
                    values.map(value => (
                      <Chip 
                        key={value}
                        label={value}
                        size="small"
                        icon={
                          category === 'food' ? <RestaurantIcon fontSize="small" /> :
                          category === 'activities' ? <LocalActivityIcon fontSize="small" /> :
                          category === 'transport' ? <DirectionsCarIcon fontSize="small" /> :
                          null
                        }
                      />
                    ))
                  ) : (
                    <Chip 
                      label={values}
                      size="small"
                      icon={
                        category === 'transport' ? <DirectionsCarIcon fontSize="small" /> :
                        null
                      }
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Typography variant="h6" sx={{ my: 2 }}>Trip Summary</Typography>
      
      <Grid container spacing={3}>
        <Grid xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SportsSoccerIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1">
                  Matches Attending
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ textAlign: 'center' }}>
                {selectedFan.attending_games ? selectedFan.attending_games.length : 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HotelIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1">
                  Hotel Stays
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ textAlign: 'center' }}>
                {selectedFan.hotel_stays ? selectedFan.hotel_stays.length : 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage; 