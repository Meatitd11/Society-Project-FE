import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from '../components/login';
import Main from '../components/Dashboard/main';
import PrivateRoute from './privateRoutes';

// Import all dashboard components
import Dashboard from "../components/Dashboard/dashboard";
import Invoice from "../components/invoice";
import Receipt from "../components/receipt";
import BlockList from "../components/Dashboard/block/blockList";
import AddBlock from "../components/Dashboard/block/addBlock";
import FloorList from "../components/Dashboard/floors/floorList";
import AddFloor from "../components/Dashboard/floors/addFloor";
import PropertyList from "../components/Dashboard/property/propertyList";
import AddProperty from "../components/Dashboard/property/addProperty";
import PropertyTypeList from "../components/Dashboard/propertyType/propertyTypeList";
import AddPropertyType from "../components/Dashboard/propertyType/addPropertyType";
import UnitTypeList from "../components/Dashboard/unitType/unitTypeList";
import AddUnitType from "../components/Dashboard/unitType/addUnitType";
import AmenityList from "../components/Dashboard/amenity/amenityList";
import AddAmenity from "../components/Dashboard/amenity/addAmenity";
import PropertyTransfer from "../components/Dashboard/propertyTransfer/propertyTransfer";
import OwnerList from "../components/Dashboard/owner/ownerList";
import AddOwner from "../components/Dashboard/owner/addOwner";
import TenantList from "../components/Dashboard/tenant/tenantList";
import AddTenant from "../components/Dashboard/tenant/addTenant";
import ServiceList from "../components/Dashboard/serviceInfo/serviceList";
import AddService from "../components/Dashboard/serviceInfo/addService";
import AreaTypeList from "../components/Dashboard/areaType/areaTypeList";
import AddAreaType from "../components/Dashboard/areaType/addAreaType";
import ListMemberType from "../components/Dashboard/memberType/listMemberType";
import AddMemberType from "../components/Dashboard/memberType/addMemberType";
import McList from "../components/Dashboard/maintenanceCost/mcList";
import AddMc from "../components/Dashboard/maintenanceCost/addMc";
import ManagementCommitteeList from "../components/Dashboard/managementCommittee/managementCommitteeList";
import AddManagementCommittee from "../components/Dashboard/managementCommittee/addManagementCommittee";
import BillSetup from "../components/Dashboard/billSetup/billSetup";
import FormsList from "../components/Dashboard/formBuilder/formList";
import AddForm from "../components/Dashboard/formBuilder/addForm";
import PaymentsList from "../components/Dashboard/paymentCollection/paymentsList";
import PaymentsAdd from "../components/Dashboard/paymentCollection/paymentsAdd";
import PlotSplitter from "../components/Dashboard/plotSplitter/PlotSplitter";
import ComplaintList from "../components/Dashboard/complaint/complaintList";
import AddComplaint from "../components/Dashboard/complaint/AddComplaint";
import FineList from "../components/Dashboard/fine/fineList";
import AddFine from "../components/Dashboard/fine/addFine";
import ReportList from "../components/Dashboard/reports/reports";
import DashboardOverview from '../components/Dashboard/dashboardOverview';
import AddCurrency from '../components/Dashboard/currency/addCurrency';
import CurrencyList from '../components/Dashboard/currency/currencyList';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        
        {/* Private Routes - All dashboard routes nested under /dashboard */}
        <Route path="/dashboard" element={<PrivateRoute><Main /></PrivateRoute>}>
          <Route index element={<DashboardOverview/>} />
          <Route path=":activeTab" element={<DashboardOverview />} />
          
          {/* Invoice and Receipt */}
          <Route path="invoice" element={<Invoice />} />
          <Route path="receipt" element={<Receipt />} />
          
          {/* Blocks */}
          <Route path="block-list" element={<BlockList />} />
          <Route path="add-block" element={<AddBlock />} />
          
          {/* Floors */}
          <Route path="floor-list" element={<FloorList />} />
          <Route path="add-floor" element={<AddFloor />} />
          
          {/* Properties */}
          <Route path="property-list" element={<PropertyList />} />
          <Route path="add-property" element={<AddProperty />} />
          <Route path="area-type-list" element={<PropertyTypeList />} />
          <Route path="add-area-type" element={<AddPropertyType />} />
          <Route path="unit-type-list" element={<UnitTypeList />} />
          <Route path="add-unit-type" element={<AddUnitType />} />
          <Route path="amenity-list" element={<AmenityList />} />
          <Route path="add-amenity" element={<AddAmenity />} />
          <Route path="property-transfer" element={<PropertyTransfer />} />
          
          {/* Owner */}
          <Route path="owner-list" element={<OwnerList />} />
          <Route path="add-owner" element={<AddOwner />} />
          
          {/* Tenant */}
          <Route path="tenant-list" element={<TenantList />} />
          <Route path="add-tenant" element={<AddTenant />} />
          
          {/* Service */}
          <Route path="service-list" element={<ServiceList />} />
          <Route path="add-service" element={<AddService />} />
          
          {/* Area Type */}
          <Route path="area-size-list" element={<AreaTypeList />} />
          <Route path="add-area-size" element={<AddAreaType />} />
          
          {/* Member Type */}
          <Route path="member-type-list" element={<ListMemberType />} />
          <Route path="add-member-type" element={<AddMemberType />} />

            {/* Currency */}
          <Route path="currency-list" element={<CurrencyList/>} />
          <Route path="add-currency" element={<AddCurrency/>} />
          
          {/* Maintenance Cost */}
          <Route path="maintenance-cost-list" element={<McList />} />
          <Route path="add-maintenance-cost" element={<AddMc />} />
          
          {/* Management Committee */}
          <Route path="management-committee-list" element={<ManagementCommitteeList />} />
          <Route path="add-management-committee" element={<AddManagementCommittee />} />
          
          {/* Bill Setup */}
          <Route path="bill-setup" element={<BillSetup />} />
          
          {/* Form Builder */}
          <Route path="form-list" element={<FormsList />} />
          <Route path="add-form" element={<AddForm />} />
          
          {/* Payment Collection */}
          <Route path="payments-list" element={<PaymentsList />} />
          <Route path="add-payments" element={<PaymentsAdd />} />
          
          {/* Plot Splitter */}
          <Route path="plot-splitter" element={<PlotSplitter />} />
          
          {/* Complaints */}
          <Route path="complaint-list" element={<ComplaintList />} />
          <Route path="add-complaint" element={<AddComplaint />} />
          
          {/* Fine */}
          <Route path="fine-list" element={<FineList />} />
          <Route path="add-fine" element={<AddFine />} />
          
          {/* Reports */}
          <Route path="report-list" element={<ReportList />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;