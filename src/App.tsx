import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { CompanyLayout } from './layouts/CompanyLayout';
import { EmployeeLayout } from './layouts/EmployeeLayout';
import { useStore } from './store/useStore';

// Public Pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';

// Admin Pages
import AdminOverview from './pages/admin/Overview';
import AdminInterventions from './pages/admin/Interventions';
import AdminCompanies from './pages/admin/Companies';
import AdminBenchmarks from './pages/admin/Benchmarks';
import AdminTemplates from './pages/admin/Templates';
import AdminPromptCenter from './pages/admin/PromptCenter';
import AdminLibraryManager from './pages/admin/LibraryManager';

// Company Pages
import CompanyDashboard from './pages/company/Dashboard';
import CompanyDepartments from './pages/company/Departments';
import CompanyDepartmentDetail from './pages/company/DepartmentDetail';
import CompanyActionPlans from './pages/company/ActionPlans';
import CompanyReports from './pages/company/Reports';
import CompanyPersonas from './pages/company/Personas';
import CompanyTests from './pages/company/Tests';

// Employee Pages
import EmployeeHome from './pages/employee/Home';
import EmployeeMyStats from './pages/employee/MyStats';
import EmployeeInsights from './pages/employee/Insights';
import EmployeeHelpCoach from './pages/employee/HelpCoach';
import EmployeeLibrary from './pages/employee/Library';

function App() {
  const loadBackendData = useStore((state) => state.loadBackendData);

  useEffect(() => {
    loadBackendData();
  }, [loadBackendData]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/overview" replace />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="companies" element={<AdminCompanies />} />
          <Route path="benchmarks" element={<AdminBenchmarks />} />
          <Route path="templates" element={<AdminTemplates />} />
          <Route path="interventions" element={<AdminInterventions />} />
          <Route path="prompt-center" element={<AdminPromptCenter />} />
          <Route path="library" element={<AdminLibraryManager />} />
          {/* Fallback for unbuilt admin routes */}
          <Route path="*" element={<div className="p-8 text-muted-foreground">This section is under construction for the demo.</div>} />
        </Route>

        {/* Company Routes */}
        <Route path="/company" element={<CompanyLayout />}>
          <Route index element={<Navigate to="/company/dashboard" replace />} />
          <Route path="dashboard" element={<CompanyDashboard />} />
          <Route path="departments" element={<CompanyDepartments />} />
          <Route path="departments/:id" element={<CompanyDepartmentDetail />} />
          <Route path="personas" element={<CompanyPersonas />} />
          <Route path="tests" element={<CompanyTests />} />
          <Route path="action-plans" element={<CompanyActionPlans />} />
          <Route path="reports" element={<CompanyReports />} />
          {/* Fallback for unbuilt company routes */}
          <Route path="*" element={<div className="p-8 text-muted-foreground">This section is under construction for the demo.</div>} />
        </Route>

        {/* Employee Routes */}
        <Route path="/employee" element={<EmployeeLayout />}>
          <Route index element={<Navigate to="/employee/home" replace />} />
          <Route path="home" element={<EmployeeHome />} />
          <Route path="my-stats" element={<EmployeeMyStats />} />
          <Route path="insights" element={<EmployeeInsights />} />
          <Route path="help-coach" element={<EmployeeHelpCoach />} />
          <Route path="library" element={<EmployeeLibrary />} />
          {/* Fallback for unbuilt employee routes */}
          <Route path="*" element={<div className="p-8 text-slate-500">This section is under construction for the demo.</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
