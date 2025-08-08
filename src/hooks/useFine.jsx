import { useState, useEffect } from 'react';
import axios from 'axios';

const useFine = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFines = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/fine-set/');
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
      const response = await axios.post('http://127.0.0.1:8000/fine-set/', {
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
      await axios.put(`http://127.0.0.1:8000/fine-set/${id}/`, {
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
      await axios.delete(`http://127.0.0.1:8000/fine-set/${id}/`);
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