import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Users, ArrowRight, X, Workflow, Zap, Loader2, AlertTriangle } from 'lucide-react';
import { getInterventions, getPersonas } from '../../lib/api';
import type { Intervention, Persona } from '../../types/domain';

export default function Personas() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  const loadPersonaData = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const [loadedPersonas, loadedInterventions] = await Promise.all([
        getPersonas(),
        getInterventions(),
      ]);
      setPersonas(loadedPersonas);
      setInterventions(loadedInterventions);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load persona data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadPersonaData();
  }, [loadPersonaData]);

  const personaInterventions = selectedPersona
    ? selectedPersona.recommendedBundle
        .map(interventionId => interventions.find(intervention => intervention.id === interventionId))
        .filter((intervention): intervention is Intervention => Boolean(intervention))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Risk Personas</h2>
        <p className="text-muted-foreground">Organizational clusters based on psychometric patterns.</p>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="p-8 flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Loading risk personas...
          </CardContent>
        </Card>
      )}

      {!isLoading && loadError && (
        <Card className="border-destructive/30">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Unable to load personas</h3>
                <p className="text-sm text-muted-foreground mt-1">{loadError}</p>
              </div>
            </div>
            <Button variant="outline" onClick={loadPersonaData}>Retry</Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !loadError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personas.map(persona => (
          <Card key={persona.id} className="hover:border-primary/50 transition-colors flex flex-col">
            <CardHeader>
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">{persona.name}</CardTitle>
              </div>
              <CardDescription>{persona.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Dominant Pattern</p>
                  <p className="text-sm font-semibold text-destructive">{persona.dominantPattern}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Affected Departments</p>
                  <div className="flex flex-wrap gap-1">
                    {persona.affectedDepartments.map(dept => (
                      <Badge key={dept} variant="secondary" className="text-[10px]">{dept}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-6" onClick={() => setSelectedPersona(persona)}>
                View Recommended Interventions <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {selectedPersona && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl mx-4 shadow-xl max-h-[80vh] flex flex-col">
            <CardHeader className="flex flex-row justify-between items-start pb-4 border-b border-border shrink-0">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <Zap className="w-5 h-5 text-primary mr-2" />
                  Interventions for: {selectedPersona.name}
                </CardTitle>
                <CardDescription>AI-recommended actions to mitigate "{selectedPersona.dominantPattern}"</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedPersona(null)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 overflow-y-auto">
              <div className="space-y-4">
                {personaInterventions.map((intervention) => (
                  <div key={intervention.id} className="p-4 rounded-lg bg-secondary/30 border border-border flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Workflow className="w-4 h-4 text-muted-foreground" />
                        <h4 className="font-semibold text-foreground">{intervention.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{intervention.description}</p>
                      <div className="flex items-center space-x-4 text-xs">
                        <span className="text-muted-foreground">Type: <span className="font-medium text-foreground">{intervention.category}</span></span>
                        <span className="text-muted-foreground">Impact: <span className="font-medium text-emerald-500">{intervention.expectedImpact}/100</span></span>
                        <span className="text-muted-foreground">Cost: <span className="font-medium text-amber-500">{intervention.estimatedCost}/100</span></span>
                      </div>
                    </div>
                    <div className="flex md:flex-col justify-end space-x-2 md:space-x-0 md:space-y-2 shrink-0">
                      <Button size="sm">Add to Plan</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
