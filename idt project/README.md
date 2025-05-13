# AI-Powered Server Management System

An intelligent system that forecasts server workload, optimizes resource allocation, and manages cooling systems to minimize power consumption without degrading performance.

## Features

- **Workload Forecasting**: Predicts CPU, memory, and I/O load using Temporal Convolutional Networks (TCN) with Attention
- **Resource Allocation**: Optimizes server activation and workload distribution using Deep Reinforcement Learning (DRL)
- **Cooling Optimization**: Adjusts cooling systems based on environmental conditions using Fuzzy Logic Control
- **Interactive Dashboard**: Visualizes system performance and AI decisions in real-time

## Setup

1. Install dependencies:
```
pip install -r requirements.txt
```

2. Run the application:
```
python app.py
```

3. Access the dashboard at http://localhost:5000

## System Architecture

The system consists of three AI models:

1. **Workload Forecasting Model**: TCN + Attention mechanism to predict future server loads
2. **Resource Allocation Model**: DRL with Adaptive Decision Trees for optimal resource management
3. **Cooling Optimization Module**: Fuzzy Logic Controller for efficient cooling management

## Technologies Used

- **Backend**: Flask
- **Frontend**: HTML, CSS, JavaScript
- **Data Processing**: NumPy, Pandas
- **Machine Learning**: TensorFlow, scikit-learn
- **Visualization**: Plotly, D3.js 