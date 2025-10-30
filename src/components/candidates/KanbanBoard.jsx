import React, { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  closestCorners,
  DragOverlay,
  defaultDropAnimation,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Search,
  Filter,
  ChevronDown,
  Plus,
  Mail,
  Phone,
  MoreVertical,
  Calendar,
  GripVertical,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Constants
const STAGES = [
  { id: 'applied', name: 'Applied', color: 'bg-blue-500' },
  { id: 'screen', name: 'Screening', color: 'bg-purple-500' },
  { id: 'tech', name: 'Technical', color: 'bg-amber-500' },
  { id: 'offer', name: 'Offer', color: 'bg-green-500' },
  { id: 'hired', name: 'Hired', color: 'bg-emerald-500' },
  { id: 'rejected', name: 'Rejected', color: 'bg-red-500' },
];

// Utility function to get initials
const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

// Sortable Candidate Card Component
const SortableCandidateCard = ({
  candidate,
  onView,
  onContact,
  attributes,
  listeners,
  isDragging,
  style,
}) => {
  const stage = STAGES.find((s) => s.id === candidate.stage) || STAGES[0];

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ease-in-out relative mb-3 group',
        isDragging && 'opacity-50 ring-2 ring-blue-500 ring-offset-2 shadow-xl'
      )}
      style={style}
      role="button"
      tabIndex={0}
      aria-label={`Candidate: ${candidate.name}, role: ${candidate.currentRole || 'No role specified'}`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 w-full">
            <button
              {...attributes}
              {...listeners}
              className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Drag handle"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-gray-100">
              <AvatarImage src={candidate.avatar} alt={candidate.name} />
              <AvatarFallback className={cn('text-white font-semibold', stage.color)}>
                {getInitials(candidate.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm truncate">{candidate.name}</h4>
              <p className="text-xs text-gray-500 truncate">
                {candidate.currentRole || 'No role specified'}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onSelect={() => onView(candidate)}>
                View Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => onContact(candidate, 'email')}>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onContact(candidate, 'phone')}>
                <Phone className="mr-2 h-4 w-4" />
                Call
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {candidate.skills?.slice(0, 3).map((skill, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
            >
              {skill}
            </Badge>
          ))}
          {candidate.skills?.length > 3 && (
            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
              +{candidate.skills.length - 3} more
            </Badge>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {candidate.appliedDate
                ? new Date(candidate.appliedDate).toLocaleDateString()
                : 'No date'}
            </span>
          </div>
          <Badge
            variant="outline"
            className={cn(
              'text-xs border-0',
              stage.color.replace('bg-', 'bg-opacity-20 text-').replace('500', '700')
            )}
          >
            {stage.name}
          </Badge>
        </div>
      </div>
    </div>
  );
};

// Candidate Card Wrapper
const CandidateCard = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.candidate.id,
    data: {
      type: 'candidate',
      candidate: props.candidate,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SortableCandidateCard
        {...props}
        attributes={attributes}
        listeners={listeners}
        isDragging={isDragging}
      />
    </div>
  );
};

