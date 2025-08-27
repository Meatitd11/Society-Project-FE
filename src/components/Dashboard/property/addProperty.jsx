import { useState, useEffect } from 'react';
import axios from 'axios';
import useProperty from '../../../hooks/useProperty';
import useBlock from '../../../hooks/useBlock';
import useAmenity from '../../../hooks/useAmenity';
import useUnitType from '../../../hooks/useUnitType';
import usePropertyType from '../../../hooks/usePropertyType';
import useAreaType from '../../../hooks/useAreaType';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API_BASE_URL from '../../../config';

const AddProperty = () => {
  const [propertyData, setPropertyData] = useState({
    block_name: '',
    building_name: '',
    property_name: '',
    property_type: '',
    property_number: '',
    unit_type: '',
    floor: '',
    number_of_bedrooms: '',
    number_of_bathrooms: '',
    balcony_or_patio: '',
    parking_space: '',
    number_of_halls: '',
    street_address: '',
    property_area: '',
    property_value: '',
    amenity_name: [], 
    is_active: false,
    documents: [],
    is_rented: false, 
    any_note: ""
  });

  const [currencies, setCurrencies] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { blocks, fetchBlocks } = useBlock();
  const { amenities, fetchAmenities } = useAmenity();
  const { unitTypes, fetchUnitTypes } = useUnitType();
  const { propertyTypes, fetchPropertyTypes } = usePropertyType();
  const { areaTypes, fetchAreaTypes } = useAreaType();
  const { countries, cities, fetchCities, addProperty, floors, fetchFloors } = useProperty();
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlocks();
    fetchAmenities();
    fetchPropertyTypes();
    fetchUnitTypes();
    fetchAreaTypes();
    fetchFloors();
    
    // Fetch currencies using axios
    axios.get(`${API_BASE_URL}/currency/`)
      .then(response => setCurrencies(response.data))
      .catch(error => console.error('Error fetching currencies:', error));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
  
    setPropertyData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? checked 
        : (name === 'is_rented' || name === 'is_active')
        ? value === 'true' // Convert string to boolean
        : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    setUploadProgress(0);
  
    try {
      const formData = new FormData();
  
      // Append all regular fields
      Object.entries(propertyData).forEach(([key, value]) => {
        if (key !== 'documents' && value !== null && value !== undefined) {
          if (key === 'is_rented' || key === 'is_active') {
            formData.append(key, value ? 'True' : 'False');
          } else if (key === 'amenity_name') {
            value.forEach(amenityId => formData.append('amenity_name', amenityId));
          } else if (typeof value === 'object' && value !== null) {
            formData.append(key, value.id || value);
          } else {
            formData.append(key, value);
          }
        }
      });
  
      // Append documents
      if (propertyData.documents?.length > 0) {
        propertyData.documents.forEach(file => formData.append('documents', file));
      }
  
      const response = await addProperty(formData);
  
      if (response.success) {
        toast.success(response.message);
        navigate('/dashboard/property-list');
      } else {
        // Handle errors and show in toaster
        if (response.errors) {
          // Combine all errors into a single message
          const errorMessages = [];
          
          Object.entries(response.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              messages.forEach(msg => errorMessages.push(`${field}: ${msg}`));
            } else {
              errorMessages.push(`${field}: ${messages}`);
            }
          });
  
          if (errorMessages.length > 0) {
            toast.error(
              <div>
                <strong>Please fix these errors:</strong>
                <ul className="list-disc pl-5 mt-1">
                  {errorMessages.map((msg, index) => (
                    <li key={index}>{msg}</li>
                  ))}
                </ul>
              </div>,
              { autoClose: 10000 } // Show for 10 seconds
            );
          } else {
            toast.error(response.message || 'Please fix the form errors');
          }
        } else {
          toast.error(response.message || 'Failed to add property');
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    
    setErrorMessage('');
    
    if (files.length > 3) {
      setErrorMessage('Maximum 3 files allowed');
      return;
    }
    
    const validFiles = [];
    for (let i = 0; i < files.length; i++) {
      if (files[i].type !== 'application/pdf') {
        setErrorMessage('Only PDF files are allowed');
        return;
      }
      if (files[i].size > 5 * 1024 * 1024) {
        setErrorMessage('File size should be less than 5MB');
        return;
      }
      validFiles.push(files[i]);
    }
    
    setPropertyData(prev => ({
      ...prev,
      documents: validFiles
    }));
  };
  
  const removeDocument = (index) => {
    setPropertyData(prev => {
      const newFiles = [...prev.documents];
      newFiles.splice(index, 1);
      return {
        ...prev,
        documents: newFiles
      };
    });
  };

  // Enhanced document preview component
  const DocumentPreview = ({ file, onRemove }) => {
    const [previewUrl, setPreviewUrl] = useState('');
    
    useEffect(() => {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
      return () => {
        reader.abort();
      };
    }, [file]);

    return (
      <div className="flex items-center justify-between p-2 border rounded mb-2">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-red-100 flex items-center justify-center rounded mr-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="truncate w-40">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 p-1"
          aria-label="Remove file"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <>
      <h1 className="text-2xl font-bold">Add Property</h1>
      <form onSubmit={handleSubmit} className="py-5" encType="multipart/form-data">
        <div className="grid grid-cols-3 gap-4">
          {/* Property Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
            <input
              type="text"
              name="property_name"
              value={propertyData.property_name}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>

          {/* Block Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Block</label>
            <select
              name="block_name"
              value={propertyData.block_name}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            >
              <option value="">Select Block</option>
              {blocks.map(block => (
                <option key={block.id} value={block.id}>{block.block_name}</option>
              ))}
            </select>
          </div>

          {/* Building Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Building Name</label>
            <input
              type="text"
              name="building_name"
              value={propertyData.building_name}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>

          {/* Property Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
            <select
              name="property_type"
              value={propertyData.property_type}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            >
              <option value="">Select Property Type</option>
              {propertyTypes.map(type => (
                <option key={type.pro_type_id} value={type.pro_type_id}>
                  {type.property_name}
                </option>
              ))}
            </select>
          </div>

          {/* Property Number */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Number</label>
            <input
              type="number"
              name="property_number"
              value={propertyData.property_number}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>

          {/* Unit Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Type</label>
            <select
              name="unit_type"
              value={propertyData.unit_type}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            >
              <option value="">Select Unit Type</option>
              {unitTypes.map(unit => (
                <option key={unit.unit_type_id} value={unit.unit_type_id}>
                  {unit.unit_number} - {unit.unit_name}
                </option>
              ))}
            </select>
          </div>

          {/* Floor */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
            <select
              name="floor"
              value={propertyData.floor}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            >
              <option value="">Select Floor</option>
              {floors.map(floor => (
                <option key={floor.id} value={floor.id}>
                  {floor.name}
                </option>
              ))}
            </select>
          </div>

          {/* Number of Bedrooms */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
            <input
              type="number"
              name="number_of_bedrooms"
              value={propertyData.number_of_bedrooms}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>

          {/* Number of Bathrooms */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
            <input
              type="number"
              name="number_of_bathrooms"
              value={propertyData.number_of_bathrooms}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>

          {/* Balcony/Patio */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Balcony/Patio</label>
            <select
              name="balcony_or_patio"
              value={propertyData.balcony_or_patio}
              onChange={handleChange}
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            >
              <option value="">Select Option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          {/* Parking Space */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Parking Space</label>
            <select
              name="parking_space"
              value={propertyData.parking_space}
              onChange={handleChange}
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            >
              <option value="">Select Option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          {/* Number of Halls */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Halls</label>
            <input
              type="number"
              name="number_of_halls"
              value={propertyData.number_of_halls}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>

          {/* Street Address */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            <input
              type="text"
              name="street_address"
              value={propertyData.street_address}
              onChange={handleChange}
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>

          {/* Property Area */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Area</label>
            <select
              name="property_area"
              value={propertyData.property_area}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            >
              <option value="">Select Area Type</option>
              {areaTypes.map(area => (
                <option key={area.area_type_id} value={area.area_type_id}>
                  {area.area_type_name} - {area.area_value}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Value</label>
            <div className="flex">
              <select
                name="property_value"
                value={propertyData.property_value}
                onChange={handleChange}
                className="w-full text-sm px-4 py-2 border border-gray-300 rounded-r-sm focus:ring-0 focus:outline-none focus:border-green-700"
                required
              >
                <option value="">Select Currency</option>
                {currencies.map(currency => (
                  <option key={currency.id} value={currency.id}>
                    {currency.symbol} - {currency.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amenity Multi-Select */}
          <div className="mb-4 col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
            <div className="grid grid-cols-3 gap-2">
              {amenities.map(amenity => (
                <div key={amenity.amenity_id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`amenity-${amenity.amenity_id}`}
                    name="amenity_name"
                    value={amenity.amenity_id}
                    checked={propertyData.amenity_name?.includes(amenity.amenity_id.toString())}
                    onChange={(e) => {
                      const newAmenities = propertyData.amenity_name || [];
                      if (e.target.checked) {
                        setPropertyData({
                          ...propertyData,
                          amenity_name: [...newAmenities, amenity.amenity_id.toString()]
                        });
                      } else {
                        setPropertyData({
                          ...propertyData,
                          amenity_name: newAmenities.filter(id => id !== amenity.amenity_id.toString())
                        });
                      }
                    }}
                    className="h-4 w-4 text-green-600 focus:ring-0 border-gray-300 rounded"
                  />
                  <label htmlFor={`amenity-${amenity.amenity_id}`} className="ml-2 text-sm text-gray-700">
                    {amenity.amenity_name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Note Field */}
          <div className="mb-4 col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <textarea
              name="any_note"
              value={propertyData.any_note}
              onChange={handleChange}
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
              rows="3"
              placeholder="Enter any additional notes..."
            />
          </div>

          {/* Enhanced Document Upload Section */}
          <div className="mb-4 col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Documents (PDF only, max 3 files, 5MB each)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="document-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none"
                  >
                    <span>Upload files</span>
                    <input
  id="document-upload"
  name="documents" // Change from "document_attdocumenachment" to "documents"
  type="file"
  onChange={handleFileChange}
  className="sr-only"
  accept=".pdf, application/pdf"
  multiple
/>
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF files up to 5MB
                </p>
              </div>
            </div>
            
            {errorMessage && (
              <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
            )}
            
            {/* Selected files preview */}
            {propertyData.documents?.length > 0 && (
  <div className="mt-4">
    <h3 className="text-sm font-medium text-gray-700">Selected files</h3>
    <div className="mt-2 space-y-2">
      {propertyData.documents.map((file, index) => (
        <DocumentPreview 
          key={index} 
          file={file} 
          onRemove={() => removeDocument(index)} 
        />
      ))}
    </div>
    <p className="mt-1 text-sm text-gray-500">
      {propertyData.documents.length} of 3 files selected
    </p>
  </div>
)}
          </div>
        </div>

       {/* Is Rented Dropdown */}
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-1">Is Rented</label>
  <select
    name="is_rented"
    value={propertyData.is_rented.toString()} // Ensure string value
    onChange={handleChange}
    className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
  >
    <option value="true">Yes</option>
    <option value="false">No</option>
  </select>
</div>

        {/* Is Active */}
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            name="is_active"
            checked={propertyData.is_active}
            onChange={(e) =>
              setPropertyData(prev => ({
                ...prev,
                is_active: e.target.checked
              }))
            }
            className="h-4 w-4 text-green-600 focus:ring-0 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">Is Active</label>
        </div>

        {/* Submit button with loading state */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`relative w-full md:w-auto px-5 py-2 rounded-sm text-white ${isSubmitting ? 'bg-green-500' : 'bg-green-700 hover:bg-green-600'} transition-colors duration-300`}
          >
            {isSubmitting ? 'Adding Property...' : 'Add Property'}
            {isSubmitting && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-200">
                <div 
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </button>
        </div>
      </form>
    </>
  );
};

export default AddProperty;