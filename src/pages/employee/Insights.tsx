import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Sparkles, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fallbackEmployeeDashboard } from '../../data/fallbackData';
import { useAsyncData } from '../../hooks/useAsyncData';
import { getEmployeeDashboard } from '../../lib/api';

export default function Insights() {
  const navigate = useNavigate();
  const { data: employeeDashboard, isLoading, error } = useAsyncData(getEmployeeDashboard, fallbackEmployeeDashboard, []);
  const sortedStrengths = [...employeeDashboard.strengths].sort((a, b) => Number(b.A) - Number(a.A));
  const topStrengths = sortedStrengths.slice(0, 2);
  const frictionPoints = sortedStrengths.slice(-2).reverse();
  const latestTrend = employeeDashboard.personalTrend['3M']?.at(-1);
  const latestStress = Number(latestTrend?.stress ?? employeeDashboard.miniTrend.at(-1)?.value ?? 0);
  const latestRecovery = Number(latestTrend?.recovery ?? 0);
  const latestEngagement = Number(latestTrend?.engagement ?? 0);
  const stressLabel = latestStress >= 3.5 ? 'elevated' : latestStress >= 2.6 ? 'moderate' : 'low';
  const recoveryLabel = latestRecovery >= 3.5 ? 'strong' : latestRecovery >= 2.8 ? 'stable' : 'needs support';

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Personal Insights</h2>
        <p className="text-slate-500">
          {isLoading ? 'Loading your latest backend snapshot...' : error ? error : 'AI-generated analysis based on your recent survey responses.'}
        </p>
      </div>

      <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100 shadow-sm rounded-3xl">
        <CardContent className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Your Wellbeing Summary</h3>
          </div>
          <p className="text-slate-700 leading-relaxed text-lg">
            Based on your latest response pattern, your stress load is currently {stressLabel}, while recovery readiness is {recoveryLabel}.
            Your strongest signals are {topStrengths.map((strength) => strength.subject).join(' and ')}, which are helping buffer day-to-day pressure.
            <br/><br/>
            The dimensions needing the most attention are {frictionPoints.map((point) => point.subject).join(' and ')}.
            Your latest engagement score is {latestEngagement || 'not yet available'}, so the best next step is to protect recovery time while improving control over high-friction tasks.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border-slate-100 shadow-sm rounded-3xl">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <CardTitle className="text-lg text-slate-800">Your Strengths</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {topStrengths.map((strength) => (
                <li className="flex items-start" key={strength.subject}>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-slate-600">
                    <strong>{strength.subject}:</strong> Your latest score is {strength.A}/100.
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 shadow-sm rounded-3xl">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <CardTitle className="text-lg text-slate-800">Friction Points</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {frictionPoints.map((point) => (
                <li className="flex items-start" key={point.subject}>
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-slate-600">
                    <strong>{point.subject}:</strong> This is one of your lower current scores at {point.A}/100.
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-4">
        <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8 py-6 text-lg" onClick={() => navigate('/employee/help-coach')}>
          Discuss this with Help Coach <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
