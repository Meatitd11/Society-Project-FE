import { useState, useEffect } from 'react';
import useManagementCommittee from '../../../hooks/useManagementCommittee';
import useMemberType from '../../../hooks/useMemberType';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AddManagementCommittee = () => {
  const { addManagementCommittee } = useManagementCommittee();
  const { memberTypes, fetchMemberTypes } = useMemberType();
  const navigate = useNavigate();  
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    mc_member_type: '',
    mc_name: '',
    mc_guardian_type: '',
    mc_guardian_name: '',
    mc_email: '',
    mc_contact: '',
    mc_pre_address: '',
    mc_per_address: '',
    mc_cnic: '',
    mc_joining_date: '',
    mc_ending_date: '',
    mc_status: '1',
    mc_image: null,
    mc_password: ''
  });

  useEffect(() => {
    fetchMemberTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, mc_image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        formDataToSend.append(key, formData[key]);
      }
    });

    const { success, message } = await addManagementCommittee(formDataToSend);
    
    if (success) {
      toast.success(message);
      setFormData({
        mc_member_type: '',
        mc_name: '',
        mc_guardian_type: '',
        mc_guardian_name: '',
        mc_email: '',
        mc_contact: '',
        mc_pre_address: '',
        mc_per_address: '',
        mc_cnic: '',
        mc_joining_date: '',
        mc_ending_date: '',
        mc_status: '1',
        mc_image: null,
        mc_password: ''
      });
      setPreviewImage(null);
      
      setTimeout(() => navigate('/dashboard/management-committee-list'), 1000);
    } else {
      toast.error(message);
    }
  };

  return (
    <>  
      <h1 className="text-2xl font-bold">Add Management Committee Member</h1>
      <form className="py-5" onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Profile Picture Upload */}
          <div className="mb-4 col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-100">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                  )}
                </div>
                <label htmlFor="mc_image" className="absolute -bottom-2 -right-2 bg-green-600 text-white p-1 rounded-full cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <input
                    type="file"
                    id="mc_image"
                    name="mc_image"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                </label>
              </div>
              <div className="text-sm text-gray-500">
                <p>Upload a clear photo</p>
                <p>Max size: 5MB</p>
                <p>Formats: JPG, PNG</p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="mc_member_type" className="block text-sm font-medium text-gray-700 mb-1">Member Type</label>
            <select
              id="mc_member_type"
              name="mc_member_type"
              value={formData.mc_member_type}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            >
              <option value="">Select Member Type</option>
              {memberTypes.map(type => (
                <option key={type.member_type_id} value={type.member_type_id}>
                  {type.member_type_name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="mc_name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              id="mc_name"
              name="mc_name"
              placeholder="Name"
              value={formData.mc_name}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="mc_guardian_type" className="block text-sm font-medium text-gray-700 mb-1">Guardian Type</label>
            <select
              id="mc_guardian_type"
              name="mc_guardian_type"
              value={formData.mc_guardian_type}
              onChange={handleChange}
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            >
              <option value="">Select Guardian Type</option>
              <option value="S/O">Son of</option>
              <option value="D/O">Daughter of</option>
              <option value="W/O">Wife of</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="mc_guardian_name" className="block text-sm font-medium text-gray-700 mb-1">Guardian Name</label>
            <input
              type="text"
              id="mc_guardian_name"
              name="mc_guardian_name"
              placeholder="Guardian Name"
              value={formData.mc_guardian_name}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="mc_email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="mc_email"
              name="mc_email"
              placeholder="Email"
              value={formData.mc_email}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="mc_contact" className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
            <input
              type="tel"
              id="mc_contact"
              name="mc_contact"
              placeholder="Contact Number"
              value={formData.mc_contact}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="mc_pre_address" className="block text-sm font-medium text-gray-700 mb-1">Present Address</label>
            <textarea
              id="mc_pre_address"
              name="mc_pre_address"
              placeholder="Present Address"
              value={formData.mc_pre_address}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="mc_per_address" className="block text-sm font-medium text-gray-700 mb-1">Permanent Address</label>
            <textarea
              id="mc_per_address"
              name="mc_per_address"
              placeholder="Permanent Address"
              value={formData.mc_per_address}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="mc_cnic" className="block text-sm font-medium text-gray-700 mb-1">CNIC</label>
            <input
              type="text"
              id="mc_cnic"
              name="mc_cnic"
              placeholder="CNIC"
              value={formData.mc_cnic}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="mc_joining_date" className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
            <input
              type="date"
              id="mc_joining_date"
              name="mc_joining_date"
              value={formData.mc_joining_date}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="mc_ending_date" className="block text-sm font-medium text-gray-700 mb-1">Ending Date</label>
            <input
              type="date"
              id="mc_ending_date"
              name="mc_ending_date"
              value={formData.mc_ending_date}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="mc_status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="mc_status"
              name="mc_status"
              value={formData.mc_status}
              onChange={handleChange}
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            >
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="mc_password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              id="mc_password"
              name="mc_password"
              placeholder="Password"
              value={formData.mc_password}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2 border border-gray-300 rounded-sm focus:ring-0 focus:outline-none focus:border-green-700"
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
        >
          Add Management Committee Member
        </button>
      </form>
    </>
  );
};

export default AddManagementCommittee;