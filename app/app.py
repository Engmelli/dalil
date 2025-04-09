from flask import Flask, request, jsonify
from datetime import datetime
from services.chat_service import ChatService
from services.data_service import DataService
from services.langgraph_service import chatbot
from langchain_community.chat_message_histories import ChatMessageHistory
from collections import defaultdict
from flask_cors import CORS
from langchain_core.tools import tool


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
user_histories = defaultdict(lambda: ChatMessageHistory())

SIMULATED_DATE = "2034-06-13"

system_message = """
You are an AI assistant for the 2034 World Cup in Saudi Arabia. 
You're helping fans have the best experience during their visit.

CURRENT DATE: {simulated_date}

FAN INFORMATION:
- Name: {fan_name}
- Nationality: {fan_nationality}
- Team Supported: {fan_team}
- Current Stay: {fan_hotel}
- Full Hotel Itinerary: {fan_hotel_timeline}
- Attending games: {fan_games}
- Preferences: {fan_preferences}

Your goal is to provide helpful, friendly information about:
1. The fan's upcoming games and schedule
2. Information about their hotel and surrounding area
3. Recommendations for activities, restaurants and attractions based on their preferences
4. Transportation options and directions
5. General World Cup information and updates

Today's notable games: {todays_games}

Keep answers concise and focused on providing practical value.
When offering recommendations, consider the fan's preferences and current location.

If you need to use tools to look up specific information, use them.
If a user asks for restaurants use the tool 'get_restaurants_by_city' to provide recommendations based on the city they are in.
If a user asks for attractions use the tool 'get_attractions_by_city' to provide recommendations based on the city they are in.
If a user asks for what to do or for an itinerary make sure to call both tools 'get_restaurants_by_city' and 'get_attractions_by_city' and provide a combined response.
If a user asks for information about the games use the tool 'get_games_within_this_week' to provide information about the games.

DO NOT RECOMMEND RESTAURANTS OR ATTRACTIONS OUTSIDE OF THE RESULTS FETCHED FROM THE TOOLS.
"""

data_service = DataService(SIMULATED_DATE)
chat_service = ChatService(data_service)

@tool
def get_restaurants_by_city(city: str) -> list[dict]:
    """Get restaurants by city

    Args:
        city (str): The city name, one of ["Abha", "Al Baha", "Al Hofuf", "Al-Ula", "Asir", "Dammam", "Hafar Al-Batin", "Hail", "Jeddah", "Khobar", "Makkah", "Medina", "NEOM", "Najran", "Riyadh", "Tabuk", "Taif"]

    Returns:
        list[dict]: List of restaurants in the specified city
    """
    return chat_service._get_restaurants_by_city(city)

@tool
def get_attractions_by_city(city: str) -> list[dict]:
    """Get attractions by city
    
    Args:
        city (str): The city name, one of ["Abha", "Al Baha", "Al Hofuf", "Al Khobar", "Al-Ula", "Asir", "Dammam", "Hafar Al-Batin", "Hail", "Jeddah", "Makkah", "Medina", "NEOM", "Najran", "Riyadh", "Tabuk", "Taif"]
    
    Returns:
        list[dict]: List of attractions in the specified city
    """
    return chat_service._get_attractions_by_city(city)

@tool
def get_games_within_this_week(simulated_date: str) -> list[dict]:
    """Get all games within the current weeks from the simulated date
    
    Args:
        simulated_date (str): The simulated date in YYYY-MM-DD format
    
    Returns:
        list[dict]: List of games within the current week
    """
    return chat_service._get_games_within_this_week(simulated_date)

@app.route('/api/games', methods=['GET'])
def get_games():
    """Get all games, processed based on the current simulated date"""
    return jsonify(data_service.games)

@app.route('/api/game/<int:game_id>', methods=['GET'])
def get_game(game_id):
    """Get a specific game by ID"""
    game = data_service.get_game_by_id(game_id)
    if not game:
        return jsonify({"error": "Game not found"}), 404
    
    return jsonify(game)

@app.route('/api/stadiums', methods=['GET'])
def get_stadiums():
    """Get all stadiums"""
    stadiums = data_service.stadiums
    return jsonify(stadiums)


@app.route('/api/fans', methods=['GET'])
def get_fans():
    """Get all fans"""
    fans = data_service.fans
    return jsonify(fans)

