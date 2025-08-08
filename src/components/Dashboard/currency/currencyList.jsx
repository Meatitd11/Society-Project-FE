import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import useCurrency from '../../../hooks/useCurrency';
import Modal from '../modal';
import { useNavigate } from 'react-router-dom';

const CurrencyList = () => {

  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'desc'
  });
  const [sortedData, setSortedData] = useState([]);

  

 
  const { currencies, deleteCurrency, editCurrency, loading } = useCurrency();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [editCurrencyData, setEditCurrencyData] = useState({
    name: '',
    symbol: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  // Apply sorting when currencies or sortConfig changes
  useEffect(() => {
    if (currencies.length > 0) {
      const sortableItems = [...currencies];
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
  }, [currencies, sortConfig]);

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

  // Calculate pagination
  const totalPages = Math.ceil(currencies.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);


  const handleOpenEditModal = (currency) => {
    setSelectedCurrency(currency);
    setEditCurrencyData({
      name: currency.name,
      symbol: currency.symbol
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (currency) => {
    setSelectedCurrency(currency);
    setIsDeleteModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditCurrencyData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditCurrency = () => {
    if (selectedCurrency) {
      editCurrency(selectedCurrency.id, editCurrencyData);
      setIsEditModalOpen(false);
    }
  };

  const handleDeleteCurrency = () => {
    if (selectedCurrency) {
      deleteCurrency(selectedCurrency.id);
      setIsDeleteModalOpen(false);
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  return (
    <div className="py-5">
      <div className='flex justify-between mb-4 items-center'> 
        <h1 className="text-2xl font-bold">Currency List</h1>
        <button 
          onClick={() => navigate('/dashboard/add-currency')}
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Add New Currency
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
                <span>Name</span>
                <span className="ml-1">{getSortIcon('name')}</span>
              </div>
            </th>
            <th className="border text-start px-4 py-2">
              <div className="flex items-center cursor-pointer" onClick={() => requestSort('symbol')}>
                <span>Symbol</span>
                <span className="ml-1">{getSortIcon('symbol')}</span>
              </div>
            </th>
            <th className="border text-start px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((currency, index) => (
              <tr key={currency.id}>
                <td className="border px-4 py-2">{indexOfFirstItem + index + 1}</td>
                <td className="border px-4 py-2">{currency.name}</td>
                <td className="border px-4 py-2">{currency.symbol}</td>
                <td className="border px-4 py-2">
                  <div className="relative group">
                    <div className="">
                      <ul className="flex gap-2 text-left">
                        <li
                          className="text-yellow-600 cursor-pointer"
                          onClick={() => handleOpenEditModal(currency)}
                        >
                          <FaEdit />
                        </li>
                        <li
                          className="text-red-700 cursor-pointer"
                          onClick={() => handleOpenDeleteModal(currency)}
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
                No currencies found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {currencies.length > itemsPerPage && (
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

      {/* Edit Currency Modal */}
      <Modal isVisible={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <h2 className="text-xl mb-4">Edit Currency</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Currency Name</label>
            <input
              type="text"
              name="name"
              value={editCurrencyData.name}
              onChange={handleEditChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Symbol</label>
            <input
              type="text"
              name="symbol"
              value={editCurrencyData.symbol}
              onChange={handleEditChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-sm"
            />
          </div>
        </div>
        
        <button
          onClick={handleEditCurrency}
          className="mt-4 w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
        >
          Save Changes
        </button>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isVisible={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <h2 className="text-xl mb-4">Confirm Delete</h2>
        <p>Are you sure you want to delete currency "{selectedCurrency?.name}"?</p>
        <button
          onClick={handleDeleteCurrency}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-sm"
        >
          Yes, Delete
        </button>
      </Modal>    </div>
  );
};

export default CurrencyList;