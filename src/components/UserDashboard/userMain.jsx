import { useState, useEffect, useMemo } from "react";
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
  FaCommentDots, 
  FaSignOutAlt
} from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import API_BASE_URL from "../../config";

const UserMain = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState("");
  const [openSubDropdown, setOpenSubDropdown] = useState("");
  const [loadingLogout, setLoadingLogout] = useState(false);

  // Menu items structure - Simplified to only show Dashboard, Billing, and Complaints
  const menuItems = useMemo(() => [
    // 1. Dashboard
    { name: "Dashboard", icon:<FaThLarge /> , path: "/user-dashboard" },
    
    // 2. Billing
    {
      name: "Billing",
      icon:<FaChartLine /> ,
      subItems: [
        { name: "Billing Details", path: "/user-dashboard/billing-details", icon: <MdKeyboardDoubleArrowRight /> },
      ],
    },

    // 3. Complaints
    {
      name: "Complaints",
      icon: <FaCommentDots />,
      subItems: [
        { name: "All Complaints", path: "/user-dashboard/complaint-list", icon: <MdKeyboardDoubleArrowRight /> },
        { name: "New Complaint", path: "/user-dashboard/add-complaint", icon: <MdKeyboardDoubleArrowRight /> },
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
    return "User Dashboard";
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
      
      await axios.post(`${API_BASE_URL}/api/user/logout/`, null, {
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
                className={`py-2 px-4 text-base  cursor-pointer flex items-center justify-between ${
                  location.pathname === item.path || openDropdown === item.name
                    ? "bg-green-700 text-white " //border-2 border-[#fe9719]
                    : "hover:bg-green-700 hover:border-s-2 hover:border-[#fe9719] hover:text-white"
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
                <ul className="transition-all duration-300 ease-in-out border-b-2 border-green-700 rounded-md mx-2 my-1 ">
                  {item.subItems.map((subItem) => (
                    <div key={subItem.path || subItem.name}>
                      <li
                        className={`py-2 px-4 text-base cursor-pointer flex  items-center gap-2 ${    //hover:bg-gray-100 
                          location.pathname === subItem.path && !subItem.subItems ? " text-black font-medium" : ""
                        } ${
                          subItem.subItems && openSubDropdown === subItem.name
                            ? " rounded-md mx-1 my-1 bg-white"
                            : ""
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
                        <ul className="transition-all duration-300 ease-in-out border-b-2 border-green-700 ml-2 mr-2">
                          {subItem.subItems.map((nestedItem) => (
                            <li
                              key={nestedItem.path}
                              className={`py-2 ps-8 text-base cursor-pointer flex items-center  gap-2  ${ //border-b-slate-300 border-b
                                location.pathname === nestedItem.path ? " text-black font-medium" : ""
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

export default UserMain;
