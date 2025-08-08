import React, { useState } from 'react';
import { FaEdit, FaTrash, FaEye, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import Modal from '../modal';
import useMaintainanceCost from '../../../hooks/useMaintainanceCost';
import { toast } from 'react-toastify';
import Pagination from '../pagination';
import { useNavigate } from 'react-router-dom';

const McList = () => {
  const {
    maintenanceCost,
    loading,
    error,
    editMaintenanceCost,
    deleteMaintenanceCost
  } = useMaintainanceCost();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    m_title: '',
    m_date: '',
    m_amount: '',
    m_details: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: 'm_id',
    direction: 'desc'
  });
  const [sortedData, setSortedData] = useState([]);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  // Apply sorting when maintenanceCost or sortConfig changes
  React.useEffect(() => {
    if (maintenanceCost.length > 0) {
      const sortableItems = [...maintenanceCost];
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
      setSortedData(sortableItems);
    }
  }, [maintenanceCost, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    toast.error(error.message);
    return <div className="text-red-600">Error loading maintenance costs</div>;
  }

  // Calculate pagination using sortedData
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const handleOpenEditModal = (item) => {
    setSelectedItem(item);
    setEditFormData({
      m_title: item.m_title,
      m_date: item.m_date,
      m_amount: item.m_amount,
      m_details: item.m_details
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleOpenViewModal = (item) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };
  const handleEditSubmit = async () => {
    if (selectedItem) {
      const { success, message } = await editMaintenanceCost(
        selectedItem.m_id,
        editFormData.m_title,
        editFormData.m_date,
        editFormData.m_amount,
        editFormData.m_details
      );
      
      if (success) {
        toast.success(message);
        setIsEditModalOpen(false);
      } else {
        toast.error(message);
      }
    }
  };
  const handleDeleteSubmit = async () => {
    if (selectedItem) {
      const { success, message } = await deleteMaintenanceCost(selectedItem.m_id);
      if (success) {
        toast.success(message);
        setIsDeleteModalOpen(false);
      } else {
        toast.error(message);
      }
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="py-5">
      <div className='flex justify-between mb-4 items-center'> 
        <h1 className="text-2xl font-bold">Maintenance Cost List</h1>
        <button 
          onClick={() => navigate('/dashboard/add-maintenance-cost')}
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Add New Maintenance Cost
        </button>
      </div>
      <table className="min-w-full text-sm text-gray-600 bg-white border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="border text-start px-4 py-2">
              <div className="flex items-center cursor-pointer" onClick={() => requestSort('m_id')}>
                <span>#</span>
                <span className="ml-1">{getSortIcon('m_id')}</span>
              </div>
            </th>
            <th className="border text-start px-4 py-2">
              <div className="flex items-center cursor-pointer" onClick={() => requestSort('m_title')}>
                <span>Title</span>
                <span className="ml-1">{getSortIcon('m_title')}</span>
              </div>
            </th>
            <th className="border text-start px-4 py-2">
              <div className="flex items-center cursor-pointer" onClick={() => requestSort('m_date')}>
                <span>Date</span>
                <span className="ml-1">{getSortIcon('m_date')}</span>
              </div>
            </th>
            <th className="border text-start px-4 py-2">
              <div className="flex items-center cursor-pointer" onClick={() => requestSort('m_amount')}>
                <span>Amount</span>
                <span className="ml-1">{getSortIcon('m_amount')}</span>
              </div>
            </th>
            <th className="border text-start px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((item, index) => (
              <tr key={item.m_id}>
                <td className="border px-4 py-2">{indexOfFirstItem + index + 1}</td>
                <td className="border px-4 py-2">{item.m_title}</td>
                <td className="border px-4 py-2">{item.m_date}</td>
                <td className="border px-4 py-2">{item.m_amount}</td>
                <td className="border px-4 py-2">
                  <div className="flex gap-2">
                    <FaEye
                      className="text-green-700 cursor-pointer"
                      onClick={() => handleOpenViewModal(item)}
                    />
                    <FaEdit
                      className="text-yellow-600 cursor-pointer"
                      onClick={() => handleOpenEditModal(item)}
                    />
                    <FaTrash
                      className="text-red-700 cursor-pointer"
                      onClick={() => handleOpenDeleteModal(item)}
                    />
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="border px-4 py-2 text-center" colSpan="5">
                No maintenance costs found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {maintenanceCost.length > itemsPerPage && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          paginate={paginate}
        />
      )}

      {/* View Modal */}
      <Modal isVisible={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
        <h2 className="text-xl mb-4">Maintenance Cost Details</h2>
        <div className="space-y-2">
          <p><strong>Title:</strong> {selectedItem?.m_title}</p>
          <p><strong>Date:</strong> {selectedItem?.m_date}</p>
          <p><strong>Amount:</strong> {selectedItem?.m_amount}</p>
          <p><strong>Details:</strong> {selectedItem?.m_details}</p>
        </div>
      </Modal>
        {/* Edit Modal */}
        <Modal isVisible={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <h2 className="text-xl mb-4">Edit Maintenance Cost</h2>
        <div className="space-y-4">
          <input
            type="text"
            name="m_title"
            value={editFormData.m_title}
            onChange={handleEditChange}
            placeholder="Title"
            className="w-full px-4 py-2 border border-gray-300 rounded-sm"
          />
          <input
            type="date"
            name="m_date"
            value={editFormData.m_date}
            onChange={handleEditChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-sm"
          />
          <input
            type="number"
            name="m_amount"
            value={editFormData.m_amount}
            onChange={handleEditChange}
            placeholder="Amount"
            className="w-full px-4 py-2 border border-gray-300 rounded-sm"
          />
          <textarea
            name="m_details"
            value={editFormData.m_details}
            onChange={handleEditChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-sm"
          />
          <button
            onClick={handleEditSubmit}
            className="w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
          >
            Save Changes
          </button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isVisible={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <h2 className="text-xl mb-4">Confirm Delete</h2>
        <p>Are you sure you want to delete "{selectedItem?.m_title}"?</p>
        <button
          onClick={handleDeleteSubmit}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-sm"
        >
          Yes, Delete
        </button>
      </Modal>
    </div>
  );
};

export default McList;