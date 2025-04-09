import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
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
  Skeleton,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import StadiumIcon from '@mui/icons-material/Stadium';

const API_URL = process.env.REACT_APP_API_URL;

const TicketCard = ({ match, stadium }) => {
  const matchDate = parseISO(match.date);
  const formattedDate = format(matchDate, 'EEE, MMM d, yyyy');
  
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="140"
        image={`https://source.unsplash.com/featured/300x200/?stadium,${stadium.name}`}
        alt={stadium.name}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div">
            {match.team_a} vs {match.team_b}
          </Typography>
          <Chip 
            label={match.stage === 'group' ? `Group ${match.group}` : match.stage.replace(/_/g, ' ')} 
            size="small" 
            color={match.stage === 'group' ? 'default' : 'primary'}
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <StadiumIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {stadium.name}, {stadium.city}
          </Typography>
        </Box>
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          {formattedDate} • {match.time}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Seat: Gate A • Section 103 • Row 12 • Seat 25
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<QrCodeIcon />}
          >
            Show QR
          </Button>
          
          <Button 
            variant="outlined" 
            size="small" 
            color="secondary"
            startIcon={<ConfirmationNumberIcon />}
          >
            Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

const BuyTicketDialog = ({ open, handleClose, matches, stadiums }) => {
  const [selectedMatch, setSelectedMatch] = useState('');
  
  const handleSubmit = () => {
    handleClose();
  };
  
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Buy Ticket</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Select a match to purchase a ticket. This is a demo feature, no actual purchase will be made.
        </DialogContentText>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Match</InputLabel>
          <Select
            value={selectedMatch}
            label="Match"
            onChange={(e) => setSelectedMatch(e.target.value)}
          >
            {matches.map((match) => {
              const stadium = stadiums.find(s => s.id === match.stadium_id);
              return (
                <MenuItem key={match.id} value={match.id}>
                  {match.team_a} vs {match.team_b} • {match.date} • {stadium?.name || 'Unknown Stadium'}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!selectedMatch}>
          Buy Ticket
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const TicketsPage = ({ selectedFan }) => {
  const [tickets, setTickets] = useState([]);
  const [availableMatches, setAvailableMatches] = useState([]);
  const [stadiums, setStadiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openBuyDialog, setOpenBuyDialog] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const stadiumsRes = await axios.get(`${API_URL}/stadiums`);
        setStadiums(stadiumsRes.data);
        
        const gamesRes = await axios.get(`${API_URL}/games`);
        
        if (selectedFan) {
          const fanTickets = gamesRes.data.filter(game => 
            selectedFan.attending_games && selectedFan.attending_games.includes(game.id)
          );
          setTickets(fanTickets);
          
          const available = gamesRes.data.filter(game => 
            !selectedFan.attending_games || !selectedFan.attending_games.includes(game.id)
          );
          setAvailableMatches(available);
        } else {
          setTickets([]);
          setAvailableMatches(gamesRes.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedFan]);
  
  const handleOpenBuyDialog = () => {
    setOpenBuyDialog(true);
  };
  
  const handleCloseBuyDialog = () => {
    setOpenBuyDialog(false);
  };
  
  if (loading) {
    return (
      <Box>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Skeleton variant="text" width="30%" height={40} />
          <Skeleton variant="text" width="50%" />
          <Skeleton variant="text" width="40%" />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Skeleton variant="rectangular" width={120} height={36} />
          </Box>
        </Paper>
        
        <Grid container spacing={3}>
          {[1, 2, 3].map((_, index) => (
            <Grid xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="rectangular" height={300} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }
  
  if (!selectedFan) {
    return (
      <Alert severity="info">
        Please select a fan to view their tickets.
      </Alert>
    );
  }
  
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          My Tickets
        </Typography>
        <Typography variant="body1" paragraph>
          {selectedFan.name}'s tickets for the World Cup 2034. Use the QR code for entry to the stadium.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            onClick={handleOpenBuyDialog}
            startIcon={<ConfirmationNumberIcon />}
          >
            Buy New Ticket
          </Button>
        </Box>
      </Paper>
      
      {tickets.length > 0 ? (
        <Grid container spacing={3}>
          {tickets.map(ticket => {
            const stadium = stadiums.find(s => s.id === ticket.stadium_id);
            return stadium && (
              <Grid xs={12} sm={6} md={4} key={ticket.id}>
                <TicketCard match={ticket} stadium={stadium} />
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Alert severity="info" sx={{ mt: 2 }}>
          No tickets found. Purchase tickets to attend matches.
        </Alert>
      )}
      
      <BuyTicketDialog 
        open={openBuyDialog} 
        handleClose={handleCloseBuyDialog} 
        matches={availableMatches}
        stadiums={stadiums}
      />
    </Box>
  );
};

export default TicketsPage; 