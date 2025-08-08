import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import useUnitType from '../../../hooks/useUnitType';
import Modal from '../modal';
import { useNavigate } from 'react-router-dom';

const UnitTypeList = () => {
    const { unitTypes, deleteUnitType, editUnitType, loading, error } = useUnitType();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUnitType, setSelectedUnitType] = useState(null);
    const [editUnitName, setEditUnitName] = useState('');
    const [editUnitNumber, setEditUnitNumber] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortedUnitTypes, setSortedUnitTypes] = useState([]);
    const [sortConfig, setSortConfig] = useState({
      key: 'unit_type_id',
      direction: 'desc'
    });
    const itemsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
      if (unitTypes.length > 0) {
        const sortableUnitTypes = [...unitTypes];
        sortableUnitTypes.sort((a, b) => {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        });
        setSortedUnitTypes(sortableUnitTypes);
      }
    }, [unitTypes, sortConfig]);

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
        return <div>Error loading unit types: {error.message}</div>;
    }

    // Calculate pagination using sortedUnitTypes
    const totalPages = Math.ceil(sortedUnitTypes.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUnitTypes = sortedUnitTypes.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleOpenEditModal = (unitType) => {
        setSelectedUnitType(unitType);
        setEditUnitName(unitType.unit_name);
        setEditUnitNumber(unitType.unit_number);
        setIsEditModalOpen(true);
    };

    const handleOpenDeleteModal = (unitType) => {
        setSelectedUnitType(unitType);
        setIsDeleteModalOpen(true);
    };

    const handleEditUnitType = () => {
        if (selectedUnitType) {
            editUnitType(selectedUnitType.unit_type_id, editUnitName, editUnitNumber);
            setIsEditModalOpen(false);
        }
    };

    const handleDeleteUnitType = () => {
        if (selectedUnitType) {
            deleteUnitType(selectedUnitType.unit_type_id);
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <div className="py-5">
            <div className='flex justify-between mb-4 items-center'> 
              <h1 className="text-2xl font-bold">Unit Type List</h1>
              <button 
                onClick={() => navigate('/dashboard/add-unit-type')}
                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                Add New Unit Type
              </button>
            </div>
            <table className="min-w-full text-sm text-gray-600 bg-white border-collapse border border-gray-200">
                <thead>
                    <tr>
                        <th className="border text-start px-4 py-2">
                          <div className="flex items-center cursor-pointer" onClick={() => requestSort('unit_type_id')}>
                            <span>#</span>
                            <span className="ml-1">{getSortIcon('unit_type_id')}</span>
                          </div>
                        </th>
                        <th className="border text-start px-4 py-2">
                          <div className="flex items-center cursor-pointer" onClick={() => requestSort('unit_name')}>
                            <span>Unit Type</span>
                            <span className="ml-1">{getSortIcon('unit_name')}</span>
                          </div>
                        </th>
                        <th className="border text-start px-4 py-2">
                          <div className="flex items-center cursor-pointer" onClick={() => requestSort('unit_number')}>
                            <span>Unit Number</span>
                            <span className="ml-1">{getSortIcon('unit_number')}</span>
                          </div>
                        </th>
                        <th className="border text-start px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentUnitTypes.length > 0 ? (
                        currentUnitTypes.map((unitType, index) => (
                            <tr key={unitType.unit_type_id}>
                                <td className="border px-4 py-2">{indexOfFirstItem + index + 1}</td>
                                <td className="border px-4 py-2">{unitType.unit_name}</td>
                                <td className="border px-4 py-2">{unitType.unit_number}</td>
                                <td className="border px-4 py-2">
                                    <ul className="flex gap-2 text-left">
                                        <li className="text-yellow-600 cursor-pointer" onClick={() => handleOpenEditModal(unitType)}>
                                            <FaEdit />
                                        </li>
                                        <li className="text-red-700 cursor-pointer" onClick={() => handleOpenDeleteModal(unitType)}>
                                            <FaTrash />
                                        </li>
                                    </ul>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td className="border px-4 py-2 text-center" colSpan="4">
                                No unit types found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {sortedUnitTypes.length > itemsPerPage && (
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
                <h2 className="text-xl mb-4">Edit Unit Type</h2>
                <input
                    type="text"
                    value={editUnitName}
                    onChange={(e) => setEditUnitName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-sm"
                    placeholder="Unit Name"
                />
                <input
                    type="number"
                    value={editUnitNumber}
                    onChange={(e) => setEditUnitNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-sm mt-2"
                    placeholder="Unit Number"
                />
                <button
                    onClick={handleEditUnitType}
                    className="mt-4 bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
                >
                    Save Changes
                </button>
            </Modal>

            {/* Delete Modal */}
            <Modal isVisible={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <h2 className="text-xl mb-4">Confirm Delete</h2>
                <p>Are you sure you want to delete unit type "{selectedUnitType?.unit_name}"?</p>
                <button
                    onClick={handleDeleteUnitType}
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded-sm"
                >
                    Yes, Delete
                </button>
            </Modal>
        </div>
    );
};

export default UnitTypeList;