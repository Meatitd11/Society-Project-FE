import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from "../config";

const useService = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/service_info/`);
      setServices(response.data);
    } catch (err) {
      setError(err);
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const addService = async (serviceName) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/service_info/`, {
        service_name: serviceName,
      });
  
      if (response.status === 201) {
        return { 
          success: true, 
          message: 'Service added successfully',
          data: response.data 
        };
      }
      return { 
        success: false, 
        message: 'Unexpected response status' 
      };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Error adding service' 
      };
    }
  };

  const editService = async (id, updatedServiceName) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_BASE_URL}/service_info/${id}/`, {
        service_name: updatedServiceName,
      });

      if (response.status === 200) {
        setServices(services.map(service => service.service_id === id ? response.data : service));
        toast.success('Service updated successfully');
        return { success: true, message: 'Service updated successfully' };
      } else {
        toast.error('Failed to update service');
        return { success: false, message: 'Failed to update service' };
      }
    } catch (err) {
      toast.error('Error updating service');
      return { success: false, message: 'Error updating service' };
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id) => {
    try {
      setLoading(true);
      const response = await axios.delete(`${API_BASE_URL}/service_info/${id}/`);

      if (response.status === 204) {
        await fetchServices();
        toast.success('Service deleted successfully');
        return { success: true, message: 'Service deleted successfully' };
      } else {
        toast.error('Failed to delete service');
        return { success: false, message: 'Failed to delete service' };
      }
    } catch (err) {
      toast.error('Error deleting service');
      return { success: false, message: 'Error deleting service' };
    } finally {
      setLoading(false);
    }
  };

  return {
    services,
    loading,
    error,
    addService,
    editService,
    deleteService,
    fetchServices,
  };
};

export default useService;