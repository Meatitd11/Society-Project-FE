import axios from "axios";
import API_BASE_URL from "../config";
import { useState, useEffect } from "react";
import { toast } from 'react-toastify';

const useMemberType = () => {
  const [memberTypes, setMemberTypes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMemberTypes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/member-type-setup/`);
      setMemberTypes(response.data);
    } catch (err) {
      setError(err);
      toast.error('Failed to fetch member types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberTypes();
  }, []);

  const addMemberType = async (memberTypeName) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/member-type-setup/`, {
        member_type_name: memberTypeName,
      });
  
      if (response.status === 201) {
        return { success: true, message: 'Member Type Added Successfully' };
      }
      return { success: false, message: 'Unexpected response status' };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Error adding Member Type' 
      };
    }
  };

  const editMemberType = async (id, updatedMemberTypeName) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_BASE_URL}/member-type-setup/${id}/`, {
        member_type_name: updatedMemberTypeName,
      });

      if (response.status === 200) {
        setMemberTypes(memberTypes.map(memberType => memberType.member_type_id === id ? response.data : memberType));
        toast.success('Member Type Updated Successfully');
        return { success: true, message: 'Member Type Updated Successfully' };
      } else {
        toast.error('Failed to update member type');
        return { success: false, message: 'Failed to update member type' };
      }
    } catch (err) {
      toast.error('Error updating member type');
      return { success: false, message: 'Error updating member type' };
    } finally {
      setLoading(false);
    }
  };

  const deleteMemberType = async (id) => {
    try {
      setLoading(true);
      const response = await axios.delete(`${API_BASE_URL}/member-type-setup/${id}/`);

      if (response.status === 204) {
        await fetchMemberTypes();
        toast.success('Member Type deleted successfully');
        return { success: true, message: 'Member Type deleted successfully' };
      } else {
        toast.error('Failed to delete member type');
        return { success: false, message: 'Failed to delete member type' };
      }
    } catch (err) {
      toast.error('Error deleting member type');
      return { success: false, message: 'Error deleting member type' };
    } finally {
      setLoading(false);
    }
  };

  return {
    memberTypes,
    loading,
    error,
    addMemberType,
    editMemberType,
    deleteMemberType,
    fetchMemberTypes,
  };
};

export default useMemberType;