import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from '../config';

const useManagementCommittee = () => {
  const [managementCommittee, setManagementCommittee] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Management Committee
  const fetchManagementCommittee = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/management-committee/`);
      setManagementCommittee(response.data);
    } catch (err) {
      setError(err);
      toast.error('Failed to fetch Management Committee data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagementCommittee();
  }, []);

  // Add Management Committee
  const addManagementCommittee = async (mcData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/management-committee/`, mcData);
      
      if (response.status === 201) {
        await fetchManagementCommittee();
        toast.success('Management Committee member added successfully');
        return { success: true };
      } else {
        toast.error('Failed to add Management Committee member');
        return { success: false };
      }
    } catch (err) {
      toast.error('Error adding Management Committee member');
      return { success: false };
    }
  };

  // Edit Management Committee
  const editManagementCommittee = async (id, updatedData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/management-committee/${id}/`, updatedData);

      if (response.status === 200) {
        setManagementCommittee(prev =>
          prev.map(mc => (mc.mc_id === id ? response.data : mc))
        );
        toast.success('Management Committee Updated Successfully');
        return { success: true };
      } else {
        toast.error('Failed to update Management Committee');
        return { success: false };
      }
    } catch (err) {
      toast.error('Error updating Management Committee');
      return { success: false };
    }
  };

  // Delete Management Committee
  const deleteManagementCommittee = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/management-committee/${id}/`);

      if (response.status === 204) {
        setManagementCommittee(prev => prev.filter(mc => mc.mc_id !== id));
        toast.success('Management Committee deleted successfully');
        return { success: true };
      } else {
        toast.error('Failed to delete Management Committee');
        return { success: false };
      }
    } catch (err) {
      toast.error('Error deleting Management Committee');
      return { success: false };
    }
  };

  return {
    managementCommittee,
    loading,
    error,
    fetchManagementCommittee,
    addManagementCommittee,
    editManagementCommittee,
    deleteManagementCommittee
  };
};

export default useManagementCommittee;