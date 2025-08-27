import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import useAmenity from '../../../hooks/useAmenity';
import Modal from '../modal';
import Pagination from "../pagination";
import { useNavigate } from 'react-router-dom';

const AmenityList = () => {
    const { amenities, deleteAmenity, editAmenity, loading, error } = useAmenity();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAmenity, setSelectedAmenity] = useState(null);
    const [editAmenityName, setEditAmenityName] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortedAmenities, setSortedAmenities] = useState([]);
    const [sortConfig, setSortConfig] = useState({
      key: 'amenity_id',
      direction: 'desc'
    });
    const itemsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
      if (amenities.length > 0) {
        const sortableAmenities = [...amenities];
        sortableAmenities.sort((a, b) => {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        });
        setSortedAmenities(sortableAmenities);
      }
    }, [amenities, sortConfig]);

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
        return <div>Error loading amenities: {error.message}</div>;
    }

    // Calculate pagination using sortedAmenities
    const totalPages = Math.ceil(sortedAmenities.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedAmenities.slice(indexOfFirstItem, indexOfLastItem);

    const handleOpenEditModal = (amenity) => {
        setSelectedAmenity(amenity);
        setEditAmenityName(amenity.amenity_name);
        setIsEditModalOpen(true);
    };

    const handleOpenDeleteModal = (amenity) => {
        setSelectedAmenity(amenity);
        setIsDeleteModalOpen(true);
    };

    const handleEditAmenity = () => {
        if (selectedAmenity) {
            editAmenity(selectedAmenity.amenity_id, editAmenityName);
            setIsEditModalOpen(false);
        }
    };

    const handleDeleteAmenity = () => {
        if (selectedAmenity) {
            deleteAmenity(selectedAmenity.amenity_id);
            setIsDeleteModalOpen(false);
        }
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="py-5">
            <div className='flex justify-between mb-4 items-center'> 
              <h1 className="text-2xl font-bold">Amenity List</h1>
              <button 
                onClick={() => navigate('/dashboard/add-amenity')}
                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                Add New Amenity
              </button>
            </div>
            <table className="min-w-full text-sm text-gray-600 bg-white border-collapse border border-gray-200">
                <thead>
                    <tr>
                        <th className="border text-start px-4 py-2">
                          <div className="flex items-center cursor-pointer" onClick={() => requestSort('amenity_id')}>
                            <span>#</span>
                            <span className="ml-1">{getSortIcon('amenity_id')}</span>
                          </div>
                        </th>
                        <th className="border text-start px-4 py-2">
                          <div className="flex items-center cursor-pointer" onClick={() => requestSort('amenity_name')}>
                            <span>Amenity Name</span>
                            <span className="ml-1">{getSortIcon('amenity_name')}</span>
                          </div>
                        </th>
                        <th className="border text-start px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.length > 0 ? (
                        currentItems.map((amenity, index) => (
                            <tr key={amenity.amenity_id}>
                                <td className="border px-4 py-2">{indexOfFirstItem + index + 1}</td>
                                <td className="border px-4 py-2">{amenity.amenity_name}</td>
                                <td className="border px-4 py-2">
                                    <ul className="flex gap-2 text-left">
                                        <li className="text-yellow-600 cursor-pointer" onClick={() => handleOpenEditModal(amenity)}>
                                            <FaEdit />
                                        </li>
                                        <li className="text-red-700 cursor-pointer" onClick={() => handleOpenDeleteModal(amenity)}>
                                            <FaTrash />
                                        </li>
                                    </ul>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td className="border px-4 py-2 text-center" colSpan="3">
                                No amenities found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {sortedAmenities.length > itemsPerPage && (
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    paginate={paginate}
                />
            )}

            {/* Edit Modal */}
            <Modal isVisible={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <h2 className="text-xl mb-4">Edit Amenity</h2>
                <input
                    type="text"
                    value={editAmenityName}
                    onChange={(e) => setEditAmenityName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-sm"
                />
                <button
                    onClick={handleEditAmenity}
                    className="mt-4 w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
                >
                    Save Changes
                </button>
            </Modal>

            {/* Delete Modal */}
            <Modal isVisible={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <h2 className="text-xl mb-4">Confirm Delete</h2>
                <p>Are you sure you want to delete amenity "{selectedAmenity?.amenity_name}"?</p>
                <button
                    onClick={handleDeleteAmenity}
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded-sm"
                >
                    Yes, Delete
                </button>
            </Modal>
        </div>
    );
};

export default AmenityList;