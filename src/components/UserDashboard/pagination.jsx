import React from 'react'
// components/common/Pagination.jsx
const Pagination = ({ currentPage, totalPages, paginate }) => {
    return (
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
    );
  };
  
  export default Pagination;
