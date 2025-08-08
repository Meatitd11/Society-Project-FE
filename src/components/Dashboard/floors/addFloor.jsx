import React, { useState } from 'react';
import useFloor from '../../../hooks/useFloor';
import { useNavigate } from 'react-router-dom';

const AddFloor = () => {
  const [floorName, setFloorName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { addFloor } = useFloor(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { success, message } = await addFloor(floorName);

    if (success) {
      setSuccessMessage(message);    
      setFloorName('');
      setTimeout(() => {
        navigate('/dashboard/floor-list'); 
      }, 1000); 
    } else {
      setErrorMessage(message);
    }
  };

  return (
    <>
    <h1 className="text-2xl font-bold">Add Floor</h1>
      <form className='py-5' onSubmit={handleSubmit}>
        <div className="mb-4">

        <input
  value={floorName}
  placeholder='Floor Name'
  onChange={(e) => setFloorName(e.target.value)}
  className="w-full px-4 py-2 border border-gray-300 rounded-sm"
/>



        </div>
        <button
          type="submit"
          className="w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
        >
          Add New Floor
        </button>
      </form>


    </>
  );
};

export default AddFloor;
