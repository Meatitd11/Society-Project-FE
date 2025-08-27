import { useEffect, useState } from 'react';
import useOwner from '../../../hooks/useOwner';
import useProperty from '../../../hooks/useProperty';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../../config';
import { toast } from 'react-toastify';

const AddOwner = () => {
  const [ownerData, setOwnerData] = useState({
    owner_name: '',
    secondary_owner: '',
    third_owner: '',
    owner_guardian_name: '',
    owner_profile_picture: '',
    owner_phone_number: '',
    password: '',
    owner_email: '',
    owner_membership_number: '',
    owner_cnic: '',
    owner_address: '',
    owner_country: '',
    owner_city: '',
    document_attachment: '',
    properties: [],
    status: 'active',
  });

  const [previewImage, setPreviewImage] = useState(null);
  const { fetchOwners, addOwner } = useOwner();
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/owners/owner-property-numbers/`);
        const data = await response.json();
        const updatedProperties = data.map(property => ({
          ...property,
          isAssigned: !!property.owner_id
        }));
        setProperties(updatedProperties);
      } catch (err) {
        toast.error('Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
    fetchOwners();
  }, []);

  const handlePropertyChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedPropertyIds = selectedOptions.map((option) => parseInt(option.value, 10));

    setOwnerData((prevData) => ({
      ...prevData,
      properties: selectedPropertyIds,
    }));
    setSelectedProperty(selectedPropertyIds);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOwnerData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOwnerData({
        ...ownerData,
        owner_profile_picture: file,
      });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const formData = new FormData();
      Object.keys(ownerData).forEach((key) => {
        if (key !== 'document_attachment') {
          if (Array.isArray(ownerData[key])) {
            ownerData[key].forEach((propertyId) => {
              formData.append('properties', propertyId);
            });
          } else {
            formData.append(key, ownerData[key]);
          }
        }
      });
  
      if (ownerData.document_attachment) {
        formData.append('document_attachment', ownerData.document_attachment);
      }
  
      const { success, message } = await addOwner(formData);
  
      if (success) {
        setTimeout(() => navigate('/dashboard/owner-list'), 1000);
      } else {
        toast.error(message || 'Failed to add owner');
      }
    } catch (error) {
      toast.error('Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <h1 className="text-2xl font-bold">Add Owner</h1>
      <form className='py-5' onSubmit={handleSubmit}>
        <div className='grid grid-cols-3 gap-x-2'>
          {/* Profile Picture Upload - Unique Design */}
          <div className="mb-4 col-span-3">
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
                <p>Upload a clear photo</p>
                <p>Max size: 5MB</p>
                <p>Formats: JPG, PNG</p>
              </div>
            </div>
          </div>

          {/* Other fields */}
          <div className="mb-4">
            <label htmlFor="owner_name" className="block text-sm font-medium text-gray-700 mb-1">Primary Name</label>
            <input
              type="text"
              id="owner_name"
              name="owner_name"
              value={ownerData.owner_name}
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
              value={ownerData.secondary_owner}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="third_owner" className="block text-sm font-medium text-gray-700 mb-1">Third Owner</label>
            <input
              type="text"
              id="third_owner"
              name="third_owner"
              value={ownerData.third_owner}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="owner_guardian_name" className="block text-sm font-medium text-gray-700 mb-1">Guardian Name</label>
            <input
              type="text"
              id="owner_guardian_name"
              name="owner_guardian_name"
              value={ownerData.owner_guardian_name}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="owner_phone_number" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              id="owner_phone_number"
              name="owner_phone_number"
              value={ownerData.owner_phone_number}
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
              value={ownerData.password}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="owner_email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="owner_email"
              name="owner_email"
              value={ownerData.owner_email}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="owner_membership_number" className="block text-sm font-medium text-gray-700 mb-1">Membership Number</label>
            <input
              type="text"
              id="owner_membership_number"
              name="owner_membership_number"
              value={ownerData.owner_membership_number}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="owner_cnic" className="block text-sm font-medium text-gray-700 mb-1">CNIC</label>
            <input
              type="text"
              id="owner_cnic"
              name="owner_cnic"
              value={ownerData.owner_cnic}
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
              value={ownerData.owner_address}
              onChange={handleChange}
              required
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
              value={ownerData.owner_country}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="owner_city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              id="owner_city"
              name="owner_city"
              value={ownerData.owner_city}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          {/* Document Upload */}
          <div className="mb-4 col-span-3">
            <label htmlFor="document_attachment" className="block text-sm font-medium text-gray-700 mb-1">Document Attachment</label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <div className="mt-2 flex justify-center text-sm text-gray-600">
                <label htmlFor="document_attachment" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none">
                  <span>Upload a file</span>
                  <input
                    id="document_attachment"
                    name="document_attachment"
                    type="file"
                    onChange={(e) =>
                      setOwnerData({
                        ...ownerData,
                        document_attachment: e.target.files[0],
                      })
                    }
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
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              name="status"
              value={ownerData.status}
              onChange={handleChange}
              required
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
              value={selectedProperty}
              onChange={handlePropertyChange}
            >
              <option value="">Select Property</option>
              {properties.map((property) => (
                <option
                  key={property.property_id}
                  value={property.property_id}
                  disabled={property.isAssigned}
                  style={{
                    color: property.isAssigned ? 'gray' : 'black',
                    textDecoration: property.isAssigned ? 'line-through' : 'none',
                  }}
                >
                  {`( ${property.property_number} ) - ${property.block_name?.block_name}`}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Owner'}
        </button>
      </form>
    </>
  );
};

export default AddOwner;