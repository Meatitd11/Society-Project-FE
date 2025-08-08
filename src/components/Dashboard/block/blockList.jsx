import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import useBlock from '../../../hooks/useBlock';
import Modal from '../modal';
import { useNavigate } from 'react-router-dom';

const BlockList = () => {
  const { blocks, deleteBlock, editBlock, loading, error } = useBlock();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [editBlockName, setEditBlockName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortedBlocks, setSortedBlocks] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'desc' // Default sort by ID descending to show newest first
  });
  const itemsPerPage = 10;
  const navigate = useNavigate();

  // Apply sorting whenever blocks or sortConfig changes
  useEffect(() => {
    if (blocks.length > 0) {
      const sortableBlocks = [...blocks];
      sortableBlocks.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
      setSortedBlocks(sortableBlocks);
    }
  }, [blocks, sortConfig]);

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
    return <div>Error loading blocks: {error.message}</div>;
  }

  // Calculate pagination using sortedBlocks
  const totalPages = Math.ceil(sortedBlocks.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedBlocks.slice(indexOfFirstItem, indexOfLastItem);

  const handleOpenEditModal = (block) => {
    setSelectedBlock(block);
    setEditBlockName(block.block_name);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (block) => {
    setSelectedBlock(block);
    setIsDeleteModalOpen(true);
  };

  const handleEditBlock = () => {
    if (selectedBlock) {
      editBlock(selectedBlock.id, editBlockName);
      setIsEditModalOpen(false);
    }
  };

  const handleDeleteBlock = () => {
    if (selectedBlock) {
      deleteBlock(selectedBlock.id);
      setIsDeleteModalOpen(false);
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="py-5">
      <div className='flex justify-between mb-4 items-center'> 
        <h1 className="text-2xl font-bold">Block List</h1>
        <button 
          onClick={() => navigate('/dashboard/add-block')}
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Add New Block
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
              <div className="flex items-center cursor-pointer" onClick={() => requestSort('block_name')}>
                <span>Block Name</span>
                <span className="ml-1">{getSortIcon('block_name')}</span>
              </div>
            </th>
            <th className="border text-start px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((block, index) => (
              <tr key={block.id}>
                <td className="border px-4 py-2">{indexOfFirstItem + index + 1}</td>
                <td className="border px-4 py-2">{block.block_name}</td>
                <td className="border px-4 py-2" colSpan={1}>
                  <div className="relative group">
                    <div className="">
                      <ul className="flex gap-2 text-left">
                        <li
                          className=" text-yellow-600 cursor-pointer"
                          onClick={() => handleOpenEditModal(block)}
                        >
                          <FaEdit />
                        </li>
                        <li
                          className="text-red-700  cursor-pointer"
                          onClick={() => handleOpenDeleteModal(block)}
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
                No blocks found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {sortedBlocks.length > itemsPerPage && (
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

      {/* Edit Block Modal */}
      <Modal isVisible={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <h2 className="text-xl mb-4">Edit Block</h2>
        <input
          type="text"
          value={editBlockName}
          onChange={(e) => setEditBlockName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-sm"
        />
        <button
          onClick={handleEditBlock}
          className="mt-4 w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
        >
          Save Changes
        </button>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isVisible={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <h2 className="text-xl mb-4">Confirm Delete</h2>
        <p>Are you sure you want to delete block "{selectedBlock?.block_name}"?</p>
        <button
          onClick={handleDeleteBlock}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-sm"
        >
          Yes, Delete
        </button>
      </Modal>
    </div>
  );
};

export default BlockList;