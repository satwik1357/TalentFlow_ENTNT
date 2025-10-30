import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Edit,
  Archive,
  ArchiveRestore,
  ExternalLink,
  Loader2,
  Building,
  MapPin,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

/**
 * JobCard Component
 *
 * A draggable card component representing a job posting.
 * Uses @dnd-kit for drag-and-drop functionality.
 * Displays job title, department, status, tags, and action buttons.
 *
 * @param {object} job - The job object containing id, title, department, status, tags, etc.
 * @param {function} onEdit - Callback function to edit the job.
 * @param {function} onUpdate - Callback function to update the job list after changes.
 */
export const JobCard = ({ job, onEdit, onUpdate }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: job.id,
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleArchiveToggle = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const newStatus = job.status === 'active' ? 'archived' : 'active';
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      toast({
        title: `Job ${newStatus === 'archived' ? 'archived' : 'restored'} successfully`,
        variant: 'default',
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating job status:', error);
      toast({
        title: 'Failed to update job status',
        description: error.message || 'An error occurred while updating the job',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 group',
        job.status === 'archived' && 'opacity-60 bg-gray-100',
        isDragging && 'shadow-2xl rotate-1 scale-105 z-50'
      )}
      role="article"
      aria-label={`Job: ${job.title}, department: ${job.department}, status: ${job.status}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Drag handle"
          >
            <GripVertical className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {job.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building className="h-4 w-4" />
                  <span>{job.department}</span>
                  {job.location && (
                    <>
                      <span>•</span>
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant={job.status === 'active' ? 'default' : 'secondary'}
                  className={cn(
                    'text-xs font-medium',
                    job.status === 'active'
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  )}
                >
                  {job.status}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                  title="View job details"
                  aria-label="View job details"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(job)}
                  className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                  title="Edit job"
                  aria-label="Edit job"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleArchiveToggle}
                  disabled={isUpdating}
                  className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                  title={job.status === 'active' ? 'Archive job' : 'Unarchive job'}
                  aria-label={job.status === 'active' ? 'Archive job' : 'Unarchive job'}
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : job.status === 'active' ? (
                    <Archive className="h-4 w-4" />
                  ) : (
                    <ArchiveRestore className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          {job.tags && job.tags.length > 0 ? (
            job.tags.map((tag, index) => (
              <Badge
                key={`${tag}-${index}`}
                variant="outline"
                className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
              >
                {tag}
              </Badge>
            ))
          ) : (
            <p className="text-xs text-gray-400 italic">No tags</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
