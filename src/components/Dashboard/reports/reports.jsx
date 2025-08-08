import React, { useState } from 'react';
import { FaEye, FaPrint, FaSearch, FaRedo, FaFilePdf } from 'react-icons/fa';
import useReports from '../../../hooks/useReports';
import useBlock from '../../../hooks/useBlock';
import useAreaType from '../../../hooks/useAreaType';
import Modal from '../modal';
import { generateReportPdf } from '../../../hooks/generateReportPdf';

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
    propertiesLoading
  } = useReports();

  const { blocks, loading: blocksLoading } = useBlock();
  const { areaTypes, loading: areaTypesLoading } = useAreaType();

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      partially: 'bg-blue-100 text-blue-800',
      overdue: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
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

  const handleOpenViewModal = (report) => {
    setSelectedReport(report);
    setIsViewModalOpen(true);
  };

  const handlePrintReport = (report) => {
    generateReportPdf(report);
  };

  const handlePrintAllReports = () => {
    const isPropertySelected = filters?.property_number;
  
    const accountInfo = isPropertySelected
      ? {
          name: reports[0]?.name_id || '-',
          cnic: reports[0]?.cnic || '-',
          contact: reports[0]?.contact || '-',
          relationship: reports[0]?.relationship || '-',
          type: reports[0]?.type || 'Utility',
          status: reports[0]?.status || 'RUNNING',
          membership_no: reports[0]?.membership_no || '-',
          property_no: reports[0]?.property_number || '-',
          block_name: reports[0]?.block_name || '-',
        }
      : null;
  
    generateReportPdf(reports, true, accountInfo); // Pass isMultiple = true
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
        <div className="bg-white rounded shadow overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">Reports</h2>
            <button
              onClick={handlePrintAllReports}
              className="px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 flex items-center"
            >
              <FaPrint className="mr-2" />
              Print All Reports
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-600">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">#</th>                  
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Receipt No</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Month/Year</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Block/Property</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Bill Period</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Total Current</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Total Bills</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Received</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Discount</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Balance</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Payment Method</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Reference No</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Paid Date</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Description</th>
                 
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((report, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">{report.recept_no || '-'}</td>
                    <td className="px-6 py-4">{report.name_id || '-'}</td>
                    <td className="px-6 py-4">{report.month}/{report.year}</td>
                    <td className="px-6 py-4">
                      {report.block_name} / {report.property_number}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(report.issue_date).toLocaleDateString()} - {new Date(report.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">{formatCurrency(report.total_current_bills)}</td>
                    <td className="px-6 py-4">{formatCurrency(report.total_bills)}</td>
                    <td className="px-6 py-4">{formatCurrency(report.received_amount)}</td>
                    <td className="px-6 py-4">{formatCurrency(report.discount || '-')}</td>
                    <td className="px-6 py-4">{formatCurrency(report.after_pay_balance || '-')}</td>
                    <td className="px-6 py-4">{getStatusBadge(report.status || '-')}</td>
                    <td className="px-6 py-4">{report.payment_by || '-'}</td>
                    <td className="px-6 py-4">{report.reference_no || '-'}</td>                   
                    <td className="px-6 py-4">
                      {report.paid_date ? new Date(report.paid_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4">{report.description || '-'}</td>
                  
                  </tr>
                ))}
              </tbody>
            </table>
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
                <p className="text-sm font-medium text-gray-500">Tenant</p>
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
                <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
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
                    {selectedReport.paid_date ? new Date(selectedReport.paid_date).toLocaleDateString() : '-'}
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