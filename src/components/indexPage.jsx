import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const IndexPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if the current path matches admin codes
    const currentPath = location.pathname;
    
    if (currentPath === '/admin098#' || currentPath === '/superAdmin032#') {
      // If user navigated directly to these URLs, redirect to login
      navigate('/login');
    }
  }, [location.pathname, navigate]);

  return (
    <div className='authentication min-h-screen flex flex-col justify-center items-center'>
      <div className="text-center mt-[2rem]">
        <h1 className='text-white text-5xl mb-6 font-bold'>گلِ دامن سوسائٹی</h1>
        <h2 className='text-white text-2xl mb-8'>مینجمنٹ اکاؤنٹ گروپ آفیسر کوآپریٹو سوسائٹی</h2>
      </div>
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20">
        <div className="p-8">
          <div className="text-center mb-8">
            <h3 className="text-white text-2xl font-semibold mb-4">Management Portal</h3>
            <div className="w-20 h-1 bg-green-500 mx-auto rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-white/10 rounded-lg">
              <div className="text-green-400 text-3xl mb-3">🏢</div>
              <h4 className="text-white font-medium mb-2">Property Management</h4>
            
            </div>
            <div className="text-center p-6 bg-white/10 rounded-lg">
              <div className="text-blue-400 text-3xl mb-3">💰</div>
              <h4 className="text-white font-medium mb-2">Financial Management</h4>
              <p className="text-white/80 text-sm">Handle payments, bills, and financial reports</p>
            </div>
            
            <div className="text-center p-6 bg-white/10 rounded-lg">
              <div className="text-purple-400 text-3xl mb-3">👥</div>
              <h4 className="text-white font-medium mb-2">Resident Management</h4>
              <p className="text-white/80 text-sm">Manage owners, tenants, and committees</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* <button
              onClick={() => navigate('/admin098')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 font-medium"
            >
              Admin Login
            </button> */}
            <button
              onClick={() => navigate('/user-login')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg  transition-colors duration-300 font-medium"
            >
              Owner Login
            </button>
             <button
              onClick={() => navigate('/user-login')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg  transition-colors duration-300 font-medium"
            >
              Tenant Login
            </button>
          </div>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className="text-white/60 text-sm">
          © 2025 Gul-e-Daman Society Management System. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default IndexPage;
