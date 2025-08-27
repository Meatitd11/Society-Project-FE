import { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from "../config";

const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (phone, password, role) => {
    setLoading(true);
    setError(null); // Reset error before new login attempt
    try {
      // Map the selected role to the corresponding role_id (updated to match backend)
      const roleMapping = {
        super_admin: 1,
        admin: 2,
        owner: 3,
        renter: 4,  // tenant role
        employee: 5,
      };
      
      const role_id = roleMapping[role]; // Get the role_id from the selected role

      console.log('API Call details:', {
        phone_number: phone,
        password: password,
        role: role,
        role_id: role_id,
        api_url: `${API_BASE_URL}/api/user/login/`
      });

      if (!role_id) {
        throw new Error(`Invalid role: ${role}`);
      }

      const response = await axios.post(`${API_BASE_URL}/api/user/login/`, {
        phone_number: phone,
        password: password,
        role_id: role_id,
      });
      
      console.log('API Response:', response.data);
      console.log('Response Status:', response.status);
      
      // Store the token in localStorage
      if (response.status === 201 || response.status === 200) {
        const token = response.data.token;
        if (token) {
          localStorage.setItem('token', token);
          console.log('Token stored successfully');
        } else {
          console.warn('No token received in response');
        }
      }

      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      console.error('Login error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Login failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return { login, loading, error };
};

export default useAuth;
