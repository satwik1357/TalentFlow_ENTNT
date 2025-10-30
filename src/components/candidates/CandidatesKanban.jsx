import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  DndContext, 
  DragOverlay, 
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import { useState, useEffect, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { GripVertical, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

// Ensure database is initialized
let isDbInitialized = false;

const initializeDb = async () => {
  if (!isDbInitialized && db) {
    try {
      await db.open();
      isDbInitialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }
  return db;
};

const STAGES = [
  { value: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-800' },
  { value: 'screen', label: 'Screening', color: 'bg-purple-100 text-purple-800' },
  { value: 'tech', label: 'Technical', color: 'bg-amber-100 text-amber-800' },
  { value: 'offer', label: 'Offer', color: 'bg-green-100 text-green-800' },
  { value: 'hired', label: 'Hired', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
];

// Generate mock candidates
const generateMockCandidates = (count = 20) => {
  const names = [
    'John Doe', 'Jane Smith', 'Robert Johnson', 'Emily Davis', 'Michael Brown',
    'Sarah Wilson', 'David Taylor', 'Jessica Anderson', 'James Thomas', 'Jennifer Jackson'
  ];
  
  const positions = [
    'Frontend Developer', 'Backend Engineer', 'UX Designer', 'Product Manager',
    'DevOps Engineer', 'Full Stack Developer', 'QA Engineer', 'Data Scientist'
  ];
  
  const skills = [
    'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'AWS',
    'Docker', 'Kubernetes', 'GraphQL', 'MongoDB', 'PostgreSQL'
  ];
  
  const stages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `candidate-${i + 1}`,
    name: names[Math.floor(Math.random() * names.length)],
    email: `candidate${i + 1}@example.com`,
    phone: `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
    position: positions[Math.floor(Math.random() * positions.length)],
    experience: Math.floor(Math.random() * 10) + 1,
    skills: Array.from({ length: Math.floor(Math.random() * 4) + 1 }, 
      () => skills[Math.floor(Math.random() * skills.length)]
    ),
    stage: stages[Math.floor(Math.random() * stages.length)],
    appliedDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    location: ['New York', 'San Francisco', 'Chicago', 'Austin', 'Remote'][
      Math.floor(Math.random() * 5)
    ]
  }));
};

const STAGE_COLORS = {
  applied: 'border-l-4 border-l-blue-500',
  screen: 'border-l-4 border-l-purple-500',
  tech: 'border-l-4 border-l-amber-500',
  offer: 'border-l-4 border-l-green-500',
  hired: 'border-l-4 border-l-[hsl(var(--status-hired))]',
  rejected: 'border-l-4 border-l-[hsl(var(--status-rejected))]',
};

// Draggable candidate card
const DraggableCandidate = ({ candidate, isDragging, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 0,
    opacity: isDragging ? 0.8 : 1,
  };

  // Format experience
  const formatExperience = (years) => {
    if (years === 1) return '1 year';
    return `${years} years`;
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "p-4 mb-3 bg-background rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow",
        STAGE_COLORS[candidate.stage],
        isDragging && "ring-2 ring-primary ring-offset-2 transform scale-105"
      )}
      onClick={() => onClick(candidate.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <button 
              className="cursor-grab hover:bg-muted p-1 rounded-md -ml-1" 
              {...listeners}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{candidate.name}</p>
              <p className="text-xs text-muted-foreground truncate">{candidate.position}</p>
            </div>
          </div>
          
          <div className="mt-3 flex items-center text-xs text-muted-foreground space-x-2">
            <div className="flex items-center">
              <Mail className="h-3 w-3 mr-1" />
              <span className="truncate max-w-[120px]">{candidate.email}</span>
            </div>
            <span>â€¢</span>
            <div className="flex items-center">
              <Phone className="h-3 w-3 mr-1" />
              <span>{candidate.phone}</span>
            </div>
          </div>
          
          <div className="mt-2 flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              {formatExperience(candidate.experience || 0)}
            </Badge>
            {candidate.location && (
              <Badge variant="outline" className="text-xs">
                {candidate.location}
              </Badge>
            )}
          </div>
          
          {candidate.skills?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {candidate.skills.slice(0, 3).map((skill, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {candidate.skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{candidate.skills.length - 3} more
                </Badge>
              )}
            </div>
          )}
          
          {candidate.appliedDate && (
            <div className="mt-2 text-xs text-muted-foreground">
              Applied: {new Date(candidate.appliedDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Kanban column component
const KanbanColumn = ({ id, title, children, count, items = [] }) => {
  return (
    <div className="flex flex-col flex-1 min-w-[300px] bg-muted/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">{title}</h3>
        <span className="text-sm text-muted-foreground">{count}</span>
      </div>
      <div className="space-y-2">
        <SortableContext items={items}>
          {children}
        </SortableContext>
      </div>
    </div>
  );
};

export const CandidatesKanban = ({ candidates = [], onCandidateUpdate }) => {
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 50; // Match CandidatesList.jsx


  // First, fetch candidates data
  const { data: filteredCandidates = [], isLoading: isQueryLoading } = useQuery({
    queryKey: ['candidates-kanban', search],
    queryFn: async () => {
      try {
        const dbInstance = await initializeDb();
        
        if (dbInstance?.candidates) {
          const count = await dbInstance.candidates.count();
          if (count === 0) {
            const mockCandidates = generateMockCandidates(30);
            await dbInstance.candidates.bulkAdd(mockCandidates);
            return mockCandidates;
          }
          
          let result = await dbInstance.candidates.toArray();
          
          if (search) {
            result = result.filter(c => 
              (c?.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
              (c?.email?.toLowerCase() || '').includes(search.toLowerCase())
            );
          }
          return result || [];
        }
        
        // Fallback to mock data if IndexedDB is not available
        console.warn('Using mock data - IndexedDB not available');
        return generateMockCandidates(20);
        
      } catch (error) {
        console.error('Error in query function:', error);
        // Return mock data if there's an error
        return generateMockCandidates(15);
      }
    },
    enabled: true,
  });

  // Initialize database on component mount
  useEffect(() => {
    const init = async () => {
      try {
        await initializeDb();
        setIsInitialized(true);
      } catch (error) {
        console.error('Database initialization error:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize the database',
          variant: 'destructive',
        });
      }
    };

    init();
  }, [toast]);
  const paginatedCandidates = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCandidates.slice(start, start + pageSize);
  }, [filteredCandidates, page]);

  // Group candidates by stage
  const candidatesByStage = useMemo(() => {
    const grouped = STAGES.reduce((acc, stage) => {
      acc[stage.value] = (paginatedCandidates || []).filter(c => c.stage === stage.value);
      return acc;
    }, {});
    STAGES.forEach(stage => { if (!grouped[stage.value]) grouped[stage.value] = []; });
    return grouped;
  }, [paginatedCandidates]);


  // Handle drag start
  const handleDragStart = useCallback((event) => {
    const { active } = event;
    setActiveId(active.id);
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Find the stages of the dragged item and the target
    const activeStage = Object.entries(candidatesByStage).find(([_, items]) => 
      items.some(item => item.id === activeId)
    )?.[0];
    
    const overStage = over.data?.current?.stage || overId;

    if (activeStage === overStage) return;
  }, [candidatesByStage]);

  // Update candidate stage mutation with optimistic updates
  const updateCandidateStage = useMutation({
    mutationFn: async ({ id, stage }) => {
      // Get current data
      const currentData = queryClient.getQueryData(['candidates-kanban', search]) || [];
      
      // Update the candidate's stage in the cache
      queryClient.setQueryData(['candidates-kanban', search], (old) => 
        old.map(candidate => 
          candidate.id === id ? { ...candidate, stage } : candidate
        )
      );
      
      // Perform the actual update
      await db.candidates.update(id, { stage });
      
      return { previousCandidates: currentData };
    },
    onMutate: async ({ id, stage }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(['candidates-kanban', search]);
      
      // Snapshot the previous value
      const previousCandidates = queryClient.getQueryData(['candidates-kanban', search]) || [];
      
      // Optimistically update to the new value
      queryClient.setQueryData(['candidates-kanban', search], (old) => 
        old.map(candidate => 
          candidate.id === id ? { ...candidate, stage } : candidate
        )
      );
      
      return { previousCandidates };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousCandidates) {
        queryClient.setQueryData(['candidates-kanban', search], context.previousCandidates);
      }
      toast({
        title: 'Error',
        description: 'Failed to update candidate stage',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure sync with server
      queryClient.invalidateQueries(['candidates-kanban', search]);
    },
  });

  // Handle drag end
  const handleDragEnd = useCallback(async (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const candidateId = active.id;

    let newStage = null;
    // If over an empty column (drop zone), over.id is the stage name.
    if (STAGES.some(s => s.value === over.id)) {
      newStage = over.id;
    } else {
      // Otherwise, find the column for the candidate we dropped on
      for (const stage of STAGES) {
        if (candidatesByStage[stage.value].some((c) => c.id === over.id)) {
          newStage = stage.value;
          break;
        }
      }
    }

    const candidate = filteredCandidates.find(c => c.id === candidateId);
    if (!candidate || candidate.stage === newStage || !newStage) return;

    await updateCandidateStage.mutateAsync({
      id: candidateId,
      stage: newStage
    });
  }, [filteredCandidates, updateCandidateStage, candidatesByStage]);


  // Configure sensors for drag and drop
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  });
  const sensors = useSensors(pointerSensor);

  // Combine loading states
  const isLoading = !isInitialized || isQueryLoading;
  
  // Get the currently dragged candidate
  const activeCandidate = useMemo(() => 
    activeId ? filteredCandidates.find(c => c.id === activeId) : null,
    [activeId, filteredCandidates]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-4 bg-slate-200 rounded col-span-2"></div>
                <div className="h-4 bg-slate-200 rounded col-span-1"></div>
              </div>
              <div className="h-4 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Candidates Pipeline</h2>
        <p className="text-muted-foreground">
          Drag and drop candidates between stages
          <span className="block text-xs text-muted-foreground/70 mt-1">
            Use the grip handle on the left of each card to drag
          </span>
        </p>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 p-4">
            {STAGES.map((stage) => {
              const stageCandidates = candidatesByStage[stage.value] || [];
              return (
                <KanbanColumn
                  key={stage.value}
                  id={stage.value}
                  title={
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${stage.color}`}>
                        {stage.label}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {stageCandidates.length}
                      </span>
                    </div>
                  }
                  count={stageCandidates.length}
                  items={stageCandidates.map(c => c.id)}
                >
                  {stageCandidates.length > 0 ? (
                    stageCandidates.map((candidate) => (
                      <DraggableCandidate
                        key={candidate.id}
                        candidate={candidate}
                        isDragging={activeId === candidate.id}
                        onClick={() => navigate(`/candidates/${candidate.id}`)}
                      />
                    ))
                  ) : (
                    <div 
                      className="p-4 text-center text-sm text-muted-foreground border-2 border-dashed rounded-lg"
                      data-drop-zone
                    >
                      Drop candidates here
                    </div>
                  )}
                </KanbanColumn>
              );
            })}
          </div>
        </div>
        <div className="flex justify-center gap-2 my-4">
          <button
            onClick={() => setPage(page => Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >Previous</button>
          <span className="px-4 py-2">
            Page {page} of {Math.ceil(filteredCandidates.length / pageSize)}
          </span>
          <button
            onClick={() => setPage(page => (page * pageSize < filteredCandidates.length ? page + 1 : page))}
            disabled={page * pageSize >= filteredCandidates.length}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >Next</button>
        </div>

        <DragOverlay>
          {activeCandidate ? (
            <div className="p-3 bg-background rounded-lg border shadow-lg w-64">
              <p className="font-medium text-sm">{activeCandidate.name}</p>
              <p className="text-xs text-muted-foreground truncate">{activeCandidate.email}</p>
              <div className="flex justify-between mt-2">
                <Badge variant="outline">{activeCandidate.experience || '0'} years</Badge>
                {activeCandidate.skills?.[0] && (
                  <Badge variant="secondary">{activeCandidate.skills[0]}</Badge>
                )}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};