// hooks/useComplaint.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from '../config';

const useComplaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);


    const token = localStorage.getItem('token');
 
  
  
  

  const fetchComplaints = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/complaints/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setComplaints(response.data);
    } catch (err) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const addComplaint = async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/complaints/`, formData, {
        headers: { Authorization: `Token ${token}` },
      });

      if (response.status === 201) {
        setComplaints([...complaints, response.data]);
        toast.success('Complaint added successfully');
        return { success: true };
      } else {
        toast.error('Failed to add complaint');
        return { success: false };
      }
    } catch (err) {
      toast.error('Error adding complaint');
      return { success: false };
    }
  };

  const editComplaint = async (id, formData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/complaints/${id}/`, formData, {
        headers: { Authorization: `Token ${token}` },
      });

      if (response.status === 200) {
        setComplaints(complaints.map(item => item.id === id ? response.data : item));
        toast.success('Complaint updated successfully');
        return { success: true };
      } else {
        toast.error('Failed to update complaint');
        return { success: false };
      }
    } catch (err) {
      toast.error('Error updating complaint');
      return { success: false };
    }
  };

  const deleteComplaint = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/complaints/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });

      if (response.status === 204) {
        await fetchComplaints();
        toast.success('Complaint deleted successfully');
        return { success: true };
      } else {
        toast.error('Failed to delete complaint');
        return { success: false };
      }
    } catch (err) {
      toast.error('Error deleting complaint');
      return { success: false };
    }
  };

  return {
    complaints,
    loading,
    addComplaint,
    editComplaint,
    deleteComplaint,
    fetchComplaints,
  };
};

export default useComplaint;
