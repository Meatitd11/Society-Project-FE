import React, { useState } from 'react';
import useMaintainanceCost from '../../../hooks/useMaintainanceCost';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AddMc = () => {
  const { addMaintenanceCost } = useMaintainanceCost();
  const [formData, setFormData] = useState({
    m_title: '',
    m_date: '',
    m_amount: '',
    m_details: ''
  });
  
  const navigate = useNavigate();


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { success, message } = await addMaintenanceCost(
      formData.m_title,
      formData.m_date,
      formData.m_amount,
      formData.m_details
    );

    if (success) {
      toast.success(message);
      setFormData({
        m_title: '',
        m_date: '',
        m_amount: '',
        m_details: ''
      });
      
      setTimeout(() => navigate('/dashboard/maintenance-cost-list'), 1000);
    } else {
      toast.error(message);
    }
  };

  return (
    <> 
       <h1 className="text-2xl font-bold">Add Maintenance Cost</h1>
     <form className='py-5' onSubmit={handleSubmit}>
      <div className="mb-4 grid md:grid-cols-2 grid-cols-1 gap-4">
        <input
          type="text"
          name="m_title"
          placeholder="Maintenance Cost Title"
          value={formData.m_title}
          onChange={handleChange}
          required
          className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
        />
        <input
          type="date"
          name="m_date"
          placeholder="Maintenance Cost Date"
          value={formData.m_date}
          onChange={handleChange}
          required
          className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
        />
        <input
          type="number"
          name="m_amount"
          placeholder="Maintenance Cost Amount"
          value={formData.m_amount}
          onChange={handleChange}
          required
          className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
        />
        <textarea
          rows={1}
          name="m_details"
          placeholder="Maintenance Cost Details"
          value={formData.m_details}
          onChange={handleChange}
          required
          className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
        />
      </div>
      <button
        type="submit"
        className="w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
      >
        Add New Maintenance Cost
      </button>
    </form></>
  
  );
};

export default AddMc;