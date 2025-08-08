// src/hooks/useFloor.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from "../config";

const useFloor = () => {
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFloors = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/floors/`);
      setFloors(response.data);
    } catch (err) {
      toast.error('Failed to fetch floors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFloors();
  }, []);

  const addFloor = async (floorName) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/floors/`, {
        name: floorName,
      });
  
      if (response.status === 201) {
        setFloors([...floors, response.data]);
        toast.success('Floor added successfully');
        return {
          success: true,
          message: 'Floor added successfully',
        };
      }
    } catch (err) {
      const message = err.response?.data?.name?.[0] || 'Error adding floor';
      toast.error(message);
      return { success: false, message };
    }
  };
  

  const editFloor = async (id, updatedFloorName) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/floors/${id}/`, {
        name: updatedFloorName,
      });
  
      if (response.status === 200) {
        setFloors(floors.map(floor => floor.id === id ? response.data : floor));
        toast.success('Floor updated successfully');
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.name?.[0] || 'Error updating floor',
      };
    }
  };
  

  const deleteFloor = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/floors/${id}/`);

      if (response.status === 204) {
        await fetchFloors();
        toast.success('Floor deleted successfully');
        return { success: true };
      }
    } catch (err) {
      toast.error('Error deleting floor');
      return { success: false };
    }
  };

  return {
    floors,
    loading,
    addFloor,
    editFloor,
    deleteFloor,
    fetchFloors,
  };
};

export default useFloor;
