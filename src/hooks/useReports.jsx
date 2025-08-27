import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from "../config";

const useReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [apiTotals, setApiTotals] = useState(null); // Add API totals state
  
  const [filters, setFilters] = useState({
    block_id: '',
    property_number: '',
    month: '',
    year: '',
    bill_status: '',
    paid_date_start: '',
    paid_date_end: '',
    area_type_id: '',
    party_type: ''
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
      
      // Debug: Log the API response structure
      console.log('=== API RESPONSE DEBUG ===');
      console.log('Raw API Response:', response.data);
      console.log('API Totals:', {
        total_current_bills_sum: response.data.total_current_bills_sum,
        after_pay_balance_sum: response.data.after_pay_balance_sum,
        received_amount_sum: response.data.totals_received_amount_and_discount?.received_amount_sum,
        discount_sum: response.data.totals_received_amount_and_discount?.discount_sum
      });
      
      // Manual calculation verification
      const manualTotals = response.data.data?.reduce((acc, record) => ({
        total_current_bills: acc.total_current_bills + (parseFloat(record.total_current_bills) || 0),
        received_amount: acc.received_amount + (parseFloat(record.received_amount) || 0),
        after_pay_balance: acc.after_pay_balance + (parseFloat(record.after_pay_balance) || 0),
        discount: acc.discount + (parseFloat(record.discount) || 0)
      }), { total_current_bills: 0, received_amount: 0, after_pay_balance: 0, discount: 0 });
      
      console.log('Manual Calculation from Records:', manualTotals);
      
      // Set API totals if available - matching the exact API structure
      const apiTotalsData = {
        totalCurrentBillsSum: parseFloat(response.data.total_current_bills_sum) || 0,
        totalBillsSum: parseFloat(response.data.total_current_bills_sum) || 0, // API only provides current bills
        afterPayBalanceSum: parseFloat(response.data.after_pay_balance_sum) || 0,
        receivedAmountSum: parseFloat(response.data.totals_received_amount_and_discount?.received_amount_sum) || 0,
        discountSum: parseFloat(response.data.totals_received_amount_and_discount?.discount_sum) || 0
      };
      
      console.log('Processed API Totals for State:', apiTotalsData);
      setApiTotals(apiTotalsData);
      
      // Handle the API response structure correctly
      const reportsData = response.data.data || response.data;
      
      // Ensure numeric fields are properly converted from strings
      const processedReports = Array.isArray(reportsData) ? reportsData.map(report => {
        const processed = {
          ...report,
          total_current_bills: parseFloat(report.total_current_bills) || 0,
          total_bills: parseFloat(report.total_bills) || parseFloat(report.total_current_bills) || 0,
          received_amount: parseFloat(report.received_amount) || 0,
          discount: parseFloat(report.discount) || 0,
          after_pay_balance: parseFloat(report.after_pay_balance) || 0,
          // Convert bills_fields object values to numbers
          bills_fields: report.bills_fields ? Object.fromEntries(
            Object.entries(report.bills_fields).map(([key, value]) => [key, parseFloat(value) || 0])
          ) : {}
        };
        console.log('Processed Report Record:', {
          name: processed.name_id,
          property: processed.property_number,
          original: {
            total_current_bills: report.total_current_bills,
            received_amount: report.received_amount,
            after_pay_balance: report.after_pay_balance
          },
          processed: {
            total_current_bills: processed.total_current_bills,
            received_amount: processed.received_amount,
            after_pay_balance: processed.after_pay_balance
          }
        });
        return processed;
      }) : [];
      
      setReports(processedReports);
      
      setHasSearched(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reports');
      toast.error('Failed to fetch reports');
      setReports([]);
      setApiTotals(null);
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
      area_type_id: '',
      party_type: ''
    });
    setReports([]);
    setApiTotals(null);
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
    propertiesLoading,
    apiTotals
  };
};

export default useReports;