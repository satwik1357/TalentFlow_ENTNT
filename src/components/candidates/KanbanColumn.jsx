import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CandidateCard } from './CandidateCard';
import { GripVertical } from 'lucide-react';

// Constants for stage titles and colors
const STAGE_TITLES = {
  applied: 'Applied',
  screen: 'Screening',
  tech: 'Technical',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
};

const STAGE_COLORS = {
  applied: 'bg-blue-500 text-white',
  screen: 'bg-purple-500 text-white',
  tech: 'bg-amber-500 text-white',
  offer: 'bg-green-500 text-white',
  hired: 'bg-emerald-500 text-white',
  rejected: 'bg-red-500 text-white',
};

/**
 * KanbanColumn component represents a single column in the Kanban board.
 * It supports drag-and-drop for reordering columns and displays candidate cards.
 *
 * @param {string} stage - The stage identifier (e.g., 'applied', 'screen').
 * @param {Array} candidates - Array of candidate objects in this stage.
 * @param {Function} onCandidateClick - Callback function when a candidate card is clicked.
 */
export const KanbanColumn = ({
  stage,
  candidates = [],
  onCandidateClick,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex-shrink-0 w-80 bg-white rounded-xl border border-gray-200 shadow-sm p-4
        hover:shadow-lg transition-all duration-200 ease-in-out
        ${isDragging ? 'ring-2 ring-blue-500 ring-offset-2 shadow-xl' : ''}
      `}
      role="region"
      aria-label={`Column for ${STAGE_TITLES[stage] || stage} stage`}
    >
      {/* Column Header */}
      <div
        className="flex items-center justify-between mb-4 cursor-grab active:cursor-grabbing group"
        {...attributes}
        {...listeners}
        role="button"
        tabIndex={0}
        aria-label={`Drag handle for ${STAGE_TITLES[stage] || stage} column`}
      >
        <div className="flex items-center space-x-3">
          <div className={`
            h-3 w-3 rounded-full ${STAGE_COLORS[stage].split(' ')[0]}
          `}></div>
          <h3 className="font-semibold text-gray-800 text-lg">
            {STAGE_TITLES[stage] || stage}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`
            px-3 py-1 text-xs font-semibold rounded-full shadow-sm
            ${STAGE_COLORS[stage]} bg-opacity-20 border border-current
          `}>
            {candidates.length}
          </span>
          <GripVertical className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Candidates List */}
      <div className="space-y-3 min-h-[200px]">
        {candidates.length > 0 ? (
          candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              onClick={() => onCandidateClick(candidate.id)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mb-2">
              <span className="text-xs font-medium">+</span>
            </div>
            <p className="text-sm font-medium">No candidates</p>
            <p className="text-xs">Drag candidates here</p>
          </div>
        )}
      </div>
    </div>
  );
};
