import axios from "axios";
import { useState, useEffect } from "react";
import API_BASE_URL from "../config";
import { toast } from 'react-toastify';

const useOwner = () => {
  const [owners, setOwners] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/owners/`);
      setOwners(response.data);
    } catch (err) {
      toast.error('Failed to fetch owners');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await axios.get('https://countriesnow.space/api/v0.1/countries');
      setCountries(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch countries');
    }
  };

  const fetchCities = async (country) => {
    try {
      const response = await axios.post('https://countriesnow.space/api/v0.1/countries/cities', { country });
      setCities(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch cities');
    }
  };

  useEffect(() => {
    fetchOwners();
    fetchCountries();
  }, []);

  const addOwner = async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/owners/`, formData);
      toast.success('Owner added successfully');
      return { success: true };
    } catch (error) {
      const data = error.response?.data;
      let message = 'Failed to add owner';
  
      if (data && typeof data === 'object') {
        // Extract and combine all field errors
        const messages = Object.entries(data).flatMap(([field, errors]) =>
          errors.map(err => `${field}: ${err}`)
        );
  
        message = messages.join('\n');
      }
  
      toast.error(message);
      return { success: false, message };
    }
  };
  
  
    

  const editOwner = async (id, updatedData) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_BASE_URL}/owners/${id}/`, updatedData);
      setOwners(owners.map(owner => owner.owner_id === id ? response.data : owner));
      toast.success('Owner updated successfully');
      return true;
    } catch (error) {
      toast.error('Failed to update owner');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteOwner = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/owners/${id}/`);
      setOwners(owners.filter(owner => owner.owner_id !== id));
      toast.success('Owner deleted successfully');
      return true;
    } catch (error) {
      toast.error('Failed to delete owner');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    owners,
    countries,
    cities,
    loading,
    fetchOwners,
    fetchCities,
    addOwner,
    editOwner,
    deleteOwner,
  };  
}

export default useOwner;