import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from "../config";

const useProperty = () => {
  const [properties, setProperties] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [floors, setFloors] = useState([]);

  const fetchFloors = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/floors/`);
      setFloors(response.data);
    } catch (err) {
      toast.error('Failed to fetch floors');
    }
  };

  // Fetch properties
  const fetchProperties = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/property_info/`);
      setProperties(response.data);
    } catch (err) {
      toast.error('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  // Fetch countries
  const fetchCountries = async () => {
    try {
      const response = await axios.get('https://countriesnow.space/api/v0.1/countries');
      setCountries(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch countries');
    }
  };

  // Fetch cities
  const fetchCities = async (country) => {
    try {
      const response = await axios.post('https://countriesnow.space/api/v0.1/countries/cities', { country });
      setCities(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch cities');
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchCountries();
  }, []);

  const addProperty = async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/property_info/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        timeout: 30000,
      });
      
      if (response.status === 200 || response.status === 201) {
        setProperties(prev => [...prev, response.data]);
        return { 
          success: true, 
          data: response.data,
          message: 'Property added successfully'
        };
      }
      return { 
        success: false, 
        message: 'Failed to add property',
        errors: response.data
      };
    } catch (err) {
      console.error("Upload error:", err);
      if (err.response) {
        return { 
          success: false, 
          message: err.response.data.message || `Server error: ${err.response.status}`,
          errors: err.response.data
        };
      }
      return { 
        success: false, 
        message: err.message || 'Network error occurred'
      };
    }
  };

  // Edit property
  const editProperty = async (id, updatedData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/property_info/${id}/`, updatedData);

      if (response.status === 200) {
        setProperties(properties.map(property => 
          property.property_id === id ? response.data : property
        ));
        toast.success('Property updated successfully');
        return { success: true };
      } else {
        toast.error('Failed to update property');
        return { success: false };
      }
    } catch (err) {
      if (err.response?.status === 400 && err.response.data?.property_number) {
        toast.error(err.response.data.property_number[0]);
      } else {
        toast.error('Error updating property');
      }
      return { success: false };
    }
  };

  // Delete property
  const deleteProperty = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/property_info/${id}/`);

      if (response.status === 204) {
        await fetchProperties();
        toast.success('Property deleted successfully');
        return { success: true };
      } else {
        toast.error('Failed to delete property');
        return { success: false };
      }
    } catch (err) {
      toast.error('Error deleting property');
      return { success: false };
    }
  };

  return {
    properties,
    countries,
    cities,
    loading,
    addProperty,
    editProperty,
    deleteProperty,
    fetchProperties,
    fetchCities,
    floors,
    fetchFloors
  };
};

export default useProperty;