@app.route('/api/fans/<int:fan_id>', methods=['GET'])
def get_fan(fan_id):
    """Get a specific fan by ID"""
    fan = data_service.get_fan_by_id(fan_id)
    if not fan:
        return jsonify({"error": "Fan not found"}), 404
    return jsonify(fan)

@app.route('/api/hotels', methods=['GET'])
def get_hotels():
    """Get all hotels"""
    hotels = data_service.hotels
    return jsonify(hotels)

@app.route('/api/date', methods=['GET'])
def get_date():
    """Get the current simulated date"""
    return jsonify({"date": SIMULATED_DATE})

@app.route('/api/date', methods=['PUT'])
def update_date():
    """Update the current simulated date"""
    global SIMULATED_DATE
    data = request.json
    if 'date' in data:
        try:
            datetime.strptime(data['date'], "%Y-%m-%d")
            SIMULATED_DATE = data['date']
            data_service.update_simulated_date(SIMULATED_DATE)
            return jsonify({"date": SIMULATED_DATE})
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    return jsonify({"error": "Date not provided"}), 400

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    if not data or 'message' not in data or 'user_id' not in data:
        return jsonify({"error": "Message and user_id are required"}), 400

    user_id = data['user_id']
    user_message = data['message']

    if user_message == "__welcome_message__":
        welcome_message = "Hello! I'm your World Cup 2034 assistant. How can I help you today?"
        history = user_histories[user_id]
        history.add_ai_message(welcome_message)
        return jsonify({"response": welcome_message})

    fan = data_service.get_fan_by_id(user_id)
    if not fan:
        return jsonify({"error": "Fan not found"}), 404

    prompt_inputs = chat_service._prepare_fan_data(fan, SIMULATED_DATE)
    sys_msg = system_message.format(**prompt_inputs)

    history = user_histories[user_id]
    history.add_user_message(user_message)

    graph = chatbot(sys_msg, [get_restaurants_by_city, get_attractions_by_city, get_games_within_this_week])
    messages = history.messages
    
    try:
        response = graph.invoke(
            {"messages": messages},
            config={"configurable": {"thread_id": user_id}}
        )
        print(response)
        assistant_reply = response["messages"][-1].content
        history.add_ai_message(assistant_reply)

        return jsonify({"response": assistant_reply})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat_history', methods=['GET'])
def get_chat_history():
    """Get the chat history for a specific user"""
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    
    try:
        user_id = int(user_id)
        history = user_histories.get(user_id, ChatMessageHistory())
        
        formatted_messages = []
        
        welcome_message_count = 0
        welcome_message = "Hello! I'm your World Cup 2034 assistant. How can I help you today?"
        
        for msg in history.messages:
            if msg.content == welcome_message and msg.type == 'ai':
                welcome_message_count += 1
                if welcome_message_count > 1:
                    continue
            
            formatted_messages.append({
                "content": msg.content,
                "type": msg.type
            })
            
        return jsonify({"chat_history": formatted_messages})
    except ValueError:
        return jsonify({"error": "Invalid user_id format"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/team/<team_name>/games', methods=['GET'])
def get_team_games(team_name):
    """Get all games for a specific team"""
    request_date = request.args.get('date', SIMULATED_DATE)
    team_games = data_service.get_games_for_team(team_name, request_date)
    return jsonify(team_games)

@app.route('/api/date/<date>/games', methods=['GET'])
def get_games_by_date(date):
    """Get all games for a specific date"""    
    games = data_service.get_games_for_date(date)
    return jsonify(games)

@app.route('/api/delete_chat_history', methods=['POST'])
def delete_chat_history():
    """Delete the chat history for a specific user"""
    data = request.json
    if not data or 'user_id' not in data:
        return jsonify({"error": "user_id is required"}), 400
    
    try:
        user_id = int(data['user_id'])
        user_histories[user_id] = ChatMessageHistory()
        return jsonify({"success": True})
    except ValueError:
        return jsonify({"error": "Invalid user_id format"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/restaurants', methods=['GET'])
def get_restaurants():
    """Return all restaurants data"""
    return jsonify(data_service.get_restaurants())

@app.route('/api/attractions', methods=['GET'])
def get_attractions():
    """Return all attractions data"""
    return jsonify(data_service.get_attractions())

if __name__ == '__main__':
    app.run(debug=True) 