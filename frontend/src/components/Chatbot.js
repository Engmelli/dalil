import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  IconButton, 
  Paper, 
  Avatar, 
  CircularProgress,
  Divider,
  Tooltip,
  Fade,
  useTheme,
  useMediaQuery
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const formatMessageText = (text) => {
  let formattedText = text.replace(/```([\s\S]*?)```/g, (match, codeContent) => {
    return `<pre class="code-block"><code>${codeContent.trim()}</code></pre>`;
  });
  
  formattedText = formattedText.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  
  formattedText = formattedText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  formattedText = formattedText.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  formattedText = formattedText.replace(/^\s*[-*]\s+(.*?)$/gm, '<li>$1</li>');
  formattedText = formattedText.replace(/<li>(.*?)<\/li>/g, '<ul><li>$1</li></ul>');
  formattedText = formattedText.replace(/<\/ul>\s*<ul>/g, '');
  
  formattedText = formattedText.replace(/\n/g, '<br />');
  
  return formattedText;
};

const Message = ({ text, isUser, isNew }) => {
  const messageContent = isUser ? (
    <Typography variant="body2">{text}</Typography>
  ) : (
    <Typography 
      variant="body2" 
      component="div" 
      dangerouslySetInnerHTML={{ __html: formatMessageText(text) }}
      sx={{
        '& code.inline-code': {
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          padding: '2px 4px',
          borderRadius: '3px',
          fontFamily: 'monospace',
          fontSize: '0.9em',
        },
        '& pre.code-block': {
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          padding: '8px 12px',
          borderRadius: '4px',
          overflowX: 'auto',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          fontSize: '0.9em',
          margin: '8px 0',
        },
        '& ul': {
          paddingLeft: '20px',
          margin: '8px 0',
        },
        '& li': {
          marginBottom: '4px',
        },
        '& strong': {
          fontWeight: 600,
        },
        '& em': {
          fontStyle: 'italic',
        },
      }}
    />
  );

  return (
    <Fade in={true} timeout={isNew ? 500 : 0}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          mb: 2,
          maxWidth: '100%',
        }}
      >
        {!isUser && (
          <Avatar 
            sx={{ 
              bgcolor: '#00529B', 
              width: 32, 
              height: 32, 
              mr: 1,
              mt: 0.5,
              boxShadow: '0 2px 4px rgba(0, 82, 155, 0.25)',
            }}
          >
            <SmartToyOutlinedIcon sx={{ width: 18, height: 18 }} />
          </Avatar>
        )}
        
        <Paper
          elevation={isUser ? 1 : 0}
          sx={{
            p: 1.5,
            borderRadius: 2,
            maxWidth: { xs: 'calc(100% - 50px)', sm: 'calc(100% - 60px)' },
            width: isUser ? 'auto' : { xs: 'calc(100% - 50px)', sm: 'calc(100% - 60px)' },
            backgroundColor: isUser ? '#00529B' : '#f5f9ff',
            color: isUser ? 'white' : '#1A2027',
            border: isUser ? 'none' : '1px solid #e0e9f8',
            wordBreak: 'break-word',
          }}
        >
          {messageContent}
        </Paper>
        
        {isUser && (
          <Avatar 
            sx={{ 
              bgcolor: '#eeeeee', 
              width: 32, 
              height: 32, 
              ml: 1,
              mt: 0.5,
              color: '#1A2027',
            }}
          >
            U
          </Avatar>
        )}
      </Box>
    </Fade>
  );
};

