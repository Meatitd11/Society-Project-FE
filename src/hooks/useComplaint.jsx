// hooks/useComplaint.js
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const useComplaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API delay
    setTimeout(() => {
      setComplaints([
        {
          id: 1,
          title: "Water Supply Issue",
          description: "Water supply has been irregular for the past week. Please fix this issue as soon as possible.",
          email: "john.doe@example.com",
          status: "pending",
          created_at: "2025-01-15T10:30:00Z",
          assigned_to: "Maintenance Team",
          user_id: 1,
          image: null
        },
        {
          id: 2,
          title: "Parking Space Problem",
          description: "My designated parking space is being occupied by unauthorized vehicles daily.",
          email: "john.doe@example.com", 
          status: "in_progress",
          created_at: "2025-02-20T14:45:00Z",
          assigned_to: "Security Team",
          user_id: 1,
          image: null
        },
        {
          id: 3,
          title: "Noise Complaint",
          description: "Excessive noise from the construction work happening in Block B during night hours.",
          email: "john.doe@example.com",
          status: "resolved",
          created_at: "2025-03-10T09:15:00Z",
          assigned_to: "Admin",
          user_id: 1,
          image: null
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const addComplaint = async (formData) => {
    try {
      // Simulate form data processing
      const newComplaint = {
        id: Date.now(), // Use timestamp for unique ID
        title: formData.get('title'),
        description: formData.get('description'),
        email: formData.get('email'),
        status: "pending",
        created_at: new Date().toISOString(),
        assigned_to: "Unassigned",
        user_id: 1,
        image: formData.get('image') ? URL.createObjectURL(formData.get('image')) : null
      };

      setComplaints(prevComplaints => [...prevComplaints, newComplaint]);
      toast.success('Complaint added successfully');
      return { success: true };
    } catch {
      toast.error('Error adding complaint');
      return { success: false };
    }
  };

  const editComplaint = async (id, formData) => {
    try {
      // Simulate form data processing for edit
      const updatedComplaint = {
        id: id,
        title: formData.get('title'),
        description: formData.get('description'),
        email: formData.get('email') || complaints.find(c => c.id === id)?.email,
        status: formData.get('status'),
        created_at: complaints.find(c => c.id === id)?.created_at || new Date().toISOString(),
        assigned_to: "Admin",
        user_id: 1,
        image: formData.get('image') ? URL.createObjectURL(formData.get('image')) : complaints.find(c => c.id === id)?.image
      };

      setComplaints(prevComplaints => 
        prevComplaints.map(item => item.id === id ? updatedComplaint : item)
      );
      toast.success('Complaint updated successfully');
      return { success: true };
    } catch {
      toast.error('Error updating complaint');
      return { success: false };
    }
  };

  const deleteComplaint = async (id) => {
    try {
      setComplaints(prevComplaints => 
        prevComplaints.filter(complaint => complaint.id !== id)
      );
      toast.success('Complaint deleted successfully');
      return { success: true };
    } catch {
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
  };
};

export default useComplaint;
