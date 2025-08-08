import React, { useState } from 'react';
import useService from '../../../hooks/useService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Add missing import

const AddService = () => {
  const [serviceName, setServiceName] = useState('');
  const [loading, setLoading] = useState(false);
  const { addService } = useService(); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { success, message } = await addService(serviceName);
      if (success) {
        toast.success(message);    
        setServiceName('');
        setTimeout(() => navigate('/dashboard/service-list'), 1000);
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error('Failed to add service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
       <h1 className="text-2xl font-bold">Add Service</h1>
      <form className='py-5' onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="text"
            id="service_name"
            name="service_name"
            placeholder="Service Name"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            required
            className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
          />
        </div>
        <button
          type="submit"
          className="w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add New Service'}
        </button>
      </form>
    </>
  );
};

export default AddService;