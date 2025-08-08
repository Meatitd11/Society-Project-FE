import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaEye, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import useAreaType from '../../../hooks/useAreaType';
import Modal from '../modal';
import Pagination from "../pagination";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AreaTypeList = () => {
  const { areaTypes, deleteAreaType, editAreaType, loading, error } = useAreaType();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAreaType, setSelectedAreaType] = useState(null);
  const [editAreaTypeName, setEditAreaTypeName] = useState('');
  const [editAreaValue, setEditAreaValue] = useState('');
  const [processing, setProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortedAreaTypes, setSortedAreaTypes] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: 'area_type_id',
    direction: 'desc'
  });
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    if (areaTypes.length > 0) {
      const sortableAreaTypes = [...areaTypes];
      sortableAreaTypes.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
      setSortedAreaTypes(sortableAreaTypes);
    }
  }, [areaTypes, sortConfig]);

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
    return <div className="text-red-600">Error loading area sizes: {error.message}</div>;
  }

  // Calculate pagination using sortedAreaTypes
  const totalPages = Math.ceil(sortedAreaTypes.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedAreaTypes.slice(indexOfFirstItem, indexOfLastItem);

  const handleOpenEditModal = (areaType) => {
    setSelectedAreaType(areaType);
    setEditAreaTypeName(areaType.area_type_name);
    setEditAreaValue(areaType.area_value);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (areaType) => {
    setSelectedAreaType(areaType);
    setIsDeleteModalOpen(true);
  };

  const handleOpenViewModal = (areaType) => {
    setSelectedAreaType(areaType);
    setIsViewModalOpen(true);
  };

  const handleEditAreaType = async () => {
    if (selectedAreaType) {
      setProcessing(true);
      try {
        await editAreaType(selectedAreaType.area_type_id, editAreaTypeName, editAreaValue);
        toast.success('Area size updated successfully');
        setIsEditModalOpen(false);
      } catch (error) {
        toast.error('Failed to update area size');
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleDeleteAreaType = async () => {
    if (selectedAreaType) {
      setProcessing(true);
      try {
        await deleteAreaType(selectedAreaType.area_type_id);
        toast.success('Area size deleted successfully');
        setIsDeleteModalOpen(false);
      } catch (error) {
        toast.error('Failed to delete area size');
      } finally {
        setProcessing(false);
      }
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="py-5">
      <div className='flex justify-between mb-4 items-center'> 
        <h1 className="text-2xl font-bold">Area Size List</h1>
        <button 
          onClick={() => navigate('/dashboard/add-area-size')}
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Add New Area Size
        </button>
      </div>
      <table className="min-w-full text-sm text-gray-600 bg-white border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="border text-start px-4 py-2">
              <div className="flex items-center cursor-pointer" onClick={() => requestSort('area_type_id')}>
                <span>#</span>
                <span className="ml-1">{getSortIcon('area_type_id')}</span>
              </div>
            </th>
            <th className="border text-start px-4 py-2">
              <div className="flex items-center cursor-pointer" onClick={() => requestSort('area_type_name')}>
                <span>Area size Name</span>
                <span className="ml-1">{getSortIcon('area_type_name')}</span>
              </div>
            </th>
            <th className="border text-start px-4 py-2">
              <div className="flex items-center cursor-pointer" onClick={() => requestSort('area_value')}>
                <span>Area Value</span>
                <span className="ml-1">{getSortIcon('area_value')}</span>
              </div>
            </th>
            <th className="border text-start px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((areaType, index) => (
              <tr key={areaType.area_type_id}>
                <td className="border px-4 py-2">{indexOfFirstItem + index + 1}</td>
                <td className="border px-4 py-2">{areaType.area_type_name}</td>
                <td className="border px-4 py-2">{areaType.area_value}</td>
                <td className="border px-4 py-2" colSpan={1}>
                  <div className="relative group">
                    <div className="">
                      <ul className="flex gap-2 text-left">
                        <li
                          className=" text-green-700 cursor-pointer"
                          onClick={() => handleOpenViewModal(areaType)}
                        >
                          <FaEye />
                        </li>
                        <li
                          className=" text-yellow-600 cursor-pointer"
                          onClick={() => handleOpenEditModal(areaType)}
                        >
                          <FaEdit />
                        </li>
                        <li
                          className="text-red-700  cursor-pointer"
                          onClick={() => handleOpenDeleteModal(areaType)}
                        >
                          <FaTrash /> 
                        </li>
                      </ul>
                    </div>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="border px-4 py-2 text-center" colSpan="4">
                No area sizes found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {sortedAreaTypes.length > itemsPerPage && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          paginate={paginate}
        />
      )}

      {/* View Area Type Modal */}
      <Modal isVisible={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
        <h2 className="text-xl mb-4">Area Type Details</h2>
        <p><strong>Area Size Name:</strong> {selectedAreaType?.area_type_name}</p>
        <p><strong>Area Value:</strong> {selectedAreaType?.area_value}</p>
      </Modal>

      {/* Edit Area Type Modal */}
      <Modal isVisible={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <h2 className="text-xl mb-4">Edit Area Size</h2>
        <div className="mb-4">
          <select 
            name="area_type_name" 
            value={editAreaTypeName} 
            onChange={(e) => setEditAreaTypeName(e.target.value)}
            required 
            className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
          >
            <option value="">Area Size</option>
            <option value="SQFT">Square Feet (SQFT)</option>
            <option value="MARLA">Marla</option>
            <option value="KANAL">Kanal</option>
          </select>
        </div>
        <div className="mb-4">
          <input
            type="number"
            id="area_value"
            name="area_value"
            placeholder="Area Value"
            value={editAreaValue}
            onChange={(e) => setEditAreaValue(e.target.value)}
            required
            className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
          />
        </div>
        <button
          onClick={handleEditAreaType}
          className="mt-4 w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
          disabled={processing}
        >
          {processing ? 'Saving...' : 'Save Changes'}
        </button>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isVisible={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <h2 className="text-xl mb-4">Confirm Delete</h2>
        <p>Are you sure you want to delete Area Size "{selectedAreaType?.area_type_name}"?</p>
        <button
          onClick={handleDeleteAreaType}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-sm"
          disabled={processing}
        >
          {processing ? 'Deleting...' : 'Yes, Delete'}
        </button>
      </Modal>
    </div>
  );
};

export default AreaTypeList;