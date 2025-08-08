import React, { useState, useEffect, useMemo } from 'react';
import { FaEdit, FaTrash, FaEye, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import Modal from '../modal';
import useProperty from '../../../hooks/useProperty';
import useBlock from '../../../hooks/useBlock';
import useAmenity from '../../../hooks/useAmenity';
import useUnitType from '../../../hooks/useUnitType';
import usePropertyType from '../../../hooks/usePropertyType';
import useAreaType from '../../../hooks/useAreaType';
import { useNavigate } from 'react-router-dom';

const PropertyList = () => {
  const { properties, deleteProperty, editProperty, loading, fetchProperties, countries, cities, fetchCities, floors, fetchFloors } = useProperty();
  const { blocks, fetchBlocks } = useBlock();
  const { amenities, fetchAmenities } = useAmenity();
  const { unitTypes, fetchUnitTypes } = useUnitType();
  const { propertyTypes, fetchPropertyTypes } = usePropertyType();
  const { areaTypes, fetchAreaTypes } = useAreaType();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editPropertyData, setEditPropertyData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const [sortConfig, setSortConfig] = useState({
    key: 'property_id',
    direction: 'desc'
  });

  useEffect(() => {
    fetchProperties();
    fetchBlocks();
    fetchAmenities();
    fetchUnitTypes();
    fetchPropertyTypes();
    fetchAreaTypes();
    fetchFloors();
  }, []);

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setEditPropertyData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'country') {
      fetchCities(value);
    }
  };

  const sortedData = useMemo(() => {
    if (!properties || properties.length === 0) return [];
    
    const sortableItems = [...properties];
    sortableItems.sort((a, b) => {
      if (sortConfig.key === 'block_name') {
        const aValue = a.block_name?.block_name || '';
        const bValue = b.block_name?.block_name || '';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }
      if (sortConfig.key === 'property_type') {
        const aValue = a.property_type?.property_name || '';
        const bValue = b.property_type?.property_name || '';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }
      if (sortConfig.key === 'unit_type') {
        const aValue = a.unit_type?.unit_name || '';
        const bValue = b.unit_type?.unit_name || '';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }
      if (sortConfig.key === 'floor') {
        const aValue = a.floor?.name || '';
        const bValue = b.floor?.name || '';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }
      
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [properties, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProperties = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleOpenEditModal = (property) => {
    setSelectedProperty(property);
    setEditPropertyData({
      block_name: property.block_name?.id,
      building_name: property.building_name,
      property_name: property.property_name,
      property_type: property.property_type?.pro_type_id,
      property_number: property.property_number,
      unit_type: property.unit_type?.unit_type_id,
      floor: property.floor?.id,
      number_of_bedrooms: property.number_of_bedrooms,
      number_of_bathrooms: property.number_of_bathrooms,
      balcony_or_patio: property.balcony_or_patio,
      parking_space: property.parking_space,
      number_of_halls: property.number_of_halls,
      street_address: property.street_address,
      property_area: property.property_area?.area_type_id,
      property_value: property.property_value,
      amenity_name: property.amenity_name?.map(a => a.amenity_id) || [],
      documents: property.documents || [], // This will contain the existing documents with id and file
      is_active: property.is_active,
      is_rented: property.is_rented,
      any_note: property.any_note
    });
    setIsEditModalOpen(true);
  };
  const handleDocumentUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
  
    // Validate files
    for (let i = 0; i < files.length; i++) {
      if (files[i].type !== 'application/pdf') {
        toast.error('Only PDF files are allowed');
        return;
      }
      if (files[i].size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
    }
  
    // Check total documents won't exceed 3
    const currentDocs = editPropertyData.documents || [];
    if (currentDocs.length + files.length > 3) {
      toast.error('Maximum 3 documents allowed');
      return;
    }
  
    // Add to existing documents
    setEditPropertyData(prev => ({
      ...prev,
      documents: [...currentDocs, ...Array.from(files)]
    }));
  };
  
  const handleDocumentRemove = (idOrIndex, isFile = false) => {
    setEditPropertyData(prev => {
      if (isFile) {
        // Remove by index (for new files)
        const newDocs = [...prev.documents];
        newDocs.splice(idOrIndex, 1);
        return { ...prev, documents: newDocs };
      } else {
        // Remove by id (for existing documents)
        return {
          ...prev,
          documents: prev.documents.filter(doc => 
            typeof doc === 'object' ? doc.id !== idOrIndex : true
          )
        };
      }
    });
  };
 
  const handleOpenDeleteModal = (property) => {
    setSelectedProperty(property);
    setIsDeleteModalOpen(true);
  };

  const handleOpenViewModal = (property) => {
    setSelectedProperty(property);
    setIsViewModalOpen(true);
  };

  const handleEditProperty = async () => {
    if (!selectedProperty) return;
  
    try {
      const formData = new FormData();
      
      // Append all regular fields
      Object.entries(editPropertyData).forEach(([key, value]) => {
        if (key !== 'documents' && value !== null && value !== undefined) {
          if (key === 'is_rented' || key === 'is_active') {
            formData.append(key, value ? 'True' : 'False');
          } else if (key === 'amenity_name') {
            value.forEach(amenityId => formData.append('amenity_name', amenityId));
          } else if (typeof value === 'object' && value !== null && !(value instanceof File)) {
            formData.append(key, value.id || value);
          } else {
            formData.append(key, value);
          }
        }
      });
  
      // Append new documents and document removals
      const existingDocIds = editPropertyData.documents
        .filter(doc => typeof doc === 'object' && doc.id)
        .map(doc => doc.id);
      
      // Add document IDs to keep (for backend to know which to delete)
      existingDocIds.forEach(id => formData.append('existing_documents', id));
      
      // Add new files to upload
      editPropertyData.documents
        .filter(doc => doc instanceof File)
        .forEach(file => formData.append('documents', file));
  
      await editProperty(selectedProperty.property_id, formData);
      setIsEditModalOpen(false);
      toast.success('Property updated successfully');
      fetchProperties(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update property');
      console.error('Error updating property:', error);
    }
  };

  const handleDeleteProperty = () => {
    if (selectedProperty) {
      deleteProperty(selectedProperty.property_id);
      setIsDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="py-5">
      <div className='flex justify-between mb-4 items-center'> 
        <h1 className="text-2xl font-bold text-secondary-yellow">Property List</h1>
        <button 
          onClick={() => navigate('/dashboard/add-property')}
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Add New Property
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-gray-600 bg-white border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="border px-4 py-2 whitespace-nowrap">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('property_id')}>
                  <span>#</span>
                  <span className="ml-1">{getSortIcon('property_id')}</span>
                </div>
              </th>
              <th className="border px-4 py-2 whitespace-nowrap">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('property_name')}>
                  <span>Property Name</span>
                  <span className="ml-1">{getSortIcon('property_name')}</span>
                </div>
              </th>
              <th className="border px-4 py-2 whitespace-nowrap">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('property_number')}>
                  <span>Property Number</span>
                  <span className="ml-1">{getSortIcon('property_number')}</span>
                </div>
              </th>
              <th className="border px-4 py-2 whitespace-nowrap">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('block_name')}>
                  <span>Block</span>
                  <span className="ml-1">{getSortIcon('block_name')}</span>
                </div>
              </th>
              <th className="border px-4 py-2 whitespace-nowrap">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('property_type')}>
                  <span>Property Type</span>
                  <span className="ml-1">{getSortIcon('property_type')}</span>
                </div>
              </th>
              <th className="border px-4 py-2 whitespace-nowrap">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('unit_type')}>
                  <span>Unit Type</span>
                  <span className="ml-1">{getSortIcon('unit_type')}</span>
                </div>
              </th>
              <th className="border px-4 py-2 whitespace-nowrap">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('floor')}>
                  <span>Floor</span>
                  <span className="ml-1">{getSortIcon('floor')}</span>
                </div>
              </th>
              <th className="border px-4 py-2 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentProperties.length > 0 ? (
              currentProperties.map((property, index) => (
                <tr key={property.property_id}>
                  <td className="border px-4 py-2">{indexOfFirstItem + index + 1}</td>
                  <td className="border px-4 py-2">{property.property_name}</td>
                  <td className="border px-4 py-2">{property.property_number}</td>
                  <td className="border px-4 py-2">{property.block_name?.block_name || 'N/A'}</td>
                  <td className="border px-4 py-2">{property.property_type?.property_name || 'N/A'}</td>
                  <td className="border px-4 py-2">
                    {property.unit_type ? `${property.unit_type.unit_number} - ${property.unit_type.unit_name}` : 'N/A'}
                  </td>
                  <td className="border px-4 py-2">
                    {property.floor?.name || 'N/A'}
                  </td>
                  <td className="border px-4 py-2">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleOpenViewModal(property)}
                        className="text-green-700 hover:text-green-900"
                      >
                        <FaEye />
                      </button>
                      <button 
                        onClick={() => handleOpenEditModal(property)}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleOpenDeleteModal(property)}
                        className="text-red-700 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border px-4 py-2 text-center" colSpan="8">
                  No properties found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {properties.length > itemsPerPage && (
        <div className="flex justify-center mt-4">
          <nav className="inline-flex rounded-md shadow">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-3 py-1 border ${
                  currentPage === number
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {number}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* View Modal */}
      <Modal isVisible={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
        <h2 className="text-xl mb-4">Property Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Property Name:</strong> {selectedProperty?.property_name}</p>
            <p><strong>Block:</strong> {selectedProperty?.block_name?.block_name || 'N/A'}</p>
            <p><strong>Building:</strong> {selectedProperty?.building_name}</p>
            <p><strong>Property Type:</strong> {selectedProperty?.property_type?.property_name || 'N/A'}</p>
            <p><strong>Property Number:</strong> {selectedProperty?.property_number}</p>
            <p><strong>Unit Type:</strong> {selectedProperty?.unit_type ? `${selectedProperty.unit_type.unit_number} - ${selectedProperty.unit_type.unit_name}` : 'N/A'}</p>
            <p><strong>Floor:</strong> {selectedProperty?.floor?.name}</p>
            <p><strong>Bedrooms:</strong> {selectedProperty?.number_of_bedrooms}</p>
            <p><strong>Bathrooms:</strong> {selectedProperty?.number_of_bathrooms}</p>
            <p><strong>Balcony/Patio:</strong> {selectedProperty?.balcony_or_patio}</p>
            <p><strong>Parking Space:</strong> {selectedProperty?.parking_space}</p>
          </div>
          <div>
            <p><strong>Halls:</strong> {selectedProperty?.number_of_halls}</p>
            <p><strong>Street Address:</strong> {selectedProperty?.street_address}</p>
            <p><strong>Property Area:</strong> {selectedProperty?.property_area ? `${selectedProperty.property_area.area_type_name} - ${selectedProperty.property_area.area_value}` : 'N/A'}</p>
            <p><strong>Property Value:</strong> {selectedProperty?.property_value}</p>
            <p><strong>Is Rented:</strong> {selectedProperty?.is_rented ? 'Yes' : 'No'}</p>
            <p><strong>Is Active:</strong> {selectedProperty?.is_active ? 'Yes' : 'No'}</p>
            <p><strong>Note:</strong> {selectedProperty?.any_note || 'N/A'}</p>
            <p><strong>Amenities:</strong> 
              {selectedProperty?.amenity_name?.length > 0 
                ? selectedProperty.amenity_name.map(a => a.amenity_name).join(', ')
                : 'N/A'}
            </p>
            <p className="mt-4"><strong>Documents:</strong></p>
  {selectedProperty?.documents?.length > 0 ? (
    <div className="mt-2 space-y-2">
      {selectedProperty.documents.map((doc, index) => (
        <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 flex items-center justify-center rounded mr-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">
                {doc.file.split('/').pop() || `Document ${index + 1}`}
              </p>
            </div>
          </div>
          <a 
            href={doc.file} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-800 ml-2"
            download
          >
            Download
          </a>
        </div>
      ))}
    </div>
  ) : (
    <p>No documents uploaded</p>
  )}
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isVisible={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <h2 className="text-xl mb-4">Edit Property</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Property Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
            <input
              type="text"
              name="property_name"
              value={editPropertyData.property_name || ''}
              onChange={handleEditChange}
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>

          {/* Block */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Block</label>
            <select
              name="block_name"
              value={editPropertyData.block_name || ''}
              onChange={handleEditChange}
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            >
              <option value="">Select Block</option>
              {blocks.map(block => (
                <option key={block.id} value={block.id}>{block.block_name}</option>
              ))}
            </select>
          </div>

          {/* Building Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Building Name</label>
            <input
              type="text"
              name="building_name"
              value={editPropertyData.building_name || ''}
              onChange={handleEditChange}
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>

          {/* Property Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
            <select
              name="property_type"
              value={editPropertyData.property_type || ''}
              onChange={handleEditChange}
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            >
              <option value="">Select Property Type</option>
              {propertyTypes.map(type => (
                <option key={type.pro_type_id} value={type.pro_type_id}>
                  {type.property_name}
                </option>
              ))}
            </select>
          </div>

          {/* Property Number */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Number</label>
            <input
              type="number"
              name="property_number"
              value={editPropertyData.property_number || ''}
              onChange={handleEditChange}
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>

          {/* Unit Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Type</label>
            <select
              name="unit_type"
              value={editPropertyData.unit_type || ''}
              onChange={handleEditChange}
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            >
              <option value="">Select Unit Type</option>
              {unitTypes.map(unit => (
                <option key={unit.unit_type_id} value={unit.unit_type_id}>
                  {unit.unit_number} - {unit.unit_name}
                </option>
              ))}
            </select>
          </div>

          {/* Floor */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
            <select
              name="floor"
              value={editPropertyData.floor || ''}
              onChange={handleEditChange}
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            >
              <option value="">Select Floor</option>
              {floors.map(floor => (
                <option key={floor.id} value={floor.id}>
                  {floor.name}
                </option>
              ))}
            </select>
          </div>

          {/* Number of Bedrooms */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
            <input
              type="number"
              name="number_of_bedrooms"
              value={editPropertyData.number_of_bedrooms || ''}
              onChange={handleEditChange}
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>

          {/* Number of Bathrooms */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
            <input
              type="number"
              name="number_of_bathrooms"
              value={editPropertyData.number_of_bathrooms || ''}
              onChange={handleEditChange}
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>

          {/* Balcony/Patio */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Balcony/Patio</label>
            <select
              name="balcony_or_patio"
              value={editPropertyData.balcony_or_patio || ''}
              onChange={handleEditChange}
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            >
              <option value="">Select Option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          {/* Parking Space */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Parking Space</label>
            <select
              name="parking_space"
              value={editPropertyData.parking_space || ''}
              onChange={handleEditChange}
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            >
              <option value="">Select Option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          {/* Number of Halls */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Halls</label>
            <input
              type="number"
              name="number_of_halls"
              value={editPropertyData.number_of_halls || ''}
              onChange={handleEditChange}
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>

          {/* Street Address */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            <input
              type="text"
              name="street_address"
              value={editPropertyData.street_address || ''}
              onChange={handleEditChange}
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>

          {/* Property Area */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Area</label>
            <select
              name="property_area"
              value={editPropertyData.property_area || ''}
              onChange={handleEditChange}
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            >
              <option value="">Select Area Type</option>
              {areaTypes.map(area => (
                <option key={area.area_type_id} value={area.area_type_id}>
                  {area.area_type_name} - {area.area_value}
                </option>
              ))}
            </select>
          </div>

          {/* Property Value */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Value</label>
            <input
              type="text"
              name="property_value"
              value={editPropertyData.property_value || ''}
              onChange={handleEditChange}
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>

          {/* Is Rented */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Is Rented</label>
            <select
              name="is_rented"
              value={editPropertyData.is_rented ? 'true' : 'false'}
              onChange={(e) => handleEditChange({ target: { name: 'is_rented', value: e.target.value === 'true' } })}
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

        {/* Amenities Section in Edit Modal */}
<div className="mb-4 col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
  <div className="grid grid-cols-3 gap-2">
    {amenities.map(amenity => (
      <div key={amenity.amenity_id} className="flex items-center">
        <input
          type="checkbox"
          id={`amenity-${amenity.amenity_id}`}
          name="amenity_name"
          checked={editPropertyData.amenity_name?.some(id => 
            id.toString() === amenity.amenity_id.toString()
          )}
          onChange={(e) => {
            const newAmenities = editPropertyData.amenity_name || [];
            if (e.target.checked) {
              setEditPropertyData({
                ...editPropertyData,
                amenity_name: [...newAmenities, amenity.amenity_id]
              });
            } else {
              setEditPropertyData({
                ...editPropertyData,
                amenity_name: newAmenities.filter(id => 
                  id.toString() !== amenity.amenity_id.toString()
                )
              });
            }
          }}
          className="h-4 w-4 text-green-600 focus:ring-0 border-gray-300 rounded"
        />
        <label htmlFor={`amenity-${amenity.amenity_id}`} className="ml-2 text-sm text-gray-700">
          {amenity.amenity_name}
        </label>
      </div>
    ))}
  </div>
</div>
          {/* Note */}
          <div className="mb-4 col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <textarea
              name="any_note"
              value={editPropertyData.any_note || ''}
              onChange={handleEditChange}
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
              rows="3"
            />
          </div>
           {/* In the Edit Modal */}
{/* In the Edit Modal */}
<div className="mb-4 col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Property Documents (PDF only, max 3 files, 5MB each)
  </label>
  
  {/* Current Documents */}
  {editPropertyData.documents?.length > 0 && (
    <div className="mb-4">
      <h4 className="text-sm font-medium mb-2">Current Documents:</h4>
      <div className="space-y-2">
        {editPropertyData.documents
          .filter(doc => typeof doc === 'object') // Filter out File objects
          .map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-100 flex items-center justify-center rounded mr-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {doc.file.split('/').pop() || `Document ${doc.id}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDocumentRemove(doc.id)}
                className="text-red-600 hover:text-red-800 ml-2"
              >
                Remove
              </button>
            </div>
          ))}
      </div>
    </div>
  )}
  
  {/* New Documents Preview */}
  {editPropertyData.documents?.some(doc => doc instanceof File) && (
    <div className="mb-4">
      <h4 className="text-sm font-medium mb-2">New Documents to Upload:</h4>
      <div className="space-y-2">
        {editPropertyData.documents
          .filter(doc => doc instanceof File)
          .map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-100 flex items-center justify-center rounded mr-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                onClick={() => handleDocumentRemove(index, true)}
                className="text-red-600 hover:text-red-800 ml-2"
              >
                Remove
              </button>
            </div>
          ))}
      </div>
    </div>
  )}
  
  {/* File Upload */}
  <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
    <input
      type="file"
      name="documents"
      onChange={handleDocumentUpload}
      className="block w-full text-sm text-gray-500
        file:mr-4 file:py-2 file:px-4
        file:rounded-sm file:border-0
        file:text-sm file:font-semibold
        file:bg-green-50 file:text-green-700
        hover:file:bg-green-100"
      multiple
      accept=".pdf,application/pdf"
    />
    <p className="mt-1 text-xs text-gray-500">
      Upload new PDF documents (max 3 files, 5MB each)
    </p>
  </div>
</div>

          {/* Is Active */}
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={editPropertyData.is_active || false}
              onChange={handleEditChange}
              className="h-4 w-4 text-green-600 focus:ring-0 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Is Active</label>
          </div>
        </div>

        <button
          onClick={handleEditProperty}
          className="mt-4 bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
        >
          Save Changes
        </button>
      </Modal>

      {/* Delete Modal */}
      <Modal isVisible={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <h2 className="text-xl mb-4">Confirm Delete</h2>
        <p>Are you sure you want to delete property "{selectedProperty?.property_name}"?</p>
        <div className="flex space-x-4 mt-4">
          <button
            onClick={handleDeleteProperty}
            className="bg-red-500 text-white px-4 py-2 rounded-sm"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded-sm"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default PropertyList;