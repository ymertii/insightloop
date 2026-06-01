import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Building2, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { useStore } from '../../store/useStore';

export default function Login() {
  const navigate = useNavigate();
  const { setRole } = useStore();

  const handleRoleSelect = (role: 'admin' | 'company' | 'employee') => {
    setRole(role);
    navigate(`/${role}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to InsighLoop Demo</h1>
        <p className="text-slate-600">Select a role to explore the platform</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full">
        <Card className="cursor-pointer hover:border-indigo-500 transition-colors" onClick={() => handleRoleSelect('admin')}>
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-slate-700" />
            </div>
            <CardTitle>Platform Admin</CardTitle>
            <CardDescription>Super admin, tenant management, and global benchmarks.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-sm font-medium text-indigo-600">Explore Admin Demo &rarr;</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-blue-500 transition-colors border-2 border-transparent shadow-md" onClick={() => handleRoleSelect('company')}>
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle>Company HR</CardTitle>
            <CardDescription>People analytics, department heatmaps, and action plans.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-sm font-medium text-blue-600">Explore Company Demo &rarr;</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-teal-500 transition-colors" onClick={() => handleRoleSelect('employee')}>
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-teal-600" />
            </div>
            <CardTitle>Employee</CardTitle>
            <CardDescription>Personal insights, wellbeing stats, and support library.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-sm font-medium text-teal-600">Explore Employee Demo &rarr;</div>
          </CardContent>
        </Card>
      </div>

      <p className="mt-12 text-sm text-slate-500 max-w-md text-center">
        Note: This prototype presents organizational wellbeing insights and decision support, not clinical diagnosis.
      </p>
    </div>
  );
}
