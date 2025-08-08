import React, { useState } from 'react';
import usePropertyType from '../../../hooks/usePropertyType';

const AddPropertyType = () => {
    const [propertyTypeName, setPropertyTypeName] = useState('');
    const { addPropertyType } = usePropertyType(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        await addPropertyType(propertyTypeName);
        setPropertyTypeName('');
    };

    return (
        <>
           <h1 className="text-2xl font-bold">Add Area Type</h1>
          <form className='py-5' onSubmit={handleSubmit}>
            <div className="mb-4">
                <input
                    type="text"
                    id="property_type_name"
                    name="property_type_name"
                    placeholder="Area Type Name"
                    value={propertyTypeName}
                    onChange={(e) => setPropertyTypeName(e.target.value)}
                    required
                    className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                />
            </div>
            <button
                type="submit"
                className="w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
            >
                Add New Area Type
            </button>
        </form></>
      
    );
};

export default AddPropertyType;