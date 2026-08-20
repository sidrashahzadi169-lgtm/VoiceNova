/* ==========================================================================
   VoiceNova Frontend API Client
   ========================================================================== */

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocalhost ? 'http://localhost:5000/api' : '/api';

window.apiClient = {
    // Get the JWT token from localStorage
    getToken: () => {
        return localStorage.getItem('voicenova_token');
    },

    // Set the JWT token in localStorage
    setToken: (token) => {
        if (token) {
            localStorage.setItem('voicenova_token', token);
        } else {
            localStorage.removeItem('voicenova_token');
        }
    },

    // Core fetch wrapper
    request: async (endpoint, options = {}) => {
        const url = `${API_BASE_URL}${endpoint}`;
        
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        const token = window.apiClient.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            
            // Handle 401 Unauthorized globally
            if (response.status === 401) {
                // Ignore if it's the login endpoint failing
                if (!endpoint.includes('/auth/login')) {
                    console.warn("Unauthorized access. Redirecting to login...");
                    window.apiClient.setToken(null);
                    window.location.href = 'login.html';
                    return null;
                }
            }

            const data = await response.json();
            return {
                status: response.status,
                ok: response.ok,
                data: data
            };
        } catch (error) {
            console.error("API Request Error:", error);
            return {
                status: 500,
                ok: false,
                data: { success: false, message: 'Network or server error occurred.' }
            };
        }
    },

    // Helper for GET requests
    get: (endpoint) => {
        return window.apiClient.request(endpoint, { method: 'GET' });
    },

    // Helper for POST requests
    post: (endpoint, body) => {
        return window.apiClient.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    // Helper for PUT requests
    put: (endpoint, body) => {
        return window.apiClient.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    // Helper for DELETE requests
    delete: (endpoint) => {
        return window.apiClient.request(endpoint, { method: 'DELETE' });
    }
};
