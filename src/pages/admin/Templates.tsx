import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { FileJson, Copy, Edit2, Save, X, Plus, Trash2, GripVertical, ChevronDown, AlignLeft, CircleDot, MoveHorizontal } from 'lucide-react';
import { fallbackInventoryTemplates } from '../../data/fallbackData';
import { useAsyncData } from '../../hooks/useAsyncData';
import { getInventoryTemplates, saveInventoryTemplate } from '../../lib/api';
import type { InventoryItem, InventoryTemplate as Inventory } from '../../types/domain';

export default function InventoryLibrary() {
  const { data: inventories, setData: setInventories, isLoading, error } = useAsyncData(
    getInventoryTemplates,
    fallbackInventoryTemplates,
    [],
  );
  const [editingInventory, setEditingInventory] = useState<Inventory | null>(null);

  const handleEdit = (inventory: Inventory) => {
    setEditingInventory(JSON.parse(JSON.stringify(inventory))); // Deep copy
  };

  const handleCreateNew = () => {
    setEditingInventory({
      id: `inv${Date.now()}`,
      title: 'Untitled Inventory',
      version: 'v1.0',
      description: '',
      purpose: '',
      measures: '',
      items: [{ id: `item${Date.now()}`, type: 'multiple_choice', question: 'Untitled Question', options: ['Option 1'] }]
    });
  };

  const handleSave = async () => {
    if (!editingInventory) return;
    const savedInventory = await saveInventoryTemplate(editingInventory);
    const existingIndex = inventories.findIndex(i => i.id === editingInventory.id);
    if (existingIndex >= 0) {
      const updated = [...inventories];
      updated[existingIndex] = savedInventory;
      setInventories(updated);
    } else {
      setInventories([...inventories, savedInventory]);
    }
    setEditingInventory(null);
  };

  const addItem = (type: InventoryItem['type']) => {
    if (!editingInventory) return;
    const newItem: InventoryItem = {
      id: `item${Date.now()}`,
      type,
      question: 'New Question',
    };
    if (type === 'multiple_choice') {
      newItem.options = ['Option 1'];
    } else if (type === 'scale') {
      newItem.scaleMin = 1;
      newItem.scaleMax = 5;
      newItem.scaleMinLabel = 'Strongly Disagree';
      newItem.scaleMaxLabel = 'Strongly Agree';
    }
    setEditingInventory({
      ...editingInventory,
      items: [...editingInventory.items, newItem]
    });
  };

  const updateItem = (itemId: string, updates: Partial<InventoryItem>) => {
    if (!editingInventory) return;
    setEditingInventory({
      ...editingInventory,
      items: editingInventory.items.map(item => item.id === itemId ? { ...item, ...updates } : item)
    });
  };

  const deleteItem = (itemId: string) => {
    if (!editingInventory) return;
    setEditingInventory({
      ...editingInventory,
      items: editingInventory.items.filter(item => item.id !== itemId)
    });
  };

  const addOption = (itemId: string) => {
    if (!editingInventory) return;
    setEditingInventory({
      ...editingInventory,
      items: editingInventory.items.map(item => {
        if (item.id === itemId && item.type === 'multiple_choice') {
          return { ...item, options: [...(item.options || []), `Option ${((item.options?.length || 0) + 1)}`] };
        }
        return item;
      })
    });
  };

  const updateOption = (itemId: string, index: number, value: string) => {
    if (!editingInventory) return;
    setEditingInventory({
      ...editingInventory,
      items: editingInventory.items.map(item => {
        if (item.id === itemId && item.type === 'multiple_choice' && item.options) {
          const newOptions = [...item.options];
          newOptions[index] = value;
          return { ...item, options: newOptions };
        }
        return item;
      })
    });
  };

  if (editingInventory) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-20">
        <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm p-4 z-10 border-b border-border shadow-sm rounded-t-lg -mx-4 px-4 mt-[-8px]">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold">{editingInventory.id.startsWith('inv' + new Date().getFullYear().toString().substring(0, 2)) ? 'Edit Inventory' : 'Create Inventory'}</h2>
            <Badge variant="outline">{editingInventory.version}</Badge>
          </div>
          <div className="space-x-2">
            <Button variant="ghost" onClick={() => setEditingInventory(null)}>Cancel</Button>
            <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Save Form</Button>
          </div>
        </div>

        {/* Top Section - Form Info */}
        <div className="bg-card border border-border shadow-sm rounded-lg border-t-8 border-t-primary p-6 space-y-4">
          <input
            type="text"
            className="w-full text-3xl font-bold border-b border-transparent hover:border-border focus:border-primary focus:outline-none bg-transparent transition-colors pb-2"
            value={editingInventory.title}
            onChange={(e) => setEditingInventory({ ...editingInventory, title: e.target.value })}
            placeholder="Inventory Title"
          />
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Description</label>
              <textarea
                className="w-full text-sm border-b border-transparent hover:border-border focus:border-primary focus:outline-none bg-transparent resize-none overflow-hidden transition-colors"
                value={editingInventory.description}
                onChange={(e) => setEditingInventory({ ...editingInventory, description: e.target.value })}
                placeholder="Give a brief overview of this inventory..."
                rows={2}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">What this measures</label>
              <input
                type="text"
                className="w-full text-sm border-b border-transparent hover:border-border focus:border-primary focus:outline-none bg-transparent transition-colors"
                value={editingInventory.measures}
                onChange={(e) => setEditingInventory({ ...editingInventory, measures: e.target.value })}
                placeholder="e.g. Emotional Exhaustion, Depersonalization..."
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Purpose / Use Case</label>
              <input
                type="text"
                className="w-full text-sm border-b border-transparent hover:border-border focus:border-primary focus:outline-none bg-transparent transition-colors"
                value={editingInventory.purpose}
                onChange={(e) => setEditingInventory({ ...editingInventory, purpose: e.target.value })}
                placeholder="e.g. To assess burnout risk among clinical staff."
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {editingInventory.items.map((item, index) => (
            <div key={item.id} className="relative group bg-card border border-border shadow-sm rounded-xl p-6 transition-all focus-within:ring-2 focus-within:ring-primary/20">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 cursor-grab px-4 py-1">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </div>
              
              <div className="flex items-start justify-between gap-4 mt-2 mb-6">
                <input
                  type="text"
                  className="flex-1 text-base font-medium p-3 bg-secondary/30 border-b border-secondary hover:bg-secondary/50 focus:bg-secondary focus:border-primary focus:outline-none rounded-t-md transition-colors"
                  value={item.question}
                  onChange={(e) => updateItem(item.id, { question: e.target.value })}
                  placeholder="Question text"
                />
                
                <select
                  value={item.type}
                  onChange={(e) => updateItem(item.id, { type: e.target.value as any })}
                  className="w-48 p-3 bg-card border border-border rounded-md text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="scale">Linear Scale</option>
                  <option value="text">Short Answer</option>
                </select>
              </div>

              <div className="pl-2">
                {item.type === 'multiple_choice' && (
                  <div className="space-y-2">
                    {item.options?.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center group/opt">
                        <CircleDot className="w-4 h-4 text-muted-foreground mr-3 shrink-0" />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => updateOption(item.id, optIdx, e.target.value)}
                          className="flex-1 border-b border-transparent hover:border-border focus:border-primary focus:outline-none bg-transparent py-1 text-sm transition-colors"
                        />
                      </div>
                    ))}
                    <div className="flex items-center mt-2">
                      <CircleDot className="w-4 h-4 text-muted-foreground/50 mr-3 shrink-0" />
                      <button onClick={() => addOption(item.id)} className="text-sm text-primary hover:underline font-medium">Add option</button>
                    </div>
                  </div>
                )}

                {item.type === 'scale' && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <select 
                        value={item.scaleMin} 
                        onChange={(e) => updateItem(item.id, { scaleMin: parseInt(e.target.value) })}
                        className="p-2 bg-card border border-border rounded-md text-sm"
                      >
                        <option value={0}>0</option>
                        <option value={1}>1</option>
                      </select>
                      <span className="text-muted-foreground">to</span>
                      <select 
                        value={item.scaleMax} 
                        onChange={(e) => updateItem(item.id, { scaleMax: parseInt(e.target.value) })}
                        className="p-2 bg-card border border-border rounded-md text-sm"
                      >
                        {[3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3 max-w-sm">
                      <div className="flex items-center space-x-4">
                        <span className="w-4 text-center font-medium">{item.scaleMin}</span>
                        <input
                          type="text"
                          value={item.scaleMinLabel || ''}
                          onChange={(e) => updateItem(item.id, { scaleMinLabel: e.target.value })}
                          placeholder="Label (optional)"
                          className="flex-1 border-b border-border hover:border-primary focus:border-primary focus:outline-none bg-transparent py-1 text-sm"
                        />
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="w-4 text-center font-medium">{item.scaleMax}</span>
                        <input
                          type="text"
                          value={item.scaleMaxLabel || ''}
                          onChange={(e) => updateItem(item.id, { scaleMaxLabel: e.target.value })}
                          placeholder="Label (optional)"
                          className="flex-1 border-b border-border hover:border-primary focus:border-primary focus:outline-none bg-transparent py-1 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {item.type === 'text' && (
                  <div className="border-b border-border border-dashed pb-2 w-1/2">
                    <span className="text-sm text-muted-foreground italic">Short answer text will go here</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 mt-6 border-t border-border/50">
                <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Add Menu */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center bg-card border border-border shadow-2xl p-2 rounded-full space-x-1 z-50">
          <Button variant="ghost" size="sm" onClick={() => addItem('multiple_choice')} className="rounded-full px-4" title="Add Multiple Choice">
            <CircleDot className="w-4 h-4 mr-2" /> Choice
          </Button>
          <div className="w-px h-6 bg-border mx-1"></div>
          <Button variant="ghost" size="sm" onClick={() => addItem('scale')} className="rounded-full px-4" title="Add Linear Scale">
            <MoveHorizontal className="w-4 h-4 mr-2" /> Scale
          </Button>
          <div className="w-px h-6 bg-border mx-1"></div>
          <Button variant="ghost" size="sm" onClick={() => addItem('text')} className="rounded-full px-4" title="Add Text Input">
            <AlignLeft className="w-4 h-4 mr-2" /> Text
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventory Library</h2>
          <p className="text-muted-foreground">
            {isLoading ? 'Loading inventory templates from backend...' : error ? error : 'Manage organizational culture and psychometric assessments.'}
          </p>
        </div>
        <Button onClick={handleCreateNew}><Plus className="w-4 h-4 mr-2" /> New Inventory</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventories.map((inventory) => (
          <Card key={inventory.id} className="flex flex-col cursor-pointer hover:border-primary transition-colors" onClick={() => handleEdit(inventory)}>
            <CardHeader className="pb-3 border-b border-border/50 bg-secondary/20">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="bg-background">{inventory.version}</Badge>
                <div className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border">
                  {inventory.items.length} items
                </div>
              </div>
              <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">{inventory.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex-1 flex flex-col space-y-4">
              <div className="text-sm text-foreground line-clamp-2">
                {inventory.description}
              </div>
              
              <div className="space-y-3 mt-auto">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Measures</h4>
                  <p className="text-sm font-medium leading-snug line-clamp-2">{inventory.measures}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Purpose</h4>
                  <p className="text-sm text-muted-foreground leading-snug line-clamp-2">{inventory.purpose}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
