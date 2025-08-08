import React, { useState } from 'react';
import useComplaint from '../../../hooks/useComplaint';

const AddComplaint = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  const { addComplaint } = useComplaint();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (image) {
      formData.append('image', image);
    }
  
    const { success } = await addComplaint(formData);
  
    if (success) {
      setTitle('');
      setDescription('');
      setImage(null);
    }
  };
  

  return (
    <> 
       <h1 className="text-2xl font-bold">Add Complain</h1>
    
    <form onSubmit={handleSubmit} className="py-5 space-y-4">
      <input
        type="text"
        placeholder="Complaint Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-sm"
        required
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-sm"
        required
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
        className="w-full"
      />

      <button
        type="submit"
        className="bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600"
      >
        Submit Complaint
      </button>
    </form></>
   
  );
};

export default AddComplaint;
