import numpy as np
import pandas as pd
import os
import joblib
import tensorflow as tf
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import Dense, Input, Concatenate, Dropout

class ResourceAllocationModel:
    def __init__(self):
        """Initialize the Resource Allocation Model using DRL with Adaptive Decision Trees"""
        self.model = None
        self.state_dim = 12  # Server states (4 servers x 3 metrics)
        self.action_dim = 8  # Actions (activate/hibernate for 4 servers)
        
        # Check if model exists, otherwise build it
        model_path = os.path.join('app', 'models', 'saved', 'resource_allocation_model.h5')
        
        if os.path.exists(model_path):
            self.model = tf.keras.models.load_model(model_path)
        else:
            # For demo purposes, we'll build a simple model
            # In production, you'd train with reinforcement learning
            self._build_model()
            
            # Create directory if it doesn't exist
            os.makedirs(os.path.join('app', 'models', 'saved'), exist_ok=True)
            
            # Save dummy model
            self.model.save(model_path)
    
    def _build_model(self):
        """Build DRL model with Adaptive Decision Tree structure"""
        # Input: Server states (CPU%, RAM%, I/O% for each server)
        state_input = Input(shape=(self.state_dim,))
        
        # First level decision tree - server activation branch
        activation_branch = Dense(64, activation='relu')(state_input)
        activation_branch = Dense(32, activation='relu')(activation_branch)
        
        # Second level decision tree - workload migration branch
        migration_branch = Dense(64, activation='relu')(state_input)
        migration_branch = Dense(32, activation='relu')(migration_branch)
        
        # Combine branches
        combined = Concatenate()([activation_branch, migration_branch])
        combined = Dense(64, activation='relu')(combined)
        combined = Dropout(0.2)(combined)
        
        # Output layer - probability of each action
        outputs = Dense(self.action_dim, activation='softmax')(combined)
        
        # Create model
        self.model = Model(inputs=state_input, outputs=outputs)
        self.model.compile(optimizer='adam', loss=tf.keras.losses.CategoricalCrossentropy())
    
    def decide(self, workload_data):
        """
        Decide resource allocation based on forecasted workload
        
        Args:
            workload_data: Dictionary containing forecasted workload
        
        Returns:
            Dictionary with resource allocation decisions
        """
        # In a real system, we'd use the DRL model to make decisions
        # For demo, we'll return mock decisions based on the workload data
        
        # Extract forecasts for the next hour
        forecasts = workload_data.get('forecasts', [])
        next_hour_forecasts = [f for f in forecasts if f['time_offset'] == 1]
        
        # Make decisions for each server
        decisions = []
        
        for forecast in next_hour_forecasts:
            server_id = forecast['server_id']
            cpu = forecast['cpu_forecast']
            memory = forecast['memory_forecast']
            io = forecast['io_forecast']
            
            # Simple decision logic for demo
            if cpu > 80 or memory > 85:
                # High load expected, prepare additional resources
                action = "activate" if server_id != 3 else "migrate_workload"
                target = "Server 5" if action == "migrate_workload" else None
            elif cpu < 20 and memory < 30 and io < 15:
                # Low load expected, save energy
                action = "hibernate"
                target = None
            else:
                # Moderate load, maintain current state
                action = "maintain"
                target = None
            
            decision = {
                'server_id': server_id,
                'action': action,
                'target': target,
                'expected_cpu_savings': round(5 + np.random.normal(0, 2), 1) if action in ["hibernate", "migrate_workload"] else 0,
                'expected_energy_savings': round(0.3 + np.random.normal(0, 0.1), 2) if action in ["hibernate", "migrate_workload"] else 0,
                'confidence': round(0.7 + np.random.normal(0, 0.1), 2)
            }
            
            decisions.append(decision)
        
        return {
            'decisions': decisions,
            'timestamp': pd.Timestamp.now().isoformat(),
            'optimization_goal': 'energy_efficiency'
        } 