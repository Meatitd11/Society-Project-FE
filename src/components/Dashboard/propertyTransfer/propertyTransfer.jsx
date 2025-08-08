import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const PropertyTransfer = () => {
  const [properties, setProperties] = useState([]);
  const [owners, setOwners] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [newOwner, setNewOwner] = useState('');

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/property-transfer/init-data/');
        setProperties(response.data.properties || []);
        setOwners(response.data.owners || []);
      } catch (error) {
        toast.error('Failed to load data for transfer.');
      }
    };

    fetchInitData();
  }, []);

  const handlePropertyChange = (e) => {
    const propertyId = e.target.value;
    setSelectedProperty(propertyId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProperty || !newOwner) {
      toast.error('Please select both property and new owner.');
      return;
    }

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/property-transfer/transfer/',
        {
          property_id: parseInt(selectedProperty),
          new_owner_id: parseInt(newOwner),
        }
      );

      const successMsg = response.data?.message?.trim() || 'Property transferred successfully.';
      toast.success(successMsg);

      // Reset form
      setSelectedProperty('');
      setNewOwner('');
    } catch (error) {
      const errMsg =
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.message ||
        error.response?.data?.detail ||
        'Transfer failed.';
      toast.error(errMsg);
    }
  };

  return (
    <>   
    <h1 className="text-2xl font-bold">Property Transfer</h1>
     <form className="py-5" onSubmit={handleSubmit}>
      {/* Property Dropdown */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Select Property</label>
        <select
          value={selectedProperty}
          onChange={handlePropertyChange}
          required
          className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-green-700"
        >
          <option value="">-- Select Property --</option>
          {properties.map((property) => (
            <option key={property.property_id} value={property.property_id}>
              ({property.block_name?.block_name}) {property.property_number}
            </option>
          ))}
        </select>
      </div>

      {/* New Owner Dropdown */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">New Owner</label>
        <select
          value={newOwner}
          onChange={(e) => setNewOwner(e.target.value)}
          required
          className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-green-700"
        >
          <option value="">-- Select New Owner --</option>
          {owners.map((owner) => (
            <option key={owner.owner_id} value={owner.owner_id}>
              {owner.owner_name}
            </option>
          ))}
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
      >
        Transfer Property
      </button>
    </form></>

  );
};

export default PropertyTransfer;
