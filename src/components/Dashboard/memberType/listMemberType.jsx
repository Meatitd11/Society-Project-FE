import React, { useState } from 'react';
import { FaEdit, FaTrash, FaEye, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import useMemberType from '../../../hooks/useMemberType';
import Modal from '../modal';
import Pagination from '../pagination';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ListMemberType = () => {
  const { memberTypes, deleteMemberType, editMemberType, loading, error } = useMemberType();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMemberType, setSelectedMemberType] = useState(null);
  const [editMemberTypeName, setEditMemberTypeName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: 'member_type_id',
    direction: 'desc'
  });
  const [sortedData, setSortedData] = useState([]);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  // Apply sorting when memberTypes or sortConfig changes
  React.useEffect(() => {
    if (memberTypes.length > 0) {
      const sortableItems = [...memberTypes];
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
  }, [memberTypes, sortConfig]);

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
    return <div className="w-full flex justify-center items-center min-h-[300px]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500"></div>
    </div>;
  }

  if (error) {
    return <div className="text-red-600">Error loading member types: {error.message}</div>;
  }

  // Calculate pagination using sortedData
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const handleOpenEditModal = (memberType) => {
    setSelectedMemberType(memberType);
    setEditMemberTypeName(memberType.member_type_name);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (memberType) => {
    setSelectedMemberType(memberType);
    setIsDeleteModalOpen(true);
  };

  const handleOpenViewModal = (memberType) => {
    setSelectedMemberType(memberType);
    setIsViewModalOpen(true);
  };

  const handleEditMemberType = async () => {
    if (selectedMemberType) {
      setProcessing(true);
      try {
        await editMemberType(selectedMemberType.member_type_id, editMemberTypeName);
        toast.success('Member type updated successfully');
        setIsEditModalOpen(false);
      } catch (error) {
        toast.error('Failed to update member type');
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleDeleteMemberType = async () => {
    if (selectedMemberType) {
      setProcessing(true);
      try {
        await deleteMemberType(selectedMemberType.member_type_id);
        toast.success('Member type deleted successfully');
        setIsDeleteModalOpen(false);
      } catch (error) {
        toast.error('Failed to delete member type');
      } finally {
        setProcessing(false);
      }
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="py-5">
      <div className='flex justify-between mb-4 items-center'> 
        <h1 className="text-2xl font-bold">Member Type List</h1>
        <button 
          onClick={() => navigate('/dashboard/add-member-type')}
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Add New Member Type
        </button>
      </div>
      <table className="min-w-full text-sm text-gray-600 bg-white border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="border text-start px-4 py-2">
              <div className="flex items-center cursor-pointer" onClick={() => requestSort('member_type_id')}>
                <span>#</span>
                <span className="ml-1">{getSortIcon('member_type_id')}</span>
              </div>
            </th>
            <th className="border text-start px-4 py-2">
              <div className="flex items-center cursor-pointer" onClick={() => requestSort('member_type_name')}>
                <span>Member Type Name</span>
                <span className="ml-1">{getSortIcon('member_type_name')}</span>
              </div>
            </th>
            <th className="border text-start px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((memberType, index) => (
              <tr key={memberType.member_type_id}>
                <td className="border px-4 py-2">{indexOfFirstItem + index + 1}</td>
                <td className="border px-4 py-2">{memberType.member_type_name}</td>
                <td className="border px-4 py-2" colSpan={1}>
                  <div className="relative group">
                    <div className="">
                      <ul className="flex gap-2 text-left">
                        <li
                          className=" text-green-700 cursor-pointer"
                          onClick={() => handleOpenViewModal(memberType)}
                        >
                          <FaEye />
                        </li>
                        <li
                          className=" text-yellow-600 cursor-pointer"
                          onClick={() => handleOpenEditModal(memberType)}
                        >
                          <FaEdit />
                        </li>
                        <li
                          className="text-red-700  cursor-pointer"
                          onClick={() => handleOpenDeleteModal(memberType)}
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
              <td className="border px-4 py-2 text-center" colSpan="3">
                No member types found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {sortedData.length > itemsPerPage && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          paginate={paginate}
        />
      )}

      {/* View MemberType Modal */}
      <Modal isVisible={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
        <h2 className="text-xl mb-4">Member Type Details</h2>
        <p><strong>Member Type Name:</strong> {selectedMemberType?.member_type_name}</p>
      </Modal>

      {/* Edit MemberType Modal */}
      <Modal isVisible={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <h2 className="text-xl mb-4">Edit Member Type</h2>
        <input
          type="text"
          value={editMemberTypeName}
          onChange={(e) => setEditMemberTypeName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-sm"
        />
        <button
          onClick={handleEditMemberType}
          className="mt-4 w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
          disabled={processing}
        >
          {processing ? 'Saving...' : 'Save Changes'}
        </button>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isVisible={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <h2 className="text-xl mb-4">Confirm Delete</h2>
        <p>Are you sure you want to delete member type "{selectedMemberType?.member_type_name}"?</p>
        <button
          onClick={handleDeleteMemberType}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-sm"
          disabled={processing}
        >
          {processing ? 'Deleting...' : 'Yes, Delete'}
        </button>
      </Modal>
    </div>
  );
};

export default ListMemberType;