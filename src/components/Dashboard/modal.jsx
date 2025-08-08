import React from 'react'
import { ImCross } from "react-icons/im";


const Modal = ({ isVisible, onClose, children }) => {
    if (!isVisible) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 ">
        <div className="bg-white relative p-4 rounded-md shadow-lg w-full max-w-lg max-h-[80vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute !block top-0 right-0 mt-4 mr-4 text-black text-sm"
          >
            <ImCross />
          </button>
          {children}
        </div>
      </div>
    );
  };
  

export default Modal

