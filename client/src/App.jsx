import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { ToastProvider } from "./components/Toast";

import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import StaffLayout from "./layouts/StaffLayout";

// Import your components
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/admin/Dashbaord";
import Landing from "./pages/Landing";
import UserHome from "./pages/user/Home";
import StaffDashboard from "./pages/Staff/Dashboard";

// Import any other admin pages
import AdminBooks from "./pages/admin/Books";

// Import any other user pages
import UserBooks from "./pages/user/Books";
import Cart from "./pages/user/Cart";
import UserOrders from "./pages/user/Orders";

// Import any other staff pages
import StaffOrders from "./pages/Staff/Orders";

function App() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public routes without layouts */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin routes with AdminLayout */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="books" element={<AdminBooks />} />
              {/* Add more admin routes as needed */}
            </Route>

            {/* User routes with UserLayout */}
            <Route path="/user" element={<UserLayout />}>
              <Route index element={<UserHome />} />
              {/* <Route path="books" element={<UserBooks />} /> */}
              <Route path="cart" element={<Cart />} />
              <Route path="orders" element={<UserOrders />} />
              {/* Add more user routes as needed */}
            </Route>

            {/* Staff routes with StaffLayout */}
            <Route path="/staff" element={<StaffLayout />}>
              <Route index element={<StaffDashboard />} />
              <Route path="orders" element={<StaffOrders />} />
              {/* Add more staff routes as needed */}
            </Route>

            {/* Catch all redirect (optional) */}
            <Route path="*" element={<Landing />} />
          </Routes>
        </Router>
      </ToastProvider>
    </Provider>
  );
}

export default App;