const Chatbot = ({ fanId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [newMessageIndex, setNewMessageIndex] = useState(-1);
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await axios.get(`${API_URL}/chat_history?user_id=${fanId}`);
        
        if (response.data.chat_history && response.data.chat_history.length > 0) {
          const formattedMessages = response.data.chat_history.map(msg => ({
            text: msg.content,
            isUser: msg.type === 'human'
          }));
          setMessages(formattedMessages);
        } else {
          const welcomeMessage = "Hello! I'm your World Cup 2034 assistant. How can I help you today?";
          setMessages([{ 
            text: welcomeMessage,
            isUser: false
          }]);
          
          try {
            await axios.post(`${API_URL}/chat`, {
              message: "__welcome_message__",
              user_id: fanId
            });
          } catch (error) {
            console.error('Error saving welcome message:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
        const welcomeMessage = "Hello! I'm your World Cup 2034 assistant. How can I help you today?";
        setMessages([{ 
          text: welcomeMessage,
          isUser: false
        }]);
      } finally {
        setInitialLoading(false);
      }
    };

    if (fanId) {
      fetchChatHistory();
    }
  }, [fanId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '') return;
    
    const userMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setNewMessageIndex(messages.length);
    
    try {
      const response = await axios.post(`${API_URL}/chat`, {
        message: input,
        user_id: fanId
      });
      
      const aiMessage = { 
        text: response.data.response, 
        isUser: false 
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setNewMessageIndex(messages.length + 1);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { 
        text: "Sorry, I couldn't process your request. Please try again later.", 
        isUser: false 
      };
      setMessages(prev => [...prev, errorMessage]);
      setNewMessageIndex(messages.length + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = async () => {
    try {
      await axios.post(`${API_URL}/delete_chat_history`, {
        user_id: fanId
      });
      
      setMessages([{ 
        text: "Chat history cleared. How can I help you today?",
        isUser: false
      }]);
      setNewMessageIndex(0);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      width: '100%',
      overflow: 'hidden',
    }}>
      <Box sx={{ 
        p: 2, 
        backgroundColor: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        flexShrink: 0,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              bgcolor: '#00529B', 
              width: 36, 
              height: 36, 
              mr: 1.5,
              boxShadow: '0 2px 4px rgba(0, 82, 155, 0.25)',
            }}
          >
            <SmartToyOutlinedIcon sx={{ width: 20, height: 20 }} />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              World Cup Assistant
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex' }}>
          <Tooltip title="Clear chat history">
            <IconButton 
              size="small" 
              color="default" 
              onClick={handleClearHistory}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Box sx={{ 
        flexGrow: 1, 
        p: 2, 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: '#fafafa',
        justifyContent: initialLoading ? 'center' : 'flex-start',
        alignItems: initialLoading ? 'center' : 'stretch',
        width: '100%',
        minHeight: 0,
      }}>
        {initialLoading ? (
          <CircularProgress size={40} sx={{ color: '#00529B' }} />
        ) : (
          <>
            {messages.map((message, index) => (
              <Message 
                key={index} 
                text={message.text} 
                isUser={message.isUser} 
                isNew={index === newMessageIndex}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>
      
      {loading && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          py: 1,
          borderTop: '1px solid rgba(0, 0, 0, 0.05)',
          flexShrink: 0,
        }}>
          <CircularProgress size={24} sx={{ color: '#00529B' }} />
        </Box>
      )}
      
      <Divider sx={{ flexShrink: 0 }} />
      
      <Box sx={{ 
        p: 2, 
        backgroundColor: '#ffffff',
        display: 'flex',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.03)',
        flexShrink: 0,
      }}>
        <TextField
          fullWidth
          placeholder="Ask me anything..."
          variant="outlined"
          size="small"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading || initialLoading}
          sx={{ 
            mr: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: '#f5f9ff',
              '&.Mui-focused': {
                backgroundColor: '#fff',
              }
            } 
          }}
          multiline
          maxRows={3}
        />
        <IconButton 
          color="primary" 
          onClick={handleSend} 
          disabled={loading || initialLoading || input.trim() === ''}
          sx={{
            bgcolor: input.trim() !== '' ? 'primary.main' : 'transparent',
            color: input.trim() !== '' ? 'white' : 'primary.main',
            '&:hover': {
              bgcolor: input.trim() !== '' ? 'primary.dark' : 'rgba(0, 82, 155, 0.08)',
            },
            '&.Mui-disabled': {
              bgcolor: 'transparent',
            }
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Chatbot; 