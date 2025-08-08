import axios from "axios";
import { useState, useEffect } from "react";
import API_BASE_URL from "../config";
import { toast } from 'react-toastify';

const useTenant = () => {
  const [tenants, setTenants] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/tenant/`);
      setTenants(response.data);
    } catch (err) {
      toast.error('Failed to fetch tenants');
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
    fetchTenants();
    fetchCountries();
  }, []);

  const addTenant = async (tenantData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tenant/`, tenantData);
      
      if (response.status === 201) {
        return { 
          success: true,
          message: 'Tenant added successfully',
          data: response.data
        };
      }
      return {
        success: false,
        message: 'Unexpected response status'
      };
    } catch (error) {
      let errorMessage = 'Failed to add tenant';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        errorMessage = Object.entries(errorData)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(' ') : messages}`)
          .join(', ');
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const editTenant = async (id, updatedData) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_BASE_URL}/tenant/${id}/`, updatedData);
      setTenants(tenants.map(tenant => tenant.tenant_id === id ? response.data : tenant));
      toast.success('Tenant updated successfully');
      return true;
    } catch (error) {
      toast.error('Failed to update tenant');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteTenant = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/tenant/${id}/`);
      setTenants(tenants.filter(tenant => tenant.tenant_id !== id));
      toast.success('Tenant deleted successfully');
      return true;
    } catch (error) {
      toast.error('Failed to delete tenant');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    tenants,
    countries,
    cities,
    loading,
    fetchTenants,
    fetchCities,
    addTenant,
    editTenant,
    deleteTenant,
  };
};

export default useTenant;