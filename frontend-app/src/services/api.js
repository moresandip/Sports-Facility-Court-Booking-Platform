const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Courts
  async getCourts() {
    return this.request('/courts');
  }

  async createCourt(courtData) {
    return this.request('/courts', {
      method: 'POST',
      body: JSON.stringify(courtData),
    });
  }

  // Equipment
  async getEquipment() {
    return this.request('/equipment');
  }

  // Coaches
  async getCoaches() {
    return this.request('/coaches');
  }

  // Bookings
  async getBookings() {
    return this.request('/bookings');
  }

  async createBooking(bookingData) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async checkAvailability(bookingData) {
    return this.request('/bookings/check-availability', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  // Pricing Rules
  async getPricingRules() {
    return this.request('/pricing-rules');
  }

  async createPricingRule(ruleData) {
    return this.request('/pricing-rules', {
      method: 'POST',
      body: JSON.stringify(ruleData),
    });
  }
}

export default new ApiService();
