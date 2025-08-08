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
      // Map the selected role to the corresponding role_id
      const roleMapping = {
        super_admin: 1,
        owner: 2,
        employee: 3,
        admin: 4,
        renter: 5,
      };
      
      const role_id = roleMapping[role]; // Get the role_id from the selected role

      const response = await axios.post(`${API_BASE_URL}/api/user/login/`, {
        phone_number: phone,
        password: password,
        role_id: role_id,
      });
      
      // Store the token in localStorage
      if (response.status === 201 || response.status === 200) {
        const token = response.data.token;
        localStorage.setItem('token', token);
      }

      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'Something went wrong';
      setError(errorMessage);  // Set only the message to avoid object issues
      throw new Error(errorMessage);
    }
  };

  return { login, loading, error };
};

export default useAuth;
