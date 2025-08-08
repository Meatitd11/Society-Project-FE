import React, {useState, useEffect} from 'react';
import useTenant from '../../../hooks/useTenant';
import Modal from '../modal';
import { FaEdit, FaTrash, FaEye, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const TenantList = () => {
  const { tenants, deleteTenant, editTenant, fetchTenants, loading, error } = useTenant();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [editTenantData, setEditTenantData] = useState({});
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [docPreview, setDocPreview] = useState(null);
  const [properties, setProperties] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: 'tenant_id',
    direction: 'desc'
  });
  const [sortedTenants, setSortedTenants] = useState([]);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/tenant/rented-property-numbers/');
        const data = await response.json();
        setProperties(data);
      } catch (err) {
        toast.error('Failed to load properties');
      }
    };

    fetchProperties();
    fetchTenants();
  }, []);

  // Apply sorting whenever tenants or sortConfig changes
  useEffect(() => {
    if (tenants.length > 0) {
      const sortableTenants = [...tenants];
      sortableTenants.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
      setSortedTenants(sortableTenants);
    }
  }, [tenants, sortConfig]);

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
    return <div className="text-red-600">Error loading tenants: {error.message}</div>;
  }

  // Calculate pagination using sortedTenants
  const totalPages = Math.ceil(sortedTenants.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTenants = sortedTenants.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleOpenEditModal = (tenant) => {
    setSelectedTenant(tenant);
    setEditTenantData({
      tenant_name: tenant.tenant_name,
      tenant_guardian_name: tenant.tenant_guardian_name,
      tenant_profile_picture: tenant.tenant_profile_picture,
      tenant_phone_number: tenant.tenant_phone_number,
      password: tenant.password,
      tenant_email: tenant.tenant_email,
      tenant_cnic: tenant.tenant_cnic,
      tenant_address: tenant.tenant_address,
      tenant_country: tenant.tenant_country,
      tenant_city: tenant.tenant_city,
      starting_date: tenant.starting_date,
      ending_agreement_date: tenant.ending_agreement_date,
      monthly_rent: tenant.monthly_rent,
      security_payment: tenant.security_payment,
      other_monthly_utility_charges: tenant.other_monthly_utility_charges,
      assign_property: tenant.assign_property?.property_id,
      agreement_attachment: tenant.agreement_attachment,   
    });
    setProfilePicPreview(tenant.tenant_profile_picture);
    setDocPreview(tenant.agreement_attachment);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (tenant) => {
    setSelectedTenant(tenant);
    setIsDeleteModalOpen(true);
  };

  const handleOpenViewModal = (tenant) => {
    setSelectedTenant(tenant);
    setIsViewModalOpen(true);
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditTenantData({
        ...editTenantData,
        tenant_profile_picture: file,
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
      setEditTenantData({
        ...editTenantData,
        agreement_attachment: file,
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

  const handleEditTenant = async () => {
    if (selectedTenant) {
      setProcessing(true);
      try {
        const formData = new FormData();
        Object.keys(editTenantData).forEach((key) => {
          if (key !== 'agreement_attachment' && key !== 'tenant_profile_picture') {
            formData.append(key, editTenantData[key]);
          }
        });
        
        if (editTenantData.tenant_profile_picture instanceof File) {
          formData.append('tenant_profile_picture', editTenantData.tenant_profile_picture);
        }

        if (editTenantData.agreement_attachment instanceof File) {
          formData.append('agreement_attachment', editTenantData.agreement_attachment);
        }

        await editTenant(selectedTenant.tenant_id, formData);
        toast.success('Tenant updated successfully');
        fetchTenants();
        setIsEditModalOpen(false);
      } catch (error) {
        toast.error('Failed to update tenant');
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleDeleteTenant = async () => {
    if (selectedTenant) {
      setProcessing(true);
      try {
        await deleteTenant(selectedTenant.tenant_id);
        toast.success('Tenant deleted successfully');
        setIsDeleteModalOpen(false);
      } catch (error) {
        toast.error('Failed to delete tenant');
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleChange = (e) => {
    const {name, value} = e.target;
    setEditTenantData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if(name === 'tenant_country'){
      fetchCities(value);
    }
  };

  return (
    <>
      <div className='flex justify-between mb-4 items-center'> 
        <h1 className="text-2xl font-bold">Tenant List</h1>
        <button 
          onClick={() => navigate('/dashboard/add-tenant')}
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Add New Tenant
        </button>
      </div>
   
      <div className='py-5 overflow-x-scroll'>
        <table className='text-sm text-gray-600 bg-white border-collapse border border-gray-200'>
          <thead>
            <tr>
              <th className="border text-start px-4 whitespace-nowrap py-2 ">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('tenant_id')}>
                  <span>#</span>
                  <span className="ml-1">{getSortIcon('tenant_id')}</span>
                </div>
              </th>
              <th className="border text-start px-4 whitespace-nowrap py-2 ">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('tenant_name')}>
                  <span>Tenant Name</span>
                  <span className="ml-1">{getSortIcon('tenant_name')}</span>
                </div>
              </th>
              <th className="border text-start px-4 whitespace-nowrap py-2 ">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('tenant_guardian_name')}>
                  <span>Tenant Guardian Name</span>
                  <span className="ml-1">{getSortIcon('tenant_guardian_name')}</span>
                </div>
              </th>
              <th className="border text-start px-4 whitespace-nowrap py-2 ">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('tenant_phone_number')}>
                  <span>Tenant Phone Number</span>
                  <span className="ml-1">{getSortIcon('tenant_phone_number')}</span>
                </div>
              </th>
              <th className="border text-start px-4 whitespace-nowrap py-2 ">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('tenant_email')}>
                  <span>Tenant Email</span>
                  <span className="ml-1">{getSortIcon('tenant_email')}</span>
                </div>
              </th>
              <th className="border text-start px-4 whitespace-nowrap py-2 ">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('tenant_cnic')}>
                  <span>Tenant CNIC</span>
                  <span className="ml-1">{getSortIcon('tenant_cnic')}</span>
                </div>
              </th>
              <th className="border text-start px-4 whitespace-nowrap py-2 ">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('tenant_address')}>
                  <span>Tenant Address</span>
                  <span className="ml-1">{getSortIcon('tenant_address')}</span>
                </div>
              </th>
              <th className="border text-start px-4 whitespace-nowrap py-2 ">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('tenant_city')}>
                  <span>Tenant City</span>
                  <span className="ml-1">{getSortIcon('tenant_city')}</span>
                </div>
              </th>
              <th className="border text-start px-4 whitespace-nowrap py-2 ">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('tenant_country')}>
                  <span>Tenant Country</span>
                  <span className="ml-1">{getSortIcon('tenant_country')}</span>
                </div>
              </th>
              <th className="border text-start px-4 whitespace-nowrap py-2 ">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('starting_date')}>
                  <span>Starting Date</span>
                  <span className="ml-1">{getSortIcon('starting_date')}</span>
                </div>
              </th>
              <th className="border text-start px-4 whitespace-nowrap py-2 ">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('ending_agreement_date')}>
                  <span>Ending Agreement Date</span>
                  <span className="ml-1">{getSortIcon('ending_agreement_date')}</span>
                </div>
              </th>
              <th className="border text-start px-4 whitespace-nowrap py-2 ">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('monthly_rent')}>
                  <span>Monthly Rent</span>
                  <span className="ml-1">{getSortIcon('monthly_rent')}</span>
                </div>
              </th>
              <th className="border text-start px-4 whitespace-nowrap py-2 ">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('security_payment')}>
                  <span>Security Payment</span>
                  <span className="ml-1">{getSortIcon('security_payment')}</span>
                </div>
              </th>
              <th className="border text-start px-4 whitespace-nowrap py-2 ">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('other_monthly_utility_charges')}>
                  <span>Other Monthly Utility Charges</span>
                  <span className="ml-1">{getSortIcon('other_monthly_utility_charges')}</span>
                </div>
              </th>
              <th className="border text-start px-4 whitespace-nowrap py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTenants.length > 0 ? (
              currentTenants.map((tenant, index) => (
                <tr key={tenant.tenant_id}>
                  <td className="border px-4 whitespace-nowrap py-2 ">{indexOfFirstItem + index + 1}</td>
                  <td className="border px-4 whitespace-nowrap py-2 ">{tenant.tenant_name}</td>
                  <td className="border px-4 whitespace-nowrap py-2 ">{tenant.tenant_guardian_name}</td>
                  <td className="border px-4 whitespace-nowrap py-2 ">{tenant.tenant_phone_number}</td>
                  <td className="border px-4 whitespace-nowrap py-2 ">{tenant.tenant_email}</td>
                  <td className="border px-4 whitespace-nowrap py-2 ">{tenant.tenant_cnic}</td>
                  <td className="border px-4 whitespace-nowrap py-2 ">{tenant.tenant_address}</td>
                  <td className="border px-4 whitespace-nowrap py-2 ">{tenant.tenant_city}</td>
                  <td className="border px-4 whitespace-nowrap py-2 ">{tenant.tenant_country}</td>
                  <td className="border px-4 whitespace-nowrap py-2 ">{tenant.starting_date}</td>
                  <td className="border px-4 whitespace-nowrap py-2 ">{tenant.ending_agreement_date}</td>
                  <td className="border px-4 whitespace-nowrap py-2 ">{tenant.monthly_rent}</td>
                  <td className="border px-4 whitespace-nowrap py-2 ">{tenant.security_payment}</td>
                  <td className="border px-4 whitespace-nowrap py-2 ">{tenant.other_monthly_utility_charges}</td>
                  <td className="border px-4 whitespace-nowrap py-2 ">
                    <button className='text-green-700 px-1' onClick={() => handleOpenViewModal(tenant)}><FaEye /></button>
                    <button className='text-yellow-600 px-1' onClick={() => handleOpenEditModal(tenant)}><FaEdit /></button>
                    <button className='text-red-700 px-1' onClick={() => handleOpenDeleteModal(tenant)}><FaTrash /></button>
                  </td>                  
                </tr>
              ))
            ) : (
              <tr>
                <td className="border px-4 py-2 text-center" colSpan="15">
                  No tenants found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {sortedTenants.length > itemsPerPage && (
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

        {/* ... rest of your modals remain the same ... */}
  {/* Edit Tenant Modal */}
  <Modal isVisible={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          <h2 className="text-xl mb-4">Edit Tenant</h2>
          <form>
            <div className='grid grid-cols-2 gap-x-2'>
              {/* Profile Picture Upload */}
              <div className="mb-4 col-span-2">
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
                    <label htmlFor="edit-tenant-profile-pic" className="absolute -bottom-2 -right-2 bg-green-600 text-white p-1 rounded-full cursor-pointer">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <input
                        type="file"
                        id="edit-tenant-profile-pic"
                        name="tenant_profile_picture"
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

              {/* Tenant Information Fields */}
              <div className="mb-4">
                <label htmlFor="edit-tenant-name" className="block text-sm font-medium text-gray-700 mb-1">Tenant Name</label>
                <input
                  type="text"
                  id="edit-tenant-name"
                  name="tenant_name"
                  value={editTenantData.tenant_name}
                  onChange={handleChange}
                  required
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="edit-tenant-guardian-name" className="block text-sm font-medium text-gray-700 mb-1">Guardian Name</label>
                <input
                  type="text"
                  id="edit-tenant-guardian-name"
                  name="tenant_guardian_name"
                  value={editTenantData.tenant_guardian_name}
                  onChange={handleChange}
                  required
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="edit-tenant-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  id="edit-tenant-phone"
                  name="tenant_phone_number"
                  value={editTenantData.tenant_phone_number}
                  onChange={handleChange}
                  required
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="edit-tenant-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="text"
                  id="edit-tenant-password"
                  name="password"
                  value={editTenantData.password}
                  onChange={handleChange}
                  required
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="edit-tenant-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="text"
                  id="edit-tenant-email"
                  name="tenant_email"
                  value={editTenantData.tenant_email}
                  onChange={handleChange}
                  required
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="edit-tenant-cnic" className="block text-sm font-medium text-gray-700 mb-1">CNIC</label>
                <input
                  type="text"
                  id="edit-tenant-cnic"
                  name="tenant_cnic"
                  value={editTenantData.tenant_cnic}
                  onChange={handleChange}
                  required
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="edit-tenant-address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  id="edit-tenant-address"
                  name="tenant_address"
                  value={editTenantData.tenant_address}
                  onChange={handleChange}
                  required
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="edit-assign-property" className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                <select
                  id="edit-assign-property"
                  name="assign_property"
                  value={editTenantData.assign_property}
                  onChange={handleChange}
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                >
                  <option value="">Select Property</option>
                  {properties.map((property) => (
                    <option key={property.property_id} value={property.property_id.toString()}>                  
                      {`( ${property.property_number} ) - ${property.block_name?.block_name}`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="edit-starting-date" className="block text-sm font-medium text-gray-700 mb-1">Starting Date</label>
                <input
                  type="date"
                  id="edit-starting-date"
                  name="starting_date"
                  value={editTenantData.starting_date}
                  onChange={handleChange}
                  required
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="edit-ending-date" className="block text-sm font-medium text-gray-700 mb-1">Ending Date</label>
                <input
                  type="date"
                  id="edit-ending-date"
                  name="ending_agreement_date"
                  value={editTenantData.ending_agreement_date}
                  onChange={handleChange}
                  required
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="edit-tenant-country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
              type="text"
              id="edit-tenant-country"
              name="tenant_country"
              value={editTenantData.tenant_country}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
              </div>
              
              <div className="mb-4">
                <label htmlFor="edit-tenant-city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
              type="text"
              id="edit-tenant-city"
              name="tenant_city"
              value={editTenantData.tenant_city}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
               
              </div>
              
              <div className="mb-4">
                <label htmlFor="edit-monthly-rent" className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent</label>
                <input
                  type="number"
                  id="edit-monthly-rent"
                  name="monthly_rent"
                  value={editTenantData.monthly_rent}
                  onChange={handleChange}
                  required
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="edit-security-payment" className="block text-sm font-medium text-gray-700 mb-1">Security Payment</label>
                <input
                  type="number"
                  id="edit-security-payment"
                  name="security_payment"
                  value={editTenantData.security_payment}
                  onChange={handleChange}
                  required
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="edit-utility-charges" className="block text-sm font-medium text-gray-700 mb-1">Utility Charges</label>
                <input
                  type="number"
                  id="edit-utility-charges"
                  name="other_monthly_utility_charges"
                  value={editTenantData.other_monthly_utility_charges}
                  onChange={handleChange}
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                />
              </div>

              {/* Document Upload */}
              <div className="mb-4 col-span-2">
                <label htmlFor="edit-agreement-attachment" className="block text-sm font-medium text-gray-700 mb-1">Agreement Attachment</label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                  {docPreview ? (
                    <div className="mb-2">
                      {typeof docPreview === 'string' && docPreview.includes('image') ? (
                        <img src={docPreview} alt="Document Preview" className="max-h-32 mx-auto" />
                      ) : (
                        <div className="text-sm text-gray-500">Document uploaded (non-image)</div>
                      )}
                    </div>
                  ) : (
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                  )}
                  <div className="mt-2 flex justify-center text-sm text-gray-600">
                    <label htmlFor="edit-agreement-attachment" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none">
                      <span>Upload a file</span>
                      <input
                        id="edit-agreement-attachment"
                        name="agreement_attachment"
                        type="file"
                        onChange={handleDocChange}
                        className="sr-only"
                        accept=".pdf,.doc,.docx,.jpg,.png"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Current: {editTenantData.agreement_attachment?.split('/').pop() || 'No document'}</p>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
              onClick={handleEditTenant}
              disabled={processing}
            >
              {processing ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </Modal>

        {/* View Tenant Modal */}
        <Modal isVisible={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
          <h2 className="text-xl mb-4">View Tenant</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Tenant Name:</strong> {selectedTenant?.tenant_name}</p>
              <p><strong>Guardian Name:</strong> {selectedTenant?.tenant_guardian_name || '-'}</p>
              <p><strong>Phone Number:</strong> {selectedTenant?.tenant_phone_number}</p>
              <p><strong>Email:</strong> {selectedTenant?.tenant_email || '-'}</p>
              <p><strong>CNIC:</strong> {selectedTenant?.tenant_cnic}</p>
              <p><strong>Address:</strong> {selectedTenant?.tenant_address}</p>
            </div>
            <div>
              <p><strong>Country:</strong> {selectedTenant?.tenant_country}</p>
              <p><strong>City:</strong> {selectedTenant?.tenant_city}</p>
              <p><strong>Starting Date:</strong> {selectedTenant?.starting_date}</p>
              <p><strong>Ending Date:</strong> {selectedTenant?.ending_agreement_date}</p>
              <p><strong>Monthly Rent:</strong> {selectedTenant?.monthly_rent}</p>
              <p><strong>Security Payment:</strong> {selectedTenant?.security_payment}</p>
              <p><strong>Utility Charges:</strong> {selectedTenant?.other_monthly_utility_charges || '-'}</p>
            </div>
          </div>
          {selectedTenant?.tenant_profile_picture && (
            <div className="mt-4">
              <p className="font-medium mb-2">Profile Picture:</p>
              <img src={selectedTenant.tenant_profile_picture} alt="Profile" className="h-32 rounded-full" />
            </div>
          )}
          {selectedTenant?.agreement_attachment && (
            <div className="mt-4">
              <p className="font-medium mb-2">Agreement:</p>
              <a href={selectedTenant.agreement_attachment} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                View Agreement Document
              </a>
            </div>
          )}
        </Modal>

        {/* Delete Tenant Modal */}
        <Modal isVisible={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
          <h2 className="text-xl mb-4">Delete Tenant</h2>
          <p>Are you sure you want to delete {selectedTenant?.tenant_name}?</p>
          <button 
            type="button" 
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-sm" 
            onClick={handleDeleteTenant}
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
        </Modal>      </div>
    </>
  );
};

export default TenantList;