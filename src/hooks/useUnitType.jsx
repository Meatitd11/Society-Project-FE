import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import API_BASE_URL from "../config";
import { useNavigate } from 'react-router-dom';

const useUnitType = () => {
    const [unitTypes, setUnitTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch unit types
    const fetchUnitTypes = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/unit_type_info/`);
            setUnitTypes(response.data);
        } catch (err) {
            toast.error('Failed to fetch unit types');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnitTypes();
    }, []);

    // Add unit type
    const addUnitType = async (unitName, unitNumber) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/unit_type_info/`, {
                unit_name: unitName,
                unit_number: unitNumber,
            });

            if (response.status === 201) {
                setUnitTypes([...unitTypes, response.data]);
                toast.success('Unit type added successfully');
                setTimeout(() => navigate('/dashboard/unit-type-list'), 1000);
                
                return { success: true };
            } else {
                toast.error('Failed to add unit type');
                return { success: false };
            }
        } catch (err) {
            if (err.response?.status === 400 && err.response.data?.unit_number) {
                toast.error(err.response.data.unit_number[0]);
            } else {
                toast.error('Error adding unit type');
            }
            return { success: false };
        }
    };

    // Edit unit type
    const editUnitType = async (id, updatedUnitName, updatedUnitNumber) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/unit_type_info/${id}/`, {
                unit_name: updatedUnitName,
                unit_number: updatedUnitNumber,
            });

            if (response.status === 200) {
                setUnitTypes(unitTypes.map(ut => ut.unit_type_id === id ? response.data : ut));
                toast.success('Unit type updated successfully');
                return { success: true };
            } else {
                toast.error('Failed to update unit type');
                return { success: false };
            }
        } catch (err) {
            if (err.response?.status === 400) {
                if (err.response.data?.unit_name) {
                    toast.error(err.response.data.unit_name[0]);
                } else if (err.response.data?.unit_number) {
                    toast.error(err.response.data.unit_number[0]);
                }
            } else {
                toast.error('Error updating unit type');
            }
            return { success: false };
        }
    };

    // Delete unit type
    const deleteUnitType = async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/unit_type_info/${id}/`);

            if (response.status === 204) {
                await fetchUnitTypes();
                toast.success('Unit type deleted successfully');
                return { success: true };
            } else {
                toast.error('Failed to delete unit type');
                return { success: false };
            }
        } catch (err) {
            toast.error('Error deleting unit type');
            return { success: false };
        }
    };

    return {
        unitTypes,
        loading,
        addUnitType,
        editUnitType,
        deleteUnitType,
        fetchUnitTypes,
    };
};

export default useUnitType;