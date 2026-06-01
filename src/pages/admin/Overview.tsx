import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Building2, Users, FileText, AlertTriangle, Activity } from 'lucide-react';
import { fallbackActiveInventories, fallbackCompanies, fallbackDepartments } from '../../data/fallbackData';
import { useAsyncData } from '../../hooks/useAsyncData';
import { getActiveInventories, getCompanies, getDepartments, getPlatformActivity } from '../../lib/api';

export default function Overview() {
  const { data: companies, isLoading } = useAsyncData(getCompanies, fallbackCompanies, []);
  const { data: departments } = useAsyncData(getDepartments, fallbackDepartments, []);
  const { data: activeInventories } = useAsyncData(getActiveInventories, fallbackActiveInventories, []);
  const { data: recentActivity } = useAsyncData(getPlatformActivity, [], []);

  const activeTenants = companies.filter((company) => company.status === 'Active').length;
  const totalEmployees = companies.reduce((sum, company) => sum + company.employees, 0);
  const highRiskDepartments = departments.filter((department) => ['Critical', 'High'].includes(department.riskLevel)).length;
  const sectorCounts = companies.reduce<Record<string, number>>((acc, company) => {
    acc[company.sector] = (acc[company.sector] ?? 0) + 1;
    return acc;
  }, {});
  const sectorDistribution = Object.entries(sectorCounts).map(([sector, count]) => ({
    sector,
    percent: Math.round((count / Math.max(companies.length, 1)) * 100),
  }));
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Platform Overview</h2>
        <p className="text-muted-foreground">
          {isLoading ? 'Loading platform metrics from backend...' : 'Global tenant health and adoption metrics.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Tenants</p>
              <h3 className="text-2xl font-bold">{activeTenants}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
              <h3 className="text-2xl font-bold">{totalEmployees.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Open Campaigns</p>
              <h3 className="text-2xl font-bold">{activeInventories.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">High-Risk Depts</p>
              <h3 className="text-2xl font-bold">{highRiskDepartments}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Tenant Activity</CardTitle>
            <CardDescription>Latest actions across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((log, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{log.tenant}</p>
                      <p className="text-xs text-muted-foreground">{log.action}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{log.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sector Distribution</CardTitle>
            <CardDescription>Active companies by industry</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sectorDistribution.map((item) => (
                <div key={item.sector}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.sector}</span>
                    <span className="text-muted-foreground">{item.percent}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${item.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
