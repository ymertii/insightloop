import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { InsightReportDocument } from '../../components/reports/InsightReportDocument';
import { useStore } from '../../store/useStore';
import { FileText, Download, Eye, Search, X, Loader2, Sparkles, Building2, Users, ClipboardList, AlertTriangle } from 'lucide-react';
import { getCompletedTests, getDepartments, getReports } from '../../lib/api';
import type { CompletedTest, Department, Report, ReportCategory } from '../../types/domain';

const completedTestToInventoryReport = (test: CompletedTest): Report => ({
  id: `INV-${test.id}`,
  title: test.name,
  type: 'Inventory Report',
  scope: test.target ?? 'Company',
  date: test.date,
  author: 'System',
  status: test.status ?? 'Published',
  category: 'Inventory',
  content: JSON.stringify({
    metrics: {
      responseRate: test.rate,
      responses: test.responses,
      ...test.metrics,
    },
    insights: test.insights ?? [],
    summary: test.finding,
  }),
});

const buildGeneratedReportContent = (reportFocus: string, departments: Department[]) => {
  const selectedDepartment = reportFocus.startsWith('dept-')
    ? departments.find((department) => department.id === reportFocus.replace('dept-', ''))
    : undefined;

  return JSON.stringify({
    generatedAt: new Date().toISOString(),
    metrics: selectedDepartment
      ? {
          burnoutScore: selectedDepartment.burnoutScore,
          employeeCount: selectedDepartment.employeeCount,
          fairness: selectedDepartment.fairness,
          resourceIndex: selectedDepartment.resourceIndex,
          riskLevel: selectedDepartment.riskLevel,
          stressScore: selectedDepartment.stressScore,
        }
      : {
          averageBurnout: departments.reduce((sum, department) => sum + department.burnoutScore, 0) / Math.max(departments.length, 1),
          averageStress: departments.reduce((sum, department) => sum + department.stressScore, 0) / Math.max(departments.length, 1),
          criticalDepartments: departments.filter((department) => department.riskLevel === 'Critical').length,
          totalEmployees: departments.reduce((sum, department) => sum + department.employeeCount, 0),
        },
    reportFocus,
  });
};

