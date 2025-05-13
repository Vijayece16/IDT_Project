/**
 * Access Control Module for AI Server Management System
 * This module handles user permissions and access to different pages
 */

// Default user role (in a real app this would come from authentication)
let userRole = 'admin';

// Page access permissions
const pagePermissions = {
    'dashboard': ['admin', 'operator', 'viewer'],
    'workload': ['admin', 'operator'],
    'resource': ['admin'],
    'cooling': ['admin', 'operator']
};

// Create access denied element
const accessDeniedEl = document.createElement('div');
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

// Initialize access control
document.addEventListener('DOMContentLoaded', () => {
    // Set up back button for access denied page
    accessDeniedEl.querySelector('#back-to-dashboard').addEventListener('click', () => {
        navigateToPage('dashboard');
    });
    
    // Check URL hash for direct navigation
    const hash = window.location.hash.substring(1);
    if (hash && pagePermissions[hash]) {
        navigateToPage(hash);
    }
});

// Check if user has access to a page
function hasPageAccess(pageId) {
    return pagePermissions[pageId]?.includes(userRole) || false;
}

// Navigate to a specific page
function navigateToPage(pageId) {
    const navItems = document.querySelectorAll('nav ul li');
    const pages = document.querySelectorAll('.page');
    
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
        
        // Show selected page, hide others
        pages.forEach(page => {
            if (page.id === `${pageId}-page`) {
                page.classList.add('active');
                
                // Update URL hash for bookmarking
                window.location.hash = pageId;
                
                // Update specific page content if needed
                if (pageId === 'workload' && typeof updateWorkloadDetailPage === 'function') {
                    updateWorkloadDetailPage();
                } else if (pageId === 'resource' && typeof updateResourceDetailPage === 'function') {
                    updateResourceDetailPage();
                } else if (pageId === 'cooling' && typeof updateCoolingDetailPage === 'function') {
                    updateCoolingDetailPage();
                }
            } else {
                page.classList.remove('active');
            }
        });
    } else {
        // Show access denied message
        pages.forEach(page => page.classList.remove('active'));
        document.querySelector('main').appendChild(accessDeniedEl);
    }
}

// For testing: Function to change user role
function setUserRole(role) {
    if (['admin', 'operator', 'viewer'].includes(role)) {
        userRole = role;
        // Refresh current page with new permissions
        const currentPage = window.location.hash.substring(1) || 'dashboard';
        navigateToPage(currentPage);
        return true;
    }
    return false;
}

// Show error message
function showErrorMessage(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-exclamation-circle"></i> Error</h3>
            </div>
            <div class="card-body">
                <p>${message}</p>
                <button class="btn" id="dismiss-error"><i class="fas fa-times"></i> Dismiss</button>
            </div>
        </div>
    `;
    
    // Add dismiss button functionality
    errorEl.querySelector('#dismiss-error').addEventListener('click', () => {
        errorEl.remove();
    });
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (errorEl.parentNode) {
            errorEl.remove();
        }
    }, 5000);
    
    document.querySelector('main').appendChild(errorEl);
} 