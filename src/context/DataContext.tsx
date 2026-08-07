"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Client, Shoot, Gallery, Photo, BlogPost, Proposal, Contract, Invoice, Task, Message, Automation, Notification } from '@/types';
import { 
  mockClients, mockShoots, mockGalleries, mockPhotos, mockBlogPosts, 
  mockProposals, mockContracts, mockInvoices, mockTasks, mockMessages, 
  mockAutomations, mockNotifications 
} from '@/data/mock-data';

interface DataState {
  clients: Client[];
  shoots: Shoot[];
  galleries: Gallery[];
  photos: Photo[];
  blogPosts: BlogPost[];
  proposals: Proposal[];
  contracts: Contract[];
  invoices: Invoice[];
  tasks: Task[];
  messages: Message[];
  automations: Automation[];
  notifications: Notification[];
}

interface DataContextType extends DataState {
  // Client actions
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  // Shoot actions
  addShoot: (shoot: Omit<Shoot, 'id' | 'createdAt'>) => Shoot;
  updateShoot: (id: string, updates: Partial<Shoot>) => void;
  deleteShoot: (id: string) => void;
  
  // Gallery actions
  addGallery: (gallery: Omit<Gallery, 'id' | 'createdAt'>) => Gallery;
  updateGallery: (id: string, updates: Partial<Gallery>) => void;
  deleteGallery: (id: string) => void;
  
  // Blog actions
  addBlogPost: (post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) => BlogPost;
  updateBlogPost: (id: string, updates: Partial<BlogPost>) => void;
  deleteBlogPost: (id: string) => void;
  
  // Proposal actions
  addProposal: (proposal: Omit<Proposal, 'id' | 'createdAt'>) => Proposal;
  updateProposal: (id: string, updates: Partial<Proposal>) => void;
  
  // Contract actions
  addContract: (contract: Omit<Contract, 'id' | 'createdAt'>) => Contract;
  updateContract: (id: string, updates: Partial<Contract>) => void;
  
  // Invoice actions
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => Invoice;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, status: Task['status']) => void;
  
  // Message actions
  markMessageRead: (id: string) => void;
  addReply: (messageId: string, content: string) => void;
  
  // Automation actions
  toggleAutomation: (id: string) => void;
  
  // Notification actions
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Refresh from storage
  refresh: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

const STORAGE_KEY = 'noirframe_data';

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataState>({
    clients: [],
    shoots: [],
    galleries: [],
    photos: [],
    blogPosts: [],
    proposals: [],
    contracts: [],
    invoices: [],
    tasks: [],
    messages: [],
    automations: [],
    notifications: [],
  });

  // Load from localStorage on mount, fallback to mock data
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setState(data);
      } catch {
        initializeWithMockData();
      }
    } else {
      initializeWithMockData();
    }
  }, []);

  const initializeWithMockData = () => {
    const initialData: DataState = {
      clients: mockClients,
      shoots: mockShoots,
      galleries: mockGalleries,
      photos: mockPhotos,
      blogPosts: mockBlogPosts,
      proposals: mockProposals,
      contracts: mockContracts,
      invoices: mockInvoices,
      tasks: mockTasks,
      messages: mockMessages,
      automations: mockAutomations,
      notifications: mockNotifications,
    };
    setState(initialData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  };

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (state.clients.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const refresh = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setState(JSON.parse(stored));
    }
  }, []);

  // Client actions
  const addClient = useCallback((client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...client,
      id: generateId('c'),
      createdAt: getToday(),
    } as Client;
    setState(prev => ({ ...prev, clients: [newClient, ...prev.clients] }));
    return newClient;
  }, []);

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    setState(prev => ({
      ...prev,
      clients: prev.clients.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  }, []);

  const deleteClient = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      clients: prev.clients.filter(c => c.id !== id),
    }));
  }, []);

  // Shoot actions
  const addShoot = useCallback((shoot: Omit<Shoot, 'id' | 'createdAt'>) => {
    const newShoot: Shoot = {
      ...shoot,
      id: generateId('s'),
      createdAt: getToday(),
    } as Shoot;
    setState(prev => ({ ...prev, shoots: [newShoot, ...prev.shoots] }));
    return newShoot;
  }, []);

  const updateShoot = useCallback((id: string, updates: Partial<Shoot>) => {
    setState(prev => ({
      ...prev,
      shoots: prev.shoots.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
  }, []);

  const deleteShoot = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      shoots: prev.shoots.filter(s => s.id !== id),
    }));
  }, []);

  // Gallery actions
  const addGallery = useCallback((gallery: Omit<Gallery, 'id' | 'createdAt'>) => {
    const newGallery: Gallery = {
      ...gallery,
      id: generateId('g'),
      createdAt: getToday(),
    } as Gallery;
    setState(prev => ({ ...prev, galleries: [newGallery, ...prev.galleries] }));
    return newGallery;
  }, []);

  const updateGallery = useCallback((id: string, updates: Partial<Gallery>) => {
    setState(prev => ({
      ...prev,
      galleries: prev.galleries.map(g => g.id === id ? { ...g, ...updates } : g),
    }));
  }, []);

  const deleteGallery = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      galleries: prev.galleries.filter(g => g.id !== id),
    }));
  }, []);

  // Blog actions
  const addBlogPost = useCallback((post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = getToday();
    const newPost: BlogPost = {
      ...post,
      id: generateId('b'),
      createdAt: now,
      updatedAt: now,
    } as BlogPost;
    setState(prev => ({ ...prev, blogPosts: [newPost, ...prev.blogPosts] }));
    return newPost;
  }, []);

  const updateBlogPost = useCallback((id: string, updates: Partial<BlogPost>) => {
    setState(prev => ({
      ...prev,
      blogPosts: prev.blogPosts.map(p => p.id === id ? { ...p, ...updates, updatedAt: getToday() } : p),
    }));
  }, []);

  const deleteBlogPost = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      blogPosts: prev.blogPosts.filter(p => p.id !== id),
    }));
  }, []);

  // Proposal actions
  const addProposal = useCallback((proposal: Omit<Proposal, 'id' | 'createdAt'>) => {
    const newProposal: Proposal = {
      ...proposal,
      id: generateId('pr'),
      createdAt: getToday(),
    } as Proposal;
    setState(prev => ({ ...prev, proposals: [newProposal, ...prev.proposals] }));
    return newProposal;
  }, []);

  const updateProposal = useCallback((id: string, updates: Partial<Proposal>) => {
    setState(prev => ({
      ...prev,
      proposals: prev.proposals.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  }, []);

  // Contract actions
  const addContract = useCallback((contract: Omit<Contract, 'id' | 'createdAt'>) => {
    const newContract: Contract = {
      ...contract,
      id: generateId('ct'),
      createdAt: getToday(),
    } as Contract;
    setState(prev => ({ ...prev, contracts: [newContract, ...prev.contracts] }));
    return newContract;
  }, []);

  const updateContract = useCallback((id: string, updates: Partial<Contract>) => {
    setState(prev => ({
      ...prev,
      contracts: prev.contracts.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  }, []);

  // Invoice actions
  const addInvoice = useCallback((invoice: Omit<Invoice, 'id' | 'createdAt'>) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: generateId('inv'),
      createdAt: getToday(),
    } as Invoice;
    setState(prev => ({ ...prev, invoices: [newInvoice, ...prev.invoices] }));
    return newInvoice;
  }, []);

  const updateInvoice = useCallback((id: string, updates: Partial<Invoice>) => {
    setState(prev => ({
      ...prev,
      invoices: prev.invoices.map(i => i.id === id ? { ...i, ...updates } : i),
    }));
  }, []);

  // Task actions
  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: generateId('tk'),
      createdAt: getToday(),
    } as Task;
    setState(prev => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
    return newTask;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id),
    }));
  }, []);

  const moveTask = useCallback((id: string, status: Task['status']) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => 
        t.id === id 
          ? { ...t, status, completedAt: status === 'done' ? getToday() : undefined } 
          : t
      ),
    }));
  }, []);

  // Message actions
  const markMessageRead = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(m => m.id === id ? { ...m, isRead: true } : m),
    }));
  }, []);

  const addReply = useCallback((messageId: string, content: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(m => 
        m.id === messageId 
          ? { 
              ...m, 
              replies: [...m.replies, { 
                id: generateId('r'), 
                content, 
                isFromPhotographer: true, 
                createdAt: getToday() 
              }] 
            } 
          : m
      ),
    }));
  }, []);

  // Automation actions
  const toggleAutomation = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      automations: prev.automations.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a),
    }));
  }, []);

  // Notification actions
  const markNotificationRead = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
    }));
  }, []);

  const clearNotifications = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, isRead: true })),
    }));
  }, []);

  return (
    <DataContext.Provider value={{
      ...state,
      addClient, updateClient, deleteClient,
      addShoot, updateShoot, deleteShoot,
      addGallery, updateGallery, deleteGallery,
      addBlogPost, updateBlogPost, deleteBlogPost,
      addProposal, updateProposal,
      addContract, updateContract,
      addInvoice, updateInvoice,
      addTask, updateTask, deleteTask, moveTask,
      markMessageRead, addReply,
      toggleAutomation,
      markNotificationRead, clearNotifications,
      refresh,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
