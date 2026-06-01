import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Building2, Plus, Search, X, Copy as CopyIcon, ExternalLink, Check, AlertTriangle, FileText, Download, Briefcase } from 'lucide-react';
import {
  createCompany,
  getCompanies,
  getCompanyRequests,
  getInvoices,
  updateCompany,
} from '../../lib/api';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fallbackCompanies, fallbackCompanyRequests, fallbackInvoices } from '../../data/fallbackData';
import type { Company, RiskLevel } from '../../types/domain';

const SECTORS = ['Technology', 'FMCG', 'Finance', 'Retail', 'Education', 'Healthcare', 'Manufacturing', 'Logistics', 'Other'];
const SUBSCRIPTION_PLANS = ['Starter', 'Professional', 'Enterprise'];
const PAYMENT_STATUSES = ['Paid', 'Overdue', 'Trial', 'Cancelled'];
type CompanyForm = Omit<Company, 'id'>;

export default function Companies() {
  const { data: companies, setData: setCompanies, isLoading, error } = useAsyncData(getCompanies, fallbackCompanies, []);
  const { data: companyRequests, setData: setCompanyRequests } = useAsyncData(getCompanyRequests, fallbackCompanyRequests, []);
  const { data: invoices } = useAsyncData(getInvoices, fallbackInvoices, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeTab, setActiveTab] = useState<'general' | 'billing' | 'invite' | 'risk'>('general');
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const [formData, setFormData] = useState<CompanyForm>({
    name: '', sector: 'Technology', employees: 0, activeEmployees: 0, website: '',
    status: 'Active', risk: 'Unknown', contactName: '', contactEmail: '', contactPhone: '',
    paymentStatus: 'Trial', subscriptionPlan: 'Professional', nextBillingDate: '', tenantCode: ''
  });

  const [copiedLink, setCopiedLink] = useState(false);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const handleOpenCreate = () => {
    setModalMode('create');
    setActiveTab('general');
    setFormData({ 
      name: '', sector: 'Technology', employees: 0, activeEmployees: 0, website: '',
      status: 'Active', risk: 'Unknown', contactName: '', contactEmail: '', contactPhone: '',
      paymentStatus: 'Trial', subscriptionPlan: 'Professional', nextBillingDate: '', 
      tenantCode: `TEN-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (company: Company) => {
    setModalMode('edit');
    setActiveTab('general');
    setEditingCompany(company);
    const { id, ...companyForm } = company;
    setFormData(companyForm);
    setIsModalOpen(true);
  };

  const handleOpenReview = (request: any) => {
    setSelectedRequest(request);
    setIsReviewModalOpen(true);
  };

  const handleSave = async () => {
    if (modalMode === 'create') {
      const savedCompany = await createCompany(formData);
      setCompanies([...companies, savedCompany]);
    } else if (modalMode === 'edit' && editingCompany) {
      const savedCompany = await updateCompany(editingCompany.id, formData);
      setCompanies(companies.map(c => c.id === editingCompany.id ? savedCompany : c));
    }
    setIsModalOpen(false);
  };

  const copyInviteLink = (tenantCode: string) => {
    const link = `https://happiwork.app/invite/${tenantCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tenant Management</h2>
          <p className="text-muted-foreground">
            {isLoading ? 'Loading tenant data from backend...' : error ? error : 'Manage companies, payments, and view detailed risk analyses.'}
          </p>
        </div>
        <Button onClick={handleOpenCreate}><Plus className="w-4 h-4 mr-2" /> New Tenant</Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Companies</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tenants..."
                className="w-full bg-background border border-border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Tenant</th>
                  <th className="px-4 py-3 font-medium">Sector</th>
                  <th className="px-4 py-3 font-medium">Employees (Active)</th>
                  <th className="px-4 py-3 font-medium">Status & Payment</th>
                  <th className="px-4 py-3 font-medium">Overall Risk</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center font-medium">
                        <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                        {company.name}
                      </div>
                      <div className="text-xs text-muted-foreground ml-6 mt-0.5 font-mono">
                        {company.tenantCode}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <Badge variant="outline" className="font-normal text-xs">{company.sector}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{company.activeEmployees.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">/ {company.employees.toLocaleString()} total</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start space-y-1">
                        <Badge variant={company.status === 'Active' ? 'success' : 'secondary'} className="text-[10px]">
                          {company.status}
                        </Badge>
                        <span className={`text-[10px] font-medium ${company.paymentStatus === 'Overdue' ? 'text-destructive' : 'text-muted-foreground'}`}>
                          Billing: {company.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={
                        company.risk === 'Critical' ? 'destructive' : 
                        company.risk === 'High' ? 'warning' : 
                        company.risk === 'Moderate' ? 'default' : 'outline'
                      } className="text-[10px]">
                        {company.risk}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEdit(company)}>Manage</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] flex flex-col">
            <CardHeader className="flex flex-row justify-between items-start pb-4 border-b border-border shrink-0">
              <div>
                <CardTitle>{modalMode === 'create' ? 'Add New Tenant' : `Manage Tenant: ${formData.name}`}</CardTitle>
                <CardDescription>
                  {modalMode === 'create' ? 'Create a new company account.' : 'Update company details, billing, and invites.'}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            
            {/* Tabs */}
            <div className="flex flex-wrap border-b border-border px-6 mt-2 shrink-0 space-x-1">
              {[
                { id: 'general', label: 'General Info' },
                { id: 'billing', label: 'Contact & Billing' },
                { id: 'invite', label: 'Invite & Onboarding', disabled: modalMode === 'create' },
                { id: 'risk', label: 'Detailed Risk Analysis', disabled: modalMode === 'create' }
              ].map(tab => (
                <button
                  key={tab.id}
                  disabled={tab.disabled}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    activeTab === tab.id 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <CardContent className="pt-6 overflow-y-auto">
              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium">Tenant Code (Auto-generated ID)</label>
                      <input
                        type="text"
                        readOnly
                        value={formData.tenantCode}
                        className="w-full border rounded-md px-3 py-2 text-sm bg-secondary/50 font-mono text-muted-foreground focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Company Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g. Acme Corp"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Website</label>
                      <input
                        type="text"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g. https://example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sector</label>
                      <select
                        value={formData.sector}
                        onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                        className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {SECTORS.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Active">Active</option>
                        <option value="Onboarding">Onboarding</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Overall Risk Override</label>
                      <select
                        value={formData.risk}
                        onChange={(e) => setFormData({ ...formData, risk: e.target.value as RiskLevel })}
                        className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-3">Primary Contact</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium">Contact Name</label>
                        <input
                          type="text"
                          value={formData.contactName}
                          onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="e.g. Jane Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Contact Email</label>
                        <input
                          type="email"
                          value={formData.contactEmail}
                          onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="e.g. jane@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Contact Phone</label>
                        <input
                          type="text"
                          value={formData.contactPhone}
                          onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="e.g. +1 555 1234"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-3">Billing & Subscription</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Subscription Plan</label>
                        <select
                          value={formData.subscriptionPlan}
                          onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                          className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {SUBSCRIPTION_PLANS.map(plan => <option key={plan} value={plan}>{plan}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Payment Status</label>
                        <select
                          value={formData.paymentStatus}
                          onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                          className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {PAYMENT_STATUSES.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Next Billing Date</label>
                        <input
                          type="date"
                          value={formData.nextBillingDate}
                          onChange={(e) => setFormData({ ...formData, nextBillingDate: e.target.value })}
                          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {modalMode === 'edit' && (
                    <div>
                      <h3 className="text-sm font-bold text-foreground mb-3">Recent Invoices</h3>
                      <div className="border border-border rounded-lg overflow-hidden">
                        {invoices.map((inv, idx) => (
                          <div key={inv.id} className={`flex items-center justify-between p-3 text-sm ${idx !== invoices.length - 1 ? 'border-b border-border' : ''}`}>
                            <div className="flex items-center space-x-3">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium text-foreground">{inv.id}</span>
                              <span className="text-muted-foreground">{inv.date}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="font-mono">{inv.amount}</span>
                              <Badge variant="success" className="text-[10px]">{inv.status}</Badge>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Download className="w-3 h-3 text-muted-foreground" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'invite' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl border border-border bg-secondary/20">
                    <h3 className="text-sm font-bold text-foreground flex items-center mb-1">
                      <ExternalLink className="w-4 h-4 mr-2 text-primary" /> Employee Invitation Link
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">Share this link with {formData.name} employees so they can automatically join this tenant workspace.</p>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-secondary border border-border rounded-md px-3 py-2 text-sm font-mono text-muted-foreground overflow-x-auto whitespace-nowrap">
                        https://happiwork.app/invite/{formData.tenantCode}
                      </div>
                      <Button variant="secondary" onClick={() => copyInviteLink(formData.tenantCode)} className="shrink-0">
                        {copiedLink ? <Check className="w-4 h-4 text-green-600" /> : <CopyIcon className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-3">Onboarding Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Target Total Employees</label>
                        <input
                          type="number"
                          value={formData.employees}
                          onChange={(e) => setFormData({ ...formData, employees: parseInt(e.target.value) || 0 })}
                          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Currently Onboarded / Active</label>
                        <div className="flex items-center space-x-3 mt-2">
                          <div className="text-2xl font-bold">{formData.activeEmployees}</div>
                          <div className="text-sm text-muted-foreground">employees</div>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-primary h-full" 
                              style={{ width: `${formData.employees > 0 ? Math.min(100, Math.round((formData.activeEmployees / formData.employees) * 100)) : 0}%` }}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground w-10 text-right">
                            {formData.employees > 0 ? Math.round((formData.activeEmployees / formData.employees) * 100) : 0}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'risk' && modalMode === 'edit' && (
                <div className="space-y-6">
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                    <div className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-orange-500 mr-2 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-orange-900">Risk Profile: {formData.risk}</h4>
                        <p className="text-sm text-orange-800 mt-1">Based on recent psychometric surveys and platform activity.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="text-sm font-medium">Burnout Risk (MBI)</span>
                      <Badge variant={formData.risk === 'Critical' ? 'destructive' : 'warning'}>Elevated</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="text-sm font-medium">Perceived Stress (PSS)</span>
                      <Badge variant={formData.risk === 'Moderate' ? 'default' : 'warning'}>Moderate</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="text-sm font-medium">Engagement/Resources (JD-R)</span>
                      <Badge variant="outline">Stable</Badge>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => alert('Detailed analytical report generation under construction.')}>
                    Download Full Risk Analytics PDF
                  </Button>
                </div>
              )}

            </CardContent>
            
            <div className="flex justify-end p-4 border-t border-border mt-auto shrink-0 bg-secondary/10 rounded-b-xl space-x-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Incoming Company Requests Section */}
      <h3 className="text-xl font-bold tracking-tight mt-10 mb-4 flex items-center">
        <Briefcase className="w-5 h-5 mr-2 text-primary" />
        Incoming Company Requests
      </h3>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Request ID & Date</th>
                  <th className="px-6 py-4 font-medium">Company / Contact</th>
                  <th className="px-6 py-4 font-medium">Employees</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companyRequests.map((req) => (
                  <tr key={req.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs">{req.id}</div>
                      <div className="text-muted-foreground text-xs mt-1">{req.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{req.companyName}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{req.contactName} ({req.email})</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{req.employeesSize}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Employees</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{req.type}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={req.status === 'Pending' ? 'warning' : 'success'}>{req.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenReview(req)}>Review</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Review Request Modal */}
      {isReviewModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4 shadow-xl">
            <CardHeader className="flex flex-row justify-between items-start pb-4 border-b border-border">
              <div>
                <CardTitle>Review Request</CardTitle>
                <CardDescription>{selectedRequest.type}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsReviewModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Company</p>
                  <p className="font-medium">{selectedRequest.companyName}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.employeesSize} Employees</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Date</p>
                  <p className="font-medium">{selectedRequest.date}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-muted-foreground uppercase">Contact Info</p>
                  <p className="font-medium">{selectedRequest.contactName}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.email}</p>
                </div>
              </div>
              
              {selectedRequest.status === 'Pending' ? (
                <div className="flex flex-col space-y-2 pt-4 mt-6 border-t border-border">
                  <Button onClick={() => {
                    setCompanyRequests(companyRequests.map(r => r.id === selectedRequest.id ? { ...r, status: 'Resolved' } : r));
                    setIsReviewModalOpen(false);
                  }}>
                    Mark as Resolved
                  </Button>
                  <Button variant="outline">
                    Reply via Email
                  </Button>
                </div>
              ) : (
                <div className="pt-4 mt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center italic">This request has already been handled / resolved.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
