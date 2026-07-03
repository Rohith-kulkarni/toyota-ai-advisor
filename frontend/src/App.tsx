import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import RequireAdmin from "./components/RequireAdmin";
import AdminLeadDetailPage from "./pages/AdminLeadDetailPage";
import AdminLeadsPage from "./pages/AdminLeadsPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import CustomerChatPage from "./pages/CustomerChatPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CustomerChatPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/leads" element={<AdminLeadsPage />} />
            <Route path="/admin/leads/:id" element={<AdminLeadDetailPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
