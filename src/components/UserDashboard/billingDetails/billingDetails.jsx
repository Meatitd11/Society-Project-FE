import { useState, useEffect, useCallback } from 'react';
import { FaEye, FaReceipt, FaSearch, FaRedo, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import Modal from '../../Dashboard/modal';
import ReceiptModal from '../../Dashboard/receiptModal';

const BillingDetails = () => {
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedBill, setSelectedBill] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [finePercentage] = useState(10);
  
  const itemsPerPage = 10;

  // Get month name
  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1] || 'Unknown';
  };

  // Calculate fine (using actual API logic)
  const calculateFine = (bill) => {
    // Only calculate fine if payment is pending and past due date
    if (bill.bill_status !== 'pending' || !bill.due_date) return 0;
    
    const dueDate = new Date(bill.due_date);
    const currentDate = new Date();
    
    // Only apply fine if current date is past due date
    if (currentDate <= dueDate) return 0;
    
    const totalBill = parseFloat(bill.total_current_bills) || 0;
    return totalBill * (finePercentage / 100);
  };

  // Calculate total bill with fine
  const getTotalWithFine = (bill) => {
    const currentBill = parseFloat(bill.total_current_bills) || 0;
    const fine = calculateFine(bill);
    return currentBill + fine;
  };

  // Get paid amount from API
  const getPaidAmount = (bill) => {
    if (bill.bill_status === 'paid') {
      return parseFloat(bill.total_current_bills) || 0;
    } else if (bill.bill_status === 'partially') {
      const totalBill = parseFloat(bill.total_current_bills) || 0;
      const balance = parseFloat(bill.balance) || 0;
      return totalBill - balance;
    }
    return 0;
  };

  // Get display name based on user role and available data
  const getDisplayName = (bill) => {
    const userRole = localStorage.getItem('userRole');
    
    if (userRole === 'owner') {
      // For owner login, prioritize owner details
      return bill.owner_details?.owner_name || 
             bill.owner_name || 
             bill.name_id;
    } else if (userRole === 'renter') {
      // For tenant login, prioritize tenant details
      return bill.tenant_details?.tenant_name || 
             bill.tenant_name || 
             bill.name_id;
    }
    
    // Fallback to name_id
    return bill.name_id;
  };

  // Get display profile picture based on user role
  const getDisplayProfilePicture = (bill) => {
    const userRole = localStorage.getItem('userRole');
    
    if (userRole === 'owner') {
      return bill.owner_details?.owner_profile_picture;
    } else if (userRole === 'renter') {
      return bill.tenant_details?.tenant_profile_picture;
    }
    
    return null;
  };

  // Get user billing data with static data
  const fetchBillingData = useCallback(async () => {
    try {
      setLoading(true);

      // Static billing data
      const staticBillingData = [
        {
          id: 1,
          name_id: "John Doe",
          month: 1,
          year: 2025,
          bill_status: "paid",
          arrears: 0,
          total_current_bills: 5000,
          balance: 0,
          rebate_adjustment: 0,
          monthly_rent: 25000,
          issue_date: "2025-01-01",
          due_date: "2025-01-15",
          created_at: "2025-01-01T00:00:00Z",
          assigned_to: "Admin",
          block_name: { block_name: "Block A" },
          property_number: "A-101",
          payments_collection_mode: "Monthly",
          owner_details: {
            owner_name: "John Doe",
            owner_phone_number: "+92-300-1234567",
            owner_email: "john.doe@example.com",
            owner_cnic: "12345-6789012-3",
            owner_address: "123 Main Street, Karachi",
            owner_city: "Karachi",
            owner_country: "Pakistan",
            owner_profile_picture: null
          },
          bills_fields: {
            maintenance_charges: 2000,
            water_charges: 800,
            electricity_charges: 1200,
            security_charges: 1000
          }
        },
        {
          id: 2,
          name_id: "John Doe",
          month: 2,
          year: 2025,
          bill_status: "paid",
          arrears: 0,
          total_current_bills: 5200,
          balance: 0,
          rebate_adjustment: 0,
          monthly_rent: 25000,
          issue_date: "2025-02-01",
          due_date: "2025-02-15",
          created_at: "2025-02-01T00:00:00Z",
          assigned_to: "Admin",
          block_name: { block_name: "Block A" },
          property_number: "A-101",
          payments_collection_mode: "Monthly",
          owner_details: {
            owner_name: "John Doe",
            owner_phone_number: "+92-300-1234567",
            owner_email: "john.doe@example.com",
            owner_cnic: "12345-6789012-3",
            owner_address: "123 Main Street, Karachi",
            owner_city: "Karachi",
            owner_country: "Pakistan",
            owner_profile_picture: null
          },
          bills_fields: {
            maintenance_charges: 2000,
            water_charges: 1000,
            electricity_charges: 1200,
            security_charges: 1000
          }
        },
        {
          id: 3,
          name_id: "John Doe",
          month: 3,
          year: 2025,
          bill_status: "pending",
          arrears: 0,
          total_current_bills: 4800,
          balance: 4800,
          rebate_adjustment: 0,
          monthly_rent: 25000,
          issue_date: "2025-03-01",
          due_date: "2025-03-15",
          created_at: "2025-03-01T00:00:00Z",
          assigned_to: "Unassigned",
          block_name: { block_name: "Block A" },
          property_number: "A-101",
          payments_collection_mode: "Monthly",
          owner_details: {
            owner_name: "John Doe",
            owner_phone_number: "+92-300-1234567",
            owner_email: "john.doe@example.com",
            owner_cnic: "12345-6789012-3",
            owner_address: "123 Main Street, Karachi",
            owner_city: "Karachi",
            owner_country: "Pakistan",
            owner_profile_picture: null
          },
          bills_fields: {
            maintenance_charges: 2000,
            water_charges: 800,
            electricity_charges: 1000,
            security_charges: 1000
          }
        },
        {
          id: 4,
          name_id: "John Doe",
          month: 4,
          year: 2025,
          bill_status: "partially",
          arrears: 0,
          total_current_bills: 5100,
          balance: 2550,
          rebate_adjustment: 0,
          monthly_rent: 25000,
          issue_date: "2025-04-01",
          due_date: "2025-04-15", 
          created_at: "2025-04-01T00:00:00Z",
          assigned_to: "Finance Team",
          block_name: { block_name: "Block A" },
          property_number: "A-101",
          payments_collection_mode: "Monthly",
          owner_details: {
            owner_name: "John Doe",
            owner_phone_number: "+92-300-1234567",
            owner_email: "john.doe@example.com",
            owner_cnic: "12345-6789012-3",
            owner_address: "123 Main Street, Karachi",
            owner_city: "Karachi",
            owner_country: "Pakistan",
            owner_profile_picture: null
          },
          bills_fields: {
            maintenance_charges: 2100,
            water_charges: 900,
            electricity_charges: 1100,
            security_charges: 1000
          }
        }
      ];

      setBillingData(staticBillingData);
      setError(null);

    } catch (error) {
      console.error("Error setting static billing data:", error);
      setError("Failed to load billing data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  // Sorting logic
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <FaSort className="text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? 
      <FaSortUp className="text-blue-600" /> : 
      <FaSortDown className="text-blue-600" />;
  };

  // Filter and sort data
  const filteredData = billingData.filter(bill =>
    getMonthName(bill.month).toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.year.toString().includes(searchTerm) ||
    bill.bill_status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bill.block_name?.block_name || bill.block_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bill.property_number || '').toString().includes(searchTerm) ||
    (bill.name_id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBills = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const handleViewDetails = (bill) => {
    setSelectedBill(bill);
    setIsViewModalOpen(true);
  };

  const handleDownloadReceipt = async (bill) => {
    if (bill.bill_status === 'paid' || bill.bill_status === 'partially') {
      try {
        // Create receipt data structure
        const receiptData = {
          id: bill.id,
          paymentId: bill.payment_id || bill.id,
          customerName: bill.name_id,
          propertyNumber: bill.property_number,
          blockName: bill.block_name?.block_name || bill.block_name,
          month: getMonthName(bill.month),
          year: bill.year,
          currentBill: bill.total_current_bills,
          paidAmount: getPaidAmount(bill),
          balance: bill.balance || 0,
          receiptDate: new Date().toLocaleDateString(),
          status: bill.bill_status,
          arrears: bill.arrears || 0,
          fine: calculateFine(bill),
          totalAmount: getTotalWithFine(bill)
        };
        
        // Set the payment ID for the receipt modal
        setSelectedPaymentId(bill.id);
        
        // Generate and download the receipt
        console.log('Generating receipt for:', receiptData);
        
        // You can implement actual PDF generation here
        // For now, we'll just show success message
        alert(`Receipt generated for ${bill.name_id} - ${getMonthName(bill.month)} ${bill.year}`);
        
      } catch (error) {
        console.error('Error generating receipt:', error);
        alert('Error generating receipt. Please try again.');
      }
    } else {
      alert('Receipt can only be generated for paid or partially paid bills.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#016F28]"></div>
      </div>
    );
  }

  return (
    <div className="py-5">
      <div className='flex justify-between mb-4 items-center'> 
        <h1 className="text-2xl font-bold">Billing Details</h1>
        <button 
          onClick={fetchBillingData}
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <FaRedo /> Refresh
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by month, year, status, block, property, or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Billing Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-gray-600 bg-white border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="border text-start px-4 py-2 whitespace-nowrap">#</th>
              <th className="border text-start px-4 py-2 whitespace-nowrap">Profile Image</th>
              <th className="border text-start px-4 py-2 whitespace-nowrap">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('name_id')}>
                  <span>Name</span>
                  <span className="ml-1">{getSortIcon('name_id')}</span>
                </div>
              </th>
              <th className="border text-start px-4 py-2 whitespace-nowrap">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('month')}>
                  <span>Bill Month</span>
                  <span className="ml-1">{getSortIcon('month')}</span>
                </div>
              </th>
              <th className="border text-start px-4 py-2 whitespace-nowrap">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('year')}>
                  <span>Bill Year</span>
                  <span className="ml-1">{getSortIcon('year')}</span>
                </div>
              </th>
              <th className="border text-start px-4 py-2 whitespace-nowrap">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('bill_status')}>
                  <span>Status</span>
                  <span className="ml-1">{getSortIcon('bill_status')}</span>
                </div>
              </th>
              <th className="border text-start px-4 py-2 whitespace-nowrap">Arrears</th>
              <th className="border text-start px-4 py-2 whitespace-nowrap">Current Bill</th>
              <th className="border text-start px-4 py-2 whitespace-nowrap">LPS</th>
              <th className="border text-start px-4 py-2 whitespace-nowrap">Total Bill</th>
              <th className="border text-start px-4 py-2 whitespace-nowrap">Paid Amount</th>
              <th className="border text-start px-4 py-2 whitespace-nowrap">Rebate/Adj</th>
              <th className="border text-start px-4 py-2 whitespace-nowrap">Balance</th>
              <th className="border text-start px-4 py-2 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentBills.length > 0 ? (
              currentBills.map((bill, index) => (
                <tr key={bill.id || index}>
                  <td className="border px-4 py-2">{indexOfFirstItem + index + 1}</td>
                  <td className="border px-4 py-2">
                    <div className="flex justify-center">
                      {getDisplayProfilePicture(bill) ? (
                        <img 
                          src={getDisplayProfilePicture(bill)} 
                          alt="Profile" 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">👤</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="border px-4 py-2">{getDisplayName(bill)}</td>
                  <td className="border px-4 py-2">{getMonthName(bill.month)}</td>
                  <td className="border px-4 py-2">{bill.year}</td>
                  <td className="border px-4 py-2">
                    {bill.bill_status === 'paid' ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Paid</span>
                    ) : bill.bill_status === 'partially' ? (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Partial</span>
                    ) : (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Pending</span>
                    )}
                  </td>
                  <td className="border px-4 py-2">Rs {bill.arrears || 0}</td>
                  <td className="border px-4 py-2">Rs {bill.total_current_bills}</td>
                  <td className="border px-4 py-2">
                    {bill.bill_status !== 'paid' ? (
                      `Rs ${calculateFine(bill).toFixed(2)}`
                    ) : (
                      'Rs 0.00'
                    )}
                  </td>
                  <td className="border px-4 py-2">Rs {getTotalWithFine(bill).toFixed(2)}</td>
                  <td className="border px-4 py-2">Rs {getPaidAmount(bill).toFixed(2)}</td>
                  <td className="border px-4 py-2">Rs {bill.rebate_adjustment || 0}</td>
                  <td className="border px-4 py-2">Rs {bill.balance || 0}</td>
                  <td className="border px-4 py-2">
                    <div className="flex gap-2 justify-center">
                      <FaEye
                        className="text-blue-600 cursor-pointer"
                        title="View Details"
                        onClick={() => handleViewDetails(bill)}
                      />
                      {(bill.bill_status === 'paid' || bill.bill_status === 'partially') && (
                        <FaReceipt
                          className="text-green-600 cursor-pointer"
                          title="Download Receipt"
                          onClick={() => handleDownloadReceipt(bill)}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border px-4 py-2 text-center" colSpan="14">
                  <div className="py-8">
                    <p className="text-gray-500 text-lg mb-2">No billing records found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {sortedData.length > itemsPerPage && (
        <div className="flex justify-center mt-4">
          <nav className="inline-flex rounded-md shadow">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm font-medium ${
                  currentPage === page
                    ? 'bg-green-700 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-300 ${page === 1 ? 'rounded-l-md' : ''} ${
                  page === totalPages ? 'rounded-r-md' : ''
                }`}
              >
                {page}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* View Details Modal */}
      {isViewModalOpen && selectedBill && (
        <Modal isVisible={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
          <h2 className="text-xl mb-4">Comprehensive Bill Details</h2>
          <div className="space-y-4">
            
            {/* Property Information */}
            <div className="bg-gray-50 p-3 rounded">
              <h3 className="font-semibold text-lg mb-2">Property Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><strong>Block Name:</strong> {selectedBill.block_name?.block_name || selectedBill.block_name}</p>
                <p><strong>Property Number:</strong> {selectedBill.property_number}</p>
                <p><strong>Collection Mode:</strong> {selectedBill.payments_collection_mode || 'N/A'}</p>
              </div>
            </div>

            {/* Role-Based User Details */}
            <div className="bg-blue-50 p-3 rounded">
              <h3 className="font-semibold text-lg mb-2">
                {localStorage.getItem('userRole') === 'owner' ? 'Owner Details' : 'Tenant Details'}
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  localStorage.getItem('userRole') === 'owner' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {localStorage.getItem('userRole') === 'owner' ? 'Owner' : 'Tenant'}
                </span>
              </h3>
              
              {/* Show Owner Details if user is owner */}
              {localStorage.getItem('userRole') === 'owner' && selectedBill.owner_details && (
                <div className="mb-4">
                  <h4 className="font-medium text-blue-700 mb-2">Owner Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p><strong>Primary Owner:</strong> {selectedBill.owner_details.owner_name}</p>
                      {selectedBill.owner_details.secondary_owner && (
                        <p><strong>Secondary Owner:</strong> {selectedBill.owner_details.secondary_owner}</p>
                      )}
                      {selectedBill.owner_details.third_owner && (
                        <p><strong>Third Owner:</strong> {selectedBill.owner_details.third_owner}</p>
                      )}
                      {selectedBill.owner_details.owner_guardian_name && (
                        <p><strong>Guardian Name:</strong> {selectedBill.owner_details.owner_guardian_name}</p>
                      )}
                      <p><strong>Phone:</strong> {selectedBill.owner_details.owner_phone_number}</p>
                      <p><strong>Email:</strong> {selectedBill.owner_details.owner_email || '-'}</p>
                    </div>
                    <div>
                      <p><strong>CNIC:</strong> {selectedBill.owner_details.owner_cnic}</p>
                      <p><strong>Address:</strong> {selectedBill.owner_details.owner_address}</p>
                      <p><strong>City:</strong> {selectedBill.owner_details.owner_city || '-'}</p>
                      <p><strong>Country:</strong> {selectedBill.owner_details.owner_country || '-'}</p>
                      {selectedBill.owner_details.owner_membership_number && (
                        <p><strong>Membership Number:</strong> {selectedBill.owner_details.owner_membership_number}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Show Tenant Details if user is tenant */}
              {localStorage.getItem('userRole') === 'renter' && selectedBill.tenant_details && (
                <div className="mb-4">
                  <h4 className="font-medium text-purple-700 mb-2">Tenant Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p><strong>Tenant Name:</strong> {selectedBill.tenant_details.tenant_name}</p>
                      <p><strong>Phone:</strong> {selectedBill.tenant_details.tenant_phone_number}</p>
                      <p><strong>Email:</strong> {selectedBill.tenant_details.tenant_email || '-'}</p>
                    </div>
                    <div>
                      <p><strong>CNIC:</strong> {selectedBill.tenant_details.tenant_cnic}</p>
                      <p><strong>Address:</strong> {selectedBill.tenant_details.tenant_address}</p>
                      <p><strong>City:</strong> {selectedBill.tenant_details.tenant_city || '-'}</p>
                      <p><strong>Country:</strong> {selectedBill.tenant_details.tenant_country || '-'}</p>
                      {selectedBill.tenant_details.tenant_monthly_rent && (
                        <p><strong>Monthly Rent:</strong> Rs {selectedBill.tenant_details.tenant_monthly_rent}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Show basic info if no detailed data available */}
              {((localStorage.getItem('userRole') === 'owner' && !selectedBill.owner_details) ||
                (localStorage.getItem('userRole') === 'renter' && !selectedBill.tenant_details)) && (
                <div className="text-sm">
                  <p><strong>Name:</strong> {getDisplayName(selectedBill)}</p>
                  <p className="text-gray-500 mt-2">
                    Detailed {localStorage.getItem('userRole') === 'owner' ? 'owner' : 'tenant'} information not available
                  </p>
                </div>
              )}
            </div>

            {/* Billing Information */}
            <div className="bg-green-50 p-3 rounded">
              <h3 className="font-semibold text-lg mb-2">Billing Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><strong>Month:</strong> {getMonthName(selectedBill.month)} {selectedBill.year}</p>
                <p><strong>Status:</strong> 
                  {selectedBill.bill_status === 'paid' ? (
                    <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Paid</span>
                  ) : selectedBill.bill_status === 'partially' ? (
                    <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Partial</span>
                  ) : (
                    <span className="ml-2 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Pending</span>
                  )}
                </p>
                <p><strong>Issue Date:</strong> {selectedBill.issue_date}</p>
                <p><strong>Due Date:</strong> {selectedBill.due_date}</p>
                <p><strong>Arrears:</strong> Rs {selectedBill.arrears || 0}</p>
                <p><strong>Current Bill:</strong> Rs {selectedBill.total_current_bills}</p>
                <p><strong>Monthly Rent:</strong> Rs {selectedBill.monthly_rent || 0}</p>
                <p><strong>LPS (Late Payment Surcharge):</strong> Rs {calculateFine(selectedBill).toFixed(2)}</p>
                <p><strong>Total Bill:</strong> Rs {getTotalWithFine(selectedBill).toFixed(2)}</p>
                <p><strong>Paid Amount:</strong> Rs {getPaidAmount(selectedBill).toFixed(2)}</p>
                <p><strong>Rebate/Adjustment:</strong> Rs {selectedBill.rebate_adjustment || 0}</p>
                <p><strong>Current Balance:</strong> Rs {selectedBill.balance || 0}</p>
              </div>
            </div>

            {/* Charges Breakdown */}
            {selectedBill.bills_fields && Object.keys(selectedBill.bills_fields).length > 0 && (
              <div className="bg-yellow-50 p-3 rounded">
                <h3 className="font-semibold text-lg mb-2">Charges Breakdown</h3>
                <table className="w-full border-collapse">
                  <tbody>
                    {Object.entries(selectedBill.bills_fields).map(([key, value]) => (
                      <tr key={key} className="border-b">
                        <td className="py-2 pr-4 font-medium">{key.replace(/_/g, ' ').toUpperCase()}</td>
                        <td className="py-2 text-right">Rs {value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Receipt Modal */}
      {selectedPaymentId && (
        <ReceiptModal 
          paymentId={selectedPaymentId} 
          onClose={() => setSelectedPaymentId(null)} 
        />
      )}
    </div>
  );
};

export default BillingDetails;