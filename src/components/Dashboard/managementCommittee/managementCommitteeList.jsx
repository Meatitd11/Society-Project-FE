import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaEye, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import Modal from '../modal';
import useManagementCommittee from '../../../hooks/useManagementCommittee';
import { toast } from 'react-toastify';
import Pagination from '../pagination';
import { useNavigate } from 'react-router-dom';

const ManagementCommitteeList = () => {
  const {
    managementCommittee,
    loading,
    error,
    editManagementCommittee,
    deleteManagementCommittee,
    fetchManagementCommittee
  } = useManagementCommittee();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [editFormData, setEditFormData] = useState({
    mc_member_type: '',
    mc_name: '',
    mc_guardian_type: '',
    mc_guardian_name: '',
    mc_email: '',
    mc_contact: '',
    mc_pre_address: '',
    mc_per_address: '',
    mc_cnic: '',
    mc_joining_date: '',
    mc_ending_date: '',
    mc_status: '1',
    mc_password: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState({
    key: 'mc_id',
    direction: 'desc'
  });
  const [sortedData, setSortedData] = useState([]);

  useEffect(() => {
    fetchManagementCommittee();
  }, []);

  useEffect(() => {
    if (managementCommittee.length > 0) {
      const sortableItems = [...managementCommittee];
      sortableItems.sort((a, b) => {
        if (sortConfig.key === 'mc_member_type') {
          const aValue = a.mc_member_type?.member_type_name || '';
          const bValue = b.mc_member_type?.member_type_name || '';
          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
        
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
  }, [managementCommittee, sortConfig]);

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
    toast.error(error.message);
    return <div className="text-red-600">Error loading management committee</div>;
  }

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const handleOpenEditModal = (item) => {
    setSelectedItem(item);
    setEditFormData({
      mc_member_type: item.mc_member_type?.member_type_id || '',
      mc_name: item.mc_name,
      mc_guardian_type: item.mc_guardian_type,
      mc_guardian_name: item.mc_guardian_name,
      mc_email: item.mc_email,
      mc_contact: item.mc_contact,
      mc_pre_address: item.mc_pre_address,
      mc_per_address: item.mc_per_address,
      mc_cnic: item.mc_cnic,
      mc_joining_date: item.mc_joining_date,
      mc_ending_date: item.mc_ending_date,
      mc_status: item.mc_status ? '1' : '0',
      mc_password: item.mc_password
    });
    setPreviewImage(item.mc_image);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditFormData(prev => ({ ...prev, mc_image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async () => {
    if (selectedItem) {
      const formData = new FormData();
      Object.keys(editFormData).forEach(key => {
        if (editFormData[key] !== null) {
          formData.append(key, editFormData[key]);
        }
      });

      const { success, message } = await editManagementCommittee(selectedItem.mc_id, formData);
      if (success) {
        toast.success(message);
        setIsEditModalOpen(false);
        fetchManagementCommittee();
      } else {
        toast.error(message);
      }
    }
  };

  const handleDeleteSubmit = async () => {
    if (selectedItem) {
      const { success, message } = await deleteManagementCommittee(selectedItem.mc_id);
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
    <>
      <div className='flex justify-between mb-4 items-center'> 
        <h1 className="text-2xl font-bold">Management Committee Member List</h1>
        <button 
          onClick={() => navigate('/dashboard/add-management-committee')}
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Add New Management Committee Member
        </button>
      </div>
    
      <div className="py-5 overflow-x-auto">
        <table className="min-w-full text-sm bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="border px-4 py-2 text-left">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('mc_id')}>
                  <span>#</span>
                  <span className="ml-1">{getSortIcon('mc_id')}</span>
                </div>
              </th>
              <th className="border px-4 py-2 text-left">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('mc_name')}>
                  <span>Name</span>
                  <span className="ml-1">{getSortIcon('mc_name')}</span>
                </div>
              </th>
              <th className="border px-4 py-2 text-left">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('mc_member_type')}>
                  <span>Member Type</span>
                  <span className="ml-1">{getSortIcon('mc_member_type')}</span>
                </div>
              </th>
              <th className="border px-4 py-2 text-left">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('mc_contact')}>
                  <span>Contact</span>
                  <span className="ml-1">{getSortIcon('mc_contact')}</span>
                </div>
              </th>
              <th className="border px-4 py-2 text-left">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('mc_status')}>
                  <span>Status</span>
                  <span className="ml-1">{getSortIcon('mc_status')}</span>
                </div>
              </th>
              <th className="border px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <tr key={item.mc_id}>
                  <td className="border px-4 py-2">{indexOfFirstItem + index + 1}</td>
                  <td className="border px-4 py-2">{item.mc_name}</td>
                  <td className="border px-4 py-2">{item.mc_member_type?.member_type_name}</td>
                  <td className="border px-4 py-2">{item.mc_contact}</td>
                  <td className="border px-4 py-2">{item.mc_status ? 'Active' : 'Inactive'}</td>
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
                <td className="border px-4 py-2 text-center" colSpan="6">
                  No committee members found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {managementCommittee.length > itemsPerPage && (
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            paginate={paginate}
          />
        )}

        {/* View Modal */}
        <Modal isVisible={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
          <h2 className="text-xl mb-4">Member Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Name:</strong> {selectedItem?.mc_name}</p>
              <p><strong>Member Type:</strong> {selectedItem?.mc_member_type?.member_type_name}</p>
              <p><strong>Guardian:</strong> {selectedItem?.mc_guardian_type} {selectedItem?.mc_guardian_name}</p>
              <p><strong>Email:</strong> {selectedItem?.mc_email}</p>
              <p><strong>Contact:</strong> {selectedItem?.mc_contact}</p>
            </div>
            <div>
              <p><strong>CNIC:</strong> {selectedItem?.mc_cnic}</p>
              <p><strong>Joining Date:</strong> {selectedItem?.mc_joining_date}</p>
              <p><strong>Ending Date:</strong> {selectedItem?.mc_ending_date}</p>
              <p><strong>Status:</strong> {selectedItem?.mc_status ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="font-medium mb-2">Present Address:</p>
            <p>{selectedItem?.mc_pre_address}</p>
          </div>
          <div className="mt-2">
            <p className="font-medium mb-2">Permanent Address:</p>
            <p>{selectedItem?.mc_per_address}</p>
          </div>
          {selectedItem?.mc_image && (
            <div className="mt-4">
              <p className="font-medium mb-2">Profile Picture:</p>
              <img src={selectedItem.mc_image} alt="Profile" className="h-32 rounded-full" />
            </div>
          )}
        </Modal>

        {/* Edit Modal */}
        <Modal isVisible={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          <h2 className="text-xl mb-4">Edit Member</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Profile Picture Upload */}
            <div className="mb-4 col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-100">
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                    )}
                  </div>
                  <label htmlFor="mc_image" className="absolute -bottom-2 -right-2 bg-green-600 text-white p-1 rounded-full cursor-pointer">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <input
                      type="file"
                      id="mc_image"
                      name="mc_image"
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </label>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Current photo will be replaced</p>
                  <p>Max size: 5MB</p>
                  <p>Formats: JPG, PNG</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="mc_name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                id="mc_name"
                name="mc_name"
                value={editFormData.mc_name}
                onChange={handleEditChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="mc_guardian_name" className="block text-sm font-medium text-gray-700 mb-1">Guardian Name</label>
              <input
                type="text"
                id="mc_guardian_name"
                name="mc_guardian_name"
                value={editFormData.mc_guardian_name}
                onChange={handleEditChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="mc_guardian_type" className="block text-sm font-medium text-gray-700 mb-1">Guardian Type</label>
              <select
                id="mc_guardian_type"
                name="mc_guardian_type"
                value={editFormData.mc_guardian_type}
                onChange={handleEditChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-sm"
              >
                <option value="S/O">Son of</option>
                <option value="D/O">Daughter of</option>
                <option value="W/O">Wife of</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="mc_email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                id="mc_email"
                name="mc_email"
                value={editFormData.mc_email}
                onChange={handleEditChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="mc_contact" className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
              <input
                type="tel"
                id="mc_contact"
                name="mc_contact"
                value={editFormData.mc_contact}
                onChange={handleEditChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="mc_cnic" className="block text-sm font-medium text-gray-700 mb-1">CNIC</label>
              <input
                type="text"
                id="mc_cnic"
                name="mc_cnic"
                value={editFormData.mc_cnic}
                onChange={handleEditChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-sm"
              />
            </div>
            <div className="mb-4 col-span-2">
              <label htmlFor="mc_pre_address" className="block text-sm font-medium text-gray-700 mb-1">Present Address</label>
              <textarea
                id="mc_pre_address"
                name="mc_pre_address"
                value={editFormData.mc_pre_address}
                onChange={handleEditChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-sm"
              />
            </div>
            <div className="mb-4 col-span-2">
              <label htmlFor="mc_per_address" className="block text-sm font-medium text-gray-700 mb-1">Permanent Address</label>
              <textarea
                id="mc_per_address"
                name="mc_per_address"
                value={editFormData.mc_per_address}
                onChange={handleEditChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="mc_joining_date" className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
              <input
                type="date"
                id="mc_joining_date"
                name="mc_joining_date"
                value={editFormData.mc_joining_date}
                onChange={handleEditChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="mc_ending_date" className="block text-sm font-medium text-gray-700 mb-1">Ending Date</label>
              <input
                type="date"
                id="mc_ending_date"
                name="mc_ending_date"
                value={editFormData.mc_ending_date}
                onChange={handleEditChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="mc_status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="mc_status"
                name="mc_status"
                value={editFormData.mc_status}
                onChange={handleEditChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-sm"
              >
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="mc_password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                id="mc_password"
                name="mc_password"
                value={editFormData.mc_password}
                onChange={handleEditChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-sm"
              />
            </div>
          </div>
          <button
            onClick={handleEditSubmit}
            className="w-auto mt-4 bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
          >
            Save Changes
          </button>
        </Modal>

        {/* Delete Modal */}
        <Modal isVisible={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
          <h2 className="text-xl mb-4">Confirm Delete</h2>
          <p>Are you sure you want to delete "{selectedItem?.mc_name}"?</p>
        <button
          onClick={handleDeleteSubmit}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-sm"
        >
          Yes, Delete
        </button>
      </Modal>
    </div></>
  );
};

export default ManagementCommitteeList;