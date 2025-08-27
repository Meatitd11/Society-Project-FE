import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash } from "react-icons/fa";
import API_BASE_URL from "../../../config";

const FormBuilder = () => {
  const [formData, setFormData] = useState({
    form_name: "",
    fields: []
  });
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const API_URL = `${API_BASE_URL}/form-builder/`;
  const navigate = useNavigate();

  // Generate field name from label
  const generateFieldName = (label) => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_") 
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");
  };

  // Handle adding a new field
  const handleAddField = () => {
    if (!newFieldLabel.trim()) {
      toast.error("Field label cannot be empty.");
      return;
    }

    const fieldName = generateFieldName(newFieldLabel);
    setFormData(prev => ({
      ...prev,
      fields: [
        ...prev.fields,
        { label: newFieldLabel, name: fieldName, type: "number", required: true }
      ]
    }));
    setNewFieldLabel("");
  };

  // Handle removing a field
  const handleRemoveField = (index) => {
    if (formData.fields.length <= 1) {
      toast.error("At least one field must be present.");
      return;
    }
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.form_name.trim()) {
      toast.error("Form name is required.");
      return;
    }

    if (formData.fields.length === 0) {
      toast.error("You must add at least one field.");
      return;
    }

    try {
      const response = await axios.post(API_URL, {
        form_name: formData.form_name,
        form_fields: formData.fields
      });

      if (response.status === 201) {
        toast.success("Form created successfully!");
        setFormData({ form_name: "", fields: [] });
        setTimeout(() => navigate('/dashboard/form-list'), 1000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.form_name?.[0] || "Error submitting form.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Form Builder</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Name Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Form Name</label>
          <input
            type="text"
            value={formData.form_name}
            onChange={(e) => setFormData(prev => ({ ...prev, form_name: e.target.value }))}
            placeholder="Enter form name"
            className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            required
          />
        </div>

        {/* Add Field Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Add Field</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newFieldLabel}
              onChange={(e) => setNewFieldLabel(e.target.value)}
              placeholder="Enter field label (e.g., Water Charges)"
              className="flex-1 text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
            <button
              type="button"
              onClick={handleAddField}
              className="w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
            >
              <FaPlus />
            </button>
          </div>
        </div>

        {/* Fields List */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Form Fields</h2>
          {formData.fields.length === 0 ? (
            <p className="text-gray-500 text-sm">No fields added yet</p>
          ) : (
            <div className="space-y-2">
              {formData.fields.map((field, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    className="flex-1 text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
                    value={field.label}
                    disabled
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveField(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
        >
          Save Form
        </button>
      </form>
    </div>
  );
};

export default FormBuilder;