import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Brain, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="px-8 py-6 flex items-center justify-between bg-white border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Activity className="w-8 h-8 text-indigo-600" />
          <span className="text-2xl font-bold text-slate-900 tracking-tight">InsighLoop</span>
        </div>
        <Link to="/login">
          <Button variant="outline" className="font-semibold">Sign In / Demo</Button>
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
            Map Burnout. Explain Stress. <span className="text-indigo-600">Prioritize Action.</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10">
            An AI-supported HR decision support system for measuring organizational burnout patterns and matching the right interventions.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link to="/login">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">
                Explore Demo <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Activity className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">1. Collect Data</h3>
            <p className="text-slate-600">Gather validated psychometric data (MBI, PSS, JD-R) through empathetic employee experiences.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Brain className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">2. Process & Analyze</h3>
            <p className="text-slate-600">Process with AHP/TOPSIS algorithms and generate explainable AI interpretations.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">3. Deliver Action</h3>
            <p className="text-slate-600">Deliver heatmaps, narrative reports, and ranked action plans for HR leadership.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
