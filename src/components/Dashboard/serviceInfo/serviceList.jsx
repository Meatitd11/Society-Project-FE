import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaEye, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import useService from '../../../hooks/useService';
import Modal from '../modal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ServiceList = () => {
  const { services, deleteService, editService, loading, error } = useService();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [editServiceName, setEditServiceName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortedServices, setSortedServices] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: 'service_id',
    direction: 'desc'
  });
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    if (services.length > 0) {
      const sortableServices = [...services];
      sortableServices.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
      setSortedServices(sortableServices);
    }
  }, [services, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  if (loading) {
    return <div className="w-full flex justify-center items-center min-h-[300px]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500"></div>
    </div>;
  }

  if (error) {
    return <div className="text-red-600">Error loading services: {error.message}</div>;
  }

  // Calculate pagination using sortedServices
  const totalPages = Math.ceil(sortedServices.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentServices = sortedServices.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleOpenEditModal = (service) => {
    setSelectedService(service);
    setEditServiceName(service.service_name);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (service) => {
    setSelectedService(service);
    setIsDeleteModalOpen(true);
  };

  const handleOpenViewModal = (service) => {
    setSelectedService(service);
    setIsViewModalOpen(true);
  };

  const handleEditService = async () => {
    if (selectedService) {
      setProcessing(true);
      try {
        await editService(selectedService.service_id, editServiceName);
        toast.success('Service updated successfully');
        setIsEditModalOpen(false);
      } catch (error) {
        toast.error('Failed to update service');
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleDeleteService = async () => {
    if (selectedService) {
      setProcessing(true);
      try {
        await deleteService(selectedService.service_id);
        toast.success('Service deleted successfully');
        setIsDeleteModalOpen(false);
      } catch (error) {
        toast.error('Failed to delete service');
      } finally {
        setProcessing(false);
      }
    }
  };

  return (
    <div className="py-5">
      <div className='flex justify-between mb-4 items-center'> 
        <h1 className="text-2xl font-bold">Service List</h1>
        <button 
          onClick={() => navigate('/dashboard/add-service')}
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Add New Service
        </button>
      </div>
      <table className="min-w-full text-sm text-gray-600 bg-white border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="border text-start px-4 py-2">
              <div className="flex items-center cursor-pointer" onClick={() => requestSort('service_id')}>
                <span>#</span>
                <span className="ml-1">{getSortIcon('service_id')}</span>
              </div>
            </th>
            <th className="border text-start px-4 py-2">
              <div className="flex items-center cursor-pointer" onClick={() => requestSort('service_name')}>
                <span>Service Name</span>
                <span className="ml-1">{getSortIcon('service_name')}</span>
              </div>
            </th>
            <th className="border text-start px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentServices.length > 0 ? (
            currentServices.map((service, index) => (
              <tr key={service.service_id}>
                <td className="border px-4 py-2">{indexOfFirstItem + index + 1}</td>
                <td className="border px-4 py-2">{service.service_name}</td>
                <td className="border px-4 py-2" colSpan={1}>
                  <div className="relative group">
                    <div className="">
                      <ul className="flex gap-2 text-left">
                        <li
                          className=" text-green-700 cursor-pointer"
                          onClick={() => handleOpenViewModal(service)}
                        >
                          <FaEye />
                        </li>
                        <li
                          className=" text-yellow-600 cursor-pointer"
                          onClick={() => handleOpenEditModal(service)}
                        >
                          <FaEdit />
                        </li>
                        <li
                          className="text-red-700  cursor-pointer"
                          onClick={() => handleOpenDeleteModal(service)}
                        >
                          <FaTrash /> 
                        </li>
                      </ul>
                    </div>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="border px-4 py-2 text-center" colSpan="3">
                No services found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {sortedServices.length > itemsPerPage && (
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
      )}

      {/* View Service Modal */}
      <Modal isVisible={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
        <h2 className="text-xl mb-4">Service Details</h2>
        <p><strong>Service Name:</strong> {selectedService?.service_name}</p>
      </Modal>

      {/* Edit Service Modal */}
      <Modal isVisible={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <h2 className="text-xl mb-4">Edit Service</h2>
        <input
          type="text"
          value={editServiceName}
          onChange={(e) => setEditServiceName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-sm"
        />
        <button
          onClick={handleEditService}
          className="mt-4 w-auto bg-green-700 text-white px-5 py-2 rounded-sm hover:bg-green-600 transition-colors duration-300"
          disabled={processing}
        >
          {processing ? 'Saving...' : 'Save Changes'}
        </button>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isVisible={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <h2 className="text-xl mb-4">Confirm Delete</h2>
        <p>Are you sure you want to delete service "{selectedService?.service_name}"?</p>
        <button
          onClick={handleDeleteService}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-sm"
          disabled={processing}
        >
          {processing ? 'Deleting...' : 'Yes, Delete'}
        </button>
      </Modal>
    </div>
  );
};

export default ServiceList;