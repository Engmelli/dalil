from datetime import datetime
from services.data_service import DataService
from typing import Dict, Any

class ChatService:
    """
    Service for handling chat functionality in the World Cup 2034 app.
    This centralizes the chat logic and integrates with other services.
    """
    
    def __init__(self, data_service: DataService):
        self.data_service = data_service
    
    def _get_fan_hotel_info(self, fan: Dict[str, Any], simulated_date: str) -> str:
        """Get fan's hotel information based on the current simulated date"""
        if 'hotel_stays' not in fan:
            return "Unknown hotel"
        
        current_stay = self.data_service.get_fan_current_hotel(fan, simulated_date)
        if current_stay:
            hotel = current_stay["hotel"]
            days_left = current_stay["days_left"]
            return f"{hotel['name']} in {hotel['city']} (checking out in {days_left} days)"
            
        next_stay = self.data_service.get_fan_next_hotel(fan, simulated_date)
        if next_stay:
            hotel = next_stay["hotel"]
            days_until = next_stay["days_until"]
            return f"Upcoming stay at {hotel['name']} in {hotel['city']} in {days_until} days"
        
        return "No current hotel stay found"
    
    def _get_fan_games_info(self, fan: Dict[str, Any], simulated_date: str) -> str:
        """Get information about games the fan is attending"""
        fan_games = self.data_service.get_fan_attending_games(fan, simulated_date)
        
        if not fan_games:
            return "No games found"
        
        game_info = []
        current_date = datetime.strptime(simulated_date, "%Y-%m-%d")
        
        for game in fan_games:
            game_date = datetime.strptime(game['date'], "%Y-%m-%d")
            
            teams = f"{game['team_a']} vs {game['team_b']}"
                
            status = "Past" if game_date < current_date else "Upcoming"
            
            stadium_name = game.get('stadium_name', "Unknown stadium")
            
            game_info.append(f"{status} match on {game['date']}: {teams} at {stadium_name}")
        
        return ", ".join(game_info)
    
    def _get_todays_games(self, simulated_date: str) -> str:
        """Get information about games happening today"""
        todays_games = self.data_service.get_games_for_date(simulated_date)
        
        if not todays_games:
            return "No games scheduled for today"
        
        game_info = []
        for game in todays_games:
            stadium = self.data_service.get_stadium_by_id(game['stadium_id'])
            stadium_name = stadium['name'] if stadium else "Unknown stadium"
            
            teams = f"{game['team_a']} vs {game['team_b']}"
            game_info.append(f"{teams} at {stadium_name}, {game['time']}")
        
        return ", ".join(game_info)
    
    def _prepare_fan_data(self, fan: Dict[str, Any], simulated_date: str) -> Dict[str, Any]:
        """Prepare all the fan data needed for the prompt"""
        fan_hotel = self._get_fan_hotel_info(fan, simulated_date)
        
        fan_games = self._get_fan_games_info(fan, simulated_date)
        
        todays_games = self._get_todays_games(simulated_date)
        
        hotel_stays = self.data_service.get_fan_hotel_stays(fan)
        hotel_stays_info = []
        
        for stay in hotel_stays:
            hotel = stay["hotel"]
            hotel_stays_info.append(f"{hotel['name']} in {hotel['city']} from {stay['check_in']} to {stay['check_out']}")
        
        full_itinerary = ", ".join(hotel_stays_info)
        
        preferences = ""
        if 'preferences' in fan:
            for category, values in fan['preferences'].items():
                if isinstance(values, list):
                    preferences += f"{category}: {', '.join(values)}. "
                else:
                    preferences += f"{category}: {values}. "
        
        return {
            "fan_id": fan["id"],
            "simulated_date": simulated_date,
            "fan_name": fan['name'],
            "fan_nationality": fan['nationality'],
            "fan_team": fan['team_supported'],
            "fan_hotel": fan_hotel,
            "fan_hotel_timeline": full_itinerary,
            "fan_games": fan_games,
            "todays_games": todays_games,
            "fan_preferences": preferences,
        }

    def _get_restaurants_by_city(self, city: str):
        return self.data_service.get_restaurants_by_city(city)

    def _get_attractions_by_city(self, city: str):
        return self.data_service.get_attractions_by_city(city)

    def _get_games_within_this_week(self, simulated_date: str):
        return self.data_service.get_games_within_this_week(simulated_date)
        