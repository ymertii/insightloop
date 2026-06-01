import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useStore, LibraryResource, ResourceCategory, ResourceType } from '../../store/useStore';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function LibraryManager() {
  const { libraryResources, addResource, updateResource, deleteResource } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<LibraryResource, 'id'>>({
    title: '',
    category: 'Blog',
    duration: '',
    iconName: 'FileText',
    type: 'article',
    content: ''
  });

  const categories: ResourceCategory[] = ['Education', 'Practice', 'Guide', 'Recovery', 'Exercise', 'Meditation', 'Blog'];
  const types: ResourceType[] = ['article', 'video', 'audio'];
  const icons = ['BookOpen', 'PlayCircle', 'Clock', 'Users', 'Activity', 'Heart', 'FileText'];

  const openModal = (resource?: LibraryResource) => {
    if (resource) {
      setEditingId(resource.id);
      setFormData({
        title: resource.title,
        category: resource.category,
        duration: resource.duration,
        iconName: resource.iconName,
        type: resource.type,
        content: resource.content
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        category: 'Blog',
        duration: '5 min',
        iconName: 'FileText',
        type: 'article',
        content: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (editingId !== null) {
      await updateResource(editingId, formData);
    } else {
      await addResource(formData);
    }
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      await deleteResource(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Library Manager</h2>
          <p className="text-muted-foreground">Manage exercise, meditation, blog and other resources for employees.</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {libraryResources.map(res => (
          <Card key={res.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold px-2 py-1 bg-secondary rounded-md text-secondary-foreground">{res.category}</span>
                  <span className="text-xs text-muted-foreground">{res.duration}</span>
                  <span className="text-xs text-muted-foreground capitalize">({res.type})</span>
                </div>
                <h3 className="font-bold text-lg mt-1">{res.title}</h3>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" onClick={() => openModal(res)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => handleDelete(res.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-2xl shadow-2xl">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">{editingId ? 'Edit Resource' : 'Add New Resource'}</h3>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="E.g., 5-Minute Desk Stretches"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value as ResourceCategory})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select 
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value as ResourceType})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    {types.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (e.g. '5 min read')</label>
                  <input 
                    type="text" 
                    value={formData.duration} 
                    onChange={e => setFormData({...formData, duration: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Icon</label>
                  <select 
                    value={formData.iconName} 
                    onChange={e => setFormData({...formData, iconName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    {icons.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Content (Text/Description)</label>
                <textarea 
                  value={formData.content} 
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md h-32"
                  placeholder="Enter the article content or description for the video/audio..."
                />
              </div>
            </CardContent>
            <div className="px-6 py-4 border-t flex justify-end space-x-2 bg-muted/50 text-right">
              <Button variant="outline" onClick={closeModal}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
