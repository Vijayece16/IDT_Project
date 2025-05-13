import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import Dense, Conv1D, LayerNormalization, Dropout, Input, Attention, Concatenate
import os
import joblib

class WorkloadForecastingModel:
    def __init__(self):
        """Initialize the Workload Forecasting Model with TCN + Attention architecture"""
        self.model = None
        self.lookback = 24  # Hours of historical data to consider
        self.forecast_horizon = 1  # Hours to forecast
        self.scaler = None
        
        # Check if model exists, otherwise build it
        model_path = os.path.join('app', 'models', 'saved', 'workload_forecast_model.h5')
        scaler_path = os.path.join('app', 'models', 'saved', 'workload_scaler.pkl')
        
        if os.path.exists(model_path) and os.path.exists(scaler_path):
            self.model = tf.keras.models.load_model(model_path)
            self.scaler = joblib.load(scaler_path)
        else:
            # For demo purposes, we'll build a simple model
            # In production, you'd train on real data
            self._build_model()
            
            # Create directory if it doesn't exist
            os.makedirs(os.path.join('app', 'models', 'saved'), exist_ok=True)
            
            # Save dummy model and scaler
            self.model.save(model_path)
            joblib.dump(self.scaler, scaler_path)
    
    def _build_model(self):
        """Build TCN + Attention model architecture"""
        # Input shape: [batch_size, lookback, features]
        # Features: CPU%, RAM%, disk I/O, timestamp features
        input_shape = (self.lookback, 7)  # 7 features
        
        # TCN part
        inputs = Input(shape=input_shape)
        x = Conv1D(filters=64, kernel_size=3, padding='causal', dilation_rate=1, activation='relu')(inputs)
        x = LayerNormalization()(x)
        x = Dropout(0.2)(x)
        
        x = Conv1D(filters=64, kernel_size=3, padding='causal', dilation_rate=2, activation='relu')(x)
        x = LayerNormalization()(x)
        x = Dropout(0.2)(x)
        
        x = Conv1D(filters=64, kernel_size=3, padding='causal', dilation_rate=4, activation='relu')(x)
        x = LayerNormalization()(x)
        tcn_output = Dropout(0.2)(x)
        
        # Attention mechanism
        attention_output = Attention()([tcn_output, tcn_output])
        
        # Combine TCN and attention outputs
        combined = Concatenate()([tcn_output, attention_output])
        
        # Output layers - predict CPU%, RAM%, and I/O for the next time window
        flattened = tf.keras.layers.Flatten()(combined)
        dense1 = Dense(128, activation='relu')(flattened)
        dense2 = Dense(64, activation='relu')(dense1)
        outputs = Dense(3, activation='sigmoid')(dense2)  # 3 outputs: CPU%, RAM%, I/O%
        
        # Create model
        self.model = Model(inputs=inputs, outputs=outputs)
        self.model.compile(optimizer='adam', loss=tf.keras.losses.MeanSquaredError(), metrics=['mae'])
        
        # Create a dummy scaler for demo purposes
        self.scaler = "dummy_scaler"
    
    def predict(self, historical_data=None):
        """
        Predict workload for the next time window
        
        Args:
            historical_data: Optional historical workload data
                             If None, uses mock data for demo
        
        Returns:
            Dictionary with forecasted workload values
        """
        # In a real system, we'd use actual historical data
        # For demo, we'll return mock predictions
        
        # Generate some realistic forecasts
        servers = [1, 2, 3, 4]
        forecasts = []
        
        for server in servers:
            # Generate realistic forecasts with some randomness
            base_cpu = 50 + np.random.normal(0, 10)
            base_memory = 60 + np.random.normal(0, 15)
            base_io = 40 + np.random.normal(0, 20)
            
            # Ensure values are within reasonable ranges
            cpu = max(5, min(95, base_cpu))
            memory = max(10, min(90, base_memory))
            io = max(5, min(85, base_io))
            
            # Create forecast data points for the next 6 hours
            server_forecasts = []
            for hour in range(1, 7):
                # Add some time-based variation
                time_factor = np.sin(hour / 6 * np.pi) * 10
                
                forecast = {
                    'server_id': server,
                    'time_offset': hour,  # hours in the future
                    'cpu_forecast': round(cpu + time_factor + np.random.normal(0, 3), 1),
                    'memory_forecast': round(memory + time_factor * 0.5 + np.random.normal(0, 2), 1),
                    'io_forecast': round(io + time_factor * 0.7 + np.random.normal(0, 4), 1)
                }
                server_forecasts.append(forecast)
            
            forecasts.extend(server_forecasts)
        
        return {
            'forecasts': forecasts,
            'timestamp': pd.Timestamp.now().isoformat(),
            'forecast_horizon': '6 hours'
        } 