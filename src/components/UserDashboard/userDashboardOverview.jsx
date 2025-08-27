
import { useState, useEffect } from "react";
import moneyIcon from "../../assets/images/fund.png";
import pendingIcon from "../../assets/images/fair.png";
import complaintIcon from "../../assets/images/chat-complain.png";
import fineIcon from "../../assets/images/fund.png"; // Using fund icon for fines
import reportIcon from "../../assets/images/room.png"; // Using room icon for reports
import { FaArrowRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const UserDashboardOverview = () => {
  const [dashboardData, setDashboardData] = useState({
    myPayments: 0,
    pendingClearances: 0,
    myFines: 0,
    myComplaints: 0,
    myReports: 0,
    loading: true,
    error: null
  });
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  const cardData = [
    { 
      id: "payments",
      title: "My Payments", 
      image: moneyIcon,
      value: dashboardData.myPayments,
      color: "bg-[#016F28]",
      link: "/user-dashboard/billing-details"
    },
    { 
      id: "pending",
      title: "Pending Clearances", 
      image: pendingIcon,
      value: dashboardData.pendingClearances,
      color: "bg-[#016F28]",
      link: "/user-dashboard/billing-details"
    },
    { 
      id: "fines",
      title: "Fines", 
      image: fineIcon,
      value: `Rs ${dashboardData.myFines}`,
      color: "bg-[#016F28]",
      link: "/user-dashboard/billing-details"
    },
    { 
      id: "complaints",
      title: "My Complaints", 
      image: complaintIcon,
      value: dashboardData.myComplaints,
      color: "bg-[#016F28]",
      link: "/user-dashboard/complaint-list"
    },
    { 
      id: "reports",
      title: "My Reports", 
      image: reportIcon,
      value: dashboardData.myReports,
      color: "bg-[#016F28]",
      link: "/user-dashboard/billing-details"
    }
  ];

  useEffect(() => {
    // Static user profile data
    const staticUserProfile = {
      name: "John Doe",
      username: "johndoe",
      phone: "+92-300-1234567",
      email: "john.doe@example.com"
    };
    
    setUserProfile(staticUserProfile);

    // Static dashboard data
    const staticDashboardData = {
      myPayments: 8,        // Number of paid bills
      pendingClearances: 3, // Number of pending bills
      myFines: 2500,        // Outstanding amount in Rs
      myComplaints: 2,      // Number of complaints
      myReports: 11,        // Total bills
      loading: false,
      error: null
    };

    setDashboardData(staticDashboardData);
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          My Personal Dashboard
         
        </h1>
    
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cardData.map((card, idx) => (
          <div
            key={idx}
            className={`${card.color} text-white shadow-lg p-4 flex flex-col justify-between  transition`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-md font-medium">{card.title}</p>
                </div>
                <p className="text-[18px] font-semibold mt-2 whitespace-nowrap">
                  {card.value}
                </p>
              </div>
              <img 
                src={card.image} 
                alt={card.title}
                className="w-12 h-12 object-contain"
              />
            </div>
            <button
              className="mt-4 text-sm bg-[#FFA500]  text-white py-1 px-3 rounded-md transition flex items-center justify-center gap-2"
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
            My Payment History - 2025
          </h2>
          <div className="h-60 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-2xl mb-2">�</div>
              <p>Personal Payment Graph</p>
              <p className="text-sm">Your payment history for {userProfile?.name || 'this account'}</p>
              <div className="mt-3 text-xs">
                <p>Paid: {dashboardData.myPayments} | Pending: {dashboardData.pendingClearances}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">
            My Outstanding Bills - 2025
          </h2>
          <div className="h-60 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <p>Personal Outstanding Amount</p>
              <p className="text-sm">Bills pending payment for {userProfile?.name || 'this account'}</p>
              <div className="mt-3 text-xs">
                <p>Outstanding: Rs {dashboardData.myFines}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardOverview;

