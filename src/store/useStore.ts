import { create } from 'zustand';
import {
  createLibraryResource,
  createReport,
  deleteLibraryResource,
  getLibraryResources,
  getReports,
  updateLibraryResource,
} from '../lib/api';
import { fallbackLibraryResources } from '../data/fallbackData';
import type { LibraryResource, Report, ResourceCategory, ResourceType } from '../types/domain';

export type { LibraryResource, Report, ResourceCategory, ResourceType };

type Role = 'admin' | 'company' | 'employee' | null;

interface AppState {
  role: Role;
  setRole: (role: Role) => void;
  isBackendLoading: boolean;
  backendError: string | null;
  loadBackendData: () => Promise<void>;
  
  // AHP Weights
  ahpWeights: {
    cost: number;
    speed: number;
    impact: number;
    readiness: number;
  };
  setAhpWeights: (weights: Partial<{ cost: number; speed: number; impact: number; readiness: number }>) => void;
  
  // Demo State
  currentTenant: string;
  setCurrentTenant: (tenant: string) => void;

  generatedReports: Report[];
  addReport: (report: Report) => Promise<Report>;

  libraryResources: LibraryResource[];
  addResource: (resource: Omit<LibraryResource, 'id'>) => Promise<void>;
  updateResource: (id: string, resource: Partial<LibraryResource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
  role: null,
  setRole: (role) => set({ role }),
  isBackendLoading: false,
  backendError: null,
  loadBackendData: async () => {
    set({ isBackendLoading: true, backendError: null });
    try {
      const [libraryResources, allReports] = await Promise.all([getLibraryResources(), getReports()]);
      set({ libraryResources, generatedReports: allReports, isBackendLoading: false });
    } catch (error) {
      set({
        backendError: error instanceof Error ? error.message : 'Unable to load backend data.',
        isBackendLoading: false,
      });
    }
  },
  
  ahpWeights: {
    cost: 22,
    speed: 12,
    impact: 47,
    readiness: 19
  },
  setAhpWeights: (newWeights) => set((state) => ({ 
    ahpWeights: { ...state.ahpWeights, ...newWeights } 
  })),
  
  currentTenant: "HappiWork",
  setCurrentTenant: (tenant) => set({ currentTenant: tenant }),

  generatedReports: [],
  addReport: async (report) => {
    const savedReport = await createReport(report);
    set((state) => ({
      generatedReports: [savedReport, ...state.generatedReports.filter((item) => item.id !== savedReport.id)]
    }));
    return savedReport;
  },

  libraryResources: fallbackLibraryResources,
  addResource: async (resource) => {
    const savedResource = await createLibraryResource(resource);
    set((state) => ({
      libraryResources: [...state.libraryResources, savedResource]
    }));
  },
  updateResource: async (id, updatedResource) => {
    const savedResource = await updateLibraryResource(id, updatedResource);
    set((state) => ({
      libraryResources: state.libraryResources.map(r => r.id === id ? { ...r, ...savedResource } : r)
    }));
  },
  deleteResource: async (id) => {
    await deleteLibraryResource(id);
    set((state) => ({
      libraryResources: state.libraryResources.filter(r => r.id !== id)
    }));
  }
}));
