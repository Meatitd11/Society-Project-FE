import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Modal from "../modal";
import Pagination from "../pagination";
import API_BASE_URL from "../../../config";

const FormsList = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // For Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: "",
    form_name: "",
    form_fields: []
  });
  const [newFieldLabel, setNewFieldLabel] = useState("");

  // For Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const API_URL = `${API_BASE_URL}/form-builder/`;

  // Fetch forms
  const fetchForms = async () => {
    try {
      const response = await axios.get(API_URL);
      setForms(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch forms");
      toast.error("Failed to fetch forms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(forms.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = forms.slice(indexOfFirstItem, indexOfLastItem);

  const handleOpenEditModal = (form) => {
    setEditFormData({
      id: form.id,
      form_name: form.form_name,
      form_fields: form.form_fields || []
    });
    setIsEditModalOpen(true);
  };

  const handleAddField = () => {
    if (!newFieldLabel.trim()) {
      toast.error("Field label cannot be empty");
      return;
    }
    setEditFormData(prev => ({
      ...prev,
      form_fields: [
        ...prev.form_fields,
        { label: newFieldLabel, name: newFieldLabel.toLowerCase().replace(/\s+/g, '_') }
      ]
    }));
    setNewFieldLabel("");
  };

  const handleRemoveField = (index) => {
    if (editFormData.form_fields.length <= 1) {
      toast.error("At least one field must be present");
      return;
    }
    setEditFormData(prev => ({
      ...prev,
      form_fields: prev.form_fields.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateForm = async () => {
    try {
      await axios.put(`${API_URL}${editFormData.id}/`, {
        form_name: editFormData.form_name,
        form_fields: editFormData.form_fields
      });
      toast.success("Form updated successfully");
      fetchForms();
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error("Failed to update form");
    }
  };

  const handleOpenDeleteModal = (form) => {
    setFormToDelete(form);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteForm = async () => {
    try {
      await axios.delete(`${API_URL}${formToDelete.id}/`);
      toast.success("Form deleted successfully");
      fetchForms();
      setIsDeleteModalOpen(false);
    } catch (err) {
      toast.error("Failed to delete form");
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <div className="py-5">
      <div className='flex justify-between mb-4 items-center'> 
        <h1 className="text-2xl font-bold">Form List</h1>
        <button 
          onClick={() => navigate('/dashboard/add-form')}
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Add New Form
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-gray-600 bg-white border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="border text-start px-4 py-2">#</th>
              <th className="border text-start px-4 py-2">Form Name</th>
              <th className="border text-start px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((form, index) => (
                <tr key={form.id}>
                  <td className="border px-4 py-2">{indexOfFirstItem + index + 1}</td>
                  <td className="border px-4 py-2">{form.form_name}</td>
                  <td className="border px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        className="text-yellow-600 hover:text-yellow-500"
                        onClick={() => handleOpenEditModal(form)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-500"
                        onClick={() => handleOpenDeleteModal(form)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border px-4 py-2 text-center" colSpan="3">
                  No forms found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {forms.length > itemsPerPage && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          paginate={paginate}
        />
      )}

      {/* Edit Form Modal */}
      <Modal isVisible={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <h2 className="text-xl mb-4">Edit Form</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Form Name</label>
            <input
              type="text"
              value={editFormData.form_name}
              onChange={(e) => setEditFormData(prev => ({ ...prev, form_name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fields</label>
            <div className="space-y-2 mb-3">
              {editFormData.form_fields.map((field, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => {
                      const updatedFields = [...editFormData.form_fields];
                      updatedFields[index].label = e.target.value;
                      updatedFields[index].name = e.target.value.toLowerCase().replace(/\s+/g, '_');
                      setEditFormData(prev => ({ ...prev, form_fields: updatedFields }));
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveField(index)}
                    className="text-red-600"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
                placeholder="New field label"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-sm"
              />
              <button
                type="button"
                onClick={handleAddField}
                className="w-auto bg-green-700 text-white px-4 py-2 rounded-sm"
              >
                <FaPlus />
              </button>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <button
              className="px-4 py-2 border border-gray-300 rounded-sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-green-700 text-white rounded-sm"
              onClick={handleUpdateForm}
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isVisible={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <h2 className="text-xl mb-4">Confirm Delete</h2>
        <p>Are you sure you want to delete "{formToDelete?.form_name}"?</p>
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 border border-gray-300 rounded-sm"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-sm"
            onClick={handleDeleteForm}
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default FormsList;