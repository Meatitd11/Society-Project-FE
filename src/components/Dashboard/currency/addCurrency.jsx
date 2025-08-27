// src/components/dashboard/currency/AddCurrency.js
import { useState } from 'react';
import useCurrency from '../../../hooks/useCurrency';
import { useNavigate } from 'react-router-dom';

const AddCurrency = () => {
  const [currencyData, setCurrencyData] = useState({
    name: '',
    symbol: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { addCurrency } = useCurrency();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrencyData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { success, message } = await addCurrency(currencyData);

    if (success) {
      setSuccessMessage(message);    
      setCurrencyData({
        name: '',
        symbol: ''
      });
      setTimeout(() => {
        navigate('/dashboard/currency-list'); 
      }, 1000); 
    } else {
      setErrorMessage(message);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold">Add Currency</h1>
      <form className='py-5' onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Currency Name</label>
          <input
            type="text"
            name="name"
            placeholder="Pak, UK, etc."
            value={currencyData.name}
            onChange={handleChange}
            required
            className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Symbol</label>
          <input
            type="text"
            name="symbol"
            placeholder="Rs, £, etc."
            value={currencyData.symbol}
            onChange={handleChange}
            required
            className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
          />
        </div>
        
        <button
          type="submit"
          className="w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
        >
          Add New Currency
        </button>
      </form>
      
    
    </>
  );
};

export default AddCurrency;