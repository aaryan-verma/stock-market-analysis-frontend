import api from './api';

export const authService = {
  async login(username: string, password: string): Promise<string> {
    try {
      const formData = new URLSearchParams({
        grant_type: 'password',
        username,
        password,
        scope: '',
        client_id: 'string',
        client_secret: 'string'
      });

      const response = await api.post('/auth/access-token', formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      const token = response.data.access_token;
      localStorage.setItem('token', token);
      return token;
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Invalid credentials');
    }
  },

  logout() {
    localStorage.removeItem('token');
  }
}; 