import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO, isToday } from 'date-fns';
import { 
  Box, 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Avatar,
  Skeleton,
  Stack,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StadiumIcon from '@mui/icons-material/Stadium';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const API_URL = process.env.REACT_APP_API_URL;

const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const MatchRow = ({ match, currentDate }) => {
  const matchDate = parseISO(match.date);
  const formattedDate = format(matchDate, 'MMM d, yyyy');
  const isPast = parseISO(currentDate) > matchDate;
  const isLive = isToday(matchDate) && parseISO(currentDate) >= matchDate;
  
  return (
    <TableRow 
      sx={{ 
        '&:last-child td, &:last-child th': { border: 0 },
        backgroundColor: isLive ? 'rgba(25, 118, 210, 0.08)' : isPast ? 'rgba(0, 0, 0, 0.04)' : 'inherit',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
      }}
    >
      <TableCell>{formattedDate}</TableCell>
      <TableCell>{match.time}</TableCell>
      <TableCell>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          fontWeight: match.winner === 'team_a' ? 700 : 400 
        }}>
          <Avatar 
            sx={{ 
              width: 24, 
              height: 24, 
              mr: 1, 
              fontSize: '0.75rem',
              bgcolor: match.winner === 'team_a' ? 'primary.main' : 'grey.300',
            }}
          >
            {match.team_a.charAt(0)}
          </Avatar>
          {match.team_a}
        </Box>
      </TableCell>
      <TableCell>
        {isLive && !match.result ? (
          <Chip 
            label="LIVE" 
            size="small" 
            color="error"
            sx={{ fontWeight: 600 }}
          />
        ) : match.result ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Chip 
              label={`${match.result.score_a} - ${match.result.score_b}`} 
              size="small" 
              color={match.winner ? "primary" : "default"}
              sx={{ fontWeight: 500 }}
            />
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center' }}>vs</Box>
        )}
      </TableCell>
      <TableCell>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          fontWeight: match.winner === 'team_b' ? 700 : 400,
          justifyContent: 'flex-end'
        }}>
          {match.team_b}
          <Avatar 
            sx={{ 
              width: 24, 
              height: 24, 
              ml: 1, 
              fontSize: '0.75rem',
              bgcolor: match.winner === 'team_b' ? 'primary.main' : 'grey.300',
            }}
          >
            {match.team_b.charAt(0)}
          </Avatar>
        </Box>
      </TableCell>
      <TableCell>
        {match.stage === 'group' ? (
          <Chip 
            label={`Group ${match.group}`} 
            size="small" 
            color="default" 
            variant="outlined"
            sx={{ borderRadius: 1 }}
          />
        ) : (
          <Chip 
            label={match.stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} 
            size="small" 
            color="primary" 
            variant="outlined"
            sx={{ borderRadius: 1 }}
          />
        )}
      </TableCell>
    </TableRow>
  );
};

const KnockoutBracket = ({ knockoutMatches }) => {
  const round16 = knockoutMatches.filter(match => match.stage === 'round_of_16');
  const quarterFinals = knockoutMatches.filter(match => match.stage === 'quarter_final');
  const semiFinals = knockoutMatches.filter(match => match.stage === 'semi_final');
  const final = knockoutMatches.filter(match => match.stage === 'final');
  
  const MatchCard = ({ match }) => {
    const matchDate = parseISO(match.date);
    const formattedDate = format(matchDate, 'MMM d');
    const hasResult = !!match.result;
    
    return (
      <Card 
        elevation={hasResult ? 0 : 2} 
        sx={{ 
          mb: 2, 
          backgroundColor: hasResult ? '#f8f9fa' : 'white',
          minWidth: '200px',
          borderRadius: 2,
          position: 'relative',
          overflow: 'visible',
          border: hasResult ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        {hasResult && match.winner && (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: -10, 
              right: -10, 
              width: 24, 
              height: 24, 
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}
          >
            <EmojiEventsIcon sx={{ fontSize: 14 }} />
          </Box>
        )}
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <CalendarTodayIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', mr: 1 }}>
              {formattedDate}
            </Typography>
            <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {match.time}
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 1,
            px: 1,
            py: 0.75,
            bgcolor: match.winner === match.team_a ? 'rgba(0, 82, 155, 0.08)' : 'transparent',
            borderRadius: 1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 28, 
                  height: 28, 
                  mr: 1,
                  bgcolor: match.winner === match.team_a ? 'primary.main' : 'grey.300',
                }}
              >
                {match.team_a.charAt(0)}
              </Avatar>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: match.winner === match.team_a ? 700 : 500
                }}
              >
                {match.team_a}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {match.result ? match.result.score_a : '-'}
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            px: 1,
            py: 0.75,
            bgcolor: match.winner === match.team_b ? 'rgba(0, 82, 155, 0.08)' : 'transparent',
            borderRadius: 1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 28, 
                  height: 28, 
                  mr: 1,
                  bgcolor: match.winner === match.team_b ? 'primary.main' : 'grey.300',
                }}
              >
                {match.team_b.charAt(0)}
              </Avatar>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: match.winner === match.team_b ? 700 : 500
                }}
              >
                {match.team_b}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {match.result ? match.result.score_b : '-'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <Box sx={{ overflowX: 'auto', pb: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        minWidth: '900px',
        p: 2
      }}>
        <Box sx={{ flex: 1, mr: 3 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              mb: 2, 
              textAlign: 'center', 
              fontWeight: 600,
              textTransform: 'uppercase',
              fontSize: '0.875rem',
              letterSpacing: 0.5,
              color: 'text.secondary'
            }}
          >
            Round of 16
          </Typography>
          {round16.map(match => (
            <MatchCard key={match.id} match={match} />
          ))}
        </Box>
        
        <Box sx={{ flex: 1, mr: 3 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              mb: 2, 
              textAlign: 'center', 
              fontWeight: 600,
              textTransform: 'uppercase',
              fontSize: '0.875rem',
              letterSpacing: 0.5,
              color: 'text.secondary'
            }}
          >
            Quarter Finals
          </Typography>
          {quarterFinals.map(match => (
            <MatchCard key={match.id} match={match} />
          ))}
        </Box>
        
        <Box sx={{ flex: 1, mr: 3 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              mb: 2, 
              textAlign: 'center', 
              fontWeight: 600,
              textTransform: 'uppercase',
              fontSize: '0.875rem',
              letterSpacing: 0.5,
              color: 'text.secondary'
            }}
          >
            Semi Finals
          </Typography>
          {semiFinals.map(match => (
            <MatchCard key={match.id} match={match} />
          ))}
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              mb: 2, 
              textAlign: 'center', 
              fontWeight: 600,
              textTransform: 'uppercase',
              fontSize: '0.875rem',
              letterSpacing: 0.5,
              color: 'text.secondary'
            }}
          >
            Final
          </Typography>
          {final.map(match => (
            <MatchCard key={match.id} match={match} />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

const GroupStandings = ({ groupMatches, onViewGroupMatches }) => {
  const matchesByGroup = {};
  const teamStats = {};
  
  groupLetters.forEach(letter => {
    matchesByGroup[letter] = groupMatches.filter(match => match.group === letter);
    
    const teamsInGroup = new Set();
    matchesByGroup[letter].forEach(match => {
      teamsInGroup.add(match.team_a);
      teamsInGroup.add(match.team_b);
    });
    
    teamsInGroup.forEach(team => {
      if (!teamStats[team]) {
        teamStats[team] = {
          group: letter,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0
        };
      }
    });
  });
  
  groupMatches.forEach(match => {
    if (match.result) {
      teamStats[match.team_a].played += 1;
      teamStats[match.team_a].goalsFor += match.result.score_a;
      teamStats[match.team_a].goalsAgainst += match.result.score_b;
      
      teamStats[match.team_b].played += 1;
      teamStats[match.team_b].goalsFor += match.result.score_b;
      teamStats[match.team_b].goalsAgainst += match.result.score_a;
      
      if (match.result.score_a > match.result.score_b) {
        teamStats[match.team_a].won += 1;
        teamStats[match.team_a].points += 3;
        teamStats[match.team_b].lost += 1;
      } else if (match.result.score_a < match.result.score_b) {
        teamStats[match.team_b].won += 1;
        teamStats[match.team_b].points += 3;
        teamStats[match.team_a].lost += 1;
      } else {
        teamStats[match.team_a].drawn += 1;
        teamStats[match.team_a].points += 1;
        teamStats[match.team_b].drawn += 1;
        teamStats[match.team_b].points += 1;
      }
    }
  });
  
  Object.keys(teamStats).forEach(team => {
    teamStats[team].goalDifference = teamStats[team].goalsFor - teamStats[team].goalsAgainst;
  });
  
  const teamsByGroup = {};
  Object.keys(teamStats).forEach(team => {
    const group = teamStats[team].group;
    if (!teamsByGroup[group]) {
      teamsByGroup[group] = [];
    }
    teamsByGroup[group].push({
      name: team,
      ...teamStats[team]
    });
  });
  
  Object.keys(teamsByGroup).forEach(group => {
    teamsByGroup[group].sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points;
      if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
  });
  
  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 1, 
        mb: 3,
        px: 1,
        justifyContent: 'center'
      }}>
        <Chip label="P = Played" size="small" />
        <Chip label="W = Won" size="small" />
        <Chip label="D = Drawn" size="small" />
        <Chip label="L = Lost" size="small" />
        <Chip label="GF:GA = Goals For:Goals Against" size="small" />
        <Chip label="+/- = Goal Difference" size="small" />
        <Chip label="Pts = Points" size="small" />
        <Chip 
          icon={<SportsSoccerIcon fontSize="small" />} 
          label="Top 2 teams qualify for knockout stage" 
          color="primary" 
          size="small" 
        />
      </Box>
      
      <Box sx={{ px: 1 }}>
        <Grid container spacing={3}>
          {Object.entries(teamsByGroup).map(([group, teams]) => (
            teams.length > 0 && (
              <Grid item xs={12} sm={6} md={6} lg={3} key={group}>
                <Paper sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  borderRadius: 2,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                    transform: 'translateY(-4px)'
                  }
                }}>
                  <Box sx={{ 
                    px: 2, 
                    py: 1.5, 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SportsSoccerIcon sx={{ mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Group {group}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => onViewGroupMatches(group)}
                      sx={{ 
                        color: 'white', 
                        borderColor: 'rgba(255,255,255,0.5)',
                        fontSize: '0.7rem',
                        py: 0.5,
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      View Matches
                    </Button>
                  </Box>
                  <TableContainer>
                    <Table size="small" sx={{ tableLayout: 'fixed' }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, width: '40px' }}>#</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Team</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, width: '40px' }}>P</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, width: '40px' }}>W</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, width: '40px' }}>D</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, width: '40px' }}>L</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, width: '50px' }}>GF:GA</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, width: '40px' }}>+/-</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, width: '40px' }}>Pts</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {teams.map((team, index) => (
                          <TableRow 
                            key={team.name}
                            sx={{
                              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                              backgroundColor: index < 2 ? 'rgba(0, 82, 155, 0.04)' : 'inherit',
                              borderLeft: index < 2 ? '4px solid #00529B' : 'none'
                            }}
                          >
                            <TableCell sx={{ pl: index < 2 ? 1 : 2 }}>{index + 1}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: index < 2 ? 'primary.main' : 'grey.300' }}>
                                  {team.name.charAt(0)}
                                </Avatar>
                                <Typography sx={{ fontWeight: index < 2 ? 600 : 400 }}>
                                  {team.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">{team.played}</TableCell>
                            <TableCell align="center">{team.won}</TableCell>
                            <TableCell align="center">{team.drawn}</TableCell>
                            <TableCell align="center">{team.lost}</TableCell>
                            <TableCell align="center">{team.goalsFor}:{team.goalsAgainst}</TableCell>
                            <TableCell align="center" sx={{ 
                              color: team.goalDifference > 0 ? 'success.main' : 
                                    team.goalDifference < 0 ? 'error.main' : 'text.secondary'
                            }}>
                              {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>{team.points}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            )
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

const MatchesPage = ({ currentDate, selectedFan }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [groupMatchesDialogOpen, setGroupMatchesDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/games`);
        setMatches(response.data);
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatches();
  }, [currentDate]);
  
  const groupMatches = matches.filter(match => match.stage === 'group');
  const knockoutMatches = matches.filter(match => match.stage !== 'group');
  
  const fanMatches = selectedFan?.attending_games
    ? matches.filter(match => selectedFan.attending_games.includes(match.id))
    : [];
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleOpenGroupMatches = (group) => {
    setSelectedGroup(group);
    setGroupMatchesDialogOpen(true);
  };
  
  const handleCloseGroupMatches = () => {
    setGroupMatchesDialogOpen(false);
  };
  
  if (loading) {
    return (
      <Box sx={{ py: 2 }}>
        <LinearProgress sx={{ mb: 3 }} />
        <Stack spacing={2}>
          {[1, 2, 3].map((item) => (
            <Skeleton 
              key={item} 
              variant="rectangular" 
              width="100%" 
              height={60} 
              sx={{ borderRadius: 1 }}
            />
          ))}
        </Stack>
      </Box>
    );
  }
  
  const todaysMatches = matches.filter(match => 
    isToday(parseISO(match.date))
  );
  
  return (
    <Box className="fade-in">
      {todaysMatches.length > 0 && (
        <Paper 
          elevation={2} 
          sx={{ 
            mb: 4, 
            borderRadius: 2,
            overflow: 'hidden',
            background: 'linear-gradient(45deg, #00529B 30%, #1976d2 90%)',
          }}
        >
          <Box sx={{ p: 2, color: 'white' }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              Today's Matches
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {todaysMatches.map(match => (
                <Card 
                  key={match.id} 
                  sx={{ 
                    minWidth: 250,
                    borderRadius: 1.5,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip 
                        size="small" 
                        label={match.time} 
                        icon={<AccessTimeIcon />} 
                        sx={{ borderRadius: 1 }}
                      />
                      <Chip 
                        size="small" 
                        label={match.stage === 'group' ? `Group ${match.group}` : match.stage.replace(/_/g, ' ')} 
                        color="primary"
                        variant="outlined"
                        sx={{ borderRadius: 1 }}
                      />
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      mb: 0.5 
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            width: 28, 
                            height: 28, 
                            mr: 1,
                            bgcolor: match.winner === match.team_a ? 'primary.main' : 'grey.300',
                            fontWeight: 500
                          }}
                        >
                          {match.team_a.charAt(0)}
                        </Avatar>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {match.team_a}
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {match.result ? match.result.score_a : '-'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between' 
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            width: 28, 
                            height: 28, 
                            mr: 1,
                            bgcolor: match.winner === match.team_b ? 'primary.main' : 'grey.300',
                            fontWeight: 500
                          }}
                        >
                          {match.team_b.charAt(0)}
                        </Avatar>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {match.team_b}
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {match.result ? match.result.score_b : '-'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </Paper>
      )}
      
      <Paper 
        sx={{ 
          mb: 3, 
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            bgcolor: '#f5f9ff'
          }}
          variant="fullWidth"
        >
          <Tab 
            label="All Matches" 
            sx={{ 
              textTransform: 'none', 
              fontWeight: 600, 
              py: 1.5 
            }} 
          />
          <Tab 
            label="Group Stage" 
            sx={{ 
              textTransform: 'none', 
              fontWeight: 600, 
              py: 1.5 
            }} 
          />
          <Tab 
            label="Knockout Stage" 
            sx={{ 
              textTransform: 'none', 
              fontWeight: 600, 
              py: 1.5 
            }} 
          />
          {selectedFan && (
            <Tab 
              label="My Matches" 
              sx={{ 
                textTransform: 'none', 
                fontWeight: 600, 
                py: 1.5 
              }} 
            />
          )}
        </Tabs>
        
        <Box sx={{ p: { xs: 1, sm: 2 } }}>
          {tabValue === 0 && (
            <Box>
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Team 1</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Team 2</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Stage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {matches.map(match => (
                      <MatchRow 
                        key={match.id} 
                        match={match} 
                        currentDate={currentDate} 
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
          
          {tabValue === 1 && (
            <GroupStandings 
              groupMatches={groupMatches} 
              onViewGroupMatches={handleOpenGroupMatches}
            />
          )}
          
          {tabValue === 2 && (
            <KnockoutBracket knockoutMatches={knockoutMatches} />
          )}

          {tabValue === 3 && selectedFan && (
            <Box>
              {fanMatches.length > 0 ? (
                <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Team 1</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Team 2</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Stage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fanMatches.map(match => (
                        <MatchRow 
                          key={match.id} 
                          match={match} 
                          currentDate={currentDate} 
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Box 
                    sx={{ 
                      p: 2,
                      mb: 2,
                      borderRadius: '50%',
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                      width: 80,
                      height: 80,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto'
                    }}
                  >
                    <StadiumIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    No matches in your schedule
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    You don't have any matches in your schedule yet.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => {
                      setTabValue(0);
                    }}
                  >
                    Browse Matches
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Paper>
      
      {selectedGroup && (
        <Dialog
          open={groupMatchesDialogOpen}
          onClose={handleCloseGroupMatches}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SportsSoccerIcon sx={{ mr: 1 }} />
              Group {selectedGroup} Matches
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Team 1</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Team 2</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupMatches
                    .filter(match => match.group === selectedGroup)
                    .map(match => (
                      <TableRow key={match.id}>
                        <TableCell>{format(parseISO(match.date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{match.time}</TableCell>
                        <TableCell>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            fontWeight: match.winner === 'team_a' ? 700 : 400 
                          }}>
                            <Avatar 
                              sx={{ 
                                width: 24, 
                                height: 24, 
                                mr: 1, 
                                fontSize: '0.75rem',
                                bgcolor: match.winner === 'team_a' ? 'primary.main' : 'grey.300',
                              }}
                            >
                              {match.team_a.charAt(0)}
                            </Avatar>
                            {match.team_a}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {match.result ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                              <Chip 
                                label={`${match.result.score_a} - ${match.result.score_b}`} 
                                size="small" 
                                color={match.winner ? "primary" : "default"}
                                sx={{ fontWeight: 500 }}
                              />
                            </Box>
                          ) : (
                            <Box sx={{ textAlign: 'center' }}>vs</Box>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            fontWeight: match.winner === 'team_b' ? 700 : 400,
                            justifyContent: 'flex-start'
                          }}>
                            <Avatar 
                              sx={{ 
                                width: 24, 
                                height: 24, 
                                mr: 1, 
                                fontSize: '0.75rem',
                                bgcolor: match.winner === 'team_b' ? 'primary.main' : 'grey.300',
                              }}
                            >
                              {match.team_b.charAt(0)}
                            </Avatar>
                            {match.team_b}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseGroupMatches}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default MatchesPage; 