// src/hooks/useCurrency.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from "../config";

const useCurrency = () => {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch currencies (GET)
  const fetchCurrencies = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/currency/`);
      setCurrencies(response.data);
    } catch (err) {
      toast.error('Failed to fetch currencies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  // Add currency (POST)
  const addCurrency = async (currencyData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/currency/`, currencyData);

      if (response.status === 201) {
        setCurrencies([...currencies, response.data]);
        toast.success('Currency added successfully');
        return { success: true, message: 'Currency added successfully' };
      } else {
        toast.error('Failed to add currency');
        return { success: false, message: 'Failed to add currency' };
      }
    } catch (err) {
      toast.error('Error adding currency');
      return { success: false, message: err.response?.data?.message || 'Error adding currency' };
    }
  };

  // Edit currency (PUT/PATCH)
  const editCurrency = async (id, updatedCurrencyData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/currency/${id}/`, updatedCurrencyData);

      if (response.status === 200) {
        setCurrencies(currencies.map(currency => currency.id === id ? response.data : currency));
        toast.success('Currency updated successfully');
        return { success: true, message: 'Currency updated successfully' };
      } else {
        toast.error('Failed to update currency');
        return { success: false, message: 'Failed to update currency' };
      }
    } catch (err) {
      toast.error('Error updating currency');
      return { success: false, message: err.response?.data?.message || 'Error updating currency' };
    }
  };

  // Delete currency (DELETE)
  const deleteCurrency = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/currency/${id}/`);

      if (response.status === 204) {
        await fetchCurrencies();
        toast.success('Currency deleted successfully');
        return { success: true, message: 'Currency deleted successfully' };
      } else {
        toast.error('Failed to delete currency');
        return { success: false, message: 'Failed to delete currency' };
      }
    } catch (err) {
      toast.error('Error deleting currency');
      return { success: false, message: err.response?.data?.message || 'Error deleting currency' };
    }
  };

  return {
    currencies,
    loading,
    addCurrency,
    editCurrency,
    deleteCurrency,
    fetchCurrencies,
  };
};

export default useCurrency;