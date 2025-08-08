import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from "../config";

const useReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [filters, setFilters] = useState({
    block_id: '',
    property_number: '',
    month: '',
    year: '',
    bill_status: '',
    paid_date_start: '',
    paid_date_end: '',
    area_type_id: ''
  });

  const [availableMonths] = useState(
    Array.from({ length: 12 }, (_, i) => ({
      value: (i + 1).toString(),
      label: new Date(0, i).toLocaleString('default', { month: 'long' })
    }))
  );

  const [availableYears] = useState(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => ({
      value: (currentYear - 5 + i).toString(),
      label: (currentYear - 5 + i).toString()
    }));
  });

  const [billStatusOptions] = useState([
    { value: '', label: 'All Statuses' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'partially', label: 'Partially Paid' },
    { value: 'overdue', label: 'Overdue' }
  ]);

  const [properties, setProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(`${API_BASE_URL}/reports-filter/?${params.toString()}`);
      setReports(response.data);
      setHasSearched(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reports');
      toast.error('Failed to fetch reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      block_id: '',
      property_number: '',
      month: '',
      year: '',
      bill_status: '',
      paid_date_start: '',
      paid_date_end: '',
      area_type_id: ''
    });
    setReports([]);
    setHasSearched(false);
  };

  const fetchPropertiesForBlock = async (blockId) => {
    if (!blockId) {
      setProperties([]);
      return;
    }
  
    setPropertiesLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/get-property-numbers/`, {
        params: { block_name: blockId }
      });
  
      const propertyData = (response.data.property_numbers || []).map(propertyNumber => ({
        property_id: propertyNumber,
        property_number: propertyNumber
      }));
  
      setProperties(propertyData);
    } catch (err) {
      console.error('Error fetching properties:', err);
      toast.error('Failed to fetch properties for this block');
      setProperties([]);
    } finally {
      setPropertiesLoading(false);
    }
  };
  
  useEffect(() => {
    if (filters.block_id) {
      fetchPropertiesForBlock(filters.block_id);
    } else {
      setProperties([]);
      updateFilters({ property_number: '' });
    }
  }, [filters.block_id]);

  return {
    reports,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    fetchReports,
    hasSearched,
    availableMonths,
    availableYears,
    billStatusOptions,
    properties,
    propertiesLoading
  };
};

export default useReports;