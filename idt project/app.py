from flask import Flask, render_template, jsonify, request
import os
import json
import numpy as np
import pandas as pd
import tensorflow as tf
from app.models.workload_forecasting import WorkloadForecastingModel
from app.models.resource_allocation import ResourceAllocationModel
from app.models.cooling_optimization import CoolingOptimizationModel

app = Flask(__name__, 
            static_folder='app/static',
            template_folder='app/templates')

# Initialize models
try:
    print("Initializing AI models...")
    # Create models directory if it doesn't exist
    os.makedirs(os.path.join('app', 'models', 'saved'), exist_ok=True)
    
    workload_model = WorkloadForecastingModel()
    resource_model = ResourceAllocationModel()
    cooling_model = CoolingOptimizationModel()
    print("All models initialized successfully")
except Exception as e:
    print(f"Error initializing models: {e}")
    # Provide fallback functionality
    from app.models.dummy_models import DummyWorkloadModel, DummyResourceModel, DummyCoolingModel
    workload_model = DummyWorkloadModel()
    resource_model = DummyResourceModel()
    cooling_model = DummyCoolingModel()

@app.route('/')
@app.route('/<path:path>')
def index(path=None):
    """Render main dashboard page for any path to support client-side routing"""
    return render_template('index.html')

@app.route('/api/workload/forecast', methods=['GET'])
def get_workload_forecast():
    """Get workload forecasts for the next time window"""
    forecast_data = workload_model.predict()
    return jsonify(forecast_data)

@app.route('/api/resource/allocate', methods=['POST'])
def allocate_resources():
    """Allocate resources based on forecasted workload"""
    workload_data = request.json
    allocation_decisions = resource_model.decide(workload_data)
    return jsonify(allocation_decisions)

@app.route('/api/cooling/optimize', methods=['POST'])
def optimize_cooling():
    """Optimize cooling based on server conditions"""
    server_data = request.json
    cooling_settings = cooling_model.optimize(server_data)
    return jsonify(cooling_settings)

@app.route('/api/system/status', methods=['GET'])
def get_system_status():
    """Get current system status for dashboard"""
    # In a real system, this would fetch actual data
    # For demo, we'll return mock data
    return jsonify({
        'servers': [
            {'id': 1, 'status': 'active', 'cpu': 78, 'memory': 65, 'io': 45, 'temperature': 42},
            {'id': 2, 'status': 'active', 'cpu': 45, 'memory': 80, 'io': 30, 'temperature': 38},
            {'id': 3, 'status': 'hibernating', 'cpu': 5, 'memory': 10, 'io': 2, 'temperature': 25},
            {'id': 4, 'status': 'active', 'cpu': 90, 'memory': 75, 'io': 60, 'temperature': 48},
        ],
        'energy': {
            'current': 4.2,  # kW
            'saved': 1.8,    # kW
            'renewable': 65  # percentage
        },
        'cooling': {
            'level': 'medium',
            'temperature': 22,  # °C
            'humidity': 45      # percentage
        }
    })

if __name__ == '__main__':
    app.run(debug=True) 