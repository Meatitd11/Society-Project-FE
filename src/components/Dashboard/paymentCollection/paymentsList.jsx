import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaEye, FaFileInvoiceDollar, FaFilePdf, FaReceipt, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import Modal from '../modal';
import usePayments from '../../../hooks/usePayment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { setMonth, setYear } from 'date-fns';
import axios from 'axios';
import { generateInvoicePdf } from '../../../hooks/generateInvoicePdf';
import { generateReceiptPdf } from '../../../hooks/generateReceiptPdf';
import ReceiptModal from '../receiptModal';
import { useNavigate } from 'react-router-dom';

const PaymentsList = () => {
  const { 
    payments, 
    fetchPayments, 
    editPayment, 
    deletePayment,
    properties,
    charges,
    totalCurrentBills,
    blocks,
    forms,
    handleChange,
    handleFormChange,
    handleChargesChange,
    handleMonthYearChange
  } = usePayments();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [editablePayment, setEditablePayment] = useState({
    form: '',
    payments_collection_mode: '',
    block_name: '',
    property_number: '',
    name_id: '',
    month: '',
    year: '',
    issue_date: '',
    due_date: '',
    bills_fields: {},
    monthly_rent: ''
  });
  const [paymentData, setPaymentData] = useState({
    received_amount: '',
    discount: '',
    payment_by: 'Cash',
    reference_no: '',
    description: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editProperties, setEditProperties] = useState([]);
  const [editCharges, setEditCharges] = useState({});
  const [editTotalCurrentBills, setEditTotalCurrentBills] = useState(0);
  const [afterPayBalance, setAfterPayBalance] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [initialBalance, setInitialBalance] = useState(0);
  const [hasPartialPayment, setHasPartialPayment] = useState(false);
  const [isFirstPayment, setIsFirstPayment] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [finePercentage, setFinePercentage] = useState(0);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  // Check if payment is rental (monthly_rent > 0)
  const isRentalPayment = (payment) => {
    return payment.monthly_rent && parseFloat(payment.monthly_rent) > 0;
  };

  useEffect(() => {
    fetchPayments();
    fetchFinePercentage();
  }, []);

  const fetchFinePercentage = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/fine-set/');
      if (response.data.length > 0) {
        setFinePercentage(parseFloat(response.data[0].fine));
      }
    } catch (error) {
      console.error('Error fetching fine percentage:', error);
    }
  };

  const calculateFine = (payment) => {
    // Only calculate fine if payment is pending and past due date
    if (payment.bill_status !== 'pending' || !payment.due_date) return 0;
    
    const dueDate = new Date(payment.due_date);
    const currentDate = new Date();
    
    if (currentDate > dueDate) {
      const fineAmount = (parseFloat(payment.total_current_bills) * finePercentage) / 100;
      return parseFloat(fineAmount.toFixed(2));
    }
    
    return 0;
  };

  const getTotalWithFine = (payment) => {
    return (parseFloat(payment.total_current_bills) + calculateFine(payment)).toFixed(2);
  };

  useEffect(() => {
    const total = Object.values(editCharges).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    setEditTotalCurrentBills(total + (parseFloat(editablePayment.monthly_rent) || 0));
  }, [editCharges, editablePayment.monthly_rent]);

  const isMonthPassed = (paymentMonth, paymentYear) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const pm = Number(paymentMonth);
    const py = Number(paymentYear);
    
    return (
      py < currentYear || 
      (py === currentYear && pm < currentMonth)
    );
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleOpenEditModal = async (payment) => {
    setSelectedPayment(payment);
    setEditablePayment({
      ...payment,
      bills_fields: payment.bills_fields || {},
      monthly_rent: payment.monthly_rent || '',
      block_name: payment.block_name,
      block_name_id: payment.block_name?.id || payment.block_name,
      property_number: payment.property_number
    });
    setEditCharges(payment.bills_fields || {});
    setIsEditModalOpen(true);
  };

  const handleOpenViewModal = (payment) => {
    setSelectedPayment(payment);
    setIsViewModalOpen(true);
  };

  const handleOpenDeleteModal = (payment) => {
    setSelectedPayment(payment);
    setIsDeleteModalOpen(true);
  };

  const handleOpenPayModal = async (payment) => {
    if (!payment || !payment.id) {
      console.error('Invalid payment object passed to handleOpenPayModal:', payment);
      setErrorMessage('Invalid payment selected for payment.');
      return;
    }
  
    setSelectedPayment(payment);
    setPaymentData({
      received_amount: '',
      discount: '',
      payment_by: 'Cash',
      reference_no: '',
      description: ''
    });

    try {
      const endpoint = isRentalPayment(payment) 
        ? `http://127.0.0.1:8000/get-current-partial-balance/?property_number=${payment.property_number}&rental=true`
        : `http://127.0.0.1:8000/get-current-partial-balance/?property_number=${payment.property_number}`;
      
      const response = await axios.get(endpoint);
      const currentBalance = parseFloat(response.data["after pay balance"]);
      const totalBill = parseFloat(getTotalWithFine(payment));
      
      setAfterPayBalance(currentBalance || totalBill);
      setInitialBalance(currentBalance || totalBill);
      
      const isFirst = currentBalance === totalBill || isNaN(currentBalance);
      setIsFirstPayment(isFirst);
      setHasPartialPayment(!isFirst && currentBalance > 0);
    } catch (error) {
      console.error('Error fetching current balance:', error);
      const totalBill = parseFloat(getTotalWithFine(payment));
      setAfterPayBalance(totalBill);
      setInitialBalance(totalBill);
      setIsFirstPayment(true);
      setHasPartialPayment(false);
    }

    setPaymentStatus('');
    setIsPayModalOpen(true);
  };

  const handlePaymentFieldChange = (e) => {
    const { name, value } = e.target;
    
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'received_amount' || name === 'discount') {
      const received = name === 'received_amount' ? parseFloat(value) || 0 : parseFloat(paymentData.received_amount) || 0;
      const discount = name === 'discount' ? parseFloat(value) || 0 : parseFloat(paymentData.discount) || 0;
      
      const newBalance = initialBalance - received - discount;
      setAfterPayBalance(newBalance);
      setPaymentStatus(newBalance <= 0 ? 'paid' : 'partially');
    }
  };

  const handlePayBill = async () => {
    if (!selectedPayment || !selectedPayment.id) {
      setErrorMessage('No valid payment selected.');
      return;
    }
  
    if (!paymentData.received_amount) {
      setErrorMessage('Received amount is required');
      return;
    }
  
    if (paymentData.payment_by === 'Bank' && !paymentData.reference_no) {
      setErrorMessage('Reference number is required for bank payments');
      return;
    }
  
    const received = parseFloat(paymentData.received_amount) || 0;
    const discount = parseFloat(paymentData.discount) || 0;
    const totalPayment = received + discount;
    const fineAmount = calculateFine(selectedPayment);
    const totalWithFine = parseFloat(getTotalWithFine(selectedPayment));
    
    if (totalPayment > totalWithFine) {
      setErrorMessage('Payment amount cannot exceed current balance');
      return;
    }
  
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/payments-collection/${selectedPayment.id}/pay_bill/`,
        {
          ...paymentData,
          received_amount: received,
          discount: discount,
          total_bills: parseFloat(selectedPayment.total_current_bills) || 0,
          fine_amount: fineAmount,
          after_pay_balance: parseFloat(afterPayBalance) || 0,
          status: paymentStatus,
          is_first_payment: isFirstPayment
        }
      );
  
      setSuccessMessage('Payment processed successfully!');
      setIsPayModalOpen(false);
      fetchPayments();
    } catch (error) {
      setErrorMessage('Failed to process payment: ' + (error.response?.data?.message || error.message));
    }
  };

  // ... (keep other functions the same as in your original code)
  const handleFieldChange = async (e) => {
    const { name, value } = e.target;
    
    setEditablePayment(prev => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'block_name') {
      await fetchEditProperties(value);
      setEditablePayment(prev => ({
        ...prev,
        property_number: '',
        name_id: '',
      }));
      setEditCharges({});
    }

    if (name === 'property_number' && value) {
      await fetchEditName(value);
    }
  };

  const handleEditFormChange = (e) => {
    const selectedFormId = e.target.value;
    setEditablePayment(prev => ({
      ...prev,
      form: selectedFormId,
    }));
  };

  const handleEditMonthYearChange = (date) => {
    setEditablePayment(prev => ({
      ...prev,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    }));
  };

  const handleEditChargesChange = (e) => {
    const { name, value } = e.target;
    setEditCharges(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchEditProperties = async (blockName) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/payments-collection/get_property_numbers/?block_name=${blockName}`
      );
      const formattedProperties = response.data.property_numbers.map((num) => ({
        id: num,
        property_number: num,
      }));
      setEditProperties(formattedProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchEditName = async (propertyNumber) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/payments-collection/get_property_owner_or_tenant/?property_number=${propertyNumber}`
      );
      const { owner_name, tenant_name, bills_fields } = response.data;
      setEditablePayment(prev => ({
        ...prev,
        name_id: owner_name || tenant_name || 'Not found',
      }));
      if (bills_fields) {
        setEditCharges(bills_fields);
      }
    } catch (error) {
      console.error('Error fetching name:', error);
    }
  };

  const handleEditPayment = async () => {
    try {
      const success = await editPayment(selectedPayment.id, {
        ...editablePayment,
        bills_fields: editCharges,
        total_current_bills: editTotalCurrentBills,
        // Ensure block_name is properly formatted
        block_name: typeof editablePayment.block_name === 'object' 
          ? editablePayment.block_name.id 
          : editablePayment.block_name
      });
  
      if (success) {
        setSuccessMessage('Payment updated successfully!');
        setIsEditModalOpen(false);
        fetchPayments();
      }
    } catch (error) {
      setErrorMessage('Failed to update payment: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeletePayment = async () => {
    try {
      await deletePayment(selectedPayment.id);
      setSuccessMessage('Payment deleted successfully!');
      setIsDeleteModalOpen(false);
      fetchPayments();
    } catch (error) {
      setErrorMessage('Failed to delete payment.');
    }
  };

  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('default', { month: 'long' });
  };
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'desc'
  });
  const [sortedData, setSortedData] = useState([]);

  useEffect(() => {
    if (payments.length > 0) {
      const sortableItems = [...payments];
      sortableItems.sort((a, b) => {
        if (sortConfig.key === 'block_name') {
          const aValue = typeof a.block_name === 'object' ? a.block_name.block_name : a.block_name || '';
          const bValue = typeof b.block_name === 'object' ? b.block_name.block_name : b.block_name || '';
          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
        
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
      setSortedData(sortableItems);
    }
  }, [payments, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="py-5">
      <div className='flex justify-between mb-4 items-center'> 
        <h1 className="text-2xl font-bold">Payment List</h1>
        <button 
          onClick={() => navigate('/dashboard/add-payments')}
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Add New Payment
        </button>
      </div>
      <table className="min-w-full text-sm text-gray-600 bg-white border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="border text-start px-4 py-2">
              <div className="flex items-center cursor-pointer" onClick={() => requestSort('id')}>
                <span>#</span>
                <span className="ml-1">{getSortIcon('id')}</span>
              </div>
            </th>
            <th className="border text-start px-4 py-2">
              <div className="flex items-center cursor-pointer" onClick={() => requestSort('block_name')}>
                <span>Block Name</span>
                <span className="ml-1">{getSortIcon('block_name')}</span>
              </div>
            </th>
            <th className="border text-start px-4 py-2">
              <div className="flex items-center cursor-pointer" onClick={() => requestSort('property_number')}>
                <span>Property Number</span>
                <span className="ml-1">{getSortIcon('property_number')}</span>
              </div>
            </th>
            <th className="border text-start px-4 py-2">
              <div className="flex items-center cursor-pointer" onClick={() => requestSort('name_id')}>
                <span>Name</span>
                <span className="ml-1">{getSortIcon('name_id')}</span>
              </div>
            </th>
            <th className="border text-start px-4 py-2">
              <div className="flex items-center cursor-pointer" onClick={() => requestSort('month')}>
                <span>Month</span>
                <span className="ml-1">{getSortIcon('month')}</span>
              </div>
            </th>
            <th className="border text-start px-4 py-2">
              <div className="flex items-center cursor-pointer" onClick={() => requestSort('year')}>
                <span>Year</span>
                <span className="ml-1">{getSortIcon('year')}</span>
              </div>
            </th>
            <th className="border text-start px-4 py-2">
              <div className="flex items-center cursor-pointer" onClick={() => requestSort('balance')}>
                <span>Balance</span>
                <span className="ml-1">{getSortIcon('balance')}</span>
              </div>
            </th>
            <th className="border text-start px-4 py-2">
              <div className="flex items-center cursor-pointer" onClick={() => requestSort('total_current_bills')}>
                <span>Total Bills</span>
                <span className="ml-1">{getSortIcon('total_current_bills')}</span>
              </div>
            </th>
            <th className="border text-start px-4 py-2">
              <div className="flex items-center cursor-pointer" onClick={() => requestSort('fine')}>
                <span>Fine</span>
                <span className="ml-1">{getSortIcon('fine')}</span>
              </div>
            </th>
            <th className="border text-start px-4 py-2">
              <div className="flex items-center cursor-pointer" onClick={() => requestSort('bill_status')}>
                <span>Status</span>
                <span className="ml-1">{getSortIcon('bill_status')}</span>
              </div>
            </th>
            <th className="border text-start px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentPayments.length > 0 ? (
            currentPayments.map((payment, index) => (
              <tr key={payment.id || index}>
                <td className="border px-4 py-2">{indexOfFirstItem + index + 1}</td>
                <td className="border px-4 py-2">{payment.block_name?.block_name || payment.block_name}</td>
                <td className="border px-4 py-2">{payment.property_number}</td>
                <td className="border px-4 py-2">{payment.name_id}</td>
                <td className="border px-4 py-2">{getMonthName(payment.month)}</td>
                <td className="border px-4 py-2">{payment.year}</td>
                <td className="border px-4 py-2">{payment.balance}</td>
                <td className="border px-4 py-2">{payment.total_current_bills}</td>
                <td className="border px-4 py-2">
                  {payment.bill_status !== 'paid' ? (
                    `Rs ${calculateFine(payment)}`
                  ) : (
                    'Rs 0.00'
                  )}
                </td>
                <td className="border px-4 py-2">
                  {payment.bill_status === 'paid' ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Paid</span>
                  ) : payment.bill_status === 'partially' ? (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Partial</span>
                  ) : (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Pending</span>
                  )}
                </td>
                <td className="border px-4 py-2 flex gap-2">
                  <FaEye
                    className="text-blue-600 cursor-pointer"
                    onClick={() => handleOpenViewModal(payment)}
                    title="View Details"
                  />
                  <FaEdit
                    className="text-yellow-600 cursor-pointer"
                    onClick={() => handleOpenEditModal(payment)}
                    title="Edit"
                  />
                  <FaTrash
                    className="text-red-700 cursor-pointer"
                    onClick={() => handleOpenDeleteModal(payment)}
                    title="Delete"
                  />
                  {payment.bill_status === 'paid' || payment.bill_status === 'partially' ? (
                    <>
                      <FaReceipt
                        className="text-blue-600 cursor-pointer"
                        title="Download Receipt"
                        onClick={() => setSelectedPaymentId(payment.id)}
                      />
                    </>
                  ) : (
                    <FaFilePdf
                      className="text-red-600 cursor-pointer"
                      title="Generate Invoice PDF"
                      onClick={() => generateInvoicePdf(payment)}
                    />
                  )}

                  {payment.bill_status !== 'paid' && (
                    <FaFileInvoiceDollar
                      className="text-green-600 cursor-pointer"
                      title="Pay Bill"
                      onClick={() => handleOpenPayModal(payment)}
                    />
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="border px-4 py-2 text-center" colSpan="12">
                No payments found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {sortedData.length > itemsPerPage && (
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

      <ReceiptModal
        isOpen={!!selectedPaymentId}
        paymentId={selectedPaymentId}
        onClose={() => setSelectedPaymentId(null)}
      />

      {isViewModalOpen && (
        <Modal isVisible={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
          <h2 className="text-xl mb-4">Payment Details</h2>
          <div className="space-y-2">
            <p><strong>Block Name:</strong> {selectedPayment.block_name?.block_name}</p>
            <p><strong>Property Number:</strong> {selectedPayment.property_number}</p>
            <p><strong>Name:</strong> {selectedPayment.name_id}</p>
            <p><strong>Month:</strong> {getMonthName(selectedPayment.month)}</p>
            <p><strong>Year:</strong> {selectedPayment.year}</p>
            <p><strong>Total Bills:</strong> Rs {selectedPayment.total_current_bills}</p>
            <p><strong>Fine:</strong> Rs {calculateFine(selectedPayment)}</p>
            <p><strong>Total with Fine:</strong> Rs {getTotalWithFine(selectedPayment)}</p>
            <p><strong>Balance:</strong> Rs {selectedPayment.balance}</p>
            <p><strong>Status:</strong> 
              {selectedPayment.bill_status === 'paid' ? (
                <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Paid</span>
              ) : selectedPayment.bill_status === 'partially' ? (
                <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Partial</span>
              ) : (
                <span className="ml-2 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Pending</span>
              )}
            </p>
            <div className="mt-4">
              <p className="font-medium">Charges Breakdown:</p>
              <table className="w-full mt-2 border-collapse">
                <tbody>
                  {selectedPayment.bills_fields && Object.entries(selectedPayment.bills_fields).map(([key, value]) => (
                    <tr key={key} className="border-b">
                      <td className="py-1 pr-4">{key.replace(/_/g, ' ').toUpperCase()}</td>
                      <td className="py-1 text-right">Rs {value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}

      {isPayModalOpen && selectedPayment && (
        <Modal isVisible={isPayModalOpen} onClose={() => setIsPayModalOpen(false)}>
          <h2 className="text-xl mb-4">Pay Bill</h2>
          <div className="space-y-4">
            {isRentalPayment(selectedPayment) && isMonthPassed(selectedPayment.month, selectedPayment.year) && (
              <div className="p-3 bg-red-100 text-red-800 rounded-md">
                <p className="font-medium">⚠️ Payment Not Allowed</p>
                <p className="text-sm">This rental payment is for a past month (Month: {getMonthName(selectedPayment.month)} {selectedPayment.year}) and cannot be processed.</p>
              </div>
            )}

{selectedPayment.bill_status === 'pending' && calculateFine(selectedPayment) > 0 && (
              <div className="p-2 bg-yellow-100 text-yellow-800 rounded mb-2">
                <p className="font-medium">⚠️ Late Payment Fine Applied</p>
                <p className="text-sm">
                  Fine amount: Rs {calculateFine(selectedPayment).toFixed(2)} ({finePercentage}% of total bill)
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Bill Amount</label>
                <input
                  type="text"
                  value={`Rs ${selectedPayment.total_current_bills}`}
                  readOnly
                  className="w-full text-sm px-4 py-2 border border-gray-300 bg-gray-100 rounded-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Fine Amount</label>
                <input
                  type="text"
                  value={`Rs ${calculateFine(selectedPayment).toFixed(2)}`}
                  readOnly
                  className="w-full text-sm px-4 py-2 border border-gray-300 bg-gray-100 rounded-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Total with Fine</label>
                <input
                  type="text"
                  value={`Rs ${getTotalWithFine(selectedPayment)}`}
                  readOnly
                  className="w-full text-sm px-4 py-2 border border-gray-300 bg-gray-100 rounded-sm font-semibold"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {hasPartialPayment ? 'Remaining Balance' : 'Current Balance'}
                </label>
                <input
                  type="text"
                  value={`Rs ${initialBalance.toFixed(2)}`}
                  readOnly
                  className={`w-full text-sm px-4 py-2 border border-gray-300 bg-gray-100 rounded-sm ${
                    initialBalance > 0 ? 'text-yellow-600' : 'text-green-600'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Received Amount*</label>
                <input
                  type="number"
                  name="received_amount"
                  value={paymentData.received_amount}
                  onChange={handlePaymentFieldChange}
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                  required
                  max={initialBalance}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Discount (if any)</label>
                <input
                  type="number"
                  name="discount"
                  value={paymentData.discount}
                  onChange={handlePaymentFieldChange}
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                  max={initialBalance - (parseFloat(paymentData.received_amount) || 0)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Method*</label>
              <select
                name="payment_by"
                value={paymentData.payment_by}
                onChange={handlePaymentFieldChange}
                className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                required
              >
                <option value="Cash">Cash</option>
                <option value="Bank">Bank Transfer</option>
              </select>
            </div>

            {paymentData.payment_by === 'Bank' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Reference Number*</label>
                <input
                  type="text"
                  name="reference_no"
                  value={paymentData.reference_no}
                  onChange={handlePaymentFieldChange}
                  className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                  required={paymentData.payment_by === 'Bank'}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={paymentData.description}
                onChange={handlePaymentFieldChange}
                className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                rows="2"
              />
            </div>

            <div className="p-4 bg-gray-50 rounded border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount Paying:</p>
                  <p className="text-lg font-semibold">
                    Rs {(
                      (parseFloat(paymentData.received_amount) || 0) + 
                      (parseFloat(paymentData.discount) || 0)
                    ).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">New Balance:</p>
                  <p className={`text-lg font-semibold ${
                    afterPayBalance > 0 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    Rs {afterPayBalance.toFixed(2)}
                  </p>
                </div>
              </div>
              
              {isFirstPayment && (
                <div className="mt-2 text-center">
                  <p className="text-sm text-gray-600">
                    No payments made yet for this bill
                  </p>
                </div>
              )}
              
              {hasPartialPayment && (
                <div className="mt-2 text-center">
                  <p className="text-sm text-yellow-600">
                    Previous partial payment made. Balance was Rs {initialBalance.toFixed(2)}
                  </p>
                </div>
              )}
              
              {afterPayBalance > 0 && paymentData.received_amount && (
                <div className="mt-2 text-center">
                  <p className="text-sm text-yellow-600">
                    This will leave a remaining balance of Rs {afterPayBalance.toFixed(2)}
                  </p>
                </div>
              )}
              
              {afterPayBalance <= 0 && paymentData.received_amount && (
                <div className="mt-2 text-center">
                  <p className="text-sm text-green-600">
                    This payment will fully settle the bill
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                onClick={handlePayBill}
                disabled={isRentalPayment(selectedPayment) && isMonthPassed(selectedPayment.month, selectedPayment.year)}
                className={`w-full px-5 py-2 rounded-sm ${
                  isRentalPayment(selectedPayment) && isMonthPassed(selectedPayment.month, selectedPayment.year)
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-green-700 text-white hover:bg-green-600 transition-colors duration-300'
                }`}
              >
                {isRentalPayment(selectedPayment) && isMonthPassed(selectedPayment.month, selectedPayment.year)
                  ? 'Payment Disabled (Past Month)'
                  : 'Process Payment'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Payment Modal */}
      {isEditModalOpen && (
        <Modal isVisible={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          <h2 className="text-xl mb-4">Edit Payment</h2>
          <div className="grid grid-cols-2 gap-x-4">
            <div className="mb-2">
              <select
                name="form"
                value={editablePayment.form}
                onChange={handleEditFormChange}
                required
                className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
              >
                <option value="">Select Form</option>
                {forms.map((form) => (
                  <option key={form.id} value={form.id}>
                    {form.form_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-2">
              <select
                name="payments_collection_mode"
                value={editablePayment.payments_collection_mode}
                onChange={handleFieldChange}
                required
                className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
              >
                <option value="">Select Collection Mode</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="half_year">Half Year</option>
              </select>
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Block Name</label>
              <input
                type="text"
                value={editablePayment.block_name?.block_name || editablePayment.block_name}
                readOnly
                className="w-full text-sm px-4 py-2 border border-gray-300 bg-gray-100 rounded-sm"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Property Number</label>
              <input
                type="text"
                value={editablePayment.property_number}
                readOnly
                className="w-full text-sm px-4 py-2 border border-gray-300 bg-gray-100 rounded-sm"
              />
            </div>

            <div className="mb-2">
              <input
                type="text"
                name="name_id"
                value={editablePayment.name_id}
                readOnly
                className="w-full text-sm px-4 py-2 border border-gray-300 bg-gray-100 rounded-sm focus:ring-0 focus:outline-none"
              />
            </div> 

            <div className="mb-2 col-span-2">
              <label className="block text-sm font-medium text-gray-700">Monthly Rent</label>
              <input
                type="number"
                name="monthly_rent"
                value={editablePayment.monthly_rent}
                onChange={(e) => setEditablePayment(prev => ({
                  ...prev,
                  monthly_rent: e.target.value
                }))}
                className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Fine Applied</label>
              <input
                type="text"
                value={`Rs ${calculateFine(editablePayment)}`}
                readOnly
                className="w-full text-sm px-4 py-2 border border-gray-300 bg-gray-100 rounded-sm"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Total with Fine</label>
              <input
                type="text"
                value={`Rs ${(parseFloat(editablePayment.total_current_bills) + calculateFine(editablePayment)).toFixed(2)}`}
                readOnly
                className="w-full text-sm px-4 py-2 border border-gray-300 bg-gray-100 rounded-sm font-semibold"
              />
            </div>

            <div className="mb-2 col-span-2">
              <DatePicker
                selected={
                  editablePayment.year && editablePayment.month
                    ? setMonth(setYear(new Date(), editablePayment.year), editablePayment.month - 1)
                    : null
                }
                onChange={handleEditMonthYearChange}
                showMonthYearPicker
                dateFormat="MM-yyyy"
                className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                placeholderText="Select Month and Year"
              />
            </div>

            {Object.keys(editCharges).length > 0 ? (
              Object.keys(editCharges).map((key) => (
                <div key={key} className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {key.replace('_', ' ').toUpperCase()}
                  </label>
                  <input
                    type="number"
                    name={key}
                    value={editCharges[key]}
                    onChange={handleEditChargesChange}
                    className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                  />
                </div>
              ))
            ) : (
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">No charges available</label>
              </div>
            )}

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Total Current Bills</label>
              <input
                type="number"
                name="total_current_bills"
                value={editTotalCurrentBills}
                readOnly
                className="w-full text-sm px-4 py-2 border border-gray-300 bg-gray-100 rounded-sm focus:ring-0 focus:outline-none"
              />
            </div>

            <div className="mb-2">
              <input
                type="date"
                name="issue_date"
                value={editablePayment.issue_date}
                onChange={handleFieldChange}
                required
                className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
              />
            </div>

            <div className="mb-2">
              <input
                type="date"
                name="due_date"
                value={editablePayment.due_date}
                onChange={handleFieldChange}
                required
                className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
              />
            </div>
          </div>

          <button
            onClick={handleEditPayment}
            className="mt-4 bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
          >
            Save Changes
          </button>
        </Modal>
      )}

      {isDeleteModalOpen && (
        <Modal isVisible={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
          <h2 className="text-xl mb-4">Confirm Delete</h2>
          <p>Are you sure you want to delete this payment?</p>
          <div className="flex justify-end gap-4 mt-4">
            <button
              onClick={handleDeletePayment}
              className="bg-red-700 text-white px-5 py-2 rounded-sm hover:bg-red-600 transition-colors duration-300"
            >
              Delete
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="bg-gray-700 text-white px-5 py-2 rounded-sm hover:bg-gray-600 transition-colors duration-300"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PaymentsList;