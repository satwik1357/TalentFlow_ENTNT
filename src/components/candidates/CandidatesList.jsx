import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, GripVertical, Briefcase, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { KanbanBoard } from "./KanbanBoard";
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { db } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";

const STAGE_COLORS = {
  applied: "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100",
  screen: "bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100",
  tech: "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100",
  offer: "bg-green-50 text-green-800 border-green-200 hover:bg-green-100",
  hired: "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100",
  rejected: "bg-red-50 text-red-800 border-red-200 hover:bg-red-100",
};

const STAGE_ICONS = {
  applied: "📄",
  screen: "📞",
  tech: "💻",
  offer: "📝",
  hired: "✅",
  rejected: "❌",
};

const STAGE_LABELS = {
  applied: "Applied",
  screen: "Screening",
  tech: "Technical",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
};

/**
 * DraggableCandidateRow Component
 * 
 * A sortable row component for displaying candidate information in a list view.
 * Supports drag-and-drop reordering.
 * 
 * @param {object} candidate - The candidate object.
 * @param {function} onClick - Callback when the row is clicked.
 * @param {boolean} isDragging - Whether the row is currently being dragged.
 */
const DraggableCandidateRow = ({ candidate, onClick, isDragging = false }) => {
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
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "grid grid-cols-12 gap-4 items-center p-4 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 border-b border-gray-200 cursor-pointer transition-all duration-200",
        isDragging && "shadow-2xl ring-2 ring-primary/20 rotate-1 scale-105",
        STAGE_COLORS[candidate.stage]
      )}
      onClick={onClick}
    >
      {/* Drag Handle */}
      <div className="flex items-center col-span-1">
        <button
          {...attributes}
          {...listeners}
          className="p-1 -ml-1 text-muted-foreground hover:text-foreground touch-none rounded hover:bg-muted transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>

      {/* Candidate Info */}
      <div className="col-span-3 flex items-center space-x-3">
        <img
          src={candidate.avatar}
          alt={candidate.name}
          className="h-10 w-10 rounded-full border-2 border-primary/20"
        />
        <div>
          <p className="font-semibold text-sm text-gray-900">{candidate.name}</p>
          <p className="text-xs text-muted-foreground">{candidate.email}</p>
        </div>
      </div>

      {/* Current Role */}
      <div className="col-span-2">
        <div className="flex items-center gap-1">
          <Briefcase className="h-3 w-3 text-muted-foreground" />
          <p className="text-sm">{candidate.currentRole}</p>
        </div>
        <p className="text-xs text-muted-foreground">{candidate.experience} years exp</p>
      </div>

      {/* Job & Location */}
      <div className="col-span-2">
        <p className="text-sm font-medium">{candidate.job?.title || "No job assigned"}</p>
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">{candidate.location}</p>
        </div>
      </div>

      {/* Skills */}
      <div className="col-span-2">
        <div className="flex flex-wrap gap-1">
          {candidate.skills.slice(0, 2).map((skill, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {candidate.skills.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{candidate.skills.length - 2}
            </Badge>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="col-span-2 text-right">
        <Badge variant="outline" className={cn("text-xs", STAGE_COLORS[candidate.stage])}>
          {STAGE_LABELS[candidate.stage]}
        </Badge>
      </div>
    </div>
  );
};

/**
 * CandidatesList Component
 * 
 * Displays a list or kanban view of candidates with filtering, searching, and drag-and-drop functionality.
 * Supports pagination and stage management.
 * 
 * @param {string} search - Initial search query.
 * @param {string} stage - Initial stage filter.
 * @param {string} jobId - Initial job filter.
 * @param {function} onStageChange - Callback for stage changes.
 * @param {function} onJobChange - Callback for job changes.
 * @param {string} viewMode - 'list' or 'kanban'.
 */
export const CandidatesList = ({
  search: initialSearch = "",
  stage: initialStage = "",
  jobId,
  onStageChange,
  onJobChange,
  viewMode = "list",
}) => {
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState(initialSearch);
  const [stage, setStage] = useState(initialStage);
  const [jobIdFilter, setJobIdFilter] = useState(jobId || "");
  const [activeId, setActiveId] = useState(null);

  // Update candidate stage mutation
  const updateCandidateStage = useMutation({
    mutationFn: async ({ id, stage }) => {
      await db.candidates.update(id, { stage });
      await db.timeline.add({
        candidateId: id,
        type: "status_change",
        description: `Moved to ${stage} stage`,
        timestamp: Date.now(),
        userName: "System",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["candidate", id] });
      queryClient.invalidateQueries({ queryKey: ["timeline", id] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update candidate stage",
        variant: "destructive",
      });
    },
  });

  // Fetch jobs for filtering
  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => await db.jobs.toArray(),
  });

  // Fetch and filter candidates
  const { data: candidatesData = [], isLoading } = useQuery({
    queryKey: ["candidates", search, stage, jobIdFilter],
    queryFn: async () => {
      let candidates = await db.candidates.toArray();

      // Apply filters
      if (search) {
        const searchLower = search.toLowerCase();
        candidates = candidates.filter(
          (candidate) =>
            candidate.name.toLowerCase().includes(searchLower) ||
            candidate.email.toLowerCase().includes(searchLower) ||
            (candidate.skills || []).some((skill) => skill.toLowerCase().includes(searchLower)) ||
            (candidate.currentRole?.toLowerCase().includes(searchLower)) ||
            (candidate.job?.title?.toLowerCase().includes(searchLower))
        );
      }
      if (stage) {
        candidates = candidates.filter((candidate) => candidate.stage === stage);
      }
      if (jobIdFilter) {
        candidates = candidates.filter((candidate) => candidate.jobId === jobIdFilter);
      }
      return candidates;
    },
  });

  // Memoized filtered candidates (though filtering is in query)
  const filteredCandidates = useMemo(() => candidatesData, [candidatesData]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [search, stage, jobIdFilter]);

  // Paginated candidates
  const paginatedCandidates = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCandidates.slice(start, start + pageSize);
  }, [filteredCandidates, page]);

  // Event handlers
  const handleCardClick = (candidateId) => {
    navigate(`/candidates/${candidateId}`);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleStageFilterChange = (stage) => {
    setStage(stage);
    if (onStageChange) onStageChange(stage);
  };

  const handleJobFilterChange = (value) => {
    setJobIdFilter(value === "all" ? "" : value);
    if (onJobChange) onJobChange(value === "all" ? "" : value);
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    // Reordering logic (placeholder, as it doesn't persist to DB)
    console.log(`Attempted to move candidate ${active.id}`);
  };

  const handleStageDrop = (candidateId, newStage) => {
    if (!candidateId || !newStage) return;

    const candidate = candidatesData.find((c) => c.id === candidateId);
    if (!candidate || candidate.stage === newStage) return;

    updateCandidateStage.mutate({
      id: candidateId,
      stage: newStage,
    });
  };

  const activeCandidate = activeId ? candidatesData.find((c) => c.id === activeId) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Filters Section */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-xl shadow-sm border">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          {/* Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search candidates by name, skills, or role..."
              className="pl-9 h-10"
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          {/* Filter Selects */}
          <div className="flex flex-wrap gap-3">
            <Select
              value={stage || "all"}
              onValueChange={(value) => handleStageFilterChange(value === "all" ? "" : value)}
            >
              <SelectTrigger className="w-[180px] h-10">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="screen">Screening</SelectItem>
                <SelectItem value="tech">Technical</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={jobIdFilter || "all"}
              onValueChange={handleJobFilterChange}
            >
              <SelectTrigger className="w-[200px] h-10">
                <Briefcase className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Jobs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* No Candidates Message */}
      {filteredCandidates.length === 0 ? (
        <div className="text-center py-16 bg-muted/20 rounded-xl">
          <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">No candidates found</h3>
          <p className="text-muted-foreground mb-6">Try adjusting your search or filters.</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setStage("");
              setJobIdFilter("");
              if (onStageChange) onStageChange("");
              if (onJobChange) onJobChange("");
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : viewMode === "kanban" ? (
        <KanbanBoard
          candidates={filteredCandidates}
          onCandidateMove={handleStageDrop}
          onCandidateClick={handleCardClick}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* List View */}
          <div className="border rounded-xl overflow-hidden shadow-lg bg-white">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b font-semibold text-sm text-muted-foreground">
              <div className="col-span-1"></div>
              <div className="col-span-3">Candidate</div>
              <div className="col-span-2">Current Role</div>
              <div className="col-span-2">Job & Location</div>
              <div className="col-span-2">Skills</div>
              <div className="col-span-2 text-right">Status</div>
            </div>

            {/* Sortable Candidates */}
            <SortableContext items={paginatedCandidates.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              {paginatedCandidates.map((candidate) => (
                <DraggableCandidateRow
                  key={candidate.id}
                  candidate={candidate}
                  onClick={() => handleCardClick(candidate.id)}
                  isDragging={activeId === candidate.id}
                />
              ))}
            </SortableContext>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {Math.ceil(filteredCandidates.length / pageSize)}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={page * pageSize >= filteredCandidates.length}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeCandidate ? (
              <div className="bg-white shadow-2xl rounded-xl p-4 w-64 border">
                <p className="font-semibold text-sm">{activeCandidate.name}</p>
                <p className="text-xs text-muted-foreground truncate">{activeCandidate.email}</p>
                <div className="flex justify-between mt-3">
                  <Badge variant="outline">{activeCandidate.experience} years</Badge>
                  <Badge variant="secondary">{activeCandidate.skills[0]}</Badge>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
};
