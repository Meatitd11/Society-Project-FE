import React, { useState, useEffect } from "react";
import axios from "axios";
import PropertyIcon from "../../assets/images/room.png";
import ownerIcon from "../../assets/images/owner.png";
import tenantIcon from "../../assets/images/rented.png";
import committeeIcon from "../../assets/images/comittee.png";
import moneyIcon from "../../assets/images/fund.png";
import pendingIcon from "../../assets/images/fair.png";
import complaintIcon from "../../assets/images/chat-complain.png";
import { FaArrowRight } from "react-icons/fa6";
import { useNavigate, Link } from "react-router-dom";


const DashboardOverview = () => {
  const [dashboardData, setDashboardData] = useState({
    totalProperties: 0,
    totalOwners: 0,
    totalTenants: 0,
    totalCommittees: 0,
    totalCollection: 0,
    pendingClearances: 0,
    totalComplaints: 0,
    loading: true,
    error: null
  });
  const navigate = useNavigate();

    const cardData = [
      { 
        id: "properties",
        title: "All Properties", 
        image: PropertyIcon,  // Use the imported image
        value: dashboardData.totalProperties,
        color: "bg-[#016F28]",
        link: "/dashboard/property-list"
      },
      { 
        id: "owners",
        title: "All Owners", 
        image: ownerIcon,
        value: dashboardData.totalOwners,
        color: "bg-[#016F28]",
        link: "/dashboard/owner-list"
      },
      { 
        id: "tenants",
        title: "All Tenants", 
        image: tenantIcon,
        value: dashboardData.totalTenants,
        color: "bg-[#016F28]",
        link: "/dashboard/tenant-list"
      },
      { 
        id: "committees",
        title: "All Committees", 
        image: committeeIcon,
        value: dashboardData.totalCommittees,
        color: "bg-[#016F28]",
        link: "/dashboard/management-committee-list"
      },
      { 
        id: "collection",
        title: "Total Collection", 
        image: moneyIcon,
        value: dashboardData.totalCollection,
        color: "bg-[#016F28]",
        link: "/dashboard/report-list"
      },
      { 
        id: "pending",
        title: "Pending Clearances", 
        image: pendingIcon,
        value: dashboardData.pendingClearances,
        color: "bg-[#016F28]",
        link: "/dashboard/report-list"
      },
      { 
        id: "complaints",
        title: "All Complaints", 
        image: complaintIcon,
        value: dashboardData.totalComplaints,
        color: "bg-[#016F28]",
        link: "/dashboard/complaint-list"
      },
    ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data in parallel
        const [
          propertiesRes,
          ownersRes,
          tenantsRes,
          complaintsRes,
          pendingRes,
          collectionRes,
          committesRes
        ] = await Promise.all([
          axios.get("http://127.0.0.1:8000/property_info/total/"),
          axios.get("http://127.0.0.1:8000/owners/total/"),
          axios.get("http://127.0.0.1:8000/tenant/total/"),
          axios.get("http://127.0.0.1:8000/complaints/total/"),
          axios.get("http://127.0.0.1:8000/payments-collection/pending_clearances/"),
          axios.get("http://127.0.0.1:8000/payments-collection/total_received_amount_current_month/"),
          axios.get("http://127.0.0.1:8000/management-committee/total/")
        ]);

        setDashboardData({
          totalProperties: propertiesRes.data.total_properties,
          totalOwners: ownersRes.data.total_owners,
          totalTenants: tenantsRes.data.total_tenants,
          totalComplaints: complaintsRes.data.total_complaints,
          pendingClearances: pendingRes.data.combined_total,
          totalCollection: collectionRes.data.total_received_amount,
          totalCommittees: committesRes.data.total_ManagementCommittee, // Assuming this endpoint isn't available yet
          loading: false,
          error: null
        });
      } catch (error) {
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          error: "Failed to fetch dashboard data"
        }));
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();

    // Set up polling for real-time updates (every 5 minutes)
    const intervalId = setInterval(fetchData, 300000);

    return () => clearInterval(intervalId);
  }, []);

  if (dashboardData.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#016F28]"></div>
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {dashboardData.error}
      </div>
    );
  }

  return (
    <div className="">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardData.map((card, idx) => (
          <div
            key={idx}
            className={`${card.color} text-white shadow-lg p-4 flex flex-col justify-between hover:opacity-90 transition`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-md ">{card.title}</p>
                <p className="text-xl font-semibold mt-2">{card.value}</p>
              </div>
              <img 
                src={card.image} 
                alt={card.title}
                className="w-12 h-12 object-contain"
              />
            </div>
            <button
  className="mt-4 text-sm bg-[#FFA500] hover:bg-[#FF8C00] text-white py-1 px-3 rounded-md transition flex items-center justify-center gap-2"
  onClick={() => navigate(card.link)}
>
  More Info <FaArrowRight />
</button>
          </div>
        ))}
      </div>

      {/* Graphs */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">
            Monthly Deposit Bill Graph For Year 2025
          </h2>
          <div className="h-60 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
            Graph Placeholder
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">
            Monthly Payment Collection Graph For 2025
          </h2>
          <div className="h-60 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
            Graph Placeholder
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;