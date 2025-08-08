import React, { useEffect, useState } from 'react';
import useTenant from '../../../hooks/useTenant';
import { useNavigate } from 'react-router-dom';

import { toast } from 'react-toastify';

const AddTenant = () => {
  const [tenantData, setTenantData] = useState({
    tenant_name: '',
    tenant_guardian_name: '',
    tenant_profile_picture: '',
    tenant_phone_number: '',
    password: '',
    tenant_email: '',
    tenant_cnic: '',
    tenant_address: '',
    tenant_country: '',
    tenant_city: '',
    starting_date: '',
    ending_agreement_date: '',
    monthly_rent: '',
    security_payment: '',
    other_monthly_utility_charges: '',
    assign_property: '',
    agreement_attachment: '',    
  });

  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [docPreview, setDocPreview] = useState(null);
  const { fetchTenants, addTenant } = useTenant();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:8000/tenant/rented-property-numbers/');
        const data = await response.json();
        setProperties(data);
      } catch (err) {
        toast.error('Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
    fetchTenants();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTenantData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTenantData({
        ...tenantData,
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
      setTenantData({
        ...tenantData,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      Object.keys(tenantData).forEach((key) => {
        if (key !== 'agreement_attachment' && key !== 'tenant_profile_picture') {
          formData.append(key, tenantData[key]);
        }
      });
      
      if (tenantData.tenant_profile_picture) {
        formData.append('tenant_profile_picture', tenantData.tenant_profile_picture);
      }

      if (tenantData.agreement_attachment) {
        formData.append('agreement_attachment', tenantData.agreement_attachment);
      }

      const success = await addTenant(formData);
      
      if (success) {
        toast.success('Tenant added successfully!');
        setTenantData({
          tenant_name: '',
          tenant_guardian_name: '',
          tenant_profile_picture: '',
          tenant_phone_number: '',
          password: '',
          tenant_email: '',
          tenant_cnic: '',
          tenant_address: '',
          tenant_country: '',
          tenant_city: '',
          starting_date: '',
          ending_agreement_date: '',
          monthly_rent: '',
          security_payment: '',
          other_monthly_utility_charges: '',
          assign_property: '',
          agreement_attachment: '',        
        });
        setProfilePicPreview(null);
        setDocPreview(null);
        setTimeout(() => navigate('/dashboard/tenant-list'), 1000);
      }
    } catch (error) {
      toast.error('Failed to add tenant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold">Add Tenant</h1>
      <form className='py-5' onSubmit={handleSubmit}>
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
                <label htmlFor="tenant_profile_picture" className="absolute -bottom-2 -right-2 bg-green-600 text-white p-1 rounded-full cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <input
                    type="file"
                    id="tenant_profile_picture"
                    name="tenant_profile_picture"
                    onChange={handleProfilePicChange}
                    className="hidden"
                    accept="image/*"
                  />
                </label>
              </div>
              <div className="text-sm text-gray-500">
                <p>Upload a clear photo</p>
                <p>Max size: 5MB</p>
                <p>Formats: JPG, PNG</p>
              </div>
            </div>
          </div>

          {/* Tenant Information Fields */}
          <div className="mb-4">
            <label htmlFor="tenant_name" className="block text-sm font-medium text-gray-700 mb-1">Tenant Name</label>
            <input
              type="text"
              id="tenant_name"
              name="tenant_name"
              value={tenantData.tenant_name}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="tenant_guardian_name" className="block text-sm font-medium text-gray-700 mb-1">Guardian Name</label>
            <input
              type="text"
              id="tenant_guardian_name"
              name="tenant_guardian_name"
              value={tenantData.tenant_guardian_name}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="tenant_phone_number" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              id="tenant_phone_number"
              name="tenant_phone_number"
              value={tenantData.tenant_phone_number}
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
              value={tenantData.password}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="tenant_email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="tenant_email"
              name="tenant_email"
              value={tenantData.tenant_email}
              onChange={handleChange}
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="tenant_cnic" className="block text-sm font-medium text-gray-700 mb-1">CNIC</label>
            <input
              type="text"
              id="tenant_cnic"
              name="tenant_cnic"
              value={tenantData.tenant_cnic}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="tenant_address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              id="tenant_address"
              name="tenant_address"
              value={tenantData.tenant_address}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          {/* Simplified Country and City Inputs */}
          <div className="mb-4">
            <label htmlFor="tenant_country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              id="tenant_country"
              name="tenant_country"
              value={tenantData.tenant_country}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="tenant_city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              id="tenant_city"
              name="tenant_city"
              value={tenantData.tenant_city}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          {/* Document Upload */}
          <div className="mb-4 col-span-3">
            <label htmlFor="agreement_attachment" className="block text-sm font-medium text-gray-700 mb-1">Agreement Attachment</label>
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
                <label htmlFor="agreement_attachment" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none">
                  <span>Upload a file</span>
                  <input
                    id="agreement_attachment"
                    name="agreement_attachment"
                    type="file"
                    onChange={handleDocChange}
                    className="sr-only"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">PDF, DOC, JPG, PNG up to 10MB</p>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="assign_property" className="block text-sm font-medium text-gray-700 mb-1">Assign Property</label>
            <select
              className='w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700'
              id="assign_property"
              name="assign_property"
              value={tenantData.assign_property}
              onChange={handleChange}
              required
            >
              <option value="">Select Property</option>
              {properties.map((property) => (
                <option key={property.property_id} value={property.property_id}>
                  {`( ${property.property_number} ) - ${property.block_name?.block_name}`}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="starting_date" className="block text-sm font-medium text-gray-700 mb-1">Starting Date</label>
            <input
              type="date"
              id="starting_date"
              name="starting_date"
              value={tenantData.starting_date}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="ending_agreement_date" className="block text-sm font-medium text-gray-700 mb-1">Ending Date</label>
            <input
              type="date"
              id="ending_agreement_date"
              name="ending_agreement_date"
              value={tenantData.ending_agreement_date}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="monthly_rent" className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent</label>
            <input
              type="number"
              id="monthly_rent"
              name="monthly_rent"
              value={tenantData.monthly_rent}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="security_payment" className="block text-sm font-medium text-gray-700 mb-1">Security Payment</label>
            <input
              type="number"
              id="security_payment"
              name="security_payment"
              value={tenantData.security_payment}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="other_monthly_utility_charges" className="block text-sm font-medium text-gray-700 mb-1">Utility Charges</label>
            <input
              type="number"
              id="other_monthly_utility_charges"
              name="other_monthly_utility_charges"
              value={tenantData.other_monthly_utility_charges}
              onChange={handleChange}
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Tenant'}
        </button>
      </form>
    </>
  );
};

export default AddTenant;