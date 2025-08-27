import { useState } from 'react';
import useMemberType from '../../../hooks/useMemberType';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';


const AddMemberType = () => {
  const [memberTypeName, setMemberTypeName] = useState('');
  const [loading, setLoading] = useState(false);
  const { addMemberType } = useMemberType();
  
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log('Submitting form...'); // Debug log
  
    try {
      const { success, message } = await addMemberType(memberTypeName);
      console.log('Response:', { success, message }); // Debug log
      
      if (success) {
        toast.success(message);
        setMemberTypeName('');
        console.log('Navigating to /dashboard/member-type-list'); // Debug log
        setTimeout(() => navigate('/dashboard/member-type-list'), 1000);
      } else {
        toast.error(message);
      }
    } catch (error) {
      console.error('Error:', error); // Debug log
      toast.error('Failed to add member type');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
       <h1 className="text-2xl font-bold">Add Member Type</h1>
      <form className='py-5' onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="text"
            id="member_type_name"
            name="member_type_name"
            placeholder="Member Type Name"
            value={memberTypeName}
            onChange={(e) => setMemberTypeName(e.target.value)}
            required
            className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
          />
        </div>
        <button
          type="submit"
          className="w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add New Member Type'}
        </button>
      </form>
    </>
  );
};

export default AddMemberType;