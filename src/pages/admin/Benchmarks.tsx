import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { fallbackBenchmarkData } from '../../data/fallbackData';
import { useAsyncData } from '../../hooks/useAsyncData';
import { getBenchmarks } from '../../lib/api';

export default function Benchmarks() {
  const { data: benchmarkData, isLoading, error } = useAsyncData(getBenchmarks, fallbackBenchmarkData, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Sector Benchmarks</h2>
        <p className="text-muted-foreground">
          {isLoading ? 'Loading benchmark data from backend...' : error ? error : 'Global comparative data for tenant calibration.'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cross-Sector Comparison</CardTitle>
          <CardDescription>Average scores across measured dimensions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={benchmarkData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="sector" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 5]} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} cursor={{fill: '#1e293b'}} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="burnout" name="Burnout Score" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="stress" name="Stress Score" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resources" name="Resource Index" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
