import axios from "axios";
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API_BASE_URL from "../config";
import { useNavigate } from 'react-router-dom';

const useAmenity = () => {
    const [amenities, setAmenities] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch amenities
    const fetchAmenities = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/amenity_info/`);
            setAmenities(response.data);
        } catch (err) {
            toast.error('Failed to fetch amenities');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAmenities();
    }, []);

    // Add amenity
    const addAmenity = async (amenityName) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/amenity_info/`, {
                amenity_name: amenityName,
            });

            if (response.status === 201) {
                setAmenities([...amenities, response.data]);
                toast.success('Amenity added successfully');
                setTimeout(() => navigate('/dashboard/amenity-list'), 1000);
                return { success: true };
            } else {
                toast.error('Failed to add amenity');
                return { success: false };
            }
        } catch (err) {
            toast.error('Error adding amenity');
            return { success: false };
        }
    };

    // Edit amenity
    const editAmenity = async (id, updatedAmenityName) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/amenity_info/${id}/`, {
                amenity_name: updatedAmenityName,
            });

            if (response.status === 200) {
                setAmenities(amenities.map(a => a.amenity_id === id ? response.data : a));
                toast.success('Amenity updated successfully');
                return { success: true };
            } else {
                toast.error('Failed to update amenity');
                return { success: false };
            }
        } catch (err) {
            toast.error('Error updating amenity');
            return { success: false };
        }
    };

    // Delete amenity
    const deleteAmenity = async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/amenity_info/${id}/`);

            if (response.status === 204) {
                await fetchAmenities();
                toast.success('Amenity deleted successfully');
                return { success: true };
            } else {
                toast.error('Failed to delete amenity');
                return { success: false };
            }
        } catch (err) {
            toast.error('Error deleting amenity');
            return { success: false };
        }
    };

    return {
        amenities,
        loading,
        addAmenity,
        editAmenity,
        deleteAmenity,
        fetchAmenities,
    };
};

export default useAmenity;