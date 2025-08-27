import React, {useState, useEffect} from 'react';
import useOwner from '../../../hooks/useOwner';
import Modal from '../modal';
import { FaEdit, FaTrash, FaEye, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API_BASE_URL from '../../../config';

const OwnerList = () => {
  const { owners, deleteOwner, editOwner, fetchOwners, loading, error } = useOwner();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [editOwnerData, setEditOwnerData] = useState({});
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [docPreview, setDocPreview] = useState(null);
  const [properties, setProperties] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: 'owner_id',
    direction: 'desc'
  });
  const [sortedOwners, setSortedOwners] = useState([]);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/owners/owner-property-numbers/`);
        const data = await response.json();
        setProperties(data);
      } catch (err) {
        toast.error('Failed to load properties');
      }
    };
    fetchProperties();
    fetchOwners();
  }, []);

  // Apply sorting whenever owners or sortConfig changes
  useEffect(() => {
    if (owners.length > 0) {
      const sortableOwners = [...owners];
      sortableOwners.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
      setSortedOwners(sortableOwners);
    }
  }, [owners, sortConfig]);

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
    return <div className="text-red-600">Error loading owners: {error.message}</div>;
  }

  // Calculate pagination using sortedOwners
  const totalPages = Math.ceil(sortedOwners.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedOwners.slice(indexOfFirstItem, indexOfLastItem);
  const handleOpenEditModal = (owner) => {
    setSelectedOwner(owner);
    setEditOwnerData({
      owner_name: owner.owner_name,
      secondary_owner: owner.secondary_owner,
      third_owner: owner.third_owner,
      owner_guardian_name: owner.owner_guardian_name,
      owner_profile_picture: owner.owner_profile_picture,
      owner_phone_number: owner.owner_phone_number,
      password: owner.password,
      owner_email: owner.owner_email,
      owner_membership_number: owner.owner_membership_number,
      owner_cnic: owner.owner_cnic,
      owner_address: owner.owner_address,
      owner_country: owner.owner_country,
      owner_city: owner.owner_city,
      document_attachment: owner.document_attachment,
      properties: owner.properties?.map(property => property.property_id) || [],
      status: owner.status || 'active',
    });
    setProfilePicPreview(owner.owner_profile_picture);
    setDocPreview(owner.document_attachment);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (owner) => {
    setSelectedOwner(owner);
    setIsDeleteModalOpen(true);
  };

  const handleOpenViewModal = (owner) => {
    setSelectedOwner(owner);
    setIsViewModalOpen(true);
  };

  const handleEditOwner = async () => {
    if (selectedOwner) {
      setProcessing(true);
      try {
        const formData = new FormData();
        Object.keys(editOwnerData).forEach((key) => {
          if (key !== 'document_attachment' && key !== 'owner_profile_picture') {
            if (Array.isArray(editOwnerData[key])) {
              editOwnerData[key].forEach((propertyId) => {
                formData.append('properties', propertyId);
              });
            } else {
              formData.append(key, editOwnerData[key]);
            }
          }
        });

        if (editOwnerData.owner_profile_picture instanceof File) {
          formData.append('owner_profile_picture', editOwnerData.owner_profile_picture);
        }

        if (editOwnerData.document_attachment instanceof File) {
          formData.append('document_attachment', editOwnerData.document_attachment);
        }

        await editOwner(selectedOwner.owner_id, formData);
        toast.success('Owner updated successfully');
        fetchOwners();
        setIsEditModalOpen(false);
      } catch (error) {
        toast.error('Failed to update owner');
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleDeleteOwner = async () => {
    if (selectedOwner) {
      setProcessing(true);
      try {
        await deleteOwner(selectedOwner.owner_id);
        toast.success('Owner deleted successfully');
        setIsDeleteModalOpen(false);
      } catch (error) {
        toast.error('Failed to delete owner');
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleChange = (e) => {
    const {name, value} = e.target;
    setEditOwnerData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditOwnerData({
        ...editOwnerData,
        owner_profile_picture: file,
      });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditOwnerData({
        ...editOwnerData,
        document_attachment: file,
      });
      
      // Create preview for images
      if (file.type.includes('image')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setDocPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setDocPreview(null);
      }
    }
  };

  const handlePropertyChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedPropertyIds = selectedOptions.map((option) => parseInt(option.value, 10));

    setEditOwnerData((prevData) => ({
      ...prevData,
      properties: selectedPropertyIds,
    }));
  };
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // ... rest of your component code remains the same until the table header

  return (
    <>
      <div className='flex justify-between mb-4 items-center'> 
        <h1 className="text-2xl font-bold">Owner List</h1>
        <button 
          onClick={() => navigate('/dashboard/add-owner')}
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Add New Owner
        </button>
      </div>
      <div className='py-5 overflow-x-scroll'>
        <table className='text-sm text-gray-600 bg-white border-collapse border border-gray-200'>
          <thead>
            <tr>
              <th className="border text-start px-4 whitespace-nowrap py-2 ">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('owner_id')}>
                  <span>#</span>
                  <span className="ml-1">{getSortIcon('owner_id')}</span>
                </div>
              </th>
              <th className="border text-start px-4 whitespace-nowrap py-2 ">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('owner_name')}>
                  <span>Primary Name</span>
                  <span className="ml-1">{getSortIcon('owner_name')}</span>
                </div>
              </th>
              {/* <th className="border text-start px-4 whitespace-nowrap py-2 ">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('owner_guardian_name')}>
                  <span>Owner Guardian Name</span>
                  <span className="ml-1">{getSortIcon('owner_guardian_name')}</span>
                </div>
              </th> */}
                <th className="border text-start px-4 whitespace-nowrap py-2 ">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('owner_guardian_name')}>
                  <span>Property Number</span>
                  <span className="ml-1">{getSortIcon('owner_guardian_name')}</span>
                </div>
              </th>
              {/* <th className="border text-start px-4 whitespace-nowrap py-2 ">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('owner_phone_number')}>
                  <span>Owner Phone Number</span>
                  <span className="ml-1">{getSortIcon('owner_phone_number')}</span>
                </div>
              </th> */}

               <th className="border text-start px-4 whitespace-nowrap py-2 ">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('owner_phone_number')}>
                  <span>Block Name</span>
                  <span className="ml-1">{getSortIcon('owner_phone_number')}</span>
                </div>
              </th>
              
              {/* <th className="border text-start px-4 whitespace-nowrap py-2 ">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('owner_email')}>
                  <span>Owner Email</span>
                  <span className="ml-1">{getSortIcon('owner_email')}</span>
                </div>
              </th> */}
              <th className="border text-start px-4 whitespace-nowrap py-2 ">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('owner_membership_number')}>
                  <span>Memebership Number</span>
                  <span className="ml-1">{getSortIcon('owner_membership_number')}</span>
                </div>
              </th>
              {/* <th className="border text-start px-4 whitespace-nowrap py-2 ">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('owner_cnic')}>
                  <span>Owner CNIC</span>
                  <span className="ml-1">{getSortIcon('owner_cnic')}</span>
                </div>
              </th> */}
              {/* <th className="border text-start px-4 whitespace-nowrap py-2 ">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('owner_address')}>
                  <span>Owner Address</span>
                  <span className="ml-1">{getSortIcon('owner_address')}</span>
                </div>
              </th> */}
              {/* <th className="border text-start px-4 whitespace-nowrap py-2 ">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('owner_country')}>
                  <span>Owner Country</span>
                  <span className="ml-1">{getSortIcon('owner_country')}</span>
                </div>
              </th> */}
              {/* <th className="border text-start px-4 whitespace-nowrap py-2 ">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('owner_city')}>
                  <span>Owner City</span>
                  <span className="ml-1">{getSortIcon('owner_city')}</span>
                </div>
              </th> */}
              <th className="border text-start px-4 whitespace-nowrap py-2">Actions</th>
            </tr>
          </thead>
        <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((owner, index) => (
                <tr key={owner.owner_id}>
                  <td className="border px-4 whitespace-nowrap py-2 ">{indexOfFirstItem + index + 1}</td>
                  <td className="border px-4 whitespace-nowrap py-2 ">{owner.owner_name}</td>
                  <td className="border px-4 whitespace-nowrap py-2 ">{Array.isArray(owner.properties) && owner.properties.length > 0 ? owner.properties.map(p => p.property_number).join(', ') : '-'}</td>
                  <td className="border px-4 whitespace-nowrap py-2 ">{Array.isArray(owner.properties) && owner.properties.length > 0 ? owner.properties.map(p => p.block_name?.block_name || p.block_name || '-').join(', ') : '-'}</td>
                  <td className="border px-4 whitespace-nowrap py-2 ">{owner.owner_membership_number}</td>
                  {/* <td className="border px-4 whitespace-nowrap py-2 ">{owner.owner_name}</td>
                  <td className="border px-4 whitespace-nowrap py-2 ">{owner.owner_guardian_name}</td>
                  <td className="border px-4 whitespace-nowrap py-2 ">{owner.owner_phone_number}</td>
                     <td className="border px-4 whitespace-nowrap py-2 ">{owner.owner_membership_number}</td> */}
                  
                  {/* <td className="border px-4 whitespace-nowrap py-2 ">{owner.owner_email}</td> */}
               
                  {/* <td className="border px-4 whitespace-nowrap py-2 ">{owner.owner_cnic}</td>
                  <td className="border px-4 whitespace-nowrap py-2 ">{owner.owner_address}</td>
                  <td className="border px-4 whitespace-nowrap py-2 ">{owner.owner_country}</td>
                  <td className="border px-4 whitespace-nowrap py-2 ">{owner.owner_city}</td> */}


                  <td className="border px-4 whitespace-nowrap py-2 ">
                    <button className='text-green-700 px-1' onClick={() => handleOpenViewModal(owner)}><FaEye /></button>
                    <button className='text-yellow-600 px-1' onClick={() => handleOpenEditModal(owner)}><FaEdit /></button>
                    <button className='text-red-700 px-1' onClick={() => handleOpenDeleteModal(owner)}><FaTrash /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border px-4 py-2 text-center" colSpan="7">
                  No owners found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {sortedOwners.length > itemsPerPage && (
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

         {/* Edit Owner Modal */}
         <Modal isVisible={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          <h2 className="text-2xl font-bold mb-4">Edit Owner</h2>
          <form>
            <div className='grid grid-cols-3 gap-x-2'>
              {/* Profile Picture Upload */}
              <div className="mb-4 col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-100">
                      {profilePicPreview ? (
                        <img src={profilePicPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                      )}
                    </div>
                    <label htmlFor="owner_profile_picture" className="absolute -bottom-2 -right-2 bg-green-600 text-white p-1 rounded-full cursor-pointer">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <input
                        type="file"
                        id="owner_profile_picture"
                        name="owner_profile_picture"
                        onChange={handleProfilePicChange}
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

              {/* Owner Information Fields */}
              <div className="mb-4">
                <label htmlFor="owner_name" className="block text-sm font-medium text-gray-700 mb-1">Primary Name</label>
                <input
                  type="text"
                  id="owner_name"
                  name="owner_name"
                  value={editOwnerData.owner_name}
                  onChange={handleChange}
                  required
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="secondary_owner" className="block text-sm font-medium text-gray-700 mb-1">Secondary Owner</label>
                <input
                  type="text"
                  id="secondary_owner"
                  name="secondary_owner"
                  value={editOwnerData.secondary_owner}
                  onChange={handleChange}
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="third_owner" className="block text-sm font-medium text-gray-700 mb-1">Third Owner</label>
                <input
                  type="text"
                  id="third_owner"
                  name="third_owner"
                  value={editOwnerData.third_owner}
                  onChange={handleChange}
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="owner_guardian_name" className="block text-sm font-medium text-gray-700 mb-1">Guardian Name</label>
                <input
                  type="text"
                  id="owner_guardian_name"
                  name="owner_guardian_name"
                  value={editOwnerData.owner_guardian_name}
                  onChange={handleChange}
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="owner_phone_number" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  id="owner_phone_number"
                  name="owner_phone_number"
                  value={editOwnerData.owner_phone_number}
                  onChange={handleChange}
                  required
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={editOwnerData.password}
                  onChange={handleChange}
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="owner_email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  id="owner_email"
                  name="owner_email"
                  value={editOwnerData.owner_email}
                  onChange={handleChange}
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="owner_membership_number" className="block text-sm font-medium text-gray-700 mb-1">Membership Number</label>
                <input
                  type="text"
                  id="owner_membership_number"
                  name="owner_membership_number"
                  value={editOwnerData.owner_membership_number}
                  onChange={handleChange}
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="owner_cnic" className="block text-sm font-medium text-gray-700 mb-1">CNIC</label>
                <input
                  type="text"
                  id="owner_cnic"
                  name="owner_cnic"
                  value={editOwnerData.owner_cnic}
                  onChange={handleChange}
                  required
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="owner_address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  id="owner_address"
                  name="owner_address"
                  value={editOwnerData.owner_address}
                  onChange={handleChange}
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                />
              </div>
              
              {/* Simplified Country and City Inputs */}
              <div className="mb-4">
                <label htmlFor="owner_country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  id="owner_country"
                  name="owner_country"
                  value={editOwnerData.owner_country}
                  onChange={handleChange}
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="owner_city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  id="owner_city"
                  name="owner_city"
                  value={editOwnerData.owner_city}
                  onChange={handleChange}
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                />
              </div>
              
              {/* Document Upload */}
              <div className="mb-4 col-span-3">
                <label htmlFor="document_attachment" className="block text-sm font-medium text-gray-700 mb-1">Document Attachment</label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                  {docPreview ? (
                    <div className="mb-2">
                      <img src={docPreview} alt="Document Preview" className="max-h-32 mx-auto" />
                    </div>
                  ) : (
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                  )}
                  <div className="mt-2 flex justify-center text-sm text-gray-600">
                    <label htmlFor="document_attachment" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none">
                      <span>Upload a file</span>
                      <input
                        id="document_attachment"
                        name="document_attachment"
                        type="file"
                        onChange={handleDocChange}
                        className="sr-only"
                        accept=".pdf,.doc,.docx,.jpg,.png"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Current: {editOwnerData.document_attachment?.split('/').pop() || 'No document'}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="status"
                  name="status"
                  value={editOwnerData.status}
                  onChange={handleChange}
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="mb-4 col-span-3">
                <label htmlFor="property" className="block text-sm font-medium text-gray-700 mb-1">Properties</label>
                <select
                  multiple
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                  id="property"
                  value={editOwnerData.properties}
                  onChange={handlePropertyChange}
                >
                  <option value="">Select Property</option>
                  {properties.map((property) => (
                    <option
                      key={property.property_id}
                      value={property.property_id}
                    >
                      {`( ${property.property_number} ) - ${property.block_name?.block_name}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="button"
              className="w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
              onClick={handleEditOwner}
              disabled={processing}
            >
              {processing ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </Modal>

        {/* Delete Owner Modal */}
        <Modal isVisible={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
          <h2 className="text-xl mb-4">Delete Owner</h2>
          <p>Are you sure you want to delete {selectedOwner?.owner_name}?</p>
          <button 
            type="button" 
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-sm" 
            onClick={handleDeleteOwner}
            disabled={processing}
          >
            {processing ? 'Deleting...' : 'Yes, Delete'}
          </button>
          <button 
            type="button" 
            className="mt-4 ms-2 bg-green-600 text-white px-4 py-2 rounded-sm" 
            onClick={() => setIsDeleteModalOpen(false)}
            disabled={processing}
          >
            Cancel
          </button>
        </Modal>

        {/* View Owner Modal */}
        <Modal isVisible={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
          <h2 className="text-xl mb-4">View Owner</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Primary Name:</strong> {selectedOwner?.owner_name}</p>
              <p><strong>Secondary Owner:</strong> {selectedOwner?.secondary_owner || '-'}</p>
              <p><strong>Third Owner:</strong> {selectedOwner?.third_owner || '-'}</p>
              <p><strong>Guardian Name:</strong> {selectedOwner?.owner_guardian_name || '-'}</p>
              <p><strong>Phone Number:</strong> {selectedOwner?.owner_phone_number}</p>
              <p><strong>Email:</strong> {selectedOwner?.owner_email || '-'}</p>
            </div>
            <div>
              <p><strong>Membership Number:</strong> {selectedOwner?.owner_membership_number}</p>
              <p><strong>CNIC:</strong> {selectedOwner?.owner_cnic}</p>
              <p><strong>Address:</strong> {selectedOwner?.owner_address}</p>
              <p><strong>Country:</strong> {selectedOwner?.owner_country}</p>
              <p><strong>City:</strong> {selectedOwner?.owner_city}</p>
              <p><strong>Status:</strong> <span className={`capitalize ${selectedOwner?.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>{selectedOwner?.status}</span></p>
            </div>
          </div>
          {selectedOwner?.owner_profile_picture && (
            <div className="mt-4">
              <p className="font-medium mb-2">Profile Picture:</p>
              <img src={selectedOwner.owner_profile_picture} alt="Profile" className="h-32 rounded-full" />
            </div>
          )}
          {selectedOwner?.document_attachment && (
            <div className="mt-4">
              <p className="font-medium mb-2">Document:</p>
              <a href={selectedOwner.document_attachment} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                View Document
              </a>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
};

export default OwnerList;