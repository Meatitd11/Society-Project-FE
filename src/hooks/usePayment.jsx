import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import useBlock from './useBlock';

const usePayments = () => {
  const [paymentData, setPaymentData] = useState({
    form: '',
    payments_collection_mode: '',
    block_name: '',
    property_number: '',
    name_id: '',
    name: '',
    month: '',
    year: '',
    issue_date: '',
    due_date: '',
    bills_fields: {},
    monthly_rent: '',
  });
  const [payments, setPayments] = useState([]);
  const [properties, setProperties] = useState([]);
  const [charges, setCharges] = useState({});
  const [totalCurrentBills, setTotalCurrentBills] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { blocks, fetchBlocks } = useBlock();
  const [forms, setForms] = useState([]);
  const [balance, setBalance] = useState(0);
  const [monthlyRent, setMonthlyRent] = useState(0);

  useEffect(() => {
    fetchBlocks();
    fetchPayments();
    fetchForms();
  }, []);

// In usePayments.js
useEffect(() => {
  // Calculate bills total
  const billsTotal = Object.values(charges).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  
  // Calculate total including rent and previous balance
  const total = billsTotal + monthlyRent + (parseFloat(balance) || 0);
  
  setTotalCurrentBills(total);
}, [charges, monthlyRent, balance]); // Add balance to dependencies

  const fetchForms = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/form-builder');
      setForms(response.data);
    } catch (error) {
      toast.error('Error fetching forms');
      console.error('Error fetching forms:', error);
    }
  };

  const handleFormChange = (e) => {
    const selectedFormId = e.target.value;
    const selectedForm = forms.find(form => form.id === selectedFormId);
    
    setPaymentData(prev => ({
      ...prev,
      form: selectedFormId,
    }));
  };

  const handleMonthYearChange = (date) => {
    setPaymentData((prevData) => ({
      ...prevData,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    setPaymentData((prevData) => ({
      ...prevData,
      [name]: value,
      ...(name === 'block_name' || name === 'property_number' ? { name_id: '' } : {}),
    }));
  
    if (name === 'block_name') {
      fetchProperties(value);
      resetCharges();
    }
  
    if (name === 'property_number') {
      fetchName(value);
      fetchBalance(value);
    }
  };
  
  const handleChargesChange = (e) => {
    const { name, value } = e.target;
    setCharges(prev => ({
      ...prev,
      [name]: value,
    }));
  };

 // In usePayments.js
const fetchBalance = async (propertyNumber) => {
  try {
    const res = await axios.get(
      `http://127.0.0.1:8000/payments/get-balance/?property_number=${propertyNumber}`
    );
    setBalance(parseFloat(res.data.balance) || 0);
  } catch (err) {
    toast.error('Failed to fetch balance');
    console.error('Failed to fetch balance:', err);
    setBalance(0);
  }
};
  
  const fetchProperties = async (blockName) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://127.0.0.1:8000/payments-collection/get_property_numbers/?block_name=${blockName}`
      );
      const formattedProperties = response.data.property_numbers.map((num) => ({
        id: num,
        property_number: num,
      }));
      setProperties(formattedProperties);
      resetCharges();
    } catch (error) {
      toast.error('Error fetching properties');
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchName = async (propertyNumber) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://127.0.0.1:8000/payments-collection/get_property_owner_or_tenant/?property_number=${propertyNumber}`
      );
      const { owners, tenant_name, bills_fields, monthly_rent } = response.data;
  
      let nameToShow = 'Not found';
      
      if (Array.isArray(owners) && owners.length > 0 && owners[0] !== 'No active owner found') {
        nameToShow = owners[0];
      } else if (tenant_name && tenant_name !== 'Tenant not found') {
        nameToShow = tenant_name;
      }
      
      setPaymentData(prev => ({
        ...prev,
        name_id: nameToShow,
        monthly_rent: parseFloat(monthly_rent) || 0,
      }));
      
      // Handle dynamic bills fields
      const billsData = bills_fields && typeof bills_fields === 'object' 
        ? bills_fields 
        : {};
      
      setMonthlyRent(parseFloat(monthly_rent) || 0);
      
      // Create charges object with all dynamic fields
      const chargesData = {};
      
      // Add all fields from bills_fields to charges
      if (billsData) {
        Object.keys(billsData).forEach(key => {
          chargesData[key] = billsData[key] || 0;
        });
      }
      
      setCharges(chargesData);
      
    } catch (error) {
      toast.error('Error fetching property details');
      console.error('Error fetching name:', error);
      resetCharges();
      setMonthlyRent(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:8000/payments-collection/');
      setPayments(response.data);
    } catch (error) {
      toast.error('Error fetching payments');
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetCharges = () => {
    setCharges({});
  };




const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);

    const billsFields = { ...charges };

    await axios.post('http://127.0.0.1:8000/payments-collection/', {
      ...paymentData,
      bills_fields: billsFields,
      total_current_bills: totalCurrentBills,
      monthly_rent: paymentData.monthly_rent || monthlyRent,
      balance: balance // Include previous balance in payload
    });

    toast.success('Payment added successfully!');
    setPaymentData({
      payments_collection_mode: '',
      block_name: '',
      property_number: '',
      name_id: '',
      name: '',
      month: '',
      year: '',
      issue_date: '',
      due_date: '',
      bills_fields: {},
      monthly_rent: '', // Reset it here too
    });
    setProperties([]);
    resetCharges();
    fetchPayments();
    setTimeout(() => navigate('/dashboard/payments-list'), 1000);
  } catch (error) {
    toast.error('Failed to add payment. Please try again.');
    console.error('Payment submission error:', error);
  } finally {
    setLoading(false);
  }
};

const editPayment = async (id, updatedData) => {
  try {
    setLoading(true);
    
    // Prepare the data to be sent to the API
    const payload = {
      ...updatedData,
      // Ensure block_name is sent as just the ID (primary key)
      block_name: typeof updatedData.block_name === 'object' 
        ? updatedData.block_name.id 
        : updatedData.block_name,
      // Convert month and year to strings if needed
      month: updatedData.month.toString(),
      year: updatedData.year.toString(),
    };

    const response = await axios.put(
      `http://127.0.0.1:8000/payments-collection/${id}/`, 
      payload
    );

    if (response.status === 200) {
      setPayments((prevPayments) =>
        prevPayments.map((payment) => (payment.id === id ? response.data : payment))
      );
      toast.success('Payment updated successfully!');
      return true; // Return success status
    }
  } catch (error) {
    toast.error('Failed to update payment. Please try again.');
    console.error('Payment update error:', error.response?.data || error.message);
    return false; // Return failure status
  } finally {
    setLoading(false);
  }
};

  const deletePayment = async (id) => {
    try {
      setLoading(true);
      const response = await axios.delete(`http://127.0.0.1:8000/payments-collection/${id}/`);
      if (response.status === 204) {
        setPayments((prevPayments) => prevPayments.filter((payment) => payment.id !== id));
        toast.success('Payment deleted successfully!');
      }
    } catch (error) {
      toast.error('Failed to delete payment. Please try again.');
      console.error('Payment deletion error:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    paymentData,
    properties,
    charges,
    payments,
    totalCurrentBills,
    fetchPayments,
    monthlyRent, 
    blocks,
    balance,
    forms,
    loading,
    handleChange,
    handleFormChange,
    handleChargesChange,
    handleMonthYearChange,
    handleSubmit,
    editPayment,
    deletePayment,
  };
};

export default usePayments;