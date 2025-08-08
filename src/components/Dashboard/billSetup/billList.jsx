import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BillList = () => {
  const [bills, setBills] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/bills-setup/');
        setBills(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching bills:', err);
        setError('Failed to load bills. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-500">Loading bills...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Submitted Bills</h1>
      {bills.length === 0 ? (
        <p className="text-gray-500">No bills have been submitted yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bills.map((bill) => (
            <div
              key={bill.id}
              className="border border-gray-300 rounded-sm p-4 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Property Number: {bill.property_number}
              </h2>
              <p>
                <strong>Property Type:</strong> {bill.property_type_name?.property_name}
              </p>
              <p>
                <strong>Property Area:</strong> {bill.property_area?.area_type_name}
              </p>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-800">Charges</h3>
                {bill.charges && Object.keys(bill.charges).length > 0 ? (
                  <ul className="list-disc pl-5 text-gray-700">
                    {Object.entries(bill.charges).map(([label, value]) => (
                      <li key={label}>
                        {label}:{value.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No charges added.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BillList;
