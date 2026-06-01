import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Progress } from '../../components/ui/Progress';
import { Sun, Battery, Brain, Moon, ArrowRight, MessageCircle, X, Activity, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useStore } from '../../store/useStore';
import { fallbackEmployeeDashboard } from '../../data/fallbackData';
import { useAsyncData } from '../../hooks/useAsyncData';
import { getActiveEmployeeAssignment, getEmployeeDashboard } from '../../lib/api';

export default function Home() {
  const navigate = useNavigate();
  const { libraryResources } = useStore();
  const { data: employeeDashboard } = useAsyncData(getEmployeeDashboard, fallbackEmployeeDashboard, []);
  const { data: activeAssignment } = useAsyncData(getActiveEmployeeAssignment, null, []);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [surveyStep, setSurveyStep] = useState(0);

  const handleStartSurvey = () => {
    if (!activeAssignment) return;
    setIsSurveyModalOpen(true);
    setSurveyStep(1);
  };

  const handleNextStep = () => {
    const totalQuestions = activeAssignment?.questions.length ?? 0;
    if (surveyStep < totalQuestions) {
      setSurveyStep(surveyStep + 1);
    } else {
      setIsSurveyModalOpen(false);
      setSurveyStep(0);
      alert('Survey completed! Your insights have been updated.');
    }
  };

  const recommendedBlog = libraryResources.find(r => r.category === 'Blog') || libraryResources[0];
  const recommendedExercise = libraryResources.find(r => r.category === 'Exercise') || libraryResources[1];
  const latestTrend = employeeDashboard.personalTrend['3M']?.slice(-1)[0] ?? employeeDashboard.personalTrend['6M']?.slice(-1)[0];
  const stressValue = Number(latestTrend?.stress ?? 0);
  const recoveryValue = Number(latestTrend?.recovery ?? 0);
  const engagementValue = Number(latestTrend?.engagement ?? 0);
  const dailySnapshot = employeeDashboard.dailySnapshot;
  const firstName = activeAssignment?.employeeName?.split(' ')[0];
  const moodLabel = dailySnapshot?.mood ?? (engagementValue >= 3.8 ? 'Positive' : engagementValue >= 3 ? 'Neutral' : 'Low');
  const stressLabel = dailySnapshot?.stress ?? (stressValue >= 3.6 ? 'High' : stressValue >= 2.7 ? 'Moderate' : 'Low');
  const energyLabel = dailySnapshot?.energy ?? (recoveryValue >= 3.6 ? 'Restored' : recoveryValue >= 3 ? 'Stable' : 'Low');
  const sleepLabel = dailySnapshot?.sleepHours ? `${dailySnapshot.sleepHours.toFixed(1)} hrs` : `${recoveryValue.toFixed(1)}/5`;
  const currentQuestion = activeAssignment?.questions[surveyStep - 1];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Greeting */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Good Morning{firstName ? `, ${firstName}` : ''}</h2>
          <p className="text-slate-600 text-lg">Here's your personal wellbeing snapshot for today.</p>
        </div>
      </div>

      {/* Quick Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-100 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-amber-500 rounded-xl"><Sun className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Mood</p>
              <p className="font-semibold text-slate-800">{moodLabel}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-100 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center space-x-4">
            <div className="p-3 bg-rose-50 text-rose-500 rounded-xl"><Brain className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Stress</p>
              <p className="font-semibold text-slate-800">{stressLabel}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-100 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl"><Battery className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Energy</p>
              <p className="font-semibold text-slate-800">{energyLabel}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-100 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl"><Moon className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{dailySnapshot?.sleepHours ? 'Sleep' : 'Recovery'}</p>
              <p className="font-semibold text-slate-800">{sleepLabel}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-white border-slate-100 shadow-sm rounded-3xl overflow-hidden">
            <div className="h-2 bg-teal-500 w-full"></div>
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-1">{activeAssignment?.name ?? 'No active assessment'}</h3>
                  <p className="text-slate-500">
                    {activeAssignment ? 'Your input helps shape organizational support.' : 'You are currently clear of assigned check-ins.'}
                  </p>
                </div>
                <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">{activeAssignment?.dueLabel ?? 'No due date'}</span>
              </div>
              <Progress value={activeAssignment?.progress ?? 0} className="h-2 mb-6 bg-slate-100" indicatorColor="bg-teal-500" />
              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-6 text-lg" onClick={handleStartSurvey} disabled={!activeAssignment}>
                Start Survey
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-100 shadow-sm rounded-3xl">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-slate-800">My Strengths Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={employeeDashboard.strengths}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Me"
                      dataKey="A"
                      stroke="#0d9488"
                      strokeWidth={2}
                      fill="#14b8a6"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-100 shadow-sm rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-slate-800">Today's Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors flex justify-between items-center group" onClick={() => navigate('/employee/library')}>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Featured Blog: {recommendedBlog?.title}</h4>
                    <p className="text-sm text-slate-500">{recommendedBlog?.duration}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600 transition-colors" />
              </div>
              <div className="p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors flex justify-between items-center group" onClick={() => navigate('/employee/library')}>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-100 transition-colors">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Quick Exercise: {recommendedExercise?.title}</h4>
                    <p className="text-sm text-slate-500">{recommendedExercise?.duration}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600 transition-colors" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          <Card className="bg-white border-slate-100 shadow-sm rounded-3xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/employee/my-stats')}>
            <CardHeader className="pb-2 bg-slate-50/50">
              <CardTitle className="text-lg text-slate-800 flex justify-between items-center">
                Wellbeing Trend
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </CardTitle>
              <CardDescription>Stress Load (Last 5 Months)</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
               <div className="h-[120px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={employeeDashboard.miniTrend} margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id="colorMiniStress" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorMiniStress)" />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-100 shadow-sm rounded-3xl">
             <CardHeader className="pb-2">
               <div className="flex justify-between items-center">
                 <CardTitle className="text-lg text-slate-800">Past Tests</CardTitle>
                 <Button variant="link" className="text-teal-600 px-0 h-auto text-xs" onClick={() => navigate('/employee/my-stats')}>View all</Button>
               </div>
             </CardHeader>
             <CardContent className="space-y-3">
               {employeeDashboard.recentTests.map((rt) => (
                 <div key={rt.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => navigate('/employee/my-stats')}>
                   <div className="flex items-center space-x-3">
                     <CheckCircle2 className="w-5 h-5 text-teal-500" />
                     <div>
                       <p className="text-sm font-semibold text-slate-800">{rt.name}</p>
                       <p className="text-xs text-slate-500">{rt.date}</p>
                     </div>
                   </div>
                   <ArrowRight className="w-4 h-4 text-slate-400" />
                 </div>
               ))}
             </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md rounded-3xl border-0">
            <CardContent className="p-6">
              <MessageCircle className="w-8 h-8 mb-4 opacity-80" />
              <h3 className="text-xl font-bold mb-2">Need guidance?</h3>
              <p className="text-teal-50 text-sm mb-6">Chat with your Help Coach to understand your profile or find resources.</p>
              <Button className="w-full bg-white text-teal-700 hover:bg-teal-50 rounded-xl" onClick={() => navigate('/employee/help-coach')}>
                Open Chat
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Survey Modal */}
      {isSurveyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <Card className="w-full max-w-lg bg-white shadow-2xl rounded-3xl overflow-hidden border-0 flex flex-col max-h-[90vh]">
             <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
               <div>
                 <h3 className="font-bold text-slate-800">Maslach Burnout Inventory</h3>
                 <p className="text-xs text-slate-500 font-medium">Question {surveyStep} of {activeAssignment?.questions.length ?? 0}</p>
               </div>
               <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 rounded-full" onClick={() => setIsSurveyModalOpen(false)}>
                 <X className="w-5 h-5" />
               </Button>
             </div>
             <CardContent className="p-8">
               <div className="space-y-6">
                 {currentQuestion && (
                   <>
                    <h4 className="text-lg font-semibold text-slate-800 text-center">{currentQuestion.question}</h4>
                    <div className="flex flex-col space-y-3">
                      {currentQuestion.options.map(opt => (
                        <Button key={opt} variant="outline" className="justify-start py-6 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200" onClick={handleNextStep}>
                          {opt}
                        </Button>
                      ))}
                    </div>
                   </>
                 )}
               </div>
             </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
