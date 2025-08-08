import React, { useState } from 'react';
import useFine from '../../../hooks/useFine';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AddFine = () => {
  const [fineAmount, setFineAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addFine } = useFine();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { success, message } = await addFine(fineAmount);

      if (success) {
        toast.success(message);
        setFineAmount('');
        setTimeout(() => navigate('/dashboard/fine-list'), 1000);
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error('Failed to add fine. Please try again.');
      console.error('Add fine error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>  
       <h1 className="text-2xl font-bold">Add Fine</h1>
    <form className='py-5' onSubmit={handleSubmit}>
      <div className="mb-4">
        <input
          type="number"
          id="fine_amount"
          name="fine_amount"
          placeholder="Fine Amount"
          value={fineAmount}
          onChange={(e) => setFineAmount(e.target.value)}
          required
          step="0.01"
          min="0"
          className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        className="w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
        disabled={loading}
      >
        {loading ? 'Adding...' : 'Add New Fine'}
      </button>
    </form></>
  
  );
};

export default AddFine;