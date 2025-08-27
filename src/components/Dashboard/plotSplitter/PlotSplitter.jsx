import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from '../../../config';

const PlotSplitter = () => {
  const [properties, setProperties] = useState([]);
  const [areaTypes, setAreaTypes] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [originalPlotNumber, setOriginalPlotNumber] = useState('');
  const [subProperties, setSubProperties] = useState([]);
  const [splitCount, setSplitCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch properties and area types
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        const [propsRes, areaRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/property/split-options/`),
          axios.get(`${API_BASE_URL}/area-type/`)
        ]);
        console.log('Properties data structure:', propsRes.data);
        console.log('Area types data structure:', areaRes.data);
        setProperties(propsRes.data);
        setAreaTypes(areaRes.data);
      } catch (err) {
        toast.error('Failed to load split options');
        console.error('Error loading options:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const handlePropertySelect = (e) => {
    const propId = e.target.value;
    console.log('Selected property ID:', propId);
    console.log('All properties:', properties);
    
    const prop = properties.find(p => (p.property_id || p.id) === parseInt(propId));
    console.log('Found property:', prop);
    
    if (prop) {
      const selectedId = prop.property_id || prop.id;
      const selectedNumber = prop.property_number || prop.number || prop.propertyNumber;
      
      console.log('Setting selected property:', selectedId, 'with number:', selectedNumber);
      
      setSelectedProperty(selectedId);
      setOriginalPlotNumber(selectedNumber);
      setSubProperties([]);
      setSplitCount(0);
      setShowPreview(false);
      setConfirmation(false);
    } else {
      console.warn('Property not found for ID:', propId);
    }
  };

  const handleSplitCountChange = (e) => {
    const count = parseInt(e.target.value);
    setSplitCount(count);
    
    // Initialize sub-properties array
    const newSubProperties = Array.from({ length: count }, () => ({
      propertyName: '',
      areaTypeId: ''
    }));
    setSubProperties(newSubProperties);
  };

  const handleSubPropertyChange = (index, field, value) => {
    const updated = [...subProperties];
    updated[index][field] = value;
    setSubProperties(updated);
  };

  const validateAndPreview = () => {
    try {
      // Check if we have sub-properties
      if (subProperties.length === 0) {
        throw new Error('No sub-properties found. Please select number of sub-properties first.');
      }

      // Validate all sub-properties
      for (let i = 0; i < subProperties.length; i++) {
        if (!subProperties[i].propertyName.trim()) {
          throw new Error(`Please enter property name for sub-property ${i + 1}`);
        }
        if (!subProperties[i].areaTypeId) {
          throw new Error(`Please select area type for sub-property ${i + 1}`);
        }
      }

      // Log data for debugging
      console.log('Preview Data:', {
        originalPlotNumber,
        splitCount,
        subProperties,
        areaTypes
      });

      setShowPreview(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setLoading(true);
      
      const payload = {
        base_property_id: parseInt(selectedProperty),
        sub_properties: subProperties.map(sub => {
          // Find the selected area type to get the area_value
          const selectedAreaType = areaTypes.find(a => 
            (a.id && a.id === parseInt(sub.areaTypeId)) || 
            (a.area_type_id && a.area_type_id === parseInt(sub.areaTypeId))
          );
          
          return {
            property_name: sub.propertyName.trim(),
            area_value: parseFloat(selectedAreaType?.area_value || 0),
            area_type_id: parseInt(sub.areaTypeId)
          };
        })
      };

      console.log('Submitting payload:', payload);

      await axios.post(`${API_BASE_URL}/property/split/`, payload);
      
      toast.success('Property split successfully!');
      resetForm();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to split property';
      toast.error(errorMessage);
      console.error('Split error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedProperty('');
    setOriginalPlotNumber('');
    setSubProperties([]);
    setSplitCount(0);
    setShowPreview(false);
    setConfirmation(false);
  };

  return (
    <div className="py-5">
       <h1 className="text-2xl font-bold mb-5">Plot Spiltter</h1>  
      <div className="mb-4">
        <select
          value={selectedProperty}
          onChange={handlePropertySelect}
          className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm"
          disabled={loading}
        >
          <option value="">Select Property</option>
          {properties.map(p => {
            // Handle different possible data structures
            const propertyId = p.property_id || p.id;
            const propertyNumber = p.property_number || p.number || p.propertyNumber;
            
            // Create display text with only property number and owner (no area info)
            let displayText = `Property #${propertyNumber || 'N/A'}`;
            
            // Add owner information if available
            if (p.owner_name) {
              displayText += ` | Owner: ${p.owner_name}`;
            } else if (p.ownerName) {
              displayText += ` | Owner: ${p.ownerName}`;
            }
            
            console.log(`Property ${propertyId} display:`, displayText, 'Raw data:', p);
            
            return (
              <option key={propertyId} value={propertyId}>
                {displayText}
              </option>
            );
          })}
        </select>
      </div>

      {/* Split Count */}
      {selectedProperty && (
        <div className="mb-4">
          <select
            value={splitCount}
            onChange={handleSplitCountChange}
            className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm"
            disabled={loading}
          >
            <option value="">Select number of sub-properties</option>
            {[...Array(10)].map((_, i) => (
              <option key={i} value={i + 2}>{i + 2}</option>
            ))}
          </select>
        </div>
      )}

      {/* Sub-Properties Fields - Show based on number of sub-properties selected */}
      {splitCount > 0 && (
        <div className="space-y-4 mb-4">
          {subProperties.map((subProp, index) => (
            <div key={index} className="grid grid-cols-3 gap-4 p-4 border border-gray-200 rounded-sm">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Property Number
                </label>
                <input
                  type="text"
                  value={`${originalPlotNumber}-${index + 1}`}
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm bg-gray-100"
                  disabled
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Property Name
                </label>
                <input
                  type="text"
                  value={subProp.propertyName}
                  onChange={(e) => handleSubPropertyChange(index, 'propertyName', e.target.value)}
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm"
                  placeholder={`Enter name for property ${originalPlotNumber}-${index + 1}`}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Area Type
                </label>
                <select
                  value={subProp.areaTypeId}
                  onChange={(e) => handleSubPropertyChange(index, 'areaTypeId', e.target.value)}
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm"
                  required
                  disabled={loading}
                >
                  <option value="">-- Select Area Type --</option>
                  {areaTypes.map((a) => (
                    <option key={a.id || a.area_type_id} value={a.id || a.area_type_id}>
                      {a.area_type_name} - {a.area_value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {splitCount > 0 && (
        <div className="space-x-3">
          <button
            onClick={validateAndPreview}
            className="bg-blue-600 text-white px-5 py-2 rounded-sm hover:bg-blue-500"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Preview'}
          </button>
          {showPreview && (
            <button
              onClick={() => setConfirmation(true)}
              className="bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600"
              disabled={loading}
            >
              Submit
            </button>
          )}
        </div>
      )}

      {/* Preview List */}
      {showPreview && (
        <div className="mt-5">
          <h3 className="text-md font-semibold mb-2">Split Preview:</h3>
          <div className="text-sm bg-gray-100 p-3 rounded">
            <p><strong>Base Property:</strong> Plot #{originalPlotNumber}</p>
            <p><strong>Will be split into:</strong> {splitCount} sub-properties</p>
            
            {subProperties.length > 0 ? (
              <div className="mt-3">
                <p><strong>Sub-Properties Details:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {subProperties.map((subProp, index) => {
                    // Find area type with multiple possible field names
                    const areaType = areaTypes.find(a => 
                      (a.id && a.id === parseInt(subProp.areaTypeId)) || 
                      (a.area_type_id && a.area_type_id === parseInt(subProp.areaTypeId))
                    );
                    
                    const areaTypeName = areaType?.area_type_name || 'N/A';
                    const areaValue = areaType?.area_value || 'N/A';
                    const propertyName = subProp.propertyName?.trim() || 'No Name';
                    
                    return (
                      <li key={index} className="mb-1">
                        <strong>Plot #{originalPlotNumber}-{index + 1}:</strong> 
                        <span className="ml-2">{propertyName}</span>
                        <span className="ml-2">-</span>
                        <span className="ml-2">Area: {areaValue}</span>
                        <span className="ml-2">-</span>
                        <span className="ml-2">Type: {areaTypeName}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-red-500"><strong>No sub-properties data available</strong></p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmation && (
        <div className="mt-5 p-4 border border-gray-300 bg-yellow-100 rounded">
          <p className="text-sm mb-3">
            Are you sure you want to split this property into {splitCount} sub-properties?
          </p>
          <div className="space-x-3">
            <button
              onClick={handleFinalSubmit}
              className="bg-green-600 text-white px-4 py-1 rounded-sm"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Confirm & Split'}
            </button>
            <button
              onClick={() => setConfirmation(false)}
              className="bg-gray-400 text-white px-4 py-1 rounded-sm"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlotSplitter;