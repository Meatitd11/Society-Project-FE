import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { setMonth, setYear } from 'date-fns';
import { toast } from 'react-toastify';
import usePayments from '../../../hooks/usePayment';

const AddPayments = () => {
  const {
    paymentData,
    properties,
    charges,
    totalCurrentBills,
    blocks,
    forms,
    loading,
    balance,
    monthlyRent,
    handleChange,
    handleFormChange,
    handleChargesChange,
    handleMonthYearChange,
    handleSubmit
  } = usePayments();

  return (
    <div className="p-5">  
       <h1 className="text-2xl font-bold mb-5">Add Payment</h1>    
      <form onSubmit={handleSubmit} >
        <div className="grid md:grid-cols-2 gap-2">
          {/* Form Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Form</label>
            <select
              name="form"
              value={paymentData.form}
              onChange={handleFormChange}
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

          {/* Collection Mode */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Collection Mode</label>
            <select
              name="payments_collection_mode"
              value={paymentData.payments_collection_mode}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            >
              <option value="">Select Mode</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="half_year">Half Year</option>
            </select>
          </div>

          {/* Block Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Block</label>
            <select
              name="block_name"
              value={paymentData.block_name}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            >
              <option value="">Select Block</option>
              {blocks.map((block) => (
                <option key={block.id} value={block.id}>
                  {block.block_name}
                </option>
              ))}
            </select>
          </div>

          {/* Property Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Property</label>
            <select
              name="property_number"
              value={paymentData.property_number}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            >
              <option value="">Select Property</option>
              {properties.map((property) => (
                <option key={property.id} value={property.property_number}>
                  {property.property_number}
                </option>
              ))}
            </select>
          </div>

          {/* Name ID */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              name="name_id"
              value={paymentData.name_id}
              readOnly
              className="w-full text-sm px-4 py-2 border border-gray-300 bg-gray-100 rounded-sm focus:ring-0 focus:outline-none"
            />
          </div>

          {/* Month/Year Picker */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Month/Year</label>
            <DatePicker
              selected={
                paymentData.year && paymentData.month
                  ? setMonth(setYear(new Date(), paymentData.year), paymentData.month - 1)
                  : null
              }
              onChange={handleMonthYearChange}
              showMonthYearPicker
              dateFormat="MM-yyyy"
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
              placeholderText="Select Month and Year"
            />
          </div>

          {/* Balance */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Balance</label>
            <input
              type="number"
              value={balance}
              readOnly
              className="w-full text-sm px-4 py-2 border border-gray-300 bg-gray-100 rounded-sm focus:ring-0 focus:outline-none"
            />
          </div>

          {/* Issue Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
            <input
              type="date"
              name="issue_date"
              value={paymentData.issue_date}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>

          {/* Due Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
            <input
              type="date"
              name="due_date"
              value={paymentData.due_date}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
        </div>

       
<div className="mb-6">
  <h2 className="text-lg font-semibold text-gray-800 mb-3">Charges</h2>
  {Object.keys(charges).length > 0 ? (
    <div className="grid md:grid-cols-2 gap-4">
      {Object.entries(charges).map(([fieldName, value]) => (
        <div key={fieldName} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {fieldName.split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </label>
          <input
            type="number"
            name={fieldName}
            value={value || ''}
            onChange={handleChargesChange}
            className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
          />
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-500 text-sm">No charges available for this property</p>
  )}
</div>

        <div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rent</label>
  <input
  type="number"
  name="monthly_rent"
  value={paymentData.monthly_rent}
  onChange={handleChange}
  readOnly
  className="w-full text-sm px-4 py-2 border border-gray-300 bg-gray-100 rounded-sm focus:ring-0 focus:outline-none"
/>

</div>

        {/* Total Current Bills */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Total Current Bills</label>
          <input
            type="number"
            name="total_current_bills"
            value={totalCurrentBills}
            readOnly
            className="w-full text-sm px-4 py-2 border border-gray-300 bg-gray-100 rounded-sm focus:ring-0 focus:outline-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Add Payment Collection'}
        </button>
      </form>
    </div>
  );
};

export default AddPayments;