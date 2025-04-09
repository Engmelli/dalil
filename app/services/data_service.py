import os
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

class DataService:
    """
    Service for handling all data operations related to the World Cup 2034 application.
    This centralizes data loading, processing, and querying functionality.
    """
    
    def __init__(self, simulated_date):
        self.raw_games = self.load_games()
        self.stadiums = self.load_stadiums()
        self.fans = self.load_fans()
        self.hotels = self.load_hotels()
        self.restaurants = self.load_restaurants()
        self.attractions = self.load_attractions()
        
        self.simulated_date = simulated_date
        self.games = self.process_games_for_date(self.raw_games, self.simulated_date)
    
    def load_games(self) -> List[Dict[str, Any]]:
        """Load games data from JSON file"""
        return self._load_data('games.json')
    
    def load_stadiums(self) -> List[Dict[str, Any]]:
        """Load stadiums data from JSON file"""
        return self._load_data('stadiums.json')
    
    def load_fans(self) -> List[Dict[str, Any]]:
        """Load fans data from JSON file"""
        return self._load_data('fans.json')
    
    def load_hotels(self) -> List[Dict[str, Any]]:
        """Load hotels data from JSON file"""
        return self._load_data('hotels.json')
    
    def load_restaurants(self) -> List[Dict[str, Any]]:
        """Load restaurants data from JSON file"""
        return self._load_data('restaurants.json')
    
    def load_attractions(self) -> List[Dict[str, Any]]:
        """Load attractions data from JSON file"""
        return self._load_data('attractions.json')
    
    def _load_data(self, filename: str) -> List[Dict[str, Any]]:
        """Load data from JSON files"""
        try:
            filepath = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', filename)
            with open(filepath, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading {filename}: {e}")
            return []
    
    def get_game_by_id(self, game_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific game by ID"""
        return next((g for g in self.games if g['id'] == game_id), None)
    
    def get_stadium_by_id(self, stadium_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific stadium by ID"""
        return next((s for s in self.stadiums if s['id'] == stadium_id), None)
    
    def get_fan_by_id(self, fan_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific fan by ID"""
        return next((f for f in self.fans if f['id'] == fan_id), None)
    
    def get_hotel_by_id(self, hotel_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific hotel by ID"""
        return next((h for h in self.hotels if h['id'] == hotel_id), None)
    
    def get_restaurant_by_id(self, restaurant_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific restaurant by ID"""
        return next((r for r in self.restaurants if r['id'] == restaurant_id), None)
    
    def get_attraction_by_id(self, attraction_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific attraction by ID"""
        return next((a for a in self.attractions if a['id'] == attraction_id), None)
    
    def get_games_for_date(self, date: str) -> List[Dict[str, Any]]:
        """Get all games scheduled for a specific date"""
        return [g for g in self.games if g['date'] == date]
    
    def get_games_for_team(self, team_name: str, current_date: str = None) -> List[Dict[str, Any]]:
        """Get all games for a specific team, optionally filtered by current date"""
        team_games = []
        for game in self.games:
            is_team_involved = (
                team_name.lower() in game["team_a"].lower() or
                team_name.lower() in game["team_b"].lower()
            )
            
            if is_team_involved:
                if current_date:
                    game_date = datetime.strptime(game['date'], "%Y-%m-%d")
                    current = datetime.strptime(current_date, "%Y-%m-%d")
                    if game_date < current:
                        continue
                
                team_games.append(game)
        
        return team_games
    
    def get_restaurants(self) -> List[Dict[str, Any]]:
        """Get all restaurants"""
        return self.restaurants
    
    def get_attractions(self) -> List[Dict[str, Any]]:
        """Get all attractions"""
        return self.attractions

    def get_restaurants_by_city(self, city: str) -> List[Dict[str, Any]]:
        """Get restaurants by city, safely handling missing 'city' fields"""
        return [r for r in self.restaurants if r.get('city', '').lower() == city.lower()]
    
    def get_attractions_by_city(self, city: str) -> List[Dict[str, Any]]:
        """Get attractions by city, safely handling missing 'city' fields"""
        return [a for a in self.attractions if a.get('city', '').lower() == city.lower()]
    
    def get_fan_current_hotel(self, fan: Dict[str, Any], current_date: str) -> Optional[Dict[str, Any]]:
        """Get a fan's current hotel based on the simulated date"""
        if 'hotel_stays' not in fan:
            return None
        
        current = datetime.strptime(current_date, "%Y-%m-%d")
        
        for stay in fan['hotel_stays']:
            check_in = datetime.strptime(stay['check_in'], "%Y-%m-%d")
            check_out = datetime.strptime(stay['check_out'], "%Y-%m-%d")
            
            if check_in <= current < check_out:
                hotel = self.get_hotel_by_id(stay['hotel_id'])
                if hotel:
                    return {
                        "hotel": hotel,
                        "check_in": stay['check_in'],
                        "check_out": stay['check_out'],
                        "days_left": (check_out - current).days
                    }
        
        return None
    
    def get_fan_next_hotel(self, fan: Dict[str, Any], current_date: str) -> Optional[Dict[str, Any]]:
        """Get a fan's next hotel stay after the current date"""
        if 'hotel_stays' not in fan:
            return None
        
        current = datetime.strptime(current_date, "%Y-%m-%d")
        
        future_stays = [
            stay for stay in fan['hotel_stays']
            if datetime.strptime(stay['check_in'], "%Y-%m-%d") > current
        ]
        
        if not future_stays:
            return None
        
        next_stay = min(future_stays, key=lambda s: datetime.strptime(s['check_in'], "%Y-%m-%d"))
        hotel = self.get_hotel_by_id(next_stay['hotel_id'])
        
        if hotel:
            check_in = datetime.strptime(next_stay['check_in'], "%Y-%m-%d")
            return {
                "hotel": hotel,
                "check_in": next_stay['check_in'],
                "check_out": next_stay['check_out'],
                "days_until": (check_in - current).days
            }
        
        return None
    
    def get_fan_hotel_stays(self, fan: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get all hotel stays for a fan with hotel details"""
        if 'hotel_stays' not in fan:
            return []
        
        hotel_stays = []
        for stay in fan['hotel_stays']:
            hotel = self.get_hotel_by_id(stay['hotel_id'])
            if hotel:
                hotel_stays.append({
                    "hotel": hotel,
                    "check_in": stay['check_in'],
                    "check_out": stay['check_out']
                })
        
        return hotel_stays
    
    def get_fan_attending_games(self, fan: Dict[str, Any], current_date: str = None) -> List[Dict[str, Any]]:
        """Get all games a fan is attending, with optional date filtering"""
        if 'attending_games' not in fan:
            return []
        
        games = []
        for game_id in fan['attending_games']:
            game = self.get_game_by_id(game_id)
            if game:
                if current_date:
                    game_date = datetime.strptime(game['date'], "%Y-%m-%d")
                    current = datetime.strptime(current_date, "%Y-%m-%d")
                    game['is_past'] = game_date < current
                
                stadium = self.get_stadium_by_id(game['stadium_id'])
                if stadium:
                    game['stadium_name'] = stadium['name']
                    game['stadium_city'] = stadium['city']
                
                games.append(game)
        
        if games:
            games.sort(key=lambda g: datetime.strptime(g['date'], "%Y-%m-%d"))
        
        return games
    
    def process_games_for_date(self, games: List[Dict[str, Any]], current_date: str) -> List[Dict[str, Any]]:
        """Process games based on the current date to hide/show appropriate information"""
        current = datetime.strptime(current_date, "%Y-%m-%d")
        processed_games = []
        
        for game in games:
            game_copy = game.copy()
            game_date = datetime.strptime(game['date'], "%Y-%m-%d")
            one_day_before = game_date - timedelta(days=1)
            
            if game['stage'] != 'group':
                if current < one_day_before + timedelta(days=1):  
                    game_copy['team_a'] = "TBD"
                    game_copy['team_b'] = "TBD"
                    game_copy['result'] = None
                    game_copy['winner'] = None
                elif current < game_date:
                    game_copy['result'] = None
                    game_copy['winner'] = None
            elif current < game_date:
                game_copy['result'] = None
                game_copy['winner'] = None
            processed_games.append(game_copy)
        
        return processed_games
    
    def update_simulated_date(self, new_date: str):
        """Update the simulated date and refresh processed games"""
        self.simulated_date = new_date
        self.games = self.process_games_for_date(self.raw_games, self.simulated_date)
    
    def get_games_within_this_week(self, simulated_date: str) -> List[Dict[str, Any]]:
        """Get all games within the next week and previous week from the simulated date"""
        current = datetime.strptime(simulated_date, "%Y-%m-%d")
        one_week_later = current + timedelta(days=7)
        one_week_ago = current - timedelta(days=7)
        return [g for g in self.games if one_week_ago <= datetime.strptime(g['date'], "%Y-%m-%d") < one_week_later]
       