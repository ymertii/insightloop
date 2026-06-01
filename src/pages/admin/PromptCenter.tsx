import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TerminalSquare, Save, Check } from 'lucide-react';
import { fallbackPromptTemplates } from '../../data/fallbackData';
import { useAsyncData } from '../../hooks/useAsyncData';
import { getPromptTemplates, savePromptTemplate } from '../../lib/api';

export default function PromptCenter() {
  const { data: promptTemplates, setData: setPromptTemplates, isLoading, error } = useAsyncData(
    getPromptTemplates,
    fallbackPromptTemplates,
    [],
  );
  const [selectedPromptId, setSelectedPromptId] = useState(fallbackPromptTemplates[0].id);
  const [isSaved, setIsSaved] = useState(false);
  const selectedTemplate = promptTemplates.find((template) => template.id === selectedPromptId) ?? promptTemplates[0] ?? fallbackPromptTemplates[0];
  const [promptText, setPromptText] = useState(selectedTemplate.content);

  useEffect(() => {
    setPromptText(selectedTemplate.content);
  }, [selectedTemplate.content, selectedTemplate.id]);

  const handleSave = async () => {
    const savedTemplate = await savePromptTemplate({ ...selectedTemplate, content: promptText });
    setPromptTemplates(promptTemplates.map((template) => template.id === savedTemplate.id ? savedTemplate : template));
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">AI Prompt Center</h2>
        <p className="text-muted-foreground">
          {isLoading ? 'Loading prompt templates from backend...' : error ? error : 'Manage the generative AI narrative engine templates.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          {promptTemplates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-colors ${selectedPromptId === template.id ? 'border-primary/50 bg-primary/5' : 'hover:border-border'}`}
              onClick={() => setSelectedPromptId(template.id)}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-base">{template.title}</CardTitle>
                <CardDescription className="text-xs">{template.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TerminalSquare className="w-5 h-5 text-primary" />
                <CardTitle>Edit Prompt Template</CardTitle>
              </div>
              <Button size="sm" onClick={handleSave}>
                {isSaved ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {isSaved ? 'Saved!' : 'Save Changes'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-secondary/30 rounded-md border border-border text-xs font-mono text-muted-foreground">
                Available Variables: {selectedTemplate.variables.map((variable) => `{{${variable}}}`).join(', ')}
              </div>
              <textarea 
                className="w-full h-64 p-4 bg-background border border-border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
