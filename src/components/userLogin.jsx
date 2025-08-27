import { useState } from 'react';
import useAuth from '../hooks/useAuth'; 
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const UserLogin = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const { login, loading, error } = useAuth(); 
  const navigate = useNavigate();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    
    console.log('Login attempt with:', { phone, password, role });
    
    try {
      const data = await login(phone, password, role);
      console.log('User login successful:', data);
      
      // Navigate based on role selection - only owner and renter allowed
      if (role === 'owner' || role === 'renter') {
        console.log(`${role} login successful, navigating to user dashboard`);
        
        // Store user role in localStorage for use in components
        localStorage.setItem('userRole', role);
        localStorage.setItem('userPhone', phone);
        
        toast.success(`login successful`);
        navigate('/user-dashboard');
      } else {
        console.error('Unauthorized role for user dashboard access:', role);
        // Don't navigate - stay on login page for unauthorized roles
      }
    } catch (err) {
      console.error('User login failed:', err.message);
      // Error is already set in the useAuth hook
    }
  };

  return (
    <div className='authentication min-h-screen flex flex-col justify-center items-center'>
      <h1 className='text-white text-3xl mb-4'>گلِ دامن سوسائٹی</h1>
      <h2 className='text-white text-xl mb-4'>مینجمنٹ اکاؤنٹ گروپ آفیسر کوآپریٹو سوسائٹی</h2>
      <div className="w-full max-w-sm bg-white rounded-md border border-white">
        <div className='bg-green-700 p-3 rounded-t-md'>
          <h5 className="font-medium text-white">Enter Login Details</h5>
        </div>

        <form onSubmit={handleLogin} className='p-5'>
          <div className="mb-6">
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-md focus:ring-0 focus:outline-none focus:border-green-700">
              <option value="" disabled>Select your role</option>
              <option value="owner">Owner</option>
              <option value="renter">Tenant </option>
            </select>
          </div>
          
          <div className="mb-4">
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="Your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-md focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>

          <div className="mb-4">
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-md focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-600 transition-colors duration-300"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative" role="alert">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UserLogin;
