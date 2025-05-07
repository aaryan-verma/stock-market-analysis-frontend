import api from './api';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export const contactService = {
  async sendContactForm(data: ContactFormData): Promise<{ message: string }> {
    try {
      const response = await api.post('/email/contact', data);
      return response.data;
    } catch (error) {
      console.error('Contact form submission failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to send contact form');
    }
  }
}; 