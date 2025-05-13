import numpy as np
import pandas as pd

class DummyWorkloadModel:
    """Fallback model for workload forecasting when TensorFlow model fails"""
    
    def __init__(self):
        print("Using dummy workload forecasting model")
    
    def predict(self, historical_data=None):
        """Generate dummy workload forecasts"""
        servers = [1, 2, 3, 4]
        forecasts = []
        
        for server in servers:
            base_cpu = 50 + np.random.normal(0, 10)
            base_memory = 60 + np.random.normal(0, 15)
            base_io = 40 + np.random.normal(0, 20)
            
            server_forecasts = []
            for hour in range(1, 7):
                time_factor = np.sin(hour / 6 * np.pi) * 10
                
                forecast = {
                    'server_id': server,
                    'time_offset': hour,
                    'cpu_forecast': round(base_cpu + time_factor, 1),
                    'memory_forecast': round(base_memory + time_factor * 0.5, 1),
                    'io_forecast': round(base_io + time_factor * 0.7, 1)
                }
                server_forecasts.append(forecast)
            
            forecasts.extend(server_forecasts)
        
        return {
            'forecasts': forecasts,
            'timestamp': pd.Timestamp.now().isoformat(),
            'forecast_horizon': '6 hours'
        }

class DummyResourceModel:
    """Fallback model for resource allocation when TensorFlow model fails"""
    
    def __init__(self):
        print("Using dummy resource allocation model")
    
    def decide(self, workload_data):
        """Generate dummy resource allocation decisions"""
        forecasts = workload_data.get('forecasts', [])
        next_hour_forecasts = [f for f in forecasts if f['time_offset'] == 1]
        
        decisions = []
        
        for forecast in next_hour_forecasts:
            server_id = forecast['server_id']
            cpu = forecast['cpu_forecast']
            memory = forecast['memory_forecast']
            
            if cpu > 80 or memory > 85:
                action = "activate"
            elif cpu < 20 and memory < 30:
                action = "hibernate"
            else:
                action = "maintain"
            
            decision = {
                'server_id': server_id,
                'action': action,
                'target': None,
                'expected_cpu_savings': 5.0 if action == "hibernate" else 0,
                'expected_energy_savings': 0.3 if action == "hibernate" else 0,
                'confidence': 0.8
            }
            
            decisions.append(decision)
        
        return {
            'decisions': decisions,
            'timestamp': pd.Timestamp.now().isoformat(),
            'optimization_goal': 'energy_efficiency'
        }

class DummyCoolingModel:
    """Fallback model for cooling optimization when the main model fails"""
    
    def __init__(self):
        print("Using dummy cooling optimization model")
    
    def optimize(self, server_data):
        """Generate dummy cooling optimization settings"""
        servers = server_data.get('servers', [])
        
        if servers:
            avg_temp = np.mean([server.get('temperature', 25) for server in servers])
            avg_cpu = np.mean([server.get('cpu', 50) for server in servers])
        else:
            avg_temp = 25
            avg_cpu = 50
        
        if avg_temp > 40 or avg_cpu > 70:
            cooling_level = 'high'
            cooling_numeric = 70
        elif avg_temp < 30 and avg_cpu < 40:
            cooling_level = 'low'
            cooling_numeric = 30
        else:
            cooling_level = 'medium'
            cooling_numeric = 50
        
        return {
            'cooling_level': cooling_level,
            'fan_speed_percent': cooling_numeric,
            'ac_temperature_setpoint': 24 - (cooling_numeric - 50) / 10,
            'expected_power_savings': (100 - cooling_numeric) * 0.05,
            'timestamp': pd.Timestamp.now().isoformat()
        } 