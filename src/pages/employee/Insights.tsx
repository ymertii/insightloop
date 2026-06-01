import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Sparkles, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Insights() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Personal Insights</h2>
        <p className="text-slate-500">AI-generated analysis based on your recent survey responses.</p>
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
            Based on your recent responses, you are showing strong resilience and excellent peer support. 
            However, there are indications that your current workload is creating moderate stress, 
            particularly because you feel a lack of autonomy over your schedule. 
            <br/><br/>
            Your recovery metrics are stable, meaning you are successfully disconnecting after work, 
            which is protecting you from deeper burnout risk.
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
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-slate-600"><strong>Strong Peer Support:</strong> You feel well-supported by your immediate team members.</p>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-slate-600"><strong>Effective Recovery:</strong> You maintain good boundaries between work and personal time.</p>
              </li>
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
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-slate-600"><strong>Schedule Autonomy:</strong> You reported feeling restricted in how you manage your daily tasks.</p>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-slate-600"><strong>Pacing:</strong> The speed of incoming requests is occasionally overwhelming.</p>
              </li>
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
