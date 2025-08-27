import { useState } from 'react';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import useComplaint from '../../../hooks/useComplaint';
import Modal from '../modal';
import Pagination from '../pagination';

import { useNavigate } from 'react-router-dom';


const ComplaintList = () => {
  const { complaints, deleteComplaint, editComplaint, loading, error } = useComplaint();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600">Error loading complaints: {error.message}</div>;
  }

  // Calculate pagination
  const totalPages = Math.ceil(complaints.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = complaints.slice(indexOfFirstItem, indexOfLastItem);

  const handleOpenEditModal = (complaint) => {
    setSelectedComplaint(complaint);
    setEditTitle(complaint.title);
    setEditDescription(complaint.description);
    setEditEmail(complaint.email || '');
    setEditStatus(complaint.status);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (complaint) => {
    setSelectedComplaint(complaint);
    setIsDeleteModalOpen(true);
  };

  const handleOpenViewModal = (complaint) => {
    setSelectedComplaint(complaint);
    setIsViewModalOpen(true);
  };

  const handleEditComplaint = async () => {
    if (selectedComplaint) {
      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('description', editDescription);
      formData.append('email', editEmail);
      formData.append('status', editStatus);
      formData.append('user_id', selectedComplaint.user_id);
  
      if (editImage) {
        formData.append('image', editImage);
      }
  
      await editComplaint(selectedComplaint.id, formData);
      setIsEditModalOpen(false);
      setEditImage(null);
    }
  };

  const handleDeleteComplaint = () => {
    if (selectedComplaint) {
      deleteComplaint(selectedComplaint.id);
      setIsDeleteModalOpen(false);
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="py-5">
      <div className='flex justify-between mb-4 items-center'> 
        <h1 className="text-2xl font-bold">All Complaints</h1>
        <button 
          onClick={() => navigate('/user-dashboard/add-complaint')}
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          New Complaint
        </button>
      </div>
      <table className="min-w-full text-sm text-gray-600 bg-white border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="border text-start px-4 py-2">#</th>
            <th className="border text-start px-4 py-2">Title</th>
            <th className="border text-start px-4 py-2">Date</th>
            <th className="border text-start px-4 py-2">Status</th>
            <th className="border text-start px-4 py-2">Assigned Complaint</th>
            <th className="border text-start px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((complaint, index) => (
              <tr key={complaint.id}>
                <td className="border px-4 py-2">{indexOfFirstItem + index + 1}</td>
                <td className="border px-4 py-2">{complaint.title}</td>
                <td className="border px-4 py-2">
                  {complaint.created_at ? new Date(complaint.created_at).toLocaleDateString() : 'N/A'}
                </td>
                <td className="border px-4 py-2 capitalize">{complaint.status}</td>
                <td className="border px-4 py-2">{complaint.assigned_to || 'Unassigned'}</td>
                <td className="border px-4 py-2">
                  <div className="flex gap-2">
                    <FaEye onClick={() => handleOpenViewModal(complaint)} className="cursor-pointer text-green-600" />
                    <FaEdit onClick={() => handleOpenEditModal(complaint)} className="cursor-pointer text-yellow-600" />
                    <FaTrash onClick={() => handleOpenDeleteModal(complaint)} className="cursor-pointer text-red-600" />
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="border px-4 py-2 text-center" colSpan="6">
                No complaints found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {complaints.length > itemsPerPage && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          paginate={paginate}
        />
      )}

      {/* View Modal */}
      <Modal isVisible={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
        <h2 className="text-xl mb-4">Complaint Details</h2>
        <p><strong>Title:</strong> {selectedComplaint?.title}</p>
        <p><strong>Description:</strong> {selectedComplaint?.description}</p>
        <p><strong>Email:</strong> {selectedComplaint?.email}</p>
        <p><strong>Date:</strong> {selectedComplaint?.created_at ? new Date(selectedComplaint.created_at).toLocaleDateString() : 'N/A'}</p>
        <p><strong>Status:</strong> {selectedComplaint?.status}</p>
        <p><strong>Assigned To:</strong> {selectedComplaint?.assigned_to || 'Unassigned'}</p>
        <p><strong>User:</strong> {selectedComplaint?.user_id}</p>
        {selectedComplaint?.image && (
          <img src={selectedComplaint.image} alt="Complaint" className="mt-2 max-w-sm" />
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isVisible={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <h2 className="text-xl mb-4">Edit Complaint</h2>
        <input
          type="text"
          placeholder="Title"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-sm mb-2"
        />
        <textarea
          placeholder="Description"
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-sm mb-2"
        />
        <input
          type="email"
          placeholder="Email Address"
          value={editEmail}
          onChange={(e) => setEditEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-sm mb-2"
        />
        <select
          value={editStatus}
          onChange={(e) => setEditStatus(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-sm mb-2"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setEditImage(e.target.files[0])}
          className="w-full px-4 py-2 border border-gray-300 rounded-sm mt-2"
        />
        {selectedComplaint?.image && (
          <img src={selectedComplaint.image} alt="Current" className="mt-2 max-w-xs" />
        )}
        <button
          onClick={handleEditComplaint}
          className="mt-4 w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
        >
          Save Changes
        </button>
      </Modal>

      {/* Delete Modal */}
      <Modal isVisible={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <h2 className="text-xl mb-4">Confirm Delete</h2>
        <p>Are you sure you want to delete complaint titled &ldquo;{selectedComplaint?.title}&rdquo;?</p>
        <button
          onClick={handleDeleteComplaint}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-sm"
        >
          Yes, Delete
        </button>
      </Modal>
    </div>
  );
};

export default ComplaintList;