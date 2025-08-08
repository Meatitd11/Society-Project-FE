import React, { useState, useEffect, useMemo } from "react";
import { 
  useNavigate, 
  useLocation,
  Outlet
} from "react-router-dom";
import { FiMenu, FiBell, FiUser } from "react-icons/fi";
import { MdKeyboardDoubleArrowRight, MdHomeWork } from "react-icons/md";
import { 
  FaCaretDown, 
  FaCaretRight, 
  FaChartLine, 
  FaThLarge, 
  FaLayerGroup, 
  FaBuilding, 
  FaUserTie, 
  FaUsers, 
  FaTools, 
  FaMapMarkedAlt, 
  FaIdCard, 
  FaMoneyBillWave, 
  FaUsersCog, 
  FaFileInvoiceDollar, 
  FaWpforms, 
  FaCreditCard, 
  FaObjectGroup, 
  FaCommentDots, 
  FaBalanceScale, 
  FaFileAlt, 
  FaSignOutAlt, 
  FaUniversity, 
  FaSwimmingPool, 
  FaExchangeAlt 
} from "react-icons/fa";
import { BsCurrencyExchange } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import axios from "axios";

const Main = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState("");
  const [openSubDropdown, setOpenSubDropdown] = useState("");
  const [loadingLogout, setLoadingLogout] = useState(false);

  // Menu items structure
  const menuItems = useMemo(() => [
    { name: "Dashboard", icon: <FaChartLine />, path: "/dashboard" },
    
    {
      name: "Blocks",
      icon: <FaThLarge />,
      subItems: [
        { name: "Block List", path: "/dashboard/block-list", icon: <MdKeyboardDoubleArrowRight /> },
        { name: "Add Block", path: "/dashboard/add-block", icon: <MdKeyboardDoubleArrowRight /> },
      ],
    },
    
    {
      name: "Floors",
      icon: <FaLayerGroup />,
      subItems: [
        { name: "Floor List", path: "/dashboard/floor-list", icon: <MdKeyboardDoubleArrowRight /> },
        { name: "Add Floor", path: "/dashboard/add-floor", icon: <MdKeyboardDoubleArrowRight /> },
      ],
    },
    
    {
      name: "Properties",
      icon: <FaBuilding />,
      subItems: [
        { name: "Property List", path: "/dashboard/property-list", icon: <MdKeyboardDoubleArrowRight /> },
        { name: "Add Property", path: "/dashboard/add-property", icon: <MdKeyboardDoubleArrowRight /> },
        {
          name: "Area Type",
          icon: <FaUniversity />,
          subItems: [
            { name: "Area Type List", path: "/dashboard/area-type-list", icon: <MdKeyboardDoubleArrowRight /> },
            { name: "Add Area Type", path: "/dashboard/add-area-type", icon: <MdKeyboardDoubleArrowRight /> },
          ],
        },
        {
          name: "Unit Type",
          icon: <FaBuilding />,
          subItems: [
            { name: "Unit Type List", path: "/dashboard/unit-type-list", icon: <MdKeyboardDoubleArrowRight /> },
            { name: "Add Unit Type", path: "/dashboard/add-unit-type", icon: <MdKeyboardDoubleArrowRight /> },
          ],
        },
        {
          name: "Amenity",
          icon: <FaSwimmingPool />,
          subItems: [
            { name: "Amenity List", path: "/dashboard/amenity-list", icon: <MdKeyboardDoubleArrowRight /> },
            { name: "Add Amenity", path: "/dashboard/add-amenity", icon: <MdKeyboardDoubleArrowRight /> },
          ],
        },
        {
          name: "Property Transfer",
          icon: <FaExchangeAlt />,
          subItems: [
            { name: "Property Transfer Form", path: "/dashboard/property-transfer", icon: <MdKeyboardDoubleArrowRight /> }
          ],
        },
      ],
    },
    
    {
      name: "Owner",
      icon: <FaUserTie />,
      subItems: [
        { name: "Owner List", path: "/dashboard/owner-list", icon: <MdKeyboardDoubleArrowRight /> },
        { name: "Add Owner", path: "/dashboard/add-owner", icon: <MdKeyboardDoubleArrowRight /> },
      ],
    },
    
    {
      name: "Tenant",
      icon: <FaUsers />,
      subItems: [
        { name: "Tenant List", path: "/dashboard/tenant-list", icon: <MdKeyboardDoubleArrowRight /> },
        { name: "Add Tenant", path: "/dashboard/add-tenant", icon: <MdKeyboardDoubleArrowRight /> },
      ],
    },
    
    {
      name: "Service",
      icon: <FaTools />,
      subItems: [
        { name: "Service List", path: "/dashboard/service-list", icon: <MdKeyboardDoubleArrowRight /> },
        { name: "Add Service", path: "/dashboard/add-service", icon: <MdKeyboardDoubleArrowRight /> },
      ],
    },
    
    {
      name: "Area Size",
      icon: <FaMapMarkedAlt />,
      subItems: [
        { name: "Area Size List", path: "/dashboard/area-size-list", icon: <MdKeyboardDoubleArrowRight /> },
        { name: "Add Area Size", path: "/dashboard/add-area-size", icon: <MdKeyboardDoubleArrowRight /> },
      ],
    },
    
    {
      name: "Member Type",
      icon: <FaIdCard />,
      subItems: [
        { name: "Member Type List", path: "/dashboard/member-type-list", icon: <MdKeyboardDoubleArrowRight /> },
        { name: "Add Member Type", path: "/dashboard/add-member-type", icon: <MdKeyboardDoubleArrowRight /> },
      ],
    },
    
    {
      name: "Maintenance Cost",
      icon: <FaMoneyBillWave />,
      subItems: [
        { name: "Maintenance Cost List", path: "/dashboard/maintenance-cost-list", icon: <MdKeyboardDoubleArrowRight /> },
        { name: "Add Maintenance Cost", path: "/dashboard/add-maintenance-cost", icon: <MdKeyboardDoubleArrowRight /> },
      ],
    },
    
    {
      name: "Management Committee",
      icon: <FaUsersCog />,
      subItems: [
        { name: "Management Committee List", path: "/dashboard/management-committee-list", icon: <MdKeyboardDoubleArrowRight /> },
        { name: "Add Management Committee", path: "/dashboard/add-management-committee", icon: <MdKeyboardDoubleArrowRight /> },
      ],
    },
     
    {
      name: "Currency",
      icon: <BsCurrencyExchange />,
      subItems: [
        { name: "Currency List", path: "/dashboard/currency-list", icon: <MdKeyboardDoubleArrowRight /> },
        { name: "Add Currency", path: "/dashboard/add-currency", icon: <MdKeyboardDoubleArrowRight /> },
      ],
    },
    
    {
      name: "Bill Setup",
      icon: <FaFileInvoiceDollar />,
      subItems: [
        { name: "Bill Setup", path: "/dashboard/bill-setup", icon: <MdKeyboardDoubleArrowRight /> },
      ],
    },
    
    {
      name: "Form Builder",
      icon: <FaWpforms />,
      subItems: [
        { name: "Form List", path: "/dashboard/form-list", icon: <MdKeyboardDoubleArrowRight /> },
        { name: "Add Form", path: "/dashboard/add-form", icon: <MdKeyboardDoubleArrowRight /> },
      ],
    },
    
    {
      name: "Payment Collection",
      icon: <FaCreditCard />,
      subItems: [
        { name: "Payments List", path: "/dashboard/payments-list", icon: <MdKeyboardDoubleArrowRight /> },
        { name: "Add Payments", path: "/dashboard/add-payments", icon: <MdKeyboardDoubleArrowRight /> },
      ],
    },
    
    {
      name: "Plot Splitter",
      icon: <FaObjectGroup />,
      subItems: [
        { name: "Plot Splitter Form", path: "/dashboard/plot-splitter", icon: <MdKeyboardDoubleArrowRight /> },
      ],
    },
    
    {
      name: "Complaints",
      icon: <FaCommentDots />,
      subItems: [
        { name: "Complaint List", path: "/dashboard/complaint-list", icon: <MdKeyboardDoubleArrowRight /> },
        { name: "Add Complaint", path: "/dashboard/add-complaint", icon: <MdKeyboardDoubleArrowRight /> },
      ],
    },
    
    {
      name: "Fine",
      icon: <FaBalanceScale />,
      subItems: [
        { name: "Fine List", path: "/dashboard/fine-list", icon: <MdKeyboardDoubleArrowRight /> },
        { name: "Add Fine", path: "/dashboard/add-fine", icon: <MdKeyboardDoubleArrowRight /> },
      ],
    },
    
    {
      name: "Reports",
      icon: <FaFileAlt />,
      subItems: [
        { name: "Report List", path: "/dashboard/report-list", icon: <MdKeyboardDoubleArrowRight /> },
      ],
    },
  ], []);

  // Get current route name for header
  const currentRouteName = useMemo(() => {
    const path = location.pathname;
    for (const item of menuItems) {
      if (item.path === path) return item.name;
      if (item.subItems) {
        for (const subItem of item.subItems) {
          if (subItem.path === path) return subItem.name;
          if (subItem.subItems) {
            for (const subSubItem of subItem.subItems) {
              if (subSubItem.path === path) return subSubItem.name;
            }
          }
        }
      }
    }
    return "Dashboard";
  }, [location.pathname, menuItems]);

  // Auto-open parent dropdowns when route changes
  useEffect(() => {
    const path = location.pathname;
    for (const item of menuItems) {
      if (item.subItems) {
        for (const subItem of item.subItems) {
          if (subItem.path === path) {
            setOpenDropdown(item.name);
            setOpenSubDropdown("");
            return;
          }
          if (subItem.subItems) {
            for (const subSubItem of subItem.subItems) {
              if (subSubItem.path === path) {
                setOpenDropdown(item.name);
                setOpenSubDropdown(subItem.name);
                return;
              }
            }
          }
        }
      }
    }
    setOpenDropdown("");
    setOpenSubDropdown("");
  }, [location.pathname, menuItems]);

  const handleLogout = async () => {
    try {
      setLoadingLogout(true);
      const token = localStorage.getItem("token");
      
      await axios.post("http://127.0.0.1:8000/api/user/logout/", null, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
      setLoadingLogout(false);
    }
  };

  const handleDropdownToggle = (name) => {
    setOpenDropdown(openDropdown === name ? "" : name);
    setOpenSubDropdown("");
  };

  const handleSubDropdownToggle = (name) => {
    setOpenSubDropdown(openSubDropdown === name ? "" : name);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="flex w-full">
      {/* Sidebar */}
      <div
        className={`fixed z-30 inset-y-0 left-0 md:w-1/5 bg-white text-gray-700 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition-transform duration-200 ease-in-out`}
      >
        <div className="p-5 border-b flex items-center justify-between h-16 bg-green-700">
          <div className="flex gap-3 items-center justify-center">
            <MdHomeWork className="text-white text-3xl" />
            <h2 className="font-bold text-white text-lg">گلِ دامن سوسائٹی</h2>
          </div>
          <button className="md:hidden text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <IoMdClose size={24} />
          </button>
        </div>
        
        <ul>
          {menuItems.map((item) => (
            <div key={item.name}>
              <li
                className={`py-2 px-4 text-base cursor-pointer flex items-center justify-between ${
                  location.pathname === item.path || openDropdown === item.name
                    ? "bg-green-700 text-white border-s-2 border-orange-600"
                    : "hover:bg-green-700 hover:border-s-2 hover:border-orange-600 hover:text-white"
                }`}
                onClick={() => {
                  if (item.path) {
                    handleNavigation(item.path);
                  } else if (item.subItems) {
                    handleDropdownToggle(item.name);
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  {item.name}
                </div>
                {item.subItems && <span>{openDropdown === item.name ? <FaCaretDown /> : <FaCaretRight />}</span>}
              </li>
              {item.subItems && openDropdown === item.name && (
                <ul className="transition-all duration-300 ease-in-out">
                  {item.subItems.map((subItem) => (
                    <div key={subItem.path || subItem.name}>
                      <li
                        className={`py-2 px-4 text-base cursor-pointer flex items-center gap-2 ${
                          location.pathname === subItem.path && !subItem.subItems ? "bg-slate-50 text-black" : ""
                        }`}
                        onClick={() =>
                          subItem.subItems ? handleSubDropdownToggle(subItem.name) : handleNavigation(subItem.path)
                        }
                      >
                        {subItem.icon}
                        {subItem.name}
                        {subItem.subItems && (
                          <span>{openSubDropdown === subItem.name ? <FaCaretDown /> : <FaCaretRight />}</span>
                        )}
                      </li>
                      {subItem.subItems && openSubDropdown === subItem.name && (
                        <ul className="transition-all duration-300 ease-in-out">
                          {subItem.subItems.map((nestedItem) => (
                            <li
                              key={nestedItem.path}
                              className={`py-2 ps-8 text-base cursor-pointer flex items-center border-b-slate-300 border-b gap-2 ${
                                location.pathname === nestedItem.path ? "bg-slate-100 text-black" : ""
                              }`}
                              onClick={() => handleNavigation(nestedItem.path)}
                            >
                              {nestedItem.icon}
                              {nestedItem.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {/* Logout */}
          <li
            className={`py-2 px-4 text-base cursor-pointer flex items-center gap-2 hover:bg-green-700 hover:border-s-2 hover:border-orange-600 hover:text-white`}
            onClick={handleLogout}
          >
            {loadingLogout ? (
              <div className="animate-spin">
                <FaSignOutAlt/>
              </div>
            ) : <FaSignOutAlt/>}
            Logout
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:w-4/5">
        <div className="w-full bg-green-700 h-16 p-4 flex items-center justify-between border-b shadow">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <FiMenu size={24} />
            </button>
           
          </div>
          <div className="flex items-center gap-6">
            <FiBell className="text-white" size={24} />
            <FiUser className="text-white" size={24} />
          </div>
        </div>
        <div className="flex-1 p-7 bg-slate-50">
        
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Main;