export default function Reports() {
  const { generatedReports, addReport } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [completedInventoryReports, setCompletedInventoryReports] = useState<Report[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'organization' | 'department' | 'inventory'>('organization');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportFocus, setReportFocus] = useState('org-full');
  const openedReportIdRef = React.useRef<string | null>(null);

  const loadReportsData = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const [loadedReports, loadedDepartments, completedTests] = await Promise.all([
        getReports(),
        getDepartments(),
        getCompletedTests(),
      ]);
      setReports(loadedReports);
      setDepartments(loadedDepartments);
      setCompletedInventoryReports(completedTests.map(completedTestToInventoryReport));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load reports data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadReportsData();
  }, [loadReportsData]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    let title = 'Organization-Wide Summary';
    let scope = 'Company';
    let type = 'Executive Summary';
    let category: ReportCategory = 'Organization';
    
    if (reportFocus.startsWith('dept-')) {
      const deptId = reportFocus.replace('dept-', '');
      const dept = departments.find(d => d.id === deptId);
      title = `${dept?.name} Department Diagnostic`;
      scope = `${dept?.name} Department`;
      type = 'Department Diagnostic';
      category = 'Department';
    } else if (reportFocus.startsWith('test-')) {
      const inventoryReport = completedInventoryReports.find((report) => report.id === reportFocus.replace('test-', ''));
      title = inventoryReport?.title ?? 'Inventory Assessment Report';
      scope = inventoryReport?.scope ?? 'Company';
      type = 'Inventory Report';
      category = 'Inventory';
    }

    try {
      const savedReport = await addReport({
        id: `REP-${Date.now()}`,
        title,
        type,
        scope,
        date: new Date().toISOString().split('T')[0],
        author: 'AI Narrative Engine',
        status: 'Published',
        content: buildGeneratedReportContent(reportFocus, departments),
        category
      });
      setActiveTab(category === 'Department' ? 'department' : category === 'Inventory' ? 'inventory' : 'organization');
      setIsGenerateModalOpen(false);
      setSelectedReport(savedReport);
      setIsViewModalOpen(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to generate report.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleView = (report: any) => {
    setSelectedReport(report);
    setIsViewModalOpen(true);
  };

  const handlePrintReport = React.useCallback(() => {
    window.setTimeout(() => window.print(), 350);
  }, []);

  const handleDownload = (report: Report) => {
    setSelectedReport(report);
    setIsViewModalOpen(true);
    window.setTimeout(() => window.print(), 650);
  };

  const allReports = React.useMemo<Report[]>(() => {
    const reportsById = new Map<string, Report>();

    [...reports, ...completedInventoryReports, ...generatedReports].forEach((report) => {
      reportsById.set(report.id, report);
    });

    return Array.from(reportsById.values());
  }, [reports, completedInventoryReports, generatedReports]);

  const orgReports = allReports.filter(r => r.scope === 'Company' && r.type !== 'Inventory Report' && r.category !== 'Inventory' && r.category !== 'Department');
  const deptReports = allReports.filter(r => r.scope === 'Department' || r.category === 'Department');
  const inventoryReports = allReports.filter(r => r.category === 'Inventory');

  const displayedReports = 
    activeTab === 'organization' ? orgReports :
    activeTab === 'department' ? deptReports :
    inventoryReports;

  React.useEffect(() => {
    const openReportId = (location.state as { openReportId?: string } | null)?.openReportId;
    if (!openReportId || openedReportIdRef.current === openReportId || allReports.length === 0) return;

    const reportToOpen = allReports.find((report) => report.id === openReportId);
    if (!reportToOpen) return;

    openedReportIdRef.current = openReportId;
    setActiveTab(reportToOpen.category === 'Department' ? 'department' : reportToOpen.category === 'Inventory' ? 'inventory' : 'organization');
    setSelectedReport(reportToOpen);
    setIsViewModalOpen(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [allReports, location.pathname, location.state, navigate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI & Analytic Reports</h2>
          <p className="text-muted-foreground">Access generated narratives, diagnostics, and executive summaries.</p>
        </div>
        <Button onClick={() => setIsGenerateModalOpen(true)} disabled={isLoading || !!loadError}>
          <FileText className="w-4 h-4 mr-2" /> Generate New Report
        </Button>
      </div>

      <div className="flex space-x-1 border-b border-border mb-6">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'organization'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('organization')}
        >
          <Building2 className="w-4 h-4" />
          <span>Organizational</span>
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'department'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('department')}
        >
          <Users className="w-4 h-4" />
          <span>Department</span>
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'inventory'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('inventory')}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Test Results</span>
        </button>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search reports..." 
            className="w-full pl-9 pr-4 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select className="px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option>All Types</option>
          <option>Executive Summary</option>
          <option>Department Diagnostic</option>
          <option>Deep Dive</option>
        </select>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="p-8 flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Loading reports...
          </CardContent>
        </Card>
      )}

      {!isLoading && loadError && (
        <Card className="border-destructive/30">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Unable to load reports</h3>
                <p className="text-sm text-muted-foreground mt-1">{loadError}</p>
              </div>
            </div>
            <Button variant="outline" onClick={loadReportsData}>Retry</Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !loadError && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayedReports.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No reports found for this category.
          </div>
        ) : (
          displayedReports.map(report => (
            <Card key={report.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <Badge variant="outline" className="text-xs">{report.type}</Badge>
                  </div>
                  <Badge variant={report.status === 'Published' ? 'success' : 'secondary'} className="text-xs">
                    {report.status}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold mb-2">{report.title}</h3>
                <div className="text-sm text-muted-foreground space-y-1 mb-6">
                  <p>Scope: {report.scope}</p>
                  <p>Date: {report.date}</p>
                  <p>Author: {report.author}</p>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" className="flex-1" onClick={() => handleView(report)}>
                    <Eye className="w-4 h-4 mr-2" /> View
                  </Button>
                  <Button variant="secondary" size="icon" onClick={() => handleDownload(report)} aria-label={`Download ${report.title} as PDF`}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
        </div>
      )}

      {/* Generate Report Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4 shadow-xl">
            <CardHeader className="flex flex-row justify-between items-start pb-4 border-b border-border">
              <div>
                <CardTitle className="flex items-center">
                  <Sparkles className="w-5 h-5 text-primary mr-2" />
                  AI Report Generator
                </CardTitle>
                <CardDescription>Configure parameters for the AI report engine.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsGenerateModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Focus</label>
                <select 
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={reportFocus}
                  onChange={(e) => setReportFocus(e.target.value)}
                >
                  <optgroup label="Organization">
                    <option value="org-full">Organization-Wide Summary</option>
                  </optgroup>
                  <optgroup label="Departments">
                    {departments.map(d => (
                      <option key={d.id} value={`dept-${d.id}`}>{d.name} Department Diagnostic</option>
                    ))}
                  </optgroup>
                  <optgroup label="Inventories">
                    {completedInventoryReports.map((report) => (
                      <option key={report.id} value={`test-${report.id}`}>{report.title}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Output Format</label>
                <select className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Executive Brief (1-2 pages)</option>
                  <option>Comprehensive Analysis (Detailed)</option>
                  <option>Presentation Deck Outline</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Key Objectives (Optional prompts)</label>
                <textarea 
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary h-20 resize-none" 
                  placeholder="Focus heavily on the correlation between remote work and the isolation metric..."
                />
              </div>

              <Button className="w-full mt-4" onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing Data...</> : 'Generate Report'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Report Modal */}
      {isViewModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-6xl mx-4 shadow-xl h-[88vh] flex flex-col">
            <CardHeader className="flex flex-row justify-between items-start pb-4 border-b border-border shrink-0">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant="outline">{selectedReport.type}</Badge>
                  <span className="text-xs text-muted-foreground">{selectedReport.date}</span>
                </div>
                <CardTitle className="text-xl">{selectedReport.title}</CardTitle>
                <CardDescription>Scope: {selectedReport.scope}</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handlePrintReport}>
                  <Download className="w-4 h-4 mr-2" /> PDF
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsViewModalOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto w-full bg-[#f4f6f9] p-0">
              <InsightReportDocument departments={departments} onPrint={handlePrintReport} report={selectedReport} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
