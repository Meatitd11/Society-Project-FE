import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const PlotSplitter = () => {
  const [properties, setProperties] = useState([]);
  const [areaTypes, setAreaTypes] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [originalPlotNumber, setOriginalPlotNumber] = useState('');
  const [originalArea, setOriginalArea] = useState('');
  const [baseAreaTypeId, setBaseAreaTypeId] = useState('');
  const [splitCount, setSplitCount] = useState(0);
  const [splits, setSplits] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch properties and area types
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        const [propsRes, areaRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/property/split-options/'),
          axios.get('http://127.0.0.1:8000/area-types/')
        ]);
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
    const prop = properties.find(p => p.property_id === parseInt(propId));
    if (prop) {
      setSelectedProperty(prop.property_id);
      setOriginalPlotNumber(prop.property_number);
      setOriginalArea(parseFloat(prop.property_area?.area_value) || '');
      setBaseAreaTypeId(prop.property_area?.area_type_id || '');
      setSplitCount(0);
      setSplits([]);
      setShowPreview(false);
      setConfirmation(false);
    }
  };

  const handleSplitCountChange = (e) => {
    const count = parseInt(e.target.value);
    setSplitCount(count);
    const newSplits = Array.from({ length: count }, () => ({
      area_value: '',
      area_type_id: ''
    }));
    setSplits(newSplits);
  };

  const handleSplitChange = (index, field, value) => {
    const updated = [...splits];
    updated[index][field] = value;
    setSplits(updated);
  };

  const validateAndPreview = () => {
    try {
      const totalArea = splits.reduce((sum, s) => sum + parseFloat(s.area_value || 0), 0);
      if (totalArea > originalArea) {
        throw new Error('Total area of sub-properties exceeds base property area');
      }

      if (splits.some(s => !s.area_value || !s.area_type_id)) {
        throw new Error('Please fill all area values and select area types');
      }

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
        base_area_value: parseFloat(originalArea) || null,
        base_area_type_id: parseInt(baseAreaTypeId) || null,
        sub_properties: splits.map((s) => ({
          area_value: parseFloat(s.area_value) || null,
          area_type_id: parseInt(s.area_type_id) || null,
        })),
      };

      await axios.post('http://127.0.0.1:8000/property/split/', payload);
      
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
    setOriginalArea('');
    setBaseAreaTypeId('');
    setSplitCount(0);
    setSplits([]);
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
          {properties.map(p => (
            <option key={p.property_id} value={p.property_id}>
              Plot #{p.property_number} — {p.area_value} {p.area_type_name}
            </option>
          ))}
        </select>
      </div>

      {selectedProperty && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Base Area Type</label>
          <select
            value={baseAreaTypeId}
            onChange={(e) => setBaseAreaTypeId(e.target.value)}
            className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm"
            required
            disabled={loading}
          >
            <option value="">-- Select Area Type --</option>
            {areaTypes.map((a) => (
              <option key={a.area_type_id} value={a.area_type_id}>
                {a.area_type_name}-{a.area_value}
              </option>
            ))}
          </select>
        </div>
      )}

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

      {/* Inputs for sub-properties */}
      {splits.length > 0 && (
        <div className="space-y-4 mb-4">
          {splits.map((split, i) => (
            <div key={i} className="grid grid-cols-2 gap-3 items-center">
              <input
                type="number"
                step="0.01"
                placeholder="Area"
                value={split.area_value}
                onChange={(e) => handleSplitChange(i, 'area_value', e.target.value)}
                className="text-sm px-3 py-2 border border-gray-300"
                required
                disabled={loading}
              />
              <select
                value={split.area_type_id}
                onChange={(e) => handleSplitChange(i, 'area_type_id', e.target.value)}
                className="text-sm px-3 py-2 border border-gray-300"
                disabled={loading}
              >
                <option value="">Select Area Type</option>
                {areaTypes.map((a) => (
                  <option key={a.area_type_id} value={a.area_type_id}>
                    {a.area_type_name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {splits.length > 0 && (
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
          <h3 className="text-md font-semibold mb-2">Resulting Sub-properties:</h3>
          <ul className="list-disc list-inside text-sm">
            {splits.map((s, i) => (
              <li key={i}>
                Area: {s.area_value} — Type ID: {s.area_type_id}
              </li>
            ))}
          </ul>
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