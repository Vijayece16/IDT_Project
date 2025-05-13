import numpy as np
import pandas as pd
import os
import joblib

class FuzzyMembership:
    """Simple implementation of fuzzy membership functions"""
    
    @staticmethod
    def triangular(x, a, b, c):
        """Triangular membership function"""
        return max(min((x - a) / (b - a), (c - x) / (c - b)), 0)
    
    @staticmethod
    def trapezoidal(x, a, b, c, d):
        """Trapezoidal membership function"""
        return max(min(min((x - a) / (b - a), 1), (d - x) / (d - c)), 0)

class CoolingOptimizationModel:
    def __init__(self):
        """Initialize the Cooling Optimization Model using Fuzzy Logic Controller"""
        # Define fuzzy sets for temperature
        self.temp_cold = lambda x: FuzzyMembership.trapezoidal(x, 15, 18, 22, 25)
        self.temp_normal = lambda x: FuzzyMembership.triangular(x, 22, 25, 28)
        self.temp_hot = lambda x: FuzzyMembership.trapezoidal(x, 25, 28, 35, 40)
        
        # Define fuzzy sets for humidity
        self.humid_low = lambda x: FuzzyMembership.trapezoidal(x, 20, 25, 35, 40)
        self.humid_normal = lambda x: FuzzyMembership.triangular(x, 35, 45, 55)
        self.humid_high = lambda x: FuzzyMembership.trapezoidal(x, 50, 60, 70, 80)
        
        # Define fuzzy sets for server heat output
        self.heat_low = lambda x: FuzzyMembership.trapezoidal(x, 0, 10, 30, 40)
        self.heat_medium = lambda x: FuzzyMembership.triangular(x, 30, 50, 70)
        self.heat_high = lambda x: FuzzyMembership.trapezoidal(x, 60, 70, 90, 100)
        
        # Load saved model if exists
        model_path = os.path.join('app', 'models', 'saved', 'cooling_optimization_rules.pkl')
        
        if os.path.exists(model_path):
            self.rules = joblib.load(model_path)
        else:
            # Define fuzzy rules
            self.rules = self._define_rules()
            
            # Create directory if it doesn't exist
            os.makedirs(os.path.join('app', 'models', 'saved'), exist_ok=True)
            
            # Save rules
            joblib.dump(self.rules, model_path)
    
    def _define_rules(self):
        """Define fuzzy logic rules for cooling optimization"""
        # Rule format: (temp_condition, humid_condition, heat_condition, cooling_level, weight)
        rules = [
            # Rule 1: If temperature is cold and server heat is low, cooling is very low
            ('cold', 'any', 'low', 'very_low', 1.0),
            
            # Rule 2: If temperature is normal and humidity is normal and server heat is low, cooling is low
            ('normal', 'normal', 'low', 'low', 0.8),
            
            # Rule 3: If temperature is normal and server heat is medium, cooling is medium
            ('normal', 'any', 'medium', 'medium', 0.7),
            
            # Rule 4: If temperature is hot or server heat is high, cooling is high
            ('hot', 'any', 'any', 'high', 0.9),
            ('any', 'any', 'high', 'high', 0.9),
            
            # Rule 5: If humidity is high and temperature is hot, cooling is very high
            ('hot', 'high', 'any', 'very_high', 1.0),
        ]
        
        return rules
    
    def _apply_rules(self, temp, humidity, heat):
        """Apply fuzzy rules to determine cooling level"""
        # Calculate membership values for each input
        temp_memberships = {
            'cold': self.temp_cold(temp),
            'normal': self.temp_normal(temp),
            'hot': self.temp_hot(temp),
            'any': 1.0
        }
        
        humid_memberships = {
            'low': self.humid_low(humidity),
            'normal': self.humid_normal(humidity),
            'high': self.humid_high(humidity),
            'any': 1.0
        }
        
        heat_memberships = {
            'low': self.heat_low(heat),
            'medium': self.heat_medium(heat),
            'high': self.heat_high(heat),
            'any': 1.0
        }
        
        # Output fuzzy sets (simplified as crisp values for demo)
        cooling_levels = {
            'very_low': 10,
            'low': 30,
            'medium': 50,
            'high': 70,
            'very_high': 90
        }
        
        # Apply rules and calculate weighted sum
        total_weight = 0
        weighted_sum = 0
        
        for temp_cond, humid_cond, heat_cond, cooling_level, weight in self.rules:
            # Calculate rule strength using min operator for AND
            rule_strength = min(
                temp_memberships[temp_cond],
                humid_memberships[humid_cond],
                heat_memberships[heat_cond]
            )
            
            # Apply weight
            weighted_rule = rule_strength * weight
            
            # Add to weighted sum
            weighted_sum += weighted_rule * cooling_levels[cooling_level]
            total_weight += weighted_rule
        
        # Calculate defuzzified result (weighted average)
        if total_weight > 0:
            cooling_level_numeric = weighted_sum / total_weight
        else:
            cooling_level_numeric = 50  # Default to medium if no rules apply
        
        # Convert numeric level back to linguistic term
        if cooling_level_numeric < 20:
            cooling_level = 'very_low'
        elif cooling_level_numeric < 40:
            cooling_level = 'low'
        elif cooling_level_numeric < 60:
            cooling_level = 'medium'
        elif cooling_level_numeric < 80:
            cooling_level = 'high'
        else:
            cooling_level = 'very_high'
        
        return cooling_level, cooling_level_numeric
    
    def optimize(self, server_data):
        """
        Optimize cooling based on server conditions
        
        Args:
            server_data: Dictionary containing server temperature and workload data
        
        Returns:
            Dictionary with cooling optimization settings
        """
        # Extract relevant data
        servers = server_data.get('servers', [])
        
        # Calculate average temperature and heat output across servers
        if servers:
            avg_temp = np.mean([server.get('temperature', 25) for server in servers])
            
            # Calculate heat output based on CPU utilization
            heat_outputs = [server.get('cpu', 50) * 0.7 + server.get('memory', 50) * 0.3 for server in servers]
            avg_heat = np.mean(heat_outputs)
        else:
            # Default values if no server data
            avg_temp = 25
            avg_heat = 50
        
        # Get ambient humidity (would come from sensors in a real system)
        ambient_humidity = server_data.get('cooling', {}).get('humidity', 45)
        
        # Apply fuzzy logic rules
        cooling_level, cooling_numeric = self._apply_rules(avg_temp, ambient_humidity, avg_heat)
        
        # Calculate fan speed based on cooling level
        fan_speed = int(cooling_numeric)
        
        # Calculate AC temperature setpoint (inverse relationship with cooling level)
        ac_setpoint = round(24 - (cooling_numeric - 50) / 10, 1)
        
        return {
            'cooling_level': cooling_level,
            'fan_speed_percent': fan_speed,
            'ac_temperature_setpoint': ac_setpoint,
            'expected_power_savings': round((100 - cooling_numeric) * 0.05, 2),
            'timestamp': pd.Timestamp.now().isoformat()
        } 