// Column Component
const Column = ({ stage, candidates = [], onView, onContact }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isOver,
  } = useSortable({
    id: stage.id,
    data: {
      type: 'column',
      stage,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex-1 min-w-80 bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm',
        isOver && 'ring-2 ring-blue-400 ring-offset-2 bg-blue-50'
      )}
    >
      <div
        className="flex items-center justify-between mb-4 px-2 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center space-x-3">
          <div className={cn('h-3 w-3 rounded-full', stage.color)}></div>
          <h3 className="font-semibold text-gray-800 text-lg">{stage.name}</h3>
          <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full shadow-sm">
            {candidates.length}
          </span>
        </div>
      </div>
      <div className="space-y-3 min-h-[300px]">
        <SortableContext
          items={candidates.map((c) => c.id) || []}
          strategy={verticalListSortingStrategy}
        >
          {candidates.length > 0 ? (
            candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onView={onView}
                onContact={onContact}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-sm">No candidates in this stage</p>
              <p className="text-xs">Drag candidates here</p>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};

// Loading Component
const LoadingState = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <p className="text-gray-500">Loading candidates...</p>
    </div>
  </div>
);

// Main Kanban Board Component
export function KanbanBoard({
  candidates = [],
  onCandidateClick = () => {},
  onContact = () => {},
  onCandidateMove = (candidateId, newStage) => {},
  isLoading = false,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('all');
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  // Filter candidates based on search and stage
  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const matchesSearch =
        candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (candidate.skills?.some((skill) =>
          skill?.toLowerCase().includes(searchTerm.toLowerCase())
        ) ?? false);

      const matchesStage = selectedStage === 'all' || candidate.stage === selectedStage;

      return matchesSearch && matchesStage;
    });
  }, [candidates, searchTerm, selectedStage]);

  // Group candidates by stage
  const candidatesByStage = useMemo(() => {
    const groups = {};
    STAGES.forEach((stage) => {
      groups[stage.id] = filteredCandidates.filter((c) => c.stage === stage.id);
    });
    return groups;
  }, [filteredCandidates]);

  // Get the currently dragged candidate
  const activeCandidate = useMemo(() => {
    if (!activeId) return null;
    return candidates.find((c) => c.id === activeId);
  }, [activeId, candidates]);

  // Handle drag start
  const handleDragStart = useCallback((event) => {
    const { active } = event;
    setActiveId(active.id);
  }, []);

  // Handle drag over
  const handleDragOver = useCallback(
    (event) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id;
      const overId = over.id;

      if (activeId === overId) return;

      // Determine stages
      const activeStage = Object.entries(candidatesByStage).find(([_, items]) =>
        items.some((item) => item.id === activeId)
      )?.[0];

      const overStage = over.data?.current?.stage?.id || overId;

      if (activeStage === overStage) return;

      // Move candidate
      onCandidateMove(activeId, overStage);
    },
    [candidatesByStage, onCandidateMove]
  );

  // Handle drag end
  const handleDragEnd = useCallback((event) => {
    setActiveId(null);
  }, []);

  const handleContact = useCallback((candidate, method) => {
    onContact(candidate, method);
  }, [onContact]);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidates Pipeline</h1>
        <p className="text-gray-600">
          Manage your recruitment process by dragging candidates between stages.
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search candidates by name, email, or skills..."
            className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-[200px] justify-between border-gray-300 hover:border-blue-500"
              >
                {selectedStage === 'all'
                  ? 'All Stages'
                  : STAGES.find((s) => s.id === selectedStage)?.name}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]">
              <DropdownMenuItem onClick={() => setSelectedStage('all')}>
                All Stages
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {STAGES.map((stage) => (
                <DropdownMenuItem key={stage.id} onClick={() => setSelectedStage(stage.id)}>
                  <div className={cn('h-2 w-2 rounded-full mr-2', stage.color)}></div>
                  {stage.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            New Candidate
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <ScrollArea className="flex-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex space-x-6 p-4">
            <SortableContext
              items={STAGES.map((stage) => stage.id)}
              strategy={rectSortingStrategy}
            >
              {STAGES.map((stage) => (
                <Column
                  key={stage.id}
                  stage={stage}
                  candidates={candidatesByStage[stage.id] || []}
                  onView={onCandidateClick}
                  onContact={handleContact}
                />
              ))}
            </SortableContext>
          </div>

          {/* Drag Overlay */}
          <DragOverlay dropAnimation={defaultDropAnimation}>
            {activeCandidate ? (
              <div className="w-80">
                <SortableCandidateCard
                  candidate={activeCandidate}
                  isDragging={true}
                  onView={() => onCandidateClick(activeCandidate)}
                  onContact={handleContact}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </ScrollArea>
    </div>
  );
}
