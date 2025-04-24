# Dalil - Saudi Arabia Fan Assistant

## Project Overview

Dalil is an interactive web application designed to enhance the fan experience during the 2034 FIFA World Cup in Saudi Arabia. The application provides personalized assistance to fans by offering information about matches, accommodations, attractions, restaurants, and other essential services throughout their stay in Saudi Arabia.

## Key Features

- **Interactive AI Assistant**: Chat with an AI assistant that provides personalized recommendations and information based on fan preferences, location, and schedule.
- **Match Information**: View upcoming matches, schedules, and results.
- **Accommodation Management**: Track hotel stays and get information about current and future accommodations.
- **Local Recommendations**: Discover restaurants, attractions, and activities near the fan's current location.
- **Profile Management**: View and manage fan profiles with preferences and match tickets.
- **Time Simulation**: Simulate different dates during the World Cup to test and demonstrate the application's functionality.

## Technical Architecture

### Backend (Flask)

The backend is built with Flask and provides a RESTful API for the frontend to consume. It includes:

- **Data Services**: Manages data loading, processing, and querying from JSON files.
- **Chat Services**: Handles AI assistant interactions using LangChain and OpenAI.
- **LangGraph Services**: Implements a conversational agent with tools for retrieving specific information.

### Frontend (React)

The frontend is built with React and Material-UI, providing a modern and responsive user interface:

- **Interactive Map**: Visualize stadiums, hotels, and other points of interest.
- **Match Schedule**: View and filter upcoming matches.
- **Ticket Management**: View purchased tickets and match details.
- **Accommodation Viewer**: Track hotel stays throughout the tournament.
- **Fan Profile**: View and manage fan information and preferences.
- **Chat Interface**: Interact with the AI assistant for personalized recommendations.

## Data Structure

The application uses several JSON files to store and manage data:

- **games.json**: Match schedules, teams, venues, and results.
- **stadiums.json**: Information about World Cup venues.
- **fans.json**: Fan profiles, preferences, and ticket information.
- **hotels.json**: Accommodation details and locations.
- **restaurants.json**: Restaurant information categorized by city.
- **attractions.json**: Tourist attractions and activities categorized by city.

## AI Assistant Capabilities

The AI assistant is powered by LangChain and OpenAI and can:

1. Provide information about upcoming matches and schedules
2. Offer details about hotels and surrounding areas
3. Recommend activities, restaurants, and attractions based on fan preferences
4. Suggest transportation options and directions
5. Provide general World Cup information and updates

The assistant uses specialized tools to retrieve data:
- `get_restaurants_by_city`: Retrieves restaurant recommendations for a specific city
- `get_attractions_by_city`: Retrieves attraction recommendations for a specific city
- `get_games_within_this_week`: Provides information about upcoming games

## How to Run the Project

### Prerequisites

- Python 3.8+
- Node.js 14+
- OpenAI API key

### Backend Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Start the Flask server:
   ```
   cd app
   python app.py
   ```

### Frontend Setup

1. Install dependencies:
   ```
   cd frontend
   npm install
   ```

2. Create a `.env` file in the frontend directory:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. Start the React development server:
   ```
   npm start
   ```

4. Access the application at `http://localhost:3000`

## Project Structure

```
Dalil/
├── app/                      # Backend Flask application
│   ├── app.py                # Main Flask application
│   ├── data/                 # JSON data files
│   │   ├── attractions.json
│   │   ├── fans.json
│   │   ├── games.json
│   │   ├── hotels.json
│   │   ├── restaurants.json
│   │   └── stadiums.json
│   └── services/             # Backend services
│       ├── chat_service.py   # AI assistant service
│       ├── data_service.py   # Data management service
│       └── langgraph_service.py # LangGraph implementation
├── frontend/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/       # Reusable UI components
│       ├── pages/            # Application pages
│       │   ├── AccommodationPage.js
│       │   ├── MapPage.js
│       │   ├── MatchesPage.js
│       │   ├── ProfilePage.js
│       │   └── TicketsPage.js
│       ├── services/         # Frontend services
│       └── utils/            # Utility functions
├── requirements.txt          # Python dependencies
└── README.md                 # Project documentation
```

## Development Workflow

1. The application simulates the 2034 World Cup experience by allowing users to select a fan profile and interact with the system as if they were that fan.
2. The simulated date can be changed to test different scenarios throughout the tournament.
3. The AI assistant provides personalized recommendations based on the fan's current location, preferences, and schedule.
4. The frontend communicates with the backend through RESTful API endpoints to retrieve and update data.

## Technologies Used

- **Backend**: Flask, LangChain, OpenAI, LangGraph
- **Frontend**: React, Material-UI, Axios
- **Data Storage**: JSON files (simulated database)
- **AI/ML**: OpenAI's language models for the conversational assistant

## Future Enhancements

- Integration with real-time transportation data
- Mobile application with offline capabilities
- Multi-language support for international fans
- Integration with ticket purchasing systems
- Real-time match updates and notifications
