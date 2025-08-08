import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import usePropertyType from '../../../hooks/usePropertyType';
import Modal from '../modal';
import { useNavigate } from 'react-router-dom';

const PropertyTypeList = () => {
    const { propertyTypes, deletePropertyType, editPropertyType, loading, error } = usePropertyType();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedPropertyType, setSelectedPropertyType] = useState(null);
    const [editPropertyName, setEditPropertyName] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortedPropertyTypes, setSortedPropertyTypes] = useState([]);
    const [sortConfig, setSortConfig] = useState({
      key: 'pro_type_id',
      direction: 'desc'
    });
    const itemsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
      if (propertyTypes.length > 0) {
        const sortablePropertyTypes = [...propertyTypes];
        sortablePropertyTypes.sort((a, b) => {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        });
        setSortedPropertyTypes(sortablePropertyTypes);
      }
    }, [propertyTypes, sortConfig]);

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

    if (loading) {
        return <div className="w-full flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500"></div>
        </div>;
    }

    if (error) {
        return <div>Error loading area types: {error.message}</div>;
    }

    // Calculate pagination using sortedPropertyTypes
    const totalPages = Math.ceil(sortedPropertyTypes.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPropertyTypes = sortedPropertyTypes.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleOpenEditModal = (propertyType) => {
        setSelectedPropertyType(propertyType);
        setEditPropertyName(propertyType.property_name);
        setIsEditModalOpen(true);
    };

    const handleOpenDeleteModal = (propertyType) => {
        setSelectedPropertyType(propertyType);
        setIsDeleteModalOpen(true);
    };

    const handleEditPropertyType = () => {
        if (selectedPropertyType) {
            editPropertyType(selectedPropertyType.pro_type_id, editPropertyName);
            setIsEditModalOpen(false);
        }
    };

    const handleDeletePropertyType = () => {
        if (selectedPropertyType) {
            deletePropertyType(selectedPropertyType.pro_type_id);
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <div className="py-5">
            <div className='flex justify-between mb-4 items-center'> 
              <h1 className="text-2xl font-bold">Area Type List</h1>
              <button 
                onClick={() => navigate('/dashboard/add-area-type')}
                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                Add New Area Type
              </button>
            </div>
            <table className="min-w-full text-sm text-gray-600 bg-white border-collapse border border-gray-200">
                <thead>
                    <tr>
                        <th className="border text-start px-4 py-2">
                          <div className="flex items-center cursor-pointer" onClick={() => requestSort('pro_type_id')}>
                            <span>#</span>
                            <span className="ml-1">{getSortIcon('pro_type_id')}</span>
                          </div>
                        </th>
                        <th className="border text-start px-4 py-2">
                          <div className="flex items-center cursor-pointer" onClick={() => requestSort('property_name')}>
                            <span>Area Type</span>
                            <span className="ml-1">{getSortIcon('property_name')}</span>
                          </div>
                        </th>
                        <th className="border text-start px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentPropertyTypes.length > 0 ? (
                        currentPropertyTypes.map((propertyType, index) => (
                            <tr key={propertyType.pro_type_id}>
                                <td className="border px-4 py-2">{indexOfFirstItem + index + 1}</td>
                                <td className="border px-4 py-2">{propertyType.property_name}</td>
                                <td className="border px-4 py-2">
                                    <ul className="flex gap-2 text-left">
                                        <li className="text-yellow-600 cursor-pointer" onClick={() => handleOpenEditModal(propertyType)}>
                                            <FaEdit />
                                        </li>
                                        <li className="text-red-700 cursor-pointer" onClick={() => handleOpenDeleteModal(propertyType)}>
                                            <FaTrash />
                                        </li>
                                    </ul>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td className="border px-4 py-2 text-center" colSpan="3">
                                No area types found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {sortedPropertyTypes.length > itemsPerPage && (
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

            {/* Edit Modal */}
            <Modal isVisible={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <h2 className="text-xl mb-4">Edit Area Type</h2>
                <input
                    type="text"
                    value={editPropertyName}
                    onChange={(e) => setEditPropertyName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-sm"
                />
                <button
                    onClick={handleEditPropertyType}
                    className="mt-4 w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
                >
                    Save Changes
                </button>
            </Modal>

            {/* Delete Modal */}
            <Modal isVisible={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <h2 className="text-xl mb-4">Confirm Delete</h2>
                <p>Are you sure you want to delete area type "{selectedPropertyType?.property_name}"?</p>
                <button
                    onClick={handleDeletePropertyType}
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded-sm"
                >
                    Yes, Delete
                </button>
            </Modal>
        </div>
    );
};

export default PropertyTypeList;