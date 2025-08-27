import { useState } from 'react';
import useAreaType from '../../../hooks/useAreaType';
import { useNavigate } from 'react-router-dom';

import { toast } from 'react-toastify';  
const AddAreaType = () => {
  const [areaTypeName, setAreaTypeName] = useState('');
  const [areaValue, setAreaValue] = useState('');
  const [loading, setLoading] = useState(false);
  const { addAreaType } = useAreaType();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { success, message } = await addAreaType(areaTypeName, areaValue);
      
      if (success) {
        toast.success(message);
        setAreaTypeName('');
        setAreaValue('');
        setTimeout(() => navigate('/dashboard/area-size-list'), 1000);
        return; // Important to return after navigation
      }
      toast.error(message);
    } catch (error) {
      toast.error(error.message || 'Failed to add area size');
    } finally {
      if (!navigate) { // Only set loading false if navigation didn't happen
        setLoading(false);
      }
    }
  };

  return (
    <>
       <h1 className="text-2xl font-bold">Add Area Size</h1>
      <form className='py-5' onSubmit={handleSubmit}>
        <div className="mb-4">
          <select 
            name="area_type_name" 
            value={areaTypeName} 
            onChange={(e) => setAreaTypeName(e.target.value)}
            required 
            className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
          >
            <option value="">Area Size</option>
            <option value="SQFT">Square Feet (SQFT)</option>
            <option value="MARLA">Marla</option>
            <option value="KANAL">Kanal</option>
          </select>
        </div>
        <div className="mb-4">
          <input
            type="number"
            id="area_value"
            name="area_value"
            placeholder="Area Value"
            value={areaValue}
            onChange={(e) => setAreaValue(e.target.value)}
            required
            className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
          />
        </div>
        <button
          type="submit"
          className="w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add New Area Size'}
        </button>
      </form>
    </>
  );
};

export default AddAreaType;