import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

const useFine = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFines = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/fin-set/`);
      setFines(response.data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const addFine = async (fineAmount) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/fin-set/`, {
        fine: fineAmount
      });
      await fetchFines();
      return { success: true, message: 'Fine added successfully!' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to add fine' };
    }
  };

  const editFine = async (id, fineAmount) => {
    try {
      await axios.put(`${API_BASE_URL}/fin-set/${id}/`, {
        fine: fineAmount
      });
      await fetchFines();
      return { success: true, message: 'Fine updated successfully!' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update fine' };
    }
  };

  const deleteFine = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/fin-set/${id}/`);
      await fetchFines();
      return { success: true, message: 'Fine deleted successfully!' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to delete fine' };
    }
  };

  return {
    fines,
    loading,
    error,
    addFine,
    editFine,
    deleteFine,
    fetchFines
  };
};

export default useFine;