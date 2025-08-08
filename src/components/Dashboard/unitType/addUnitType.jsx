import React, { useState } from 'react';
import useUnitType from '../../../hooks/useUnitType';

const AddUnitType = () => {
    const [unitTypeName, setUnitTypeName] = useState('');
    const [unitNumber, setUnitNumber] = useState('');
    const { addUnitType } = useUnitType();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await addUnitType(unitTypeName, unitNumber);
        setUnitTypeName('');
        setUnitNumber('');
    };

    return (
        <>
           <h1 className="text-2xl font-bold">Add Unit Type</h1>
          <form className='py-5' onSubmit={handleSubmit}>
            <div className="mb-4">
                <input
                    type="number"
                    id="unit_number"
                    name="unit_number"
                    placeholder="Unit Number"
                    value={unitNumber}
                    onChange={(e) => setUnitNumber(e.target.value)}
                    required
                    className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                />
            </div>
            <div className="mb-4">
                <input
                    type="text"
                    id="unit_type_name"
                    name="unit_type_name"
                    placeholder="Unit Type Name"
                    value={unitTypeName}
                    onChange={(e) => setUnitTypeName(e.target.value)}
                    required
                    className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                />
            </div>
            <button
                type="submit"
                className="w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
            >
                Add New Unit Type
            </button>
        </form></>
      
    );
};

export default AddUnitType;