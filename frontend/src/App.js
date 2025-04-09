import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Layout from './components/Layout';

import MapPage from './pages/MapPage';
import MatchesPage from './pages/MatchesPage';
import TicketsPage from './pages/TicketsPage';
import AccommodationPage from './pages/AccommodationPage';
import ProfilePage from './pages/ProfilePage';

const API_URL = process.env.REACT_APP_API_URL;

const theme = createTheme({
  palette: {
    primary: {
      main: '#00529B',
      light: '#3378B1',
      dark: '#003C72',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F44336',
      light: '#F6685E',
      dark: '#AA2E25',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A2027',
      secondary: '#637381',
    },
    success: {
      main: '#2E7D32',
    },
    info: {
      main: '#0288D1',
    },
    warning: {
      main: '#ED6C02',
    },
    error: {
      main: '#D32F2F',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.05)',
    '0px 4px 8px rgba(0, 0, 0, 0.1)',
    ...Array(22).fill(''),
  ].map((shadow, index) => index < 3 ? shadow : createTheme().shadows[index]),
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
        },
      },
    },
  },
});

function App() {
  const [currentDate, setCurrentDate] = useState('');
  const [fans, setFans] = useState([]);
  const [selectedFan, setSelectedFan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const dateResponse = await axios.get(`${API_URL}/date`);
        setCurrentDate(dateResponse.data.date);
        
        const fanResponse = await axios.get(`${API_URL}/fans`);
        setFans(fanResponse.data);
        setSelectedFan(fanResponse.data[0]);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const updateDate = async (newDate) => {
    try {
      const response = await axios.put(`${API_URL}/date`, { date: newDate });
      setCurrentDate(response.data.date);
    } catch (error) {
      console.error('Error updating date:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout 
          currentDate={currentDate} 
          updateDate={updateDate}
          fans={fans}
          selectedFan={selectedFan}
          setSelectedFan={setSelectedFan}
          loading={loading}
        >
          <Routes>
            <Route path="/" element={<MapPage currentDate={currentDate} selectedFan={selectedFan} />} />
            <Route path="/matches" element={<MatchesPage currentDate={currentDate} selectedFan={selectedFan} />} />
            <Route path="/tickets" element={<TicketsPage selectedFan={selectedFan} />} />
            <Route path="/accommodation" element={<AccommodationPage selectedFan={selectedFan} />} />
            <Route path="/profile" element={<ProfilePage selectedFan={selectedFan} />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
