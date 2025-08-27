import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaEye, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import useFine from '../../../hooks/useFine';
import Modal from '../modal';
import { toast } from 'react-toastify';
import Pagination from '../pagination';
import { useNavigate } from 'react-router-dom';

const FineList = () => {
  const { fines, deleteFine, editFine, loading, error, fetchFines } = useFine();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null);
  const [editFineAmount, setEditFineAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'desc'
  });
  const [sortedData, setSortedData] = useState([]);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  // Apply sorting when fines or sortConfig changes
  useEffect(() => {
    if (fines.length > 0) {
      const sortableItems = [...fines];
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
  }, [fines, sortConfig]);

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
    toast.error(`Error loading fines: ${error.message}`);
    return <div className="text-red-600 p-4">Error loading fines. Please try again.</div>;
  }

  // Calculate pagination using sortedData
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const handleOpenEditModal = (fine) => {
    setSelectedFine(fine);
    setEditFineAmount(fine.fine);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (fine) => {
    setSelectedFine(fine);
    setIsDeleteModalOpen(true);
  };

  const handleOpenViewModal = (fine) => {
    setSelectedFine(fine);
    setIsViewModalOpen(true);
  };

  const handleEditFine = async () => {
    if (!selectedFine) return;
    
    setProcessing(true);
    try {
      const { success, message } = await editFine(selectedFine.id, editFineAmount);
      if (success) {
        toast.success(message);
        setIsEditModalOpen(false);
        fetchFines();
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error('Failed to update fine. Please try again.');
      console.error('Edit fine error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteFine = async () => {
    if (!selectedFine) return;
    
    setProcessing(true);
    try {
      const { success, message } = await deleteFine(selectedFine.id);
      if (success) {
        toast.success(message);
        setIsDeleteModalOpen(false);
        fetchFines();
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error('Failed to delete fine. Please try again.');
      console.error('Delete fine error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="py-5">
      <div className='flex justify-between mb-4 items-center'> 
        <h1 className="text-2xl font-bold">Fine List</h1>
        <button 
          onClick={() => navigate('/dashboard/add-fine')}
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Add New Fine
        </button>
      </div>
      <table className="min-w-full text-sm text-gray-600 bg-white border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="border text-start px-4 py-2">
              <div className="flex items-center cursor-pointer" onClick={() => requestSort('id')}>
                <span>#</span>
                <span className="ml-1">{getSortIcon('id')}</span>
              </div>
            </th>
            <th className="border text-start px-4 py-2">
              <div className="flex items-center cursor-pointer" onClick={() => requestSort('fine')}>
                <span>Fine Amount</span>
                <span className="ml-1">{getSortIcon('fine')}</span>
              </div>
            </th>
            <th className="border text-start px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((fine, index) => (
              <tr key={fine.id}>
                <td className="border px-4 py-2">{indexOfFirstItem + index + 1}</td>
                <td className="border px-4 py-2">{fine.fine}</td>
                <td className="border px-4 py-2">
                  <div className="flex gap-2">
                    <FaEye 
                      className="text-green-700 cursor-pointer"
                      onClick={() => handleOpenViewModal(fine)}
                    />
                    <FaEdit 
                      className="text-yellow-600 cursor-pointer"
                      onClick={() => handleOpenEditModal(fine)}
                    />
                    <FaTrash 
                      className="text-red-700 cursor-pointer"
                      onClick={() => handleOpenDeleteModal(fine)}
                    />
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="border px-4 py-2 text-center" colSpan="3">
                No fines found
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

      {/* View Fine Modal */}
      <Modal isVisible={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
        <h2 className="text-xl mb-4">Fine Details</h2>
        <p><strong>Fine Amount:</strong> {selectedFine?.fine}</p>
      </Modal>

      {/* Edit Fine Modal */}
      <Modal isVisible={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <h2 className="text-xl mb-4">Edit Fine</h2>
        <input
          type="number"
          value={editFineAmount}
          onChange={(e) => setEditFineAmount(e.target.value)}
          step="0.01"
          min="0"
          className="w-full px-4 py-2 border border-gray-300 rounded-sm"
          disabled={processing}
        />
        <button
          onClick={handleEditFine}
          className="mt-4 w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
          disabled={processing}
        >
          {processing ? 'Saving...' : 'Save Changes'}
        </button>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isVisible={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <h2 className="text-xl mb-4">Confirm Delete</h2>
        <p>Are you sure you want to delete fine "{selectedFine?.fine}"?</p>
        <div className="flex gap-4 mt-4">
          <button
            onClick={handleDeleteFine}
            className="bg-red-500 text-white px-4 py-2 rounded-sm"
            disabled={processing}
          >
            {processing ? 'Deleting...' : 'Yes, Delete'}
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

export default FineList;