import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import API_BASE_URL from "../config";
import { useNavigate } from 'react-router-dom';

const usePropertyType = () => {
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    // Fetch property types
    const fetchPropertyTypes = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/property_type_info/`);
            setPropertyTypes(response.data);
        } catch (err) {
            toast.error('Failed to fetch area types');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPropertyTypes();
    }, []);

    // Add property type
    const addPropertyType = async (propertyName) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/property_type_info/`, {
                property_name: propertyName,
            });

            if (response.status === 201) {
                setPropertyTypes([...propertyTypes, response.data]);
                toast.success('Area type added successfully');   
                setTimeout(() => navigate('/dashboard/area-type-list'), 1000);
                
                return { success: true };
            
            } else {
                toast.error('Failed to add area type');
                return { success: false };
            }
        } catch (err) {
            if (err.response?.status === 400 && err.response.data?.property_name) {
                toast.error(err.response.data.property_name[0]);
            } else {
                toast.error('Error adding area type');
            }
            return { success: false };
        }
    };

    // Edit property type
    const editPropertyType = async (id, updatedPropertyName) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/property_type_info/${id}/`, {
                property_name: updatedPropertyName,
            });

            if (response.status === 200) {
                setPropertyTypes(propertyTypes.map(pt => pt.pro_type_id === id ? response.data : pt));
                toast.success('Area type updated successfully');
                return { success: true };
            } else {
                toast.error('Failed to update area type');
                return { success: false };
            }
        } catch (err) {
            if (err.response?.status === 400 && err.response.data?.property_name) {
                toast.error(err.response.data.property_name[0]);
            } else {
                toast.error('Error updating area type');
            }
            return { success: false };
        }
    };

    // Delete property type
    const deletePropertyType = async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/property_type_info/${id}/`);

            if (response.status === 204) {
                await fetchPropertyTypes();
                toast.success('Area type deleted successfully');
                return { success: true };
            } else {
                toast.error('Failed to delete area type');
                return { success: false };
            }
        } catch (err) {
            toast.error('Error deleting area type');
            return { success: false };
        }
    };

    return {
        propertyTypes,
        loading,
        addPropertyType,
        editPropertyType,
        deletePropertyType,
        fetchPropertyTypes,
    };
};

export default usePropertyType;