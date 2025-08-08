import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from "../config";

const useBlock = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch blocks (GET)
  const fetchBlocks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/block_info/`);
      setBlocks(response.data);
    } catch (err) {
      toast.error('Failed to fetch blocks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  // Add block (POST)
  const addBlock = async (blockName) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/block_info/`, {
        block_name: blockName,
      });

      if (response.status === 201) {
        setBlocks([...blocks, response.data]);
        toast.success('Block added successfully');
        return { success: true };
      } else {
        toast.error('Failed to add block');
        return { success: false };
      }
    } catch (err) {
      toast.error('Error adding block');
      return { success: false };
    }
  };

  // Edit block (PUT/PATCH)
  const editBlock = async (id, updatedBlockName) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/block_info/${id}/`, {
        block_name: updatedBlockName,
      });

      if (response.status === 200) {
        setBlocks(blocks.map(block => block.id === id ? response.data : block));
        toast.success('Block updated successfully');
        return { success: true };
      } else {
        toast.error('Failed to update block');
        return { success: false };
      }
    } catch (err) {
      toast.error('Error updating block');
      return { success: false };
    }
  };

  // Delete block (DELETE)
  const deleteBlock = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/block_info/${id}/`);

      if (response.status === 204) {
        await fetchBlocks();
        toast.success('Block deleted successfully');
        return { success: true };
      } else {
        toast.error('Failed to delete block');
        return { success: false };
      }
    } catch (err) {
      toast.error('Error deleting block');
      return { success: false };
    }
  };

  return {
    blocks,
    loading,
    addBlock,
    editBlock,
    deleteBlock,
    fetchBlocks,
  };
};

export default useBlock;
