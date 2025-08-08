import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from '../config';

const useMaintainanceCost = () => {
  const [maintenanceCost, setMaintenanceCost] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch MaintenanceCost
  const fetchMaintenanceCost = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/maintenance_costs/`);
      setMaintenanceCost(response.data);
    } catch (err) {
      setError(err);
      toast.error('Failed to fetch maintenance costs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceCost();
  }, []);

  // Add Maintenance cost
  const addMaintenanceCost = async (mcTitle, mcDate, mcAmount, mcDetails) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/maintenance_costs/`, {
        m_title: mcTitle,
        m_date: mcDate,
        m_amount: mcAmount,
        m_details: mcDetails,
      });

      if (response.status === 201) {
        setMaintenanceCost([...maintenanceCost, response.data]);
        toast.success('Maintenance Cost Added Successfully');
        return { success: true };
      } else {
        toast.error('Failed to add Maintenance Cost');
        return { success: false };
      }
    } catch (err) {
      toast.error('Error adding Maintenance Cost');
      return { success: false };
    }
  };

  // Edit maintenance cost
  const editMaintenanceCost = async (id, updatedMcTitle, updatedMcDate, updatedMcAmount, updatedMcDetails) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/maintenance_costs/${id}/`, {
        m_title: updatedMcTitle,
        m_date: updatedMcDate,
        m_amount: updatedMcAmount,
        m_details: updatedMcDetails
      });

      if (response.status === 200) {
        setMaintenanceCost(prev =>
          prev.map(mc => (mc.m_id === id ? response.data : mc))
        );
        toast.success('Maintenance cost updated successfully');
        return { success: true };
      } else {
        toast.error('Failed to update maintenance cost');
        return { success: false };
      }
    } catch (err) {
      toast.error('Error updating maintenance cost');
      return { success: false };
    }
  };

  // Delete maintenance cost
  const deleteMaintenanceCost = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/maintenance_costs/${id}/`);

      if (response.status === 204) {
        await fetchMaintenanceCost();
        toast.success('Maintenance cost deleted successfully');
        return { success: true };
      } else {
        toast.error('Failed to delete maintenance cost');
        return { success: false };
      }
    } catch (err) {
      toast.error('Error deleting maintenance cost');
      return { success: false };
    }
  };

  return {
    maintenanceCost,
    loading,
    error,
    fetchMaintenanceCost,
    addMaintenanceCost,
    editMaintenanceCost,
    deleteMaintenanceCost
  };
};

export default useMaintainanceCost;