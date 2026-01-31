const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || 'Request failed');
    }
    
    return response.json();
  }

  // Auth
  async exchangeSession(sessionId) {
    return this.request('/api/auth/session', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    });
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  async logout() {
    return this.request('/api/auth/logout', { method: 'POST' });
  }

  // Projects
  async getProjects() {
    return this.request('/api/projects');
  }

  async createProject(data) {
    return this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProject(projectId) {
    return this.request(`/api/projects/${projectId}`);
  }

  async updateProject(projectId, data) {
    return this.request(`/api/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(projectId) {
    return this.request(`/api/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  // Bids
  async updateBid(projectId, serviceName, data) {
    return this.request(`/api/projects/${projectId}/bids/${encodeURIComponent(serviceName)}`, {
      method: 'PUT',
      body: JSON.stringify({ serviceName, ...data }),
    });
  }

  // AI
  async getAiRecommendations(serviceName, notes, otherSelectedServices) {
    return this.request('/api/ai/recommendations', {
      method: 'POST',
      body: JSON.stringify({ serviceName, notes, otherSelectedServices }),
    });
  }

  // Services
  async getServices() {
    return this.request('/api/services');
  }
}

export const api = new ApiService();
export default api;
