import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import useFloor from '../../../hooks/useFloor';
import Modal from '../modal';
import { toast } from 'react-toastify';
import Pagination from '../pagination';
import { useNavigate } from 'react-router-dom';

const FloorList = () => {
  const { floors, deleteFloor, editFloor, loading, error } = useFloor();
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [editFloorName, setEditFloorName] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortedFloors, setSortedFloors] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'desc' // Default sort by ID descending
  });
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    if (floors.length > 0) {
      const sortableFloors = [...floors];
      sortableFloors.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
      setSortedFloors(sortableFloors);
    }
  }, [floors, sortConfig]);

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
    return (
      <div className="w-full flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    toast.error(`Error loading floors: ${error.message}`);
    return <div className="text-red-600">Error loading floors</div>;
  }

  // Calculate pagination using sortedFloors
  const totalPages = Math.ceil(sortedFloors.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedFloors.slice(indexOfFirstItem, indexOfLastItem);

  const handleOpenEditModal = (floor) => {
    setSelectedFloor(floor);
    setEditFloorName(floor.name);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (floor) => {
    setSelectedFloor(floor);
    setIsDeleteModalOpen(true);
  };

  const handleEditFloor = () => {
    if (selectedFloor) {
      editFloor(selectedFloor.id, editFloorName);
      setIsEditModalOpen(false);
    }
  };

  const handleDeleteFloor = () => {
    if (selectedFloor) {
      deleteFloor(selectedFloor.id);
      setIsDeleteModalOpen(false);
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="py-5">
      <div className='flex justify-between mb-4 items-center'> 
        <h1 className="text-2xl font-bold">Floor List</h1>
        <button 
          onClick={() => navigate('/dashboard/add-floor')}
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Add New Floor
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
              <div className="flex items-center cursor-pointer" onClick={() => requestSort('name')}>
                <span>Floor Name</span>
                <span className="ml-1">{getSortIcon('name')}</span>
              </div>
            </th>
            <th className="border text-start px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((floor, index) => (
              <tr key={floor.id}>
                <td className="border px-4 py-2">{indexOfFirstItem + index + 1}</td>
                <td className="border px-4 py-2">{floor.name}</td>
                <td className="border px-4 py-2">
                  <ul className="flex gap-2">
                    <li className="text-yellow-600 cursor-pointer" onClick={() => handleOpenEditModal(floor)}>
                      <FaEdit />
                    </li>
                    <li className="text-red-700 cursor-pointer" onClick={() => handleOpenDeleteModal(floor)}>
                      <FaTrash />
                    </li>
                  </ul>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="border px-4 py-2 text-center" colSpan="3">
                No floors found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {sortedFloors.length > itemsPerPage && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          paginate={paginate}
        />
      )}

      <Modal isVisible={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <h2 className="text-xl mb-4">Edit Floor</h2>
        <input
          value={editFloorName}
          onChange={(e) => setEditFloorName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-sm"
        />
          
        <button
          onClick={handleEditFloor}
          className="mt-4 bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600"
        >
          Save Changes
        </button>
      </Modal>

      <Modal isVisible={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <h2 className="text-xl mb-4">Confirm Delete</h2>
        <p>Are you sure you want to delete floor "{selectedFloor?.name}"?</p>
        <button
          onClick={handleDeleteFloor}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-sm"
        >
          Yes, Delete
        </button>
      </Modal>
    </div>
  );
};

export default FloorList;