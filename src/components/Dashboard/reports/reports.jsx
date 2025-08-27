import { useState, useMemo } from 'react';
import { FaPrint, FaSearch, FaRedo, FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import useReports from '../../../hooks/useReports';
import useBlock from '../../../hooks/useBlock';
import useAreaType from '../../../hooks/useAreaType';
import Modal from '../modal';
import { generateReportPdf } from '../../../hooks/generateReportPdf';
import logo from '../../../assets/images/gul-e-daman-logo.png';

const ReportList = () => {
  const {
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
  } = useReports();

  const { blocks, loading: blocksLoading } = useBlock();
  const { areaTypes, loading: areaTypesLoading } = useAreaType();

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  // Memoized sorted reports
  const sortedReports = useMemo(() => {
    if (!Array.isArray(reports) || reports.length === 0) return [];
    if (!sortConfig.key) return reports;

    const sorted = [...reports].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle different data types
      if (sortConfig.key.includes('date')) {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      } else if (typeof aValue === 'string') {
        aValue = aValue?.toLowerCase() || '';
        bValue = bValue?.toLowerCase() || '';
      } else if (typeof aValue === 'number') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [reports, sortConfig]);

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <FaSort className="ml-1 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="ml-1 text-blue-500" />
      : <FaSortDown className="ml-1 text-blue-500" />;
  };

  // Calculate totals for display
  const totals = useMemo(() => {
    if (!Array.isArray(sortedReports) || sortedReports.length === 0) return null;
    
    // Use API totals if available, otherwise calculate from sorted reports
    if (apiTotals) {
      const displayTotals = {
        totalCurrentBills: apiTotals.totalCurrentBillsSum,
        totalBills: apiTotals.totalBillsSum,
        receivedAmount: apiTotals.receivedAmountSum,
        discount: apiTotals.discountSum,
        balance: apiTotals.afterPayBalanceSum
      };
      console.log('=== FRONTEND TOTALS DEBUG ===');
      console.log('API Totals from State:', apiTotals);
      console.log('Display Totals:', displayTotals);
      console.log('Expected from API Response:', {
        totalCurrentBills: 14300.0,
        receivedAmount: 14100.0,
        discount: 0.0,
        balance: 200.0
      });
      return displayTotals;
    }
    
    // Fallback to client-side calculation for filtered/sorted data
    const clientTotals = {
      totalCurrentBills: sortedReports.reduce((sum, report) => sum + (parseFloat(report.total_current_bills) || 0), 0),
      totalBills: sortedReports.reduce((sum, report) => sum + (parseFloat(report.total_bills) || 0), 0),
      receivedAmount: sortedReports.reduce((sum, report) => sum + (parseFloat(report.received_amount) || 0), 0),
      discount: sortedReports.reduce((sum, report) => sum + (parseFloat(report.discount) || 0), 0),
      balance: sortedReports.reduce((sum, report) => sum + (parseFloat(report.after_pay_balance) || 0), 0)
    };
    console.log('Using Client-side Totals:', clientTotals);
    return clientTotals;
  }, [sortedReports, apiTotals]);

  const formatCurrency = (amount) => {
    const formatted = new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount);
    
    // Remove .00 if it's a whole number
    return formatted.replace(/\.00$/, '');
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      partially: 'bg-blue-100 text-blue-800',
      overdue: 'bg-red-100 text-red-800'
    };
    
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    updateFilters({ [name]: value });
  };

  const handleSubmitFilters = (e) => {
    e.preventDefault();
    fetchReports();
  };

  const handleResetFilters = () => {
    resetFilters();
  };

  const handlePrintReport = (report) => {
    generateReportPdf(report);
  };

  const handlePrintAllReports = () => {
    const isPropertySelected = filters?.property_number;
  
    const accountInfo = isPropertySelected
      ? {
          name: sortedReports[0]?.name_id || '-',
          cnic: sortedReports[0]?.cnic || '-',
          contact: sortedReports[0]?.contact || '-',
          email: sortedReports[0]?.email || '-',
          address: sortedReports[0]?.address || '-',
          relationship: sortedReports[0]?.relationship || '-',
          type: sortedReports[0]?.type || 'Utility',
          status: sortedReports[0]?.status || 'RUNNING',
          membership_no: sortedReports[0]?.membership_no || '-',
          property_no: sortedReports[0]?.property_number || '-',
          block_name: sortedReports[0]?.block_name || '-',
          party_type: sortedReports[0]?.party_type || '-',
          tenant_guardian_name: sortedReports[0]?.tenant_guardian_name || '',
          tenant_phone_number: sortedReports[0]?.tenant_phone_number || '',
          tenant_email: sortedReports[0]?.tenant_email || '',
          tenant_cnic: sortedReports[0]?.tenant_cnic || '',
          tenant_address: sortedReports[0]?.tenant_address || '',
        }
      : null;
  
    generateReportPdf(sortedReports, true, accountInfo, apiTotals); // Pass API totals
  };
  

  return (
    <div className="py-5">
      {/* Filters Section */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Filter Reports</h2>
        <form onSubmit={handleSubmitFilters}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Block Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Block</label>
              <select
                name="block_id"
                value={filters.block_id}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                disabled={blocksLoading}
              >
                <option value="">Select Block</option>
                {blocks.map(block => (
                  <option key={block.id} value={block.id}>{block.block_name}</option>
                ))}
              </select>
            </div>
            
            {/* Property Number Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Number</label>
              <select
                name="property_number"
                value={filters.property_number}
                onChange={handleFilterChange}
                disabled={!filters.block_id || propertiesLoading}
                className={`w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-green-500 ${!filters.block_id ? 'bg-gray-100' : ''}`}
              >
                <option value="">Select Property</option>
                {properties.map(property => (
                  <option key={property.property_id} value={property.property_number}>
                    {property.property_number}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Month Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="">Select Month</option>
                {availableMonths.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
            
            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="">Select Year</option>
                {availableYears.map(year => (
                  <option key={year.value} value={year.value}>{year.label}</option>
                ))}
              </select>
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="bill_status"
                value={filters.bill_status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                {billStatusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            {/* Paid Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paid Date Start</label>
              <input
                type="date"
                name="paid_date_start"
                value={filters.paid_date_start}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paid Date End</label>
              <input
                type="date"
                name="paid_date_end"
                value={filters.paid_date_end}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            
            {/* Area Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area Type</label>
              <select
                name="area_type_id"
                value={filters.area_type_id}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                disabled={areaTypesLoading}
              >
                <option value="">All Area Types</option>
                {areaTypes.map(areaType => (
                  <option key={areaType.area_type_id} value={areaType.area_type_id}>
                    {areaType.area_type_name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Party Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Party Type</label>
              <select
                name="party_type"
                value={filters.party_type}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="">All Party Types</option>
                <option value="owner">Owner</option>
                <option value="tenant">Tenant</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4 space-x-3">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 border border-gray-300 rounded-sm bg-white text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <FaRedo className="mr-2" />
              Reset
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-sm hover:bg-green-700 flex items-center"
            >
              <FaSearch className="mr-2" />
              Search
            </button>
          </div>
        </form>
      </div>
      
      {/* Sorting Controls */}
      {hasSearched && !loading && !error && reports.length > 0 && (
        <div className="bg-white p-4 rounded shadow mb-4">
          <h3 className="text-md font-medium mb-3">Sort Reports</h3>
          <div className="text-sm text-gray-600">
            Click on any column header to sort the reports by that field.
          </div>
        </div>
      )}
      
      {/* Reports Listing */}
      {loading && (
        <div className="w-full flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>Error loading reports: {error}</p>
        </div>
      )}
      
      {!hasSearched && !loading && (
        <div className="bg-white rounded shadow p-8 text-center">
          <p className="text-gray-500">Please apply filters to view reports</p>
        </div>
      )}
      
      {hasSearched && !loading && !error && reports.length > 0 && (
        <div className="bg-white rounded shadow overflow-hidden border">
          {/* Header Section - Exact PDF Match */}
          <div className="p-6 bg-white">
            <div className="flex items-center mb-4">
              <div className="w-16 mr-4">
                <img 
                  src={logo} 
                  alt="Logo" 
                  className="w-full h-auto"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-lg font-bold text-black text-center mb-1">
                  Accounts Group Officers Co-operative Housing Society Limited Lahore
                </h1>
                <p className="text-sm text-gray-600 text-center">
                  Regd.No 1174 (Gul-e-Daman) College Road, Lahore. Ph: 042-35140503, E-mail: agochs1174@gmail.com
                </p>
              </div>
              <div className="w-16 flex justify-end">
                <button
                  onClick={handlePrintAllReports}
                  className="px-4 py-2 bg-[#016F28]  text-white rounded flex items-center text-sm"
                >
                  <FaPrint className="mr-1" />
                  Print
                </button>
              </div>
            </div>

            <h2 className="text-center text-black font-semibold mb-5 pb-5 border-b-2 border-black">
              Account Status
            </h2>
            
            {/* Conditional Information Section - Show when property is selected */}
            {sortedReports.length > 0 && filters.property_number && (
              <div className="space-y-4 mb-6">
                {/* Basic Account Information */}
                <div className="border border-gray-300">
                  <div className="bg-[#016F28]  text-white px-4 py-2">
                    <h4 className="font-semibold text-sm">Account Information</h4>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                      {/* Owner Information Section */}
                      <div className="space-y-2 border-r border-gray-200 pr-4">
                        <h5 className="font-semibold text-black text-[16px] border-b border-purple-200 pb-1">Owner Information</h5>
                        <div className="space-y-1">
                          <div>
                            <span className="font-semibold text-black">Name:</span>
                            <span className="ml-2">{sortedReports[0].name_id || '-'}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-black">CNIC:</span>
                            <span className="ml-2">{sortedReports[0].cnic || '-'}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-black">Contact:</span>
                            <span className="ml-2">{sortedReports[0].contact || '-'}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-black">Email:</span>
                            <span className="ml-2">{sortedReports[0].email || '-'}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-black">Address:</span>
                            <span className="ml-2">{sortedReports[0].address || '-'}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Property & Account Details Section */}
                      <div className="space-y-2 border-r border-gray-200 pr-4">
                        <h5 className="font-semibold text-black text-[16px] border-b border-purple-200 pb-1">Property & Account Details</h5>
                        <div className="space-y-1">
                          <div>
                            <span className="font-semibold text-black">Party Type:</span>
                            <span className="ml-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${sortedReports[0].party_type?.toLowerCase() === 'owner' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                {sortedReports[0].party_type || '-'}
                              </span>
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-black">Status:</span>
                            <span className="ml-2 font-medium">RUNNING</span>
                          </div>
                          <div>
                            <span className="font-semibold text-black">Membership No:</span>
                            <span className="ml-2">{sortedReports[0].membership_no || '-'}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-black">Property/Block:</span>
                            <span className="ml-2">{sortedReports[0].property_number || '-'} - {sortedReports[0].block_name || '-'}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-black">Relationship:</span>
                            <span className="ml-2">{sortedReports[0].relationship || '-'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Tenant Information Section */}
                      <div className="space-y-3">
                        <h5 className="font-semibold text-black text-[16px] border-b border-purple-200 pb-1">Tenant Information</h5>
                        <div className="space-y-2">
                          {sortedReports[0].party_type?.toLowerCase() !== 'owner' && (sortedReports[0].tenant_guardian_name || sortedReports[0].tenant_phone_number || sortedReports[0].tenant_email || sortedReports[0].tenant_cnic || sortedReports[0].tenant_address) ? (
                            <>
                              {sortedReports[0].tenant_guardian_name && (
                                <div>
                                  <span className="font-semibold text-black">Name:</span>
                                  <span className="ml-2">{sortedReports[0].tenant_guardian_name}</span>
                                </div>
                              )}
                              {sortedReports[0].tenant_phone_number && (
                                <div>
                                  <span className="font-semibold text-black">Phone:</span>
                                  <span className="ml-2">{sortedReports[0].tenant_phone_number}</span>
                                </div>
                              )}
                              {sortedReports[0].tenant_email && (
                                <div>
                                  <span className="font-semibold text-black">Email:</span>
                                  <span className="ml-2">{sortedReports[0].tenant_email}</span>
                                </div>
                              )}
                              {sortedReports[0].tenant_cnic && (
                                <div>
                                  <span className="font-semibold text-black">CNIC:</span>
                                  <span className="ml-2">{sortedReports[0].tenant_cnic}</span>
                                </div>
                              )}
                              {sortedReports[0].tenant_address && (
                                <div>
                                  <span className="font-semibold text-black">Address:</span>
                                  <span className="ml-2">{sortedReports[0].tenant_address}</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <div>
                              <span className="text-black">N/A</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Table Section - Exact PDF Match */}
          <div className="overflow-x-auto bg-white  ml-[1.4rem] mr-[1.4rem] shadow-sm">
            <table className="min-w-full text-xs border-collapse table-fixed" style={{minWidth: '1400px'}}>
              <thead>
                <tr className="bg-[#016F28]  text-white">
                  <th className="border border-gray-300 px-2 py-2 text-left font-medium w-12">#</th>                  
                  <th 
                    className="border border-gray-300 px-3 py-2 text-left font-medium cursor-pointer bg-[#016F28] select-none whitespace-nowrap w-24"
                    onClick={() => handleSort('recept_no')}
                  >
                    <div className="flex items-center">
                      Receipt No
                      {getSortIcon('recept_no')}
                    </div>
                  </th>
                  <th 
                    className="border border-gray-300 px-2 py-2 text-left font-medium cursor-pointer bg-[#016F28] select-none w-32"
                    onClick={() => handleSort('name_id')}
                  >
                    <div className="flex items-center">
                      Name
                      {getSortIcon('name_id')}
                    </div>
                  </th>
                  <th 
                    className="border border-gray-300 px-2 py-2 text-left font-medium cursor-pointer bg-[#016F28]  select-none w-20"
                    onClick={() => handleSort('month')}
                  >
                    <div className="flex items-center">
                      Month/Year
                      {getSortIcon('month')}
                    </div>
                  </th>
                  <th 
                    className="border border-gray-300 px-2 py-2 text-left font-medium cursor-pointer bg-[#016F28] select-none w-32"
                    onClick={() => handleSort('property_number')}
                  >
                    <div className="flex items-center">
                      Property
                      {getSortIcon('property_number')}
                    </div>
                  </th>
                  <th 
                    className="border border-gray-300 px-2 py-2 text-left font-medium cursor-pointer bg-[#016F28] select-none w-40"
                    onClick={() => handleSort('issue_date')}
                  >
                    <div className="flex items-center">
                      Period
                      {getSortIcon('issue_date')}
                    </div>
                  </th>
                  <th 
                    className="border border-gray-300 px-2 py-2 text-left font-medium cursor-pointer bg-[#016F28] select-none w-24"
                    onClick={() => handleSort('total_current_bills')}
                  >
                    <div className="flex items-center">
                      Current
                      {getSortIcon('total_current_bills')}
                    </div>
                  </th>
                  <th 
                    className="border border-gray-300 px-2 py-2 text-left font-medium cursor-pointer bg-[#016F28] select-none w-24"
                    onClick={() => handleSort('total_bills')}
                  >
                    <div className="flex items-center">
                      Total
                      {getSortIcon('total_bills')}
                    </div>
                  </th>
                  <th 
                    className="border border-gray-300 px-2 py-2 text-left font-medium cursor-pointer bg-[#016F28]  select-none w-24"
                    onClick={() => handleSort('received_amount')}
                  >
                    <div className="flex items-center">
                      Received
                      {getSortIcon('received_amount')}
                    </div>
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-left font-medium w-20">Discount</th>
                  <th 
                    className="border border-gray-300 px-2 py-2 text-left font-medium cursor-pointer bg-[#016F28]  select-none w-24"
                    onClick={() => handleSort('after_pay_balance')}
                  >
                    <div className="flex items-center">
                      Balance
                      {getSortIcon('after_pay_balance')}
                    </div>
                  </th>
                  <th 
                    className="border border-gray-300 px-2 py-2 text-left font-medium cursor-pointer bg-[#016F28]  select-none w-20"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-left font-medium w-20">Payment</th>
                  <th className="border border-gray-300 px-2 py-2 text-left font-medium w-24">Reference</th>
                  <th 
                    className="border border-gray-300 px-2 py-2 text-left font-medium cursor-pointer bg-[#016F28] select-none whitespace-nowrap w-24"
                    onClick={() => handleSort('paid_date')}
                  >
                    <div className="flex items-center">
                      Paid Date
                      {getSortIcon('paid_date')}
                    </div>
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-left font-medium w-40">Description</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(sortedReports) && sortedReports.length > 0 ? sortedReports.map((report, index) => (
                  <tr key={index} className={`${index % 2 === 0 ? 'bg-gray-50 ' : 'bg-white'} hover:bg-blue-50`}>
                    <td className="border border-gray-300 px-2 py-2 text-left">{index + 1}</td>
                    <td className="border border-gray-300 px-4 py-2 font-medium text-left">{report.recept_no || '-'}</td>
                    <td className="border border-gray-300 px-2 py-2 text-left">{report.name_id || '-'}</td>
                    <td className="border border-gray-300 px-2 py-2 text-left">{report.month || '-'}/{report.year || '-'}</td>
                    <td className="border border-gray-300 px-2 py-2 text-left">
                      {(report.block_name || '-')} / {(report.property_number || '-')}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-sm text-left">
                      {report.issue_date ? new Date(report.issue_date).toLocaleDateString('en-GB') : '-'} - {report.due_date ? new Date(report.due_date).toLocaleDateString('en-GB') : '-'}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-left font-medium">{formatCurrency(report.total_current_bills || 0)}</td>
                    <td className="border border-gray-300 px-2 py-2 text-left font-medium">{formatCurrency(report.total_bills || 0)}</td>
                    <td className="border border-gray-300 px-2 py-2 text-left font-medium">{formatCurrency(report.received_amount || 0)}</td>
                    <td className="border border-gray-300 px-2 py-2 text-left font-medium">{formatCurrency(report.discount || 0)}</td>
                    <td className="border border-gray-300 px-2 py-2 text-left font-medium">{formatCurrency(report.after_pay_balance || 0)}</td>
                    <td className="border border-gray-300 px-2 py-2 text-left">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(report.status)}`}>
                        {report.status ? report.status.charAt(0).toUpperCase() + report.status.slice(1) : 'N/A'}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-left">{report.payment_by || '-'}</td>
                    <td className="border border-gray-300 px-2 py-2 text-left">{report.reference_no || '-'}</td>                   
                    <td className="border border-gray-300 px-2 py-2 text-left">
                      {report.paid_date ? new Date(report.paid_date).toLocaleDateString('en-GB') : '-'}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 max-w-xs truncate text-left" title={report.description || '-'}>
                      {report.description || '-'}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="22" className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                      No reports available
                    </td>
                  </tr>
                )}
              </tbody>
              
              {/* Totals Row - Exact PDF Match */}
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td colSpan="6" className="border border-gray-300 px-2 py-2 text-right">Totals:</td>
                  <td className="border border-gray-300 px-2 py-2 text-left">{formatCurrency(totals?.totalCurrentBills || 0)}</td>
                  <td className="border border-gray-300 px-2 py-2 text-left">{formatCurrency(totals?.totalBills || 0)}</td>
                  <td className="border border-gray-300 px-2 py-2 text-left">{formatCurrency(totals?.receivedAmount || 0)}</td>
                  <td className="border border-gray-300 px-2 py-2 text-left">{formatCurrency(totals?.discount || 0)}</td>
                  <td className="border border-gray-300 px-2 py-2 text-left">{formatCurrency(totals?.balance || 0)}</td>
                  <td colSpan="5" className="border border-gray-300 px-2 py-2 text-left"></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {/* Footer Section - Exact PDF Match */}
          <div className="p-6 text-center text-xs text-gray-600 bg-white border-t">
            <p>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
            <p className="mt-1">Accounts Group Officers Co-operative Housing Society Limited Lahore</p>
          </div>
        </div>
      )}
      
      {hasSearched && !loading && !error && reports.length === 0 && (
        <div className="bg-white rounded shadow p-8 text-center">
          <p className="text-gray-500">No reports found matching your filters</p>
        </div>
      )}
      
      {/* View Report Modal */}
      {isViewModalOpen && selectedReport && (
        <Modal isVisible={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
          <h2 className="text-xl mb-4">Report Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {selectedReport.party_type?.toLowerCase() === 'owner' ? 'Owner' : 'Tenant'}
                </p>
                <p className="font-semibold">{selectedReport.name_id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Month/Year</p>
                <p className="font-semibold">{selectedReport.month}/{selectedReport.year}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Block/Property</p>
                <p className="font-semibold">{selectedReport.block_name} / {selectedReport.property_number}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Bill Period</p>
                <p className="font-semibold">
                  {new Date(selectedReport.issue_date).toLocaleDateString()} - {new Date(selectedReport.due_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Charges Breakdown</h3>
              <div className="bg-gray-50 p-3 rounded">
                {selectedReport.bills_fields && Object.entries(selectedReport.bills_fields).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-1 border-b last:border-b-0">
                    <span className="text-gray-600">{key.replace(/_/g, ' ')}</span>
                    <span className="font-medium">{formatCurrency(value)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Current Bills</p>
                <p className="font-semibold">{formatCurrency(selectedReport.total_current_bills)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Bills</p>
                <p className="font-semibold">{formatCurrency(selectedReport.total_bills)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Received Amount</p>
                <p className="font-semibold">{formatCurrency(selectedReport.received_amount)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Discount</p>
                <p className="font-semibold">{formatCurrency(selectedReport.discount)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Balance</p>
                <p className={`font-semibold ${
                  selectedReport.after_pay_balance > 0 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {formatCurrency(selectedReport.after_pay_balance)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <div className="mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedReport.status)}`}>
                    {selectedReport.status ? selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Payment Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Method</p>
                  <p className="font-semibold">{selectedReport.payment_by}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Reference No</p>
                  <p className="font-semibold">{selectedReport.reference_no || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Receipt No</p>
                  <p className="font-semibold">{selectedReport.recept_no}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Paid Date</p>
                  <p className="font-semibold">
                    {selectedReport.paid_date ? new Date(selectedReport.paid_date).toLocaleDateString('en-GB') : '-'}
                  </p>
                </div>
              </div>
            </div>
            
            {selectedReport.description && (
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-gray-700">{selectedReport.description}</p>
              </div>
            )}
            
            {/* Tenant Information Section - Only show for non-owners */}
            {selectedReport.party_type?.toLowerCase() !== 'owner' && (selectedReport.tenant_guardian_name || selectedReport.tenant_phone_number || selectedReport.tenant_email || selectedReport.tenant_cnic || selectedReport.tenant_address) && (
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Tenant Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedReport.tenant_guardian_name && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Guardian Name</p>
                      <p className="font-semibold">{selectedReport.tenant_guardian_name}</p>
                    </div>
                  )}
                  {selectedReport.tenant_phone_number && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone Number</p>
                      <p className="font-semibold">{selectedReport.tenant_phone_number}</p>
                    </div>
                  )}
                  {selectedReport.tenant_email && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="font-semibold">{selectedReport.tenant_email}</p>
                    </div>
                  )}
                  {selectedReport.tenant_cnic && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">CNIC</p>
                      <p className="font-semibold">{selectedReport.tenant_cnic}</p>
                    </div>
                  )}
                  {selectedReport.tenant_address && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <p className="font-semibold">{selectedReport.tenant_address}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex justify-end pt-4">
              <button
                onClick={() => handlePrintReport(selectedReport)}
                className="px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 flex items-center"
              >
                <FaPrint className="mr-2" />
                Print Report
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ReportList;