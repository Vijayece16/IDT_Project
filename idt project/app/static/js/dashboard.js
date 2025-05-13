// Global variables
let systemData = null;
let forecastData = null;
let resourceAllocationData = null;
let coolingData = null;
let userRole = 'admin'; // Default role - in a real app this would come from authentication
let modelDetailsData = null; // New global variable for model details

// DOM Elements
const refreshBtn = document.getElementById('refresh-btn');
const lastUpdatedEl = document.getElementById('last-updated');
const navItems = document.querySelectorAll('.sidebar nav ul li');
const pages = document.querySelectorAll('.page');
const accessDeniedEl = document.createElement('div'); // Create access denied element

// Set up access denied element
accessDeniedEl.className = 'access-denied-message';
accessDeniedEl.innerHTML = `
    <div class="card">
        <div class="card-header">
            <h3><i class="fas fa-exclamation-triangle"></i> Access Denied</h3>
        </div>
        <div class="card-body">
            <p>You don't have permission to access this page. Please contact your administrator for assistance.</p>
            <button class="btn" id="back-to-dashboard"><i class="fas fa-home"></i> Back to Dashboard</button>
        </div>
    </div>
`;

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initial data fetch
    fetchAllData();
    
    // Set up refresh button
    refreshBtn.addEventListener('click', fetchAllData);
    
    // Set up navigation (only sets the dashboard as active)
    setupNavigation();
    
    // Initialize all visualizations for the dashboard
    updateDashboardVisualizations();
    
    // Auto-refresh every 60 seconds
    setInterval(fetchAllData, 60000);
});

// Set up event listeners for model training buttons
function setupModelTrainingEventListeners() {
    // Workload Forecasting model
    const wfTrainBtn = document.getElementById('wf-train-btn');
    const wfResetBtn = document.getElementById('wf-reset-btn');
    
    if (wfTrainBtn) {
        wfTrainBtn.addEventListener('click', () => {
            const epochs = document.getElementById('wf-epochs')?.value || 100;
            const batchSize = document.getElementById('wf-batch-size')?.value || 32;
            const learningRate = document.getElementById('wf-learning-rate')?.value || 0.001;
            
            // In a real app, this would make an API call
            console.log(`Training Workload Forecasting model with ${epochs} epochs, batch size ${batchSize}, learning rate ${learningRate}`);
            
            // Show training notification
            showNotification('Workload Forecasting model training started...', 'info');
            simulateModelTraining('wf');
        });
    }
    
    if (wfResetBtn) {
        wfResetBtn.addEventListener('click', () => {
            console.log('Resetting Workload Forecasting model');
            showNotification('Workload Forecasting model reset to default weights', 'warning');
        });
    }
    
    // Resource Allocation model
    const raTrainBtn = document.getElementById('ra-train-btn');
    const raResetBtn = document.getElementById('ra-reset-btn');
    
    if (raTrainBtn) {
        raTrainBtn.addEventListener('click', () => {
            const episodes = document.getElementById('ra-episodes')?.value || 500;
            const discount = document.getElementById('ra-discount')?.value || 0.95;
            const exploration = document.getElementById('ra-exploration')?.value || 0.2;
            
            console.log(`Training Resource Allocation model with ${episodes} episodes, discount ${discount}, exploration ${exploration}`);
            showNotification('Resource Allocation model training started...', 'info');
            simulateModelTraining('ra');
        });
    }
    
    if (raResetBtn) {
        raResetBtn.addEventListener('click', () => {
            console.log('Resetting Resource Allocation model');
            showNotification('Resource Allocation model reset to default weights', 'warning');
        });
    }
    
    // Cooling Optimization model
    const coUpdateBtn = document.getElementById('co-update-btn');
    const coResetBtn = document.getElementById('co-reset-btn');
    
    if (coUpdateBtn) {
        coUpdateBtn.addEventListener('click', () => {
            const tempWeight = document.getElementById('co-temp-weight')?.value || 0.5;
            const humidityWeight = document.getElementById('co-humidity-weight')?.value || 0.3;
            const powerWeight = document.getElementById('co-power-weight')?.value || 0.2;
            
            console.log(`Updating Cooling Optimization model with temperature weight ${tempWeight}, humidity weight ${humidityWeight}, power weight ${powerWeight}`);
            showNotification('Cooling Optimization model configuration updated', 'success');
        });
    }
    
    if (coResetBtn) {
        coResetBtn.addEventListener('click', () => {
            document.getElementById('co-temp-weight').value = 0.5;
            document.getElementById('co-humidity-weight').value = 0.3;
            document.getElementById('co-power-weight').value = 0.2;
            
            console.log('Resetting Cooling Optimization model configuration');
            showNotification('Cooling Optimization model reset to default configuration', 'warning');
        });
    }
}

// Simulate model training process
function simulateModelTraining(modelPrefix) {
    // Find status element
    const statusEl = document.querySelector(`.training-controls .status-value`);
    if (!statusEl) return;
    
    // Update status to training
    statusEl.textContent = 'Training';
    statusEl.className = 'status-value training';
    
    // Disable buttons during training
    const trainBtn = document.getElementById(`${modelPrefix}-train-btn`);
    const resetBtn = document.getElementById(`${modelPrefix}-reset-btn`);
    
    if (trainBtn) trainBtn.disabled = true;
    if (resetBtn) resetBtn.disabled = true;
    
    // Simulate training completion after 3 seconds
    setTimeout(() => {
        statusEl.textContent = 'Active';
        statusEl.className = 'status-value active';
        
        if (trainBtn) trainBtn.disabled = false;
        if (resetBtn) resetBtn.disabled = false;
        
        showNotification(`${modelPrefix.toUpperCase()} model training completed!`, 'success');
    }, 3000);
}

// Page access permissions (in a real app this would come from a backend API)
const pagePermissions = {
    'dashboard': ['admin', 'operator', 'viewer'],
    'workload': ['admin', 'operator'],
    'resource': ['admin'],
    'cooling': ['admin', 'operator'],
    'models': ['admin'], // Add models page permission
    'model-training': ['admin'],
    'model-monitoring': ['admin', 'operator'],
    'model-deployment': ['admin']
};

// Check if user has access to a page
function hasPageAccess(pageId) {
    return true; // In a real application, check against user role/permissions
}

// Navigate to a specific page
function navigateToPage(pageId) {
    // Update active navigation item
    navItems.forEach(navItem => {
        if (navItem.dataset.page === pageId) {
            navItem.classList.add('active');
        } else {
            navItem.classList.remove('active');
        }
    });
    
    // Check access permissions
    if (hasPageAccess(pageId)) {
        // Remove access denied message if it exists
        if (accessDeniedEl.parentNode) {
            accessDeniedEl.parentNode.removeChild(accessDeniedEl);
        }
        
        // Update URL hash without triggering the hashchange event
        const currentHash = window.location.hash.substring(1);
        if (currentHash !== pageId) {
            window.history.pushState(null, '', `#${pageId}`);
        }
        
        // Show selected page, hide others
        pages.forEach(page => {
            if (page.id === pageId) {
                page.classList.add('active');
            } else {
                page.classList.remove('active');
            }
        });
    } else {
        // Show access denied message
        accessDeniedEl.className = 'access-denied-message';
        accessDeniedEl.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-lock"></i> Access Denied</h3>
                </div>
                <div class="card-body">
                    <p>You don't have permission to access this page. Please contact your administrator or switch to a role with appropriate permissions.</p>
                    <button class="btn" id="back-to-dashboard"><i class="fas fa-home"></i> Back to Dashboard</button>
                </div>
            </div>
        `;
        
        document.querySelector('main').appendChild(accessDeniedEl);
    }
}

// Set up navigation between pages
function setupNavigation() {
    // Since we only have a dashboard page now, we don't need to handle navigation
    // Just make sure the dashboard is active
    const dashboardPage = document.getElementById('dashboard');
    if (dashboardPage) {
        dashboardPage.classList.add('active');
    }
    
    // Set active class on dashboard nav item
    const dashboardNavItem = document.querySelector('.sidebar nav ul li[data-page="dashboard"]');
    if (dashboardNavItem) {
        dashboardNavItem.classList.add('active');
    }
}

// Fetch all data from APIs
async function fetchAllData() {
    try {
        // Show loading state
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        refreshBtn.disabled = true;
        
        // Try to fetch system status
        try {
            systemData = await fetchData('/api/system/status');
        } catch (error) {
            console.log('Using mock system data');
            systemData = generateMockSystemData();
        }
        updateSystemStatus(systemData);
        
        // Try to fetch workload forecast
        try {
            forecastData = await fetchData('/api/workload/forecast');
        } catch (error) {
            console.log('Using mock forecast data');
            forecastData = generateMockForecastData();
        }
        
        // Try to fetch resource allocation decisions
        try {
            resourceAllocationData = await fetchPostData('/api/resource/allocate', forecastData);
        } catch (error) {
            console.log('Using mock resource allocation data');
            resourceAllocationData = generateMockResourceAllocationData();
        }
        
        // Try to fetch cooling optimization
        try {
            coolingData = await fetchPostData('/api/cooling/optimize', systemData);
        } catch (error) {
            console.log('Using mock cooling data');
            coolingData = generateMockCoolingData();
        }
        
        // Update charts and visualizations
        updateWorkloadForecastChart(forecastData);
        updateResourceAllocationChart(resourceAllocationData);
        updateServerCards(systemData.servers);
        updateAIInsights(forecastData, resourceAllocationData, coolingData);
        
        // Update dashboard visualizations
        updateDashboardVisualizations();
        
        // Update last updated timestamp
        lastUpdatedEl.textContent = new Date().toLocaleString();
        
        // Reset refresh button
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
        refreshBtn.disabled = false;
    } catch (error) {
        console.error('Error fetching data:', error);
        refreshBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Retry';
        refreshBtn.disabled = false;
        
        showErrorMessage('Failed to fetch data. Using mock data instead.');
        
        // Generate mock data if everything fails
        systemData = generateMockSystemData();
        forecastData = generateMockForecastData();
        resourceAllocationData = generateMockResourceAllocationData();
        coolingData = generateMockCoolingData();
        
        // Update UI with mock data
        updateSystemStatus(systemData);
        updateWorkloadForecastChart(forecastData);
        updateResourceAllocationChart(resourceAllocationData);
        updateServerCards(systemData.servers);
        updateAIInsights(forecastData, resourceAllocationData, coolingData);
        updateDashboardVisualizations();
        
        // Update last updated timestamp
        lastUpdatedEl.textContent = new Date().toLocaleString() + ' (Mock Data)';
    }
}

// Show error message
function showErrorMessage(message) {
    const errorToast = document.createElement('div');
    errorToast.className = 'error-toast';
    errorToast.textContent = message;
    
    document.body.appendChild(errorToast);
    
    // Show the toast
    setTimeout(() => {
        errorToast.classList.add('show');
        
        // Hide and remove after 5 seconds
        setTimeout(() => {
            errorToast.classList.remove('show');
            setTimeout(() => {
                errorToast.remove();
            }, 300);
        }, 5000);
    }, 100);
}

// Fetch data from API
async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
}

// Post data to API
async function fetchPostData(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
}

// Update system status overview
function updateSystemStatus(data) {
    // Update workload metrics
    if (data.servers && data.servers.length > 0) {
        const avgCpu = data.servers.reduce((sum, server) => sum + server.cpu, 0) / data.servers.length;
        const avgMemory = data.servers.reduce((sum, server) => sum + server.memory, 0) / data.servers.length;
        const avgIo = data.servers.reduce((sum, server) => sum + server.io, 0) / data.servers.length;
        
        document.getElementById('avg-cpu').textContent = `${avgCpu.toFixed(1)}%`;
        document.getElementById('avg-memory').textContent = `${avgMemory.toFixed(1)}%`;
        document.getElementById('avg-io').textContent = `${avgIo.toFixed(1)}%`;
    }
    
    // Update energy metrics
    if (data.energy) {
        document.getElementById('current-power').textContent = `${data.energy.current} kW`;
        document.getElementById('power-saved').textContent = `${data.energy.saved} kW`;
        document.getElementById('renewable-pct').textContent = `${data.energy.renewable}%`;
    }
    
    // Update cooling metrics
    if (data.cooling) {
        document.getElementById('cooling-level').textContent = data.cooling.level;
        document.getElementById('avg-temp').textContent = `${data.cooling.temperature}°C`;
        document.getElementById('humidity').textContent = `${data.cooling.humidity}%`;
    }
}

// Create and update workload forecast chart
function updateWorkloadForecastChart(data) {
    const forecasts = data.forecasts || [];
    
    // Group forecasts by server
    const serverForecasts = {};
    forecasts.forEach(forecast => {
        const serverId = forecast.server_id;
        if (!serverForecasts[serverId]) {
            serverForecasts[serverId] = {
                timeOffsets: [],
                cpuValues: [],
                memoryValues: [],
                ioValues: []
            };
        }
        
        serverForecasts[serverId].timeOffsets.push(forecast.time_offset);
        serverForecasts[serverId].cpuValues.push(forecast.cpu_forecast);
        serverForecasts[serverId].memoryValues.push(forecast.memory_forecast);
        serverForecasts[serverId].ioValues.push(forecast.io_forecast);
    });
    
    // Create plot data
    const plotData = [];
    
    // Add CPU forecasts
    Object.keys(serverForecasts).forEach((serverId, index) => {
        const serverData = serverForecasts[serverId];
        
        plotData.push({
            x: serverData.timeOffsets,
            y: serverData.cpuValues,
            type: 'scatter',
            mode: 'lines+markers',
            name: `Server ${serverId} - CPU`,
            line: { dash: 'solid', width: 3 },
            marker: { size: 6 },
            hovertemplate: 'Time: +%{x}h<br>CPU: %{y}%<extra>Server ' + serverId + '</extra>'
        });
        
        // Add memory forecasts (only for the first server to avoid cluttering)
        if (index === 0) {
            plotData.push({
                x: serverData.timeOffsets,
                y: serverData.memoryValues,
                type: 'scatter',
                mode: 'lines+markers',
                name: `Server ${serverId} - Memory`,
                line: { dash: 'dash', width: 2 },
                marker: { size: 5 },
                hovertemplate: 'Time: +%{x}h<br>Memory: %{y}%<extra>Server ' + serverId + '</extra>'
            });
        }
    });
    
    // Plot layout
    const layout = {
        title: 'Workload Forecast (Next 6 Hours)',
        xaxis: {
            title: 'Hours from Now',
            tickvals: [1, 2, 3, 4, 5, 6],
            ticktext: ['+1h', '+2h', '+3h', '+4h', '+5h', '+6h']
        },
        yaxis: {
            title: 'Utilization (%)',
            range: [0, 100]
        },
        margin: { t: 50, l: 60, r: 30, b: 50 },
        legend: { orientation: 'h', y: -0.2 },
        hovermode: 'closest',
        plot_bgcolor: 'rgba(240, 240, 240, 0.5)',
        paper_bgcolor: 'rgba(0, 0, 0, 0)',
        font: { family: 'Segoe UI, sans-serif' }
    };
    
    // Create plot
    Plotly.newPlot('workload-forecast-chart', plotData, layout, { responsive: true });
}

// Create and update resource allocation chart
function updateResourceAllocationChart(data) {
    const decisions = data.decisions || [];
    
    // Prepare data for visualization
    const serverIds = decisions.map(d => `Server ${d.server_id}`);
    const actions = decisions.map(d => d.action);
    const energySavings = decisions.map(d => d.expected_energy_savings);
    const cpuSavings = decisions.map(d => d.expected_cpu_savings);
    const confidence = decisions.map(d => d.confidence * 100);
    
    // Define colors based on action
    const colors = decisions.map(d => {
        switch (d.action) {
            case 'hibernate': return 'rgba(46, 204, 113, 0.7)';
            case 'activate': return 'rgba(52, 152, 219, 0.7)';
            case 'migrate_workload': return 'rgba(155, 89, 182, 0.7)';
            default: return 'rgba(149, 165, 166, 0.7)';
        }
    });
    
    // Create plot data
    const plotData = [{
        type: 'bar',
        x: serverIds,
        y: energySavings,
        name: 'Energy Savings (kW)',
        marker: { color: colors }
    }, {
        type: 'scatter',
        x: serverIds,
        y: confidence,
        name: 'Confidence (%)',
        yaxis: 'y2',
        mode: 'lines+markers',
        line: { color: 'rgba(231, 76, 60, 0.8)', width: 3 },
        marker: { size: 8, symbol: 'diamond' }
    }];
    
    // Create annotations for actions
    const annotations = decisions.map((d, i) => ({
        x: serverIds[i],
        y: energySavings[i] + 0.15,
        text: d.action.toUpperCase(),
        showarrow: false,
        font: { size: 10, color: '#333' }
    }));
    
    // Plot layout
    const layout = {
        title: 'Resource Allocation Decisions',
        xaxis: { title: 'Server' },
        yaxis: { 
            title: 'Energy Savings (kW)',
            range: [0, Math.max(...energySavings) * 1.5 || 1]
        },
        yaxis2: {
            title: 'Confidence (%)',
            range: [0, 100],
            overlaying: 'y',
            side: 'right',
            showgrid: false
        },
        margin: { t: 50, l: 60, r: 60, b: 50 },
        legend: { orientation: 'h', y: -0.2 },
        annotations: annotations,
        barmode: 'group',
        plot_bgcolor: 'rgba(240, 240, 240, 0.5)',
        paper_bgcolor: 'rgba(0, 0, 0, 0)',
        font: { family: 'Segoe UI, sans-serif' }
    };
    
    // Create plot
    Plotly.newPlot('resource-allocation-chart', plotData, layout, { responsive: true });
}

// Create and update server cards
function updateServerCards(servers) {
    const serversGrid = document.getElementById('servers-grid');
    serversGrid.innerHTML = '';
    
    servers.forEach(server => {
        const serverCard = document.createElement('div');
        serverCard.className = 'server-card';
        
        // Determine status class
        let statusClass = 'active';
        if (server.status === 'hibernating') {
            statusClass = 'hibernating';
        } else if (server.status === 'offline') {
            statusClass = 'offline';
        }
        
        serverCard.innerHTML = `
            <div class="server-header">
                <div class="server-name">
                    <i class="fas fa-server"></i>
                    Server ${server.id}
                </div>
                <div class="server-status ${statusClass}">${server.status}</div>
            </div>
            <div class="server-metrics">
                <div class="server-metric">
                    <div class="server-metric-label">CPU</div>
                    <div class="server-metric-value">${server.cpu}%</div>
                    <div class="progress-bar">
                        <div class="progress-fill cpu" style="width: ${server.cpu}%"></div>
                    </div>
                </div>
                <div class="server-metric">
                    <div class="server-metric-label">Memory</div>
                    <div class="server-metric-value">${server.memory}%</div>
                    <div class="progress-bar">
                        <div class="progress-fill memory" style="width: ${server.memory}%"></div>
                    </div>
                </div>
                <div class="server-metric">
                    <div class="server-metric-label">I/O</div>
                    <div class="server-metric-value">${server.io}%</div>
                    <div class="progress-bar">
                        <div class="progress-fill io" style="width: ${server.io}%"></div>
                    </div>
                </div>
                <div class="server-metric">
                    <div class="server-metric-label">Temperature</div>
                    <div class="server-metric-value">${server.temperature}°C</div>
                    <div class="progress-bar">
                        <div class="progress-fill temperature" style="width: ${(server.temperature / 60) * 100}%"></div>
                    </div>
                </div>
            </div>
        `;
        
        serversGrid.appendChild(serverCard);
    });
}

// Update AI insights
function updateAIInsights(forecastData, resourceData, coolingData) {
    const insightsList = document.getElementById('ai-insights-list');
    insightsList.innerHTML = '';
    
    // Generate insights based on data
    const insights = [];
    
    // Workload forecast insights
    if (forecastData && forecastData.forecasts) {
        const highLoadServers = forecastData.forecasts
            .filter(f => f.time_offset === 1 && (f.cpu_forecast > 80 || f.memory_forecast > 85))
            .map(f => f.server_id);
            
        if (highLoadServers.length > 0) {
            insights.push({
                icon: 'chart-line',
                title: 'High Load Alert',
                content: `Servers ${highLoadServers.join(', ')} are predicted to experience high load in the next hour. Resource allocation has been adjusted.`
            });
        }
        
        const lowLoadServers = forecastData.forecasts
            .filter(f => f.time_offset === 1 && f.cpu_forecast < 20 && f.memory_forecast < 30)
            .map(f => f.server_id);
            
        if (lowLoadServers.length > 0) {
            insights.push({
                icon: 'battery-quarter',
                title: 'Low Utilization Detected',
                content: `Servers ${lowLoadServers.join(', ')} are underutilized. Consider hibernating these servers to save energy.`
            });
        }
    }
    
    // Resource allocation insights
    if (resourceData && resourceData.decisions) {
        const hibernateDecisions = resourceData.decisions.filter(d => d.action === 'hibernate');
        const migrateDecisions = resourceData.decisions.filter(d => d.action === 'migrate_workload');
        
        if (hibernateDecisions.length > 0) {
            const totalSavings = hibernateDecisions.reduce((sum, d) => sum + d.expected_energy_savings, 0);
            insights.push({
                icon: 'leaf',
                title: 'Energy Savings Opportunity',
                content: `Hibernating ${hibernateDecisions.length} servers can save approximately ${totalSavings.toFixed(2)} kW of power.`
            });
        }
        
        if (migrateDecisions.length > 0) {
            insights.push({
                icon: 'exchange-alt',
                title: 'Workload Migration Recommended',
                content: `Migrating workloads from Server ${migrateDecisions.map(d => d.server_id).join(', ')} will optimize resource usage and improve performance.`
            });
        }
    }
    
    // Cooling optimization insights
    if (coolingData) {
        insights.push({
            icon: 'snowflake',
            title: 'Cooling Optimization',
            content: `Cooling system set to ${coolingData.cooling_level} (${coolingData.fan_speed_percent}% fan speed, ${coolingData.ac_temperature_setpoint}°C). Expected power savings: ${coolingData.expected_power_savings} kW.`
        });
    }
    
    // Add renewable energy insight
    if (systemData && systemData.energy) {
        insights.push({
            icon: 'sun',
            title: 'Renewable Energy Usage',
            content: `Currently ${systemData.energy.renewable}% of power is from renewable sources. ${systemData.energy.renewable > 50 ? 'Great job!' : 'Consider scheduling intensive tasks during peak renewable generation.'}`
        });
    }
    
    // Render insights
    insights.forEach(insight => {
        const insightItem = document.createElement('div');
        insightItem.className = 'insight-item';
        
        insightItem.innerHTML = `
            <div class="insight-icon">
                <i class="fas fa-${insight.icon}"></i>
            </div>
            <div class="insight-content">
                <h4>${insight.title}</h4>
                <p>${insight.content}</p>
            </div>
        `;
        
        insightsList.appendChild(insightItem);
    });
}

// Update workload detail page
function updateWorkloadDetailPage() {
    if (!forecastData) return;
    
    // Create a more detailed workload forecast chart
    const forecasts = forecastData.forecasts || [];
    
    // Group forecasts by server
    const serverForecasts = {};
    forecasts.forEach(forecast => {
        const serverId = forecast.server_id;
        if (!serverForecasts[serverId]) {
            serverForecasts[serverId] = {
                timeOffsets: [],
                cpuValues: [],
                memoryValues: [],
                ioValues: []
            };
        }
        
        serverForecasts[serverId].timeOffsets.push(forecast.time_offset);
        serverForecasts[serverId].cpuValues.push(forecast.cpu_forecast);
        serverForecasts[serverId].memoryValues.push(forecast.memory_forecast);
        serverForecasts[serverId].ioValues.push(forecast.io_forecast);
    });
    
    // Create plot data
    const plotData = [];
    
    // Add all metrics for all servers
    Object.keys(serverForecasts).forEach(serverId => {
        const serverData = serverForecasts[serverId];
        
        // CPU
        plotData.push({
            x: serverData.timeOffsets,
            y: serverData.cpuValues,
            type: 'scatter',
            mode: 'lines+markers',
            name: `Server ${serverId} - CPU`,
            line: { width: 3, color: `rgba(231, 76, 60, ${1 - serverId * 0.15})` },
            marker: { size: 6 },
            hovertemplate: 'Time: +%{x}h<br>CPU: %{y}%<extra>Server ' + serverId + '</extra>'
        });
        
        // Memory
        plotData.push({
            x: serverData.timeOffsets,
            y: serverData.memoryValues,
            type: 'scatter',
            mode: 'lines+markers',
            name: `Server ${serverId} - Memory`,
            line: { dash: 'dash', width: 2, color: `rgba(52, 152, 219, ${1 - serverId * 0.15})` },
            marker: { size: 5 },
            hovertemplate: 'Time: +%{x}h<br>Memory: %{y}%<extra>Server ' + serverId + '</extra>'
        });
        
        // I/O
        plotData.push({
            x: serverData.timeOffsets,
            y: serverData.ioValues,
            type: 'scatter',
            mode: 'lines+markers',
            name: `Server ${serverId} - I/O`,
            line: { dash: 'dot', width: 2, color: `rgba(46, 204, 113, ${1 - serverId * 0.15})` },
            marker: { size: 5 },
            hovertemplate: 'Time: +%{x}h<br>I/O: %{y}%<extra>Server ' + serverId + '</extra>'
        });
    });
    
    // Plot layout
    const layout = {
        title: 'Detailed Workload Forecast (Next 6 Hours)',
        xaxis: {
            title: 'Hours from Now',
            tickvals: [1, 2, 3, 4, 5, 6],
            ticktext: ['+1h', '+2h', '+3h', '+4h', '+5h', '+6h']
        },
        yaxis: {
            title: 'Utilization (%)',
            range: [0, 100]
        },
        margin: { t: 50, l: 60, r: 30, b: 50 },
        legend: { orientation: 'h', y: -0.2 },
        hovermode: 'closest',
        plot_bgcolor: 'rgba(240, 240, 240, 0.5)',
        paper_bgcolor: 'rgba(0, 0, 0, 0)',
        font: { family: 'Segoe UI, sans-serif' }
    };
    
    // Create plot
    Plotly.newPlot('workload-detail-chart', plotData, layout, { responsive: true });
    
    // Update training controls status
    updateModelTrainingStatus('wf');
}

// Update resource allocation detail page
function updateResourceDetailPage() {
    if (!resourceAllocationData) return;
    
    // Create a detailed resource allocation visualization
    const decisions = resourceAllocationData.decisions || [];
    const resourceDecisionsList = document.getElementById('resource-decisions-list');
    
    // Clear previous content
    resourceDecisionsList.innerHTML = '';
    
    // Create a visualization of resource allocation decisions
    const serverData = [];
    const serverLabels = [];
    const cpuData = [];
    const memoryData = [];
    const ioData = [];
    const energyData = [];
    
    // Collect data for the chart
    decisions.forEach(decision => {
        serverLabels.push(`Server ${decision.server_id}`);
        cpuData.push(decision.expected_cpu_savings);
        energyData.push(decision.expected_energy_savings);
    });
    
    // Create plot data
    const plotData = [
        {
            type: 'bar',
            name: 'CPU Savings (%)',
            x: serverLabels,
            y: cpuData,
            marker: { color: 'rgba(52, 152, 219, 0.7)' }
        },
        {
            type: 'bar',
            name: 'Energy Savings (kW)',
            x: serverLabels,
            y: energyData,
            marker: { color: 'rgba(46, 204, 113, 0.7)' }
        }
    ];
    
    // Plot layout
    const layout = {
        title: 'Resource Allocation Decisions',
        barmode: 'group',
        xaxis: { title: 'Server' },
        yaxis: { title: 'Savings' },
        margin: { t: 50, l: 60, r: 30, b: 70 },
        legend: { orientation: 'h', y: -0.2 },
        plot_bgcolor: 'rgba(240, 240, 240, 0.5)',
        paper_bgcolor: 'rgba(0, 0, 0, 0)',
        font: { family: 'Segoe UI, sans-serif' }
    };
    
    // Create plot
    Plotly.newPlot('resource-detail-chart', plotData, layout, { responsive: true });
    
    // Create decision cards
    decisions.forEach(decision => {
        const decisionItem = document.createElement('div');
        decisionItem.className = 'insight-item';
        
        // Choose icon based on action
        let icon = 'cog';
        let actionColor = 'var(--accent-color)';
        
        if (decision.action === 'hibernate') {
            icon = 'power-off';
            actionColor = 'var(--danger-color)';
        } else if (decision.action === 'activate') {
            icon = 'play';
            actionColor = 'var(--success-color)';
        } else if (decision.action === 'migrate_workload') {
            icon = 'exchange-alt';
            actionColor = 'var(--warning-color)';
        }
        
        decisionItem.innerHTML = `
            <div class="insight-icon" style="background-color: ${actionColor}">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="insight-content">
                <h4>Server ${decision.server_id}: ${decision.action.toUpperCase()}</h4>
                <p>
                    Expected CPU Savings: ${decision.expected_cpu_savings}%<br>
                    Expected Energy Savings: ${decision.expected_energy_savings} kW<br>
                    Confidence: ${(decision.confidence * 100).toFixed(1)}%
                </p>
            </div>
        `;
        
        resourceDecisionsList.appendChild(decisionItem);
    });
    
    // Update training controls status
    updateModelTrainingStatus('ra');
}

// Update cooling optimization detail page
function updateCoolingDetailPage() {
    if (!coolingData) return;
    
    // Create a visualization of cooling settings
    const coolingSettingsDisplay = document.getElementById('cooling-settings-display');
    
    // Clear previous content
    coolingSettingsDisplay.innerHTML = '';
    
    // Create temperature heatmap data
    const serverRows = 2;
    const serverCols = 5;
    const zValues = [];
    const textValues = [];
    
    for (let row = 0; row < serverRows; row++) {
        const zRow = [];
        const textRow = [];
        
        for (let col = 0; col < serverCols; col++) {
            const serverIndex = row * serverCols + col;
            const serverTemp = coolingData.server_temperatures?.[serverIndex] || 
                               (35 + Math.random() * 15); // Random temp between 35-50°C
            
            zRow.push(serverTemp);
            textRow.push(`${serverTemp.toFixed(1)}°C`);
        }
        
        zValues.push(zRow);
        textValues.push(textRow);
    }
    
    // Create plot data
    const plotData = [
        {
            type: 'heatmap',
            z: zValues,
            text: textValues,
            texttemplate: '%{text}',
            textfont: { color: 'white' },
            colorscale: [
                [0, 'rgba(0, 255, 255, 0.7)'],   // Cool (cyan)
                [0.5, 'rgba(255, 255, 0, 0.9)'], // Warm (yellow)
                [1, 'rgba(255, 0, 0, 0.9)']      // Hot (red)
            ],
            showscale: true,
            zmin: 35,
            zmax: 70,
            colorbar: {
                title: 'Temperature (°C)',
                titleside: 'right',
                titlefont: { size: 14 }
            }
        }
    ];
    
    // Plot layout
    const layout = {
        title: 'Server Temperature Heatmap',
        margin: { t: 50, l: 30, r: 100, b: 30 },
        xaxis: { 
            title: 'Rack Position',
            tickvals: [...Array(serverCols).keys()],
            ticktext: [...Array(serverCols).keys()].map(i => `Pos ${i+1}`)
        },
        yaxis: { 
            title: 'Rack Level',
            tickvals: [...Array(serverRows).keys()],
            ticktext: [...Array(serverRows).keys()].map(i => `Level ${i+1}`)
        },
        plot_bgcolor: 'rgba(240, 240, 240, 0.5)',
        paper_bgcolor: 'rgba(0, 0, 0, 0)',
        font: { family: 'Segoe UI, sans-serif' }
    };
    
    // Create plot
    Plotly.newPlot('cooling-detail-chart', plotData, layout, { responsive: true });
    
    // Create cards for current cooling settings
    updateCoolingSettings();
}

// Update cooling settings display
function updateCoolingSettings() {
    const coolingSettingsDisplay = document.getElementById('cooling-settings-display');
    if (!coolingSettingsDisplay || !coolingData) return;
    
    // Clear previous content
    coolingSettingsDisplay.innerHTML = '';
    
    const settings = coolingData.cooling_settings || {
        fan_speed: 65,
        target_temp: 22,
        humidity_level: 45,
        power_optimization: 'balanced'
    };
    
    const powerOptimizationColors = {
        'performance': 'var(--danger-color)',
        'balanced': 'var(--warning-color)',
        'eco': 'var(--success-color)'
    };
    
    const settingsItems = [
        {
            icon: 'fan',
            title: 'Cooling Fan Speed',
            value: `${settings.fan_speed}%`,
            details: `Current HVAC fan speed setting`
        },
        {
            icon: 'thermometer-half',
            title: 'Target Room Temperature',
            value: `${settings.target_temp}°C`,
            details: `Optimal temperature for current workload`
        },
        {
            icon: 'tint',
            title: 'Humidity Control',
            value: `${settings.humidity_level}%`,
            details: `Target relative humidity level`
        },
        {
            icon: 'leaf',
            title: 'Power Optimization Mode',
            value: settings.power_optimization?.toUpperCase() || 'BALANCED',
            details: `Current energy efficiency setting`,
            color: powerOptimizationColors[settings.power_optimization] || 'var(--accent-color)'
        }
    ];
    
    // Add settings items to DOM
    settingsItems.forEach(item => {
        const settingCard = document.createElement('div');
        settingCard.className = 'setting-card';
        
        settingCard.innerHTML = `
            <div class="setting-icon" style="background-color: ${item.color || 'var(--accent-color)'}">
                <i class="fas fa-${item.icon}"></i>
            </div>
            <div class="setting-details">
                <h4>${item.title}</h4>
                <div class="setting-value">${item.value}</div>
                <div class="setting-description">${item.details}</div>
            </div>
        `;
        
        coolingSettingsDisplay.appendChild(settingCard);
    });
}

// Update resource decisions list
function updateResourceDecisionsList() {
    const resourceDecisionsList = document.getElementById('resource-decisions-list');
    
    // Update training controls status
    updateModelTrainingStatus('co');
}

// Fetch model details from the API
async function fetchModelDetails() {
    try {
        modelDetailsData = await fetchData('/api/models/details');
        updateModelsPage();
    } catch (error) {
        console.error('Error fetching model details:', error);
        // Use dummy data for development
        modelDetailsData = {
            models: [
                {
                    id: 'workload_forecasting',
                    name: 'Workload Forecasting',
                    type: 'Temporal Convolutional Network',
                    accuracy: 0.94,
                    last_trained: '2023-05-15',
                    status: 'active',
                    inputs: ['CPU History', 'Memory History', 'I/O History', 'Time Features'],
                    outputs: ['CPU Forecast', 'Memory Forecast', 'I/O Forecast'],
                    version: '2.1.3'
                },
                {
                    id: 'resource_allocation',
                    name: 'Resource Allocation',
                    type: 'Deep Reinforcement Learning',
                    accuracy: 0.91,
                    last_trained: '2023-04-22',
                    status: 'active',
                    inputs: ['Current Server Status', 'Workload Forecast', 'Energy Targets'],
                    outputs: ['Server Actions', 'Expected Savings', 'Confidence Scores'],
                    version: '1.8.5'
                },
                {
                    id: 'cooling_optimization',
                    name: 'Cooling Optimization',
                    type: 'Fuzzy Logic Controller',
                    accuracy: 0.95,
                    last_trained: 'N/A',
                    status: 'active',
                    inputs: ['Server Temperatures', 'Ambient Conditions', 'Workload Heat Output'],
                    outputs: ['Cooling Level', 'Fan Speed', 'AC Temperature'],
                    version: '3.2.1'
                }
            ],
            interactions: [
                {
                    source: 'workload_forecasting',
                    target: 'resource_allocation',
                    data: 'Predicted server load'
                },
                {
                    source: 'workload_forecasting',
                    target: 'cooling_optimization',
                    data: 'Predicted heat generation'
                },
                {
                    source: 'resource_allocation',
                    target: 'cooling_optimization',
                    data: 'Server activation plans'
                }
            ]
        };
        updateModelsPage();
    }
}

// Update AI models page
function updateModelsPage() {
    if (!modelDetailsData) return;
    
    const modelsContainer = document.getElementById('models-overview');
    if (!modelsContainer) return;
    
    // Clear previous content
    modelsContainer.innerHTML = '';
    
    // Create model cards
    modelDetailsData.models.forEach(model => {
        const modelCard = document.createElement('div');
        modelCard.className = 'model-card';
        
        // Determine icon based on model type
        let icon = 'brain';
        if (model.id === 'workload_forecasting') icon = 'chart-line';
        else if (model.id === 'resource_allocation') icon = 'server';
        else if (model.id === 'cooling_optimization') icon = 'snowflake';
        
        // Determine status class
        let statusClass = 'active';
        if (model.status === 'inactive') statusClass = 'hibernating';
        else if (model.status === 'error') statusClass = 'offline';
        else if (model.status === 'training') statusClass = 'warning';
        
        modelCard.innerHTML = `
            <div class="model-card-header">
                <div class="model-icon">
                    <i class="fas fa-${icon}"></i>
                </div>
                <div class="model-title">
                    <h4>${model.name}</h4>
                    <div class="model-type">${model.type}</div>
                </div>
                <div class="model-status ${statusClass}">${model.status}</div>
            </div>
            <div class="model-card-body">
                <div class="model-metrics">
                    <div class="model-metric">
                        <div class="metric-label">Accuracy</div>
                        <div class="metric-value">${model.accuracy * 100}%</div>
                    </div>
                    <div class="model-metric">
                        <div class="metric-label">Version</div>
                        <div class="metric-value">${model.version}</div>
                    </div>
                    <div class="model-metric">
                        <div class="metric-label">Last Trained</div>
                        <div class="metric-value">${model.last_trained}</div>
                    </div>
                </div>
                <div class="model-io">
                    <div class="model-inputs">
                        <h5>Inputs</h5>
                        <ul>
                            ${model.inputs.map(input => `<li>${input}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="model-outputs">
                        <h5>Outputs</h5>
                        <ul>
                            ${model.outputs.map(output => `<li>${output}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                <div class="model-actions">
                    <button class="btn model-action-btn" data-model="${model.id}" data-action="view">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="btn model-action-btn" data-model="${model.id}" data-action="retrain">
                        <i class="fas fa-sync-alt"></i> Retrain
                    </button>
                    <button class="btn model-action-btn" data-model="${model.id}" data-action="toggle">
                        <i class="fas fa-${model.status === 'active' ? 'power-off' : 'play'}"></i>
                        ${model.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                </div>
            </div>
        `;
        
        modelsContainer.appendChild(modelCard);
    });
    
    // Add event listeners to model action buttons
    const actionButtons = document.querySelectorAll('.model-action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', handleModelAction);
    });
    
    // Create model interaction visualization
    createModelInteractionsDiagram();
    
    // Create model performance chart
    createModelPerformanceChart('all');
}

// Handle model action button clicks
function handleModelAction(event) {
    const button = event.currentTarget;
    const modelId = button.dataset.model;
    const action = button.dataset.action;
    
    // In a real app, these would make API calls
    switch (action) {
        case 'view':
            // Navigate to the specific model page
            if (modelId === 'workload_forecasting') {
                navigateToPage('workload');
            } else if (modelId === 'resource_allocation') {
                navigateToPage('resource');
            } else if (modelId === 'cooling_optimization') {
                navigateToPage('cooling');
            }
            break;
            
        case 'retrain':
            // Show a notification that retraining has started
            showNotification(`Retraining ${modelId.replace('_', ' ')} model...`, 'info');
            // In a real app, you would make an API call to trigger retraining
            break;
            
        case 'toggle':
            // Toggle model status
            const model = modelDetailsData.models.find(m => m.id === modelId);
            if (model) {
                model.status = model.status === 'active' ? 'inactive' : 'active';
                // Update UI
                updateModelsPage();
                // Show notification
                showNotification(
                    `${model.name} ${model.status === 'active' ? 'activated' : 'deactivated'}`,
                    model.status === 'active' ? 'success' : 'warning'
                );
            }
            break;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notificationEl = document.createElement('div');
    notificationEl.className = `notification ${type}`;
    notificationEl.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add dismiss button functionality
    notificationEl.querySelector('.notification-close').addEventListener('click', () => {
        notificationEl.remove();
    });
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (notificationEl.parentNode) {
            notificationEl.remove();
        }
    }, 5000);
    
    document.querySelector('main').appendChild(notificationEl);
}

// Create a force-directed graph showing model interactions
function createModelInteractionsDiagram() {
    const interactionContainer = document.getElementById('model-interactions');
    if (!interactionContainer || !modelDetailsData) return;
    
    // Check if D3.js is available
    if (typeof d3 === 'undefined') {
        interactionContainer.innerHTML = '<div class="chart-placeholder">D3.js library is required for interaction visualization.</div>';
        return;
    }
    
    // Clear previous content
    interactionContainer.innerHTML = '';
    
    // Prepare data for D3.js
    const nodes = modelDetailsData.models.map(model => ({
        id: model.id,
        name: model.name,
        type: model.type,
        status: model.status
    }));
    
    const links = modelDetailsData.interactions.map(interaction => ({
        source: interaction.source,
        target: interaction.target,
        label: interaction.data
    }));
    
    // Create SVG container
    const width = interactionContainer.clientWidth;
    const height = 400;
    
    const svg = d3.select(interactionContainer)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    // Define forces
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(150))
        .force('charge', d3.forceManyBody().strength(-500))
        .force('center', d3.forceCenter(width / 2, height / 2));
    
    // Create links
    const link = svg.append('g')
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 2);
    
    // Create link labels
    const linkLabels = svg.append('g')
        .selectAll('text')
        .data(links)
        .enter()
        .append('text')
        .text(d => d.label)
        .attr('font-size', '10px')
        .attr('text-anchor', 'middle')
        .attr('dy', -5);
    
    // Create nodes
    const node = svg.append('g')
        .selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('r', 30)
        .attr('fill', d => {
            switch (d.id) {
                case 'workload_forecasting': return 'rgba(52, 152, 219, 0.8)';
                case 'resource_allocation': return 'rgba(155, 89, 182, 0.8)';
                case 'cooling_optimization': return 'rgba(46, 204, 113, 0.8)';
                default: return 'rgba(149, 165, 166, 0.8)';
            }
        })
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));
    
    // Create node labels
    const nodeLabels = svg.append('g')
        .selectAll('text')
        .data(nodes)
        .enter()
        .append('text')
        .text(d => d.name.split(' ')[0])
        .attr('font-size', '12px')
        .attr('text-anchor', 'middle')
        .attr('dy', 5);
    
    // Update positions on simulation tick
    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        linkLabels
            .attr('x', d => (d.source.x + d.target.x) / 2)
            .attr('y', d => (d.source.y + d.target.y) / 2);
        
        node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
        
        nodeLabels
            .attr('x', d => d.x)
            .attr('y', d => d.y);
    });
    
    // Drag functions
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

// Create and update model performance chart
function createModelPerformanceChart(modelFilter = 'all') {
    const performanceChart = document.getElementById('model-performance-chart');
    if (!performanceChart || !modelDetailsData) return;
    
    // Sample historical data for demonstration
    // In a real app, this would come from the API
    const today = new Date();
    const historyDays = 30;
    const dates = [];
    
    for (let i = historyDays; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }
    
    // Generate sample performance data
    // Each model has slightly different baseline accuracy and variability
    function generatePerformanceData(baseAccuracy, variability) {
        return dates.map(date => {
            // Add some randomness to simulate real data
            const noise = (Math.random() - 0.5) * variability;
            // Accuracy generally improves over time
            const timeImprovement = dates.indexOf(date) / dates.length * 0.05;
            return baseAccuracy + noise + timeImprovement;
        });
    }
    
    const performanceData = {
        workload_forecasting: generatePerformanceData(0.90, 0.04),
        resource_allocation: generatePerformanceData(0.87, 0.05),
        cooling_optimization: generatePerformanceData(0.92, 0.03)
    };
    
    // Plot data based on filter
    const plotData = [];
    
    if (modelFilter === 'all' || modelFilter === 'workload_forecasting') {
        plotData.push({
            x: dates,
            y: performanceData.workload_forecasting,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Workload Forecasting',
            line: { color: 'rgba(52, 152, 219, 0.8)', width: 3 },
            marker: { size: 6 }
        });
    }
    
    if (modelFilter === 'all' || modelFilter === 'resource_allocation') {
        plotData.push({
            x: dates,
            y: performanceData.resource_allocation,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Resource Allocation',
            line: { color: 'rgba(155, 89, 182, 0.8)', width: 3 },
            marker: { size: 6 }
        });
    }
    
    if (modelFilter === 'all' || modelFilter === 'cooling_optimization') {
        plotData.push({
            x: dates,
            y: performanceData.cooling_optimization,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Cooling Optimization',
            line: { color: 'rgba(46, 204, 113, 0.8)', width: 3 },
            marker: { size: 6 }
        });
    }
    
    // Plot layout
    const layout = {
        title: 'Model Accuracy Over Time',
        xaxis: {
            title: 'Date',
            tickformat: '%Y-%m-%d',
            tickangle: -45
        },
        yaxis: {
            title: 'Accuracy',
            range: [0.8, 1.0],
            tickformat: '.0%'
        },
        margin: { t: 50, l: 60, r: 30, b: 80 },
        legend: { orientation: 'h', y: -0.2 },
        hovermode: 'closest',
        plot_bgcolor: 'rgba(240, 240, 240, 0.5)',
        paper_bgcolor: 'rgba(0, 0, 0, 0)',
        font: { family: 'Segoe UI, sans-serif' }
    };
    
    // Create plot
    Plotly.newPlot('model-performance-chart', plotData, layout, { responsive: true });
}

// Reset model interactions
function resetInteractions() {
    // Implementation of resetInteractions function
}

// Update Model Training Page
function updateModelTrainingPage() {
    // Create the training progress chart
    const progressChartEl = document.getElementById('training-progress-chart');
    if (!progressChartEl) return;
    
    // Sample data for demonstration
    const traces = [
        {
            y: [0.8, 0.82, 0.85, 0.87, 0.89, 0.90, 0.91, 0.915, 0.92, 0.925],
            x: Array.from({length: 10}, (_, i) => i + 1),
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Accuracy',
            line: { color: 'rgba(46, 204, 113, 0.8)', width: 3 },
            marker: { size: 6 }
        },
        {
            y: [0.6, 0.45, 0.35, 0.3, 0.28, 0.25, 0.22, 0.2, 0.18, 0.16],
            x: Array.from({length: 10}, (_, i) => i + 1),
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Loss',
            line: { color: 'rgba(231, 76, 60, 0.8)', width: 3 },
            marker: { size: 6 }
        }
    ];
    
    const layout = {
        title: 'Training Progress',
        xaxis: {
            title: 'Epoch',
            tickmode: 'linear',
            tick0: 1,
            dtick: 1
        },
        yaxis: {
            title: 'Value',
            range: [0, 1]
        },
        margin: { t: 50, l: 60, r: 30, b: 50 },
        legend: { orientation: 'h', y: -0.2 },
        hovermode: 'closest',
        plot_bgcolor: 'rgba(240, 240, 240, 0.5)',
        paper_bgcolor: 'rgba(0, 0, 0, 0)',
        font: { family: 'Segoe UI, sans-serif' }
    };
    
    // Create plot
    Plotly.newPlot('training-progress-chart', traces, layout, { responsive: true });
    
    // Add event listeners to the training buttons
    const wftTrainBtn = document.getElementById('wft-train-btn');
    const ratTrainBtn = document.getElementById('rat-train-btn');
    const cotUpdateBtn = document.getElementById('cot-update-btn');
    
    if (wftTrainBtn) {
        wftTrainBtn.addEventListener('click', () => {
            const epochs = document.getElementById('wft-epochs').value;
            const batchSize = document.getElementById('wft-batch-size').value;
            
            showNotification(`Starting Workload Forecasting training with ${epochs} epochs and batch size ${batchSize}...`, 'info');
            
            // Simulate training progress update
            setTimeout(() => {
                showNotification('Workload Forecasting Model training completed successfully!', 'success');
                
                // Update the chart with new "data"
                const newAccuracy = traces[0].y.map(y => Math.min(y + Math.random() * 0.03, 1));
                const newLoss = traces[1].y.map(y => Math.max(y - Math.random() * 0.03, 0));
                
                Plotly.update('training-progress-chart', {
                    y: [newAccuracy, newLoss]
                }, {}, [0, 1]);
            }, 3000);
        });
    }
    
    if (ratTrainBtn) {
        ratTrainBtn.addEventListener('click', () => {
            const episodes = document.getElementById('rat-episodes').value;
            const exploration = document.getElementById('rat-exploration').value;
            
            showNotification(`Starting Resource Allocation training with ${episodes} episodes and exploration rate ${exploration}...`, 'info');
            
            // Simulate training progress update
            setTimeout(() => {
                showNotification('Resource Allocation Model training completed successfully!', 'success');
            }, 3000);
        });
    }
    
    if (cotUpdateBtn) {
        cotUpdateBtn.addEventListener('click', () => {
            const tempWeight = document.getElementById('cot-temp-weight').value;
            const powerWeight = document.getElementById('cot-power-weight').value;
            
            showNotification(`Updating Cooling Optimization configuration with temperature weight ${tempWeight} and power weight ${powerWeight}...`, 'info');
            
            // Simulate update
            setTimeout(() => {
                showNotification('Cooling Optimization Model configuration updated successfully!', 'success');
            }, 1500);
        });
    }
}

// Update Model Monitoring Page
function updateModelMonitoringPage() {
    // Create accuracy trend chart
    const accuracyChartEl = document.getElementById('model-accuracy-chart');
    if (!accuracyChartEl) return;
    
    // Sample data for demonstration
    const today = new Date();
    const dates = Array.from({length: 30}, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - 29 + i);
        return date.toISOString().split('T')[0];
    });
    
    const workloadAccuracy = dates.map(() => 0.9 + (Math.random() - 0.5) * 0.05);
    const resourceAccuracy = dates.map(() => 0.88 + (Math.random() - 0.5) * 0.06);
    const coolingAccuracy = dates.map(() => 0.93 + (Math.random() - 0.5) * 0.04);
    
    const traces = [
        {
            y: workloadAccuracy,
            x: dates,
            type: 'scatter',
            mode: 'lines',
            name: 'Workload Forecasting',
            line: { color: 'rgba(52, 152, 219, 0.8)', width: 3 }
        },
        {
            y: resourceAccuracy,
            x: dates,
            type: 'scatter',
            mode: 'lines',
            name: 'Resource Allocation',
            line: { color: 'rgba(155, 89, 182, 0.8)', width: 3 }
        },
        {
            y: coolingAccuracy,
            x: dates,
            type: 'scatter',
            mode: 'lines',
            name: 'Cooling Optimization',
            line: { color: 'rgba(46, 204, 113, 0.8)', width: 3 }
        }
    ];
    
    const layout = {
        title: 'Model Accuracy Trends',
        xaxis: {
            title: 'Date',
            tickformat: '%Y-%m-%d',
            tickangle: -45,
            nticks: 10
        },
        yaxis: {
            title: 'Accuracy',
            range: [0.8, 1.0],
            tickformat: '.0%'
        },
        margin: { t: 50, l: 60, r: 30, b: 80 },
        legend: { orientation: 'h', y: -0.2 },
        hovermode: 'closest',
        plot_bgcolor: 'rgba(240, 240, 240, 0.5)',
        paper_bgcolor: 'rgba(0, 0, 0, 0)',
        font: { family: 'Segoe UI, sans-serif' }
    };
    
    // Create plot
    Plotly.newPlot('model-accuracy-chart', traces, layout, { responsive: true });
    
    // Add event listener to monitor model selector
    const monitoringModelSelect = document.getElementById('monitoring-model-select');
    
    if (monitoringModelSelect) {
        monitoringModelSelect.addEventListener('change', () => {
            const model = monitoringModelSelect.value;
            
            // Filter data based on selection
            const visibleTraces = [0, 1, 2]; // All models by default
            
            if (model === 'workload_forecasting') {
                Plotly.update('model-accuracy-chart', {}, {}, [0]);
            } else if (model === 'resource_allocation') {
                Plotly.update('model-accuracy-chart', {}, {}, [1]);
            } else if (model === 'cooling_optimization') {
                Plotly.update('model-accuracy-chart', {}, {}, [2]);
            } else {
                Plotly.update('model-accuracy-chart', {}, {}, visibleTraces);
            }
        });
    }
}

// Update Model Deployment Page
function updateModelDeploymentPage() {
    // Add event listeners to deployment buttons
    const deploymentButtons = document.querySelectorAll('[id$="-rollback-btn"], [id$="-update-btn"]');
    
    deploymentButtons.forEach(button => {
        button.addEventListener('click', event => {
            const buttonId = event.currentTarget.id;
            const isRollback = buttonId.includes('-rollback-btn');
            const modelPrefix = buttonId.split('-')[0];
            
            let modelName;
            if (modelPrefix === 'wf') {
                modelName = 'Workload Forecasting';
            } else if (modelPrefix === 'ra') {
                modelName = 'Resource Allocation';
            } else if (modelPrefix === 'co') {
                modelName = 'Cooling Optimization';
            }
            
            if (isRollback) {
                showNotification(`Preparing to rollback ${modelName} model to previous version...`, 'warning');
                
                // Simulate confirmation dialog
                setTimeout(() => {
                    const confirmed = confirm(`Are you sure you want to rollback ${modelName} model to the previous version? This action cannot be undone.`);
                    
                    if (confirmed) {
                        showNotification(`${modelName} model successfully rolled back to previous version.`, 'success');
                    }
                }, 1000);
            } else {
                showNotification(`Preparing to update ${modelName} model...`, 'info');
                
                // Simulate update process
                setTimeout(() => {
                    showNotification(`${modelName} model successfully updated to latest version.`, 'success');
                }, 2000);
            }
        });
    });
    
    // Add event listener to version history selector
    const versionModelSelect = document.getElementById('version-model-select');
    
    if (versionModelSelect) {
        versionModelSelect.addEventListener('change', () => {
            const model = versionModelSelect.value;
            const versionHistoryList = document.querySelector('.version-history-list');
            
            // Replace with model-specific version history (simplified for this example)
            if (model === 'resource_allocation') {
                versionHistoryList.innerHTML = `
                    <div class="version-item">
                        <div class="version-header">
                            <div class="version-tag current">v1.8.5</div>
                            <div class="version-date">Apr 18, 2023</div>
                        </div>
                        <div class="version-details">
                            <p>Fine-tuned reward function to prioritize energy efficiency. Added hardware-specific optimizations.</p>
                        </div>
                    </div>
                    <div class="version-item">
                        <div class="version-header">
                            <div class="version-tag">v1.8.0</div>
                            <div class="version-date">Mar 5, 2023</div>
                        </div>
                        <div class="version-details">
                            <p>Major update with improved DRL agent architecture. Added support for heterogeneous server clusters.</p>
                        </div>
                    </div>
                `;
            } else if (model === 'cooling_optimization') {
                versionHistoryList.innerHTML = `
                    <div class="version-item">
                        <div class="version-header">
                            <div class="version-tag current">v3.2.1</div>
                            <div class="version-date">May 10, 2023</div>
                        </div>
                        <div class="version-details">
                            <p>Refined fuzzy logic rules for improved temperature stability. Reduced cooling oscillations by 30%.</p>
                        </div>
                    </div>
                    <div class="version-item">
                        <div class="version-header">
                            <div class="version-tag">v3.2.0</div>
                            <div class="version-date">Apr 22, 2023</div>
                        </div>
                        <div class="version-details">
                            <p>Added support for variable humidity conditions. Implemented new power-saving algorithms.</p>
                        </div>
                    </div>
                `;
            } else {
                // Workload forecasting is the default
                versionHistoryList.innerHTML = `
                    <div class="version-item">
                        <div class="version-header">
                            <div class="version-tag current">v2.1.3</div>
                            <div class="version-date">May 1, 2023</div>
                        </div>
                        <div class="version-details">
                            <p>Improved accuracy for weekend workload predictions. Reduced false positives by 15%.</p>
                        </div>
                    </div>
                    <div class="version-item">
                        <div class="version-header">
                            <div class="version-tag">v2.1.2</div>
                            <div class="version-date">Apr 12, 2023</div>
                        </div>
                        <div class="version-details">
                            <p>Fixed memory leak in temporal convolution layer. Optimized model size.</p>
                        </div>
                    </div>
                    <div class="version-item">
                        <div class="version-header">
                            <div class="version-tag">v2.1.0</div>
                            <div class="version-date">Mar 28, 2023</div>
                        </div>
                        <div class="version-details">
                            <p>Added attention mechanism for better long-term forecasting. Improved RMSE by 12%.</p>
                        </div>
                    </div>
                `;
            }
        });
    }
}

// Update model training status
function updateModelTrainingStatus(modelPrefix) {
    // Get reference to training status elements
    const statusEl = document.querySelector(`.training-controls .status-value`);
    if (!statusEl) return;
    
    // In a real application, we would fetch the current training status from the API
    // For demo purposes, we'll set it to active
    statusEl.textContent = 'Active';
    statusEl.className = 'status-value active';
    
    // Ensure buttons are enabled
    const trainBtn = document.getElementById(`${modelPrefix}-train-btn`);
    const resetBtn = document.getElementById(`${modelPrefix}-reset-btn`);
    
    if (trainBtn) trainBtn.disabled = false;
    if (resetBtn) resetBtn.disabled = false;
}

// Generate mock system data
function generateMockSystemData() {
    const numServers = 5;
    const servers = [];
    
    for (let i = 1; i <= numServers; i++) {
        servers.push({
            id: i,
            cpu: Math.floor(30 + Math.random() * 60), // 30-90%
            memory: Math.floor(20 + Math.random() * 70), // 20-90%
            io: Math.floor(10 + Math.random() * 80), // 10-90%
            temperature: Math.floor(35 + Math.random() * 15), // 35-50°C
            status: ['active', 'active', 'active', 'hibernating', 'offline'][Math.floor(Math.random() * 5)]
        });
    }
    
    return {
        servers: servers,
        energy: {
            current: (12 + Math.random() * 8).toFixed(1), // 12-20 kW
            saved: (3 + Math.random() * 5).toFixed(1), // 3-8 kW
            renewable: Math.floor(20 + Math.random() * 60) // 20-80%
        },
        cooling: {
            level: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
            temperature: (20 + Math.random() * 5).toFixed(1), // 20-25°C
            humidity: Math.floor(40 + Math.random() * 20) // 40-60%
        }
    };
}

// Generate mock forecast data
function generateMockForecastData() {
    const numServers = 5;
    const timePoints = 6; // 6 hours into the future
    const forecasts = [];
    
    for (let server = 1; server <= numServers; server++) {
        const baseCpu = 30 + Math.random() * 40; // 30-70%
        const baseMemory = 40 + Math.random() * 30; // 40-70%
        const baseIo = 20 + Math.random() * 40; // 20-60%
        
        for (let time = 1; time <= timePoints; time++) {
            // Add some randomness and trend for time progression
            const trendFactor = time / timePoints; // Increases with time
            const randomVariation = Math.random() * 20 - 10; // -10 to +10
            
            forecasts.push({
                server_id: server,
                time_offset: time,
                cpu_forecast: Math.min(100, Math.max(5, Math.floor(baseCpu + (randomVariation - 5) + trendFactor * 20))),
                memory_forecast: Math.min(100, Math.max(5, Math.floor(baseMemory + randomVariation + trendFactor * 15))),
                io_forecast: Math.min(100, Math.max(5, Math.floor(baseIo + randomVariation - trendFactor * 10)))
            });
        }
    }
    
    return {
        forecasts: forecasts
    };
}

// Generate mock resource allocation data
function generateMockResourceAllocationData() {
    const numServers = 5;
    const decisions = [];
    const actions = ['hibernate', 'activate', 'migrate_workload', 'no_action'];
    
    for (let server = 1; server <= numServers; server++) {
        const action = actions[Math.floor(Math.random() * actions.length)];
        
        // Different values based on the action
        let cpuSavings, energySavings;
        
        if (action === 'hibernate') {
            cpuSavings = 80 + Math.random() * 20; // 80-100%
            energySavings = 4 + Math.random() * 3; // 4-7 kW
        } else if (action === 'activate') {
            cpuSavings = -1 * (30 + Math.random() * 20); // -30 to -50%
            energySavings = -1 * (2 + Math.random() * 2); // -2 to -4 kW
        } else if (action === 'migrate_workload') {
            cpuSavings = 20 + Math.random() * 30; // 20-50%
            energySavings = 1 + Math.random() * 2; // 1-3 kW
        } else { // no_action
            cpuSavings = 0;
            energySavings = 0;
        }
        
        decisions.push({
            server_id: server,
            action: action,
            expected_cpu_savings: Math.floor(cpuSavings),
            expected_energy_savings: parseFloat(energySavings.toFixed(2)),
            confidence: 0.7 + Math.random() * 0.3 // 0.7-1.0
        });
    }
    
    return {
        decisions: decisions
    };
}

// Generate mock cooling data
function generateMockCoolingData() {
    const serverRows = 2;
    const serverCols = 5;
    const serverTemperatures = [];
    
    // Generate temperatures for server heatmap
    for (let i = 0; i < serverRows * serverCols; i++) {
        // Servers in different positions have different temperature profiles
        const rowPosition = Math.floor(i / serverCols);
        const colPosition = i % serverCols;
        
        // Servers in the center tend to be hotter
        const distanceFromCenter = Math.abs(colPosition - Math.floor(serverCols / 2)) + 
                                   Math.abs(rowPosition - Math.floor(serverRows / 2));
        
        // Base temperature 40-45°C with variation based on position
        serverTemperatures.push(40 + Math.random() * 5 + (3 - distanceFromCenter) * 2);
    }
    
    return {
        server_temperatures: serverTemperatures,
        cooling_level: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        fan_speed_percent: Math.floor(50 + Math.random() * 40), // 50-90%
        ac_temperature_setpoint: 20 + Math.random() * 2, // 20-22°C
        expected_power_savings: (2 + Math.random() * 3).toFixed(1), // 2-5 kW
        cooling_settings: {
            fan_speed: Math.floor(50 + Math.random() * 45), // 50-95%
            target_temp: (21 + Math.random() * 3).toFixed(1), // 21-24°C
            humidity_level: Math.floor(40 + Math.random() * 15), // 40-55%
            power_optimization: ['performance', 'balanced', 'eco'][Math.floor(Math.random() * 3)]
        }
    };
} 