import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCirclePlus } from "react-icons/fa6";
import useAreaType from '../../../hooks/useAreaType';
import usePropertyType from '../../../hooks/usePropertyType';
import useProperty from '../../../hooks/useProperty';
import useFloor from '../../../hooks/useFloor';

const BillSetupForm = () => {
  // Main form data state
  const [formData, setFormData] = useState({
    property_type_id: '',
    property_area_id: '',
    property_number_id: '',
    floor_id: '',
  });

  // Form selection and fields state
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState('');
  const [formFields, setFormFields] = useState([]);
  const [fieldValues, setFieldValues] = useState({});
  const [totalAmount, setTotalAmount] = useState(0); // New state for total amount

  // Custom hooks for dropdown data
  const { propertyTypes, fetchPropertyTypes } = usePropertyType();
  const { areaTypes, fetchAreaTypes } = useAreaType();
  const { properties, fetchProperties } = useProperty();
  const { floors, fetchFloors } = useFloor();

  // Calculate total whenever fieldValues changes
  useEffect(() => {
    calculateTotal();
  }, [fieldValues]);

  const calculateTotal = () => {
    let sum = 0;
    Object.keys(fieldValues).forEach(key => {
      const value = parseFloat(fieldValues[key]) || 0;
      sum += value;
    });
    setTotalAmount(sum);
  };

  // Initialize data
  useEffect(() => {
    fetchPropertyTypes();
    fetchAreaTypes();
    fetchProperties();
    fetchFloors();
    fetchForms();
  }, []);

  // Fetch bill setup data when dependencies change
  useEffect(() => {
    if (formData.property_type_id && formData.property_area_id) {
      fetchBillSetupData();
    }
  }, [formData.property_type_id, formData.property_area_id, formData.property_number_id, formData.floor_id, formFields]);

  const fetchForms = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/form-builder');
      setForms(response.data);
      if (response.data.length > 0) {
        setSelectedFormId(response.data[0].id);
        fetchFormFields(response.data[0].id);
      }
    } catch (error) {
      toast.error('Failed to fetch forms');
    }
  };

  const fetchFormFields = async (formId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/form-builder/${formId}`);
      setFormFields(response.data.form_fields || []);
      // Initialize field values with 0
      const initialValues = response.data.form_fields?.reduce((acc, field) => {
        acc[field.name] = '0';
        return acc;
      }, {}) || {};
      setFieldValues(initialValues);
    } catch (error) {
      toast.error('Failed to fetch form fields');
      setFormFields([]);
    }
  };

  const fetchBillSetupData = async () => {
    try {
      const params = {
        property_type_name: formData.property_type_id,
        property_area: formData.property_area_id,
        ...(formData.property_number_id && { property_number: formData.property_number_id }),
        ...(formData.floor_id && { floor: formData.floor_id }),
      };

      const response = await axios.get('http://127.0.0.1:8000/bills-setup/', { params });
      
      if (response.data.length > 0) {
        const billData = response.data[0].form_data || {};
        setFieldValues(prev => ({
          ...Object.keys(prev).reduce((acc, key) => {
            acc[key] = billData[key] || '0';
            return acc;
          }, {}),
          ...billData
        }));
      }
    } catch (error) {
      toast.error('Failed to fetch bill setup data');
    }
  };

  const handleFormSelection = (formId) => {
    setSelectedFormId(formId);
    fetchFormFields(formId);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFieldValueChange = (fieldName, value) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldName]: value === '' ? '0' : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      form_id: selectedFormId,
      property_type_name: formData.property_type_id,
      property_area: formData.property_area_id,
      property_number: formData.property_number_id,
      floor: formData.floor_id,
      form_data: fieldValues,
    };

    try {
      // Check for existing entry
      const existingResponse = await axios.get('http://127.0.0.1:8000/bills-setup/', {
        params: {
          property_type_name: formData.property_type_id,
          property_area: formData.property_area_id,
          ...(formData.property_number_id && { property_number: formData.property_number_id }),
          ...(formData.floor_id && { floor: formData.floor_id }),
        }
      });

      if (existingResponse.data.length > 0) {
        // Update existing
        await axios.put(
          `http://127.0.0.1:8000/bills-setup/${existingResponse.data[0].bill_setup_id}/`,
          payload
        );
        toast.success('Bill setup updated successfully');
      } else {
        // Create new
        await axios.post('http://127.0.0.1:8000/bills-setup/', payload);
        toast.success('Bill setup created successfully');
      }
    } catch (error) {
      toast.error('Error submitting bill setup');
    }
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Bill Setup</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property Selection Row */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
            <select
              name="property_type_id"
              value={formData.property_type_id}
              onChange={handleInputChange}
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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Area</label>
            <select
              name="property_area_id"
              value={formData.property_area_id}
              onChange={handleInputChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            >
              <option value="">Select Property Area</option>
              {areaTypes.map(area => (
                <option key={area.area_type_id} value={area.area_type_id}>
                  {area.area_type_name} - {area.area_value}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Number</label>
            <select
              name="property_number_id"
              value={formData.property_number_id}
              onChange={handleInputChange}
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            >
              <option value="">Select Property Number</option>
              {properties.map(property => (
                <option key={property.property_id} value={property.property_id}>
                  {property.block_name?.block_name} - {property.property_number}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
            <select
              name="floor_id"
              value={formData.floor_id}
              onChange={handleInputChange}
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
        </div>

        {/* Form Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Form</label>
          <select
            value={selectedFormId}
            onChange={(e) => handleFormSelection(e.target.value)}
            required
            className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
          >
            <option value="">Select Form</option>
            {forms.map(form => (
              <option key={form.id} value={form.id}>
                {form.form_name}
              </option>
            ))}
          </select>
        </div>

        {/* Form Fields */}
        {formFields.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Form Fields</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {formFields.map(field => (
                <div key={field.name} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={fieldValues[field.name] || '0'}
                    onFocus={(e) => e.target.value === '0' && (e.target.value = '')}
                    onChange={(e) => handleFieldValueChange(field.name, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700"
                    required={field.required}
                  />
                </div>
              ))}
            </div>
            
            {/* Total Amount Display */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">Total Amount:</span>
                <span className="text-xl font-bold text-green-700">
                  {totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default BillSetupForm;