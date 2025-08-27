import { useState } from 'react';
import useBlock from '../../../hooks/useBlock';
import { useNavigate } from 'react-router-dom';

const AddBlock = () => {
  const [blockName, setBlockName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { addBlock } = useBlock(); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { success, message } = await addBlock(blockName);

    if (success) {
      setSuccessMessage(message);    
      setBlockName('');
      setTimeout(() => {
        navigate('/dashboard/block-list'); 
      }, 1000); 
    } else {
      setErrorMessage(message);
    }
  };

  return (
    <>
    <h1 className="text-2xl font-bold">Add Block</h1>
    <form className='py-5' onSubmit={handleSubmit}>
      <div className="mb-4">
        <input
          type="text"
          id="block_name"
          name="block_name"
          placeholder="Block Name"
          value={blockName}
          onChange={(e) => setBlockName(e.target.value)}
          required
          className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
        />
      </div>
      <button
        type="submit"
        className="w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
      >
        Add New Block
      </button>
    </form>
     {/* Success Message */}
     {successMessage && (
      <div className="mt-4 text-green-600 text-sm">
        {successMessage}
      </div>
    )}

    {/* Error Message */}
    {errorMessage && (
      <div className="mt-4 text-red-600 text-sm">
        {errorMessage}
      </div>
    )}
    </>
  );
};

export default AddBlock;
