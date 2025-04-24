import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Paper,
  Avatar,
  Tooltip,
  Divider
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, parseISO } from 'date-fns';

import MapIcon from '@mui/icons-material/Map';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import HotelIcon from '@mui/icons-material/Hotel';
import PersonIcon from '@mui/icons-material/Person';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import Chatbot from './Chatbot';

const drawerWidth = 260;
const chatWidth = {
  xs: '100%',
  sm: '380px',
  md: '400px'
};

const menuItems = [
  { text: 'Map', icon: <MapIcon />, path: '/' },
  { text: 'Matches', icon: <SportsSoccerIcon />, path: '/matches' },
  { text: 'Tickets', icon: <ConfirmationNumberIcon />, path: '/tickets' },
  { text: 'Accommodation', icon: <HotelIcon />, path: '/accommodation' },
  { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
];

const Layout = ({ 
  children, 
  currentDate, 
  updateDate, 
  fans,
  selectedFan,
  setSelectedFan,
  loading 
}) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleDateChange = (date) => {
    if (date) {
      updateDate(format(date, 'yyyy-MM-dd'));
    }
  };
  
  const handleFanChange = (event) => {
    const fanId = event.target.value;
    const fan = fans.find(f => f.id === fanId);
    if (fan) {
      setSelectedFan(fan);
    }
  };

  const toggleChat = () => {
    setChatOpen(!chatOpen);
  };
  
  const toggleMobileDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  const sidebarContent = (
    <>
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          mt: 1,
          mb: 2 
        }}
      >
        <Box
          component="img"
          src="/logo.png"
          alt="Dalil Logo"
          sx={{ 
            height: 42,
            filter: 'brightness(0) invert(1)',
            opacity: 0.9
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48dGV4dCB4PSI1MCIgeT0iNTAiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiI+V0MzNDwvdGV4dD48L3N2Zz4=';
          }}
        />
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            fontWeight: 'bold',
            fontSize: '1.2rem',
            ml: 1.5,
            background: 'linear-gradient(45deg, #fff 30%, #ccc 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Dalil
        </Typography>
      </Box>
      
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mx: 2, mb: 2 }} />
      
      <List component="nav" sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 1.5,
                py: 1,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  boxShadow: '0 4px 8px rgba(0, 82, 155, 0.25)',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontSize: '0.95rem',
                  fontWeight: location.pathname === item.path ? 600 : 400
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ flexGrow: 1 }} />
    </>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={toggleMobileDrawer}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#0A1929',
            color: 'white',
          },
        }}
      >
        {sidebarContent}
      </Drawer>
      
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            backgroundColor: '#0A1929',
            color: 'white',
            borderRight: 'none',
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      <Box 
        component="main" 
        className="fade-in"
        sx={{ 
          flexGrow: 1, 
          p: 0, 
          position: 'relative',
          bgcolor: 'background.default',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AppBar 
          position="sticky" 
          color="inherit" 
          elevation={0}
          sx={{ 
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleMobileDrawer}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs>
                <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                  {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
                </Typography>
              </Grid>
              
              <Grid item>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Tooltip title="Simulated Date">
                    <IconButton
                      size="small"
                      color="primary"
                      sx={{ mr: 0.5 }}
                    >
                      <CalendarTodayIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Simulated Date"
                      value={currentDate ? parseISO(currentDate) : null}
                      onChange={handleDateChange}
                      slotProps={{ 
                        textField: { 
                          size: 'small',
                          variant: 'outlined',
                          sx: { minWidth: 170 }
                        } 
                      }}
                      disabled={loading}
                    />
                  </LocalizationProvider>
                </Box>
              </Grid>
              
              <Grid item>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FormControl 
                    size="small" 
                    sx={{ 
                      minWidth: 150,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                      }
                    }}
                  >
                    <InputLabel>Select Fan</InputLabel>
                    <Select
                      value={selectedFan?.id || ''}
                      label="Select Fan"
                      onChange={handleFanChange}
                      disabled={loading}
                      IconComponent={() => <KeyboardArrowDownIcon color="action" sx={{ mr: 1 }} />}
                    >
                      {fans.map(fan => (
                        <MenuItem key={fan.id} value={fan.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar 
                              sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}
                            >
                              {fan.name.charAt(0)}
                            </Avatar>
                            <span>{fan.name}</span>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Tooltip title={chatOpen ? "Close Assistant" : "Open Assistant"}>
                    <IconButton
                      color={chatOpen ? "primary" : "default"}
                      onClick={toggleChat}
                      sx={{ 
                        bgcolor: chatOpen ? 'primary.lighter' : 'transparent',
                        '&:hover': {
                          bgcolor: chatOpen ? 'primary.lighter' : 'rgba(0, 0, 0, 0.04)'
                        }
                      }}
                    >
                      <ChatBubbleOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
        
        <Box sx={{ 
          display: 'flex', 
          flexGrow: 1,
          height: 'calc(100vh - 64px)',
          position: 'relative',
        }}>
          <Box sx={{ 
            flexGrow: 1, 
            height: '100%', 
            overflow: 'auto',
            p: { xs: 2, sm: 3 },
            width: chatOpen ? { xs: '100%', md: `calc(100% - ${chatWidth.md})` } : '100%',
            transition: 'width 0.3s ease',
          }}>
            {children}
          </Box>
          
          <Paper
            elevation={6}
            sx={{
              position: { xs: 'fixed', md: 'absolute' },
              right: 0,
              top: 0,
              height: '100%',
              width: chatOpen ? chatWidth : 0,
              transition: 'width 0.3s ease, transform 0.3s ease',
              transform: chatOpen ? 'translateX(0)' : 'translateX(100%)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 0,
              borderLeft: '1px solid rgba(0, 0, 0, 0.08)',
              bgcolor: '#fff',
              zIndex: { xs: 1200, md: 10 },
              maxWidth: { xs: '100%', sm: chatWidth.md }
            }}
          >
            {chatOpen && selectedFan && (
              <Chatbot fanId={selectedFan.id} />
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout; 