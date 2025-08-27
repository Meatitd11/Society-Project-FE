import {useState, useEffect} from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { toast } from 'react-toastify';

const useAreaType = () => {
  const [areaTypes, setAreaTypes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAreaTypes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/area-type/`);
      setAreaTypes(response.data);
    } catch (err) {
      setError(err);
      toast.error('Failed to fetch area sizes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreaTypes();
  }, []);

  const addAreaType = async (areaTypeName, areaValue) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/area-type/`, {
        area_type_name: areaTypeName,
        area_value: areaValue,
      });
  
      if (response.status === 201) {
        return { success: true, message: 'Area Size Added Successfully' };
      }
      return { success: false, message: 'Unexpected response status' };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Error adding area size' 
      };
    }
  };

  const editAreaType = async (id, updatedAreaTypeName, updatedAreaValue) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_BASE_URL}/area-type/${id}/`, {
        area_type_name: updatedAreaTypeName,
        area_value: updatedAreaValue,
      });

      if (response.status === 200) {
        setAreaTypes(areaTypes.map(areaType => areaType.area_type_id === id ? response.data : areaType));
        toast.success('Area size updated successfully');
        return { success: true, message: 'Area size updated successfully' };
      } else {
        toast.error('Failed to update area size');
        return { success: false, message: 'Failed to update area size' };
      }
    } catch (err) {
      toast.error('Error updating area size');
      return { success: false, message: 'Error updating area size' };
    } finally {
      setLoading(false);
    }
  };

  const deleteAreaType = async (id) => {
    try {
      setLoading(true);
      const response = await axios.delete(`${API_BASE_URL}/area-type/${id}/`);

      if (response.status === 204) {
        await fetchAreaTypes();
        toast.success('Area size deleted successfully');
        return { success: true, message: 'Area size deleted successfully' };
      } else {
        toast.error('Failed to delete area size');
        return { success: false, message: 'Failed to delete area size' };
      }
    } catch (err) {
      toast.error('Error deleting area size');
      return { success: false, message: 'Error deleting area size' };
    } finally {
      setLoading(false);
    }
  };

  return {
    areaTypes,
    loading,
    error,
    addAreaType,
    editAreaType,
    deleteAreaType,
    fetchAreaTypes,
  };
};

export default useAreaType;