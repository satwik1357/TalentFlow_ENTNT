import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Briefcase, Clock } from "lucide-react";

/**
 * CandidateCard Component
 * 
 * A draggable card component representing a candidate in a list.
 * Uses @dnd-kit for drag-and-drop functionality.
 * Displays candidate avatar, name, role, and experience.
 * 
 * @param {object} candidate - The candidate object containing id, name, avatar, currentRole, experience.
 * @param {function} onClick - Callback function when the card is clicked.
 */
export const CandidateCard = ({ candidate, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
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
        "bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group",
        isDragging && "shadow-2xl rotate-2 scale-105"
      )}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        <Avatar className="h-10 w-10 border-2 border-primary/20 group-hover:border-primary transition-colors">
          <AvatarImage src={candidate.avatar} alt={candidate.name} />
          <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
            {candidate?.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Candidate Details */}
        <div className="flex-1 min-w-0 space-y-1">
          <h4 className="font-semibold text-sm text-gray-900 truncate group-hover:text-primary transition-colors">
            {candidate.name}
          </h4>
          <div className="flex items-center gap-1">
            <Briefcase className="h-3 w-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground truncate">{candidate.currentRole}</p>
          </div>
        </div>

        {/* Experience Badge */}
        <Badge variant="secondary" className="flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
          <Clock className="h-3 w-3" />
          {candidate.experience}y
        </Badge>
      </div>
    </div>
  );
};
