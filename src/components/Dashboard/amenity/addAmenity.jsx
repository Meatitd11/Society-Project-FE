import React, { useState } from 'react';
import useAmenity from '../../../hooks/useAmenity';

const AddAmenity = () => {
    const [amenityName, setAmenityName] = useState('');
    const { addAmenity } = useAmenity();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await addAmenity(amenityName);
        setAmenityName('');
    };

    return (
        <> 
           <h1 className="text-2xl font-bold">Add Amenity</h1>
        <form className='py-5' onSubmit={handleSubmit}>
            <div className="mb-4">
                <input
                    type="text"
                    id="amenity_name"
                    name="amenity_name"
                    placeholder="Amenity Name"
                    value={amenityName}
                    onChange={(e) => setAmenityName(e.target.value)}
                    required
                    className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                />
            </div>
            <button
                type="submit"
                className="w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
            >
                Add New Amenity
            </button>
        </form></>
       
    );
};

export default AddAmenity;