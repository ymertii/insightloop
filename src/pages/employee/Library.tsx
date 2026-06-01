import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { BookOpen, PlayCircle, Clock, Users, X, Bookmark, Share2, Activity, Heart, FileText, LucideIcon, Filter } from 'lucide-react';
import { useStore, LibraryResource, ResourceCategory } from '../../store/useStore';

const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  PlayCircle,
  Clock,
  Users,
  Activity,
  Heart,
  FileText
};

const categories: ResourceCategory[] = ['Education', 'Practice', 'Guide', 'Recovery', 'Exercise', 'Meditation', 'Blog'];

export default function Library() {
  const [selectedResource, setSelectedResource] = useState<LibraryResource | null>(null);
  const [activeCategory, setActiveCategory] = useState<ResourceCategory | 'All'>('All');
  const { libraryResources } = useStore();

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName];
    return Icon ? Icon : BookOpen;
  };

  const SelectedIcon = selectedResource ? getIcon(selectedResource.iconName) : BookOpen;

  const filteredResources = activeCategory === 'All' 
    ? libraryResources 
    : libraryResources.filter(r => r.category === activeCategory);

  return (
    <div className="space-y-8 max-w-5xl mx-auto relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Resource Library</h2>
          <p className="text-slate-500">Curated tools and guides to support your wellbeing journey.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm overflow-x-auto w-full md:w-auto max-w-full">
          <Button 
            variant="ghost" 
            size="sm"
            className={`px-4 rounded-lg whitespace-nowrap transition-colors ${activeCategory === 'All' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
            onClick={() => setActiveCategory('All')}
          >
            All
          </Button>
          {categories.map(cat => (
            <Button 
              key={cat}
              variant="ghost" 
              size="sm"
              className={`px-4 rounded-lg whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredResources.map((res) => {
          const IconComponent = getIcon(res.iconName);
          return (
            <Card key={res.id} className="bg-white border-slate-100 shadow-sm rounded-3xl hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setSelectedResource(res)}>
              <CardContent className="p-6 flex items-start space-x-4">
                <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl group-hover:bg-teal-100 transition-colors">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{res.category}</span>
                    <span className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md">{res.duration}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{res.title}</h3>
                  <Button variant="link" className="text-teal-600 px-0 h-auto font-semibold" onClick={(e) => { e.stopPropagation(); setSelectedResource(res); }}>
                    Open Resource &rarr;
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredResources.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-3xl border border-slate-100">
            No resources found for this category.
          </div>
        )}
      </div>

      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <Card className="w-full max-w-2xl bg-white shadow-2xl rounded-3xl overflow-hidden border-0 flex flex-col max-h-[90vh]">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-teal-100 text-teal-700 rounded-xl">
                  <SelectedIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{selectedResource.title}</h3>
                  <p className="text-xs text-slate-500 font-medium">{selectedResource.category} • {selectedResource.duration}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 rounded-full" onClick={() => setSelectedResource(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <CardContent className="p-8 overflow-y-auto">
              {selectedResource.type === 'video' && (
                <div className="w-full aspect-video bg-slate-800 rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 to-slate-800 opacity-80" />
                  <PlayCircle className="w-16 h-16 text-white/50 mb-2 relative z-10 hover:text-white/80 cursor-pointer transition-colors" />
                </div>
              )}
              {selectedResource.type === 'audio' && (
                <div className="w-full h-24 bg-slate-100 rounded-2xl mb-6 flex items-center px-6 space-x-4">
                  <Button size="icon" className="rounded-full shrink-0 bg-teal-600 hover:bg-teal-700 text-white shadow-sm">
                    <PlayCircle className="w-6 h-6 ml-0.5" />
                  </Button>
                  <div className="flex-1 space-y-2">
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="w-1/4 h-full bg-teal-500 rounded-full" />
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                      <span>03:45</span>
                      <span>15:00</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="prose prose-slate max-w-none">
                {selectedResource.content.split('\n\n').map((paragraph: string, i: number) => (
                  <p key={i} className="text-slate-600 leading-relaxed mb-4">{paragraph}</p>
                ))}
              </div>
            </CardContent>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-between items-center">
              <div className="space-x-2">
                <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50"><Bookmark className="w-4 h-4 mr-2" /> Save</Button>
                <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50"><Share2 className="w-4 h-4 mr-2" /> Share</Button>
              </div>
              <Button onClick={() => setSelectedResource(null)} className="bg-teal-600 hover:bg-teal-700 text-white">Done</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
