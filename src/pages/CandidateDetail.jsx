import React from 'react';
import { db } from '@/lib/db';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Briefcase,
  MapPin,
  GraduationCap,
  Clock,
  User,
  Edit,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { NotesSection } from '@/components/candidates/NotesSection';

// Stage configurations
const STAGES = [
  { id: 'applied', name: 'Applied', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
  { id: 'screen', name: 'Screening', color: 'bg-purple-100 text-purple-800', icon: Clock },
  { id: 'tech', name: 'Technical', color: 'bg-amber-100 text-amber-800', icon: Briefcase },
  { id: 'offer', name: 'Offer', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { id: 'hired', name: 'Hired', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
  { id: 'rejected', name: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
];

// Timeline event types
const TIMELINE_ICONS = {
  status_change: CheckCircle,
  note: MessageSquare,
  assessment_completed: FileText,
  applied: AlertCircle,
};

/**
 * Formats timeline event description based on type and metadata
 * @param {object} event - Timeline event object
 * @returns {string} Formatted description
 */
const formatTimelineDescription = (event) => {
  switch (event.type) {
    case 'status_change':
      if (event.metadata?.from && event.metadata?.to) {
        const fromStage = STAGES.find(s => s.id === event.metadata.from)?.name || event.metadata.from;
        const toStage = STAGES.find(s => s.id === event.metadata.to)?.name || event.metadata.to;
        return `Moved from ${fromStage} to ${toStage}`;
      }
      return event.description || 'Status changed';
    case 'note':
      return event.description || 'Note added';
    case 'assessment_completed':
      return event.description || 'Assessment completed';
    case 'applied':
      return 'Application submitted';
    default:
      return event.description || 'Activity recorded';
  }
};

/**
 * CandidateDetail Component
 *
 * Displays detailed information about a candidate, including contact info,
 * application stats, notes, and a step-by-step timeline.
 *
 * @param {string} id - Candidate ID from URL params
 */
const CandidateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch candidate data
  const { data: candidate, isLoading, error } = useQuery({
    queryKey: ['candidate', id],
    queryFn: () => db.candidates.get(id),
    retry: false,
  });

  // Fetch job data
  const { data: job } = useQuery({
    queryKey: ['job', candidate?.jobId],
    queryFn: () => candidate?.jobId ? db.jobs.get(candidate.jobId) : null,
    enabled: !!candidate?.jobId,
  });

  // Fetch timeline data
  const { data: timeline = [] } = useQuery({
    queryKey: ['timeline', id],
    queryFn: () =>
      db.timeline
        .where('candidateId')
        .equals(id)
        .sortBy('timestamp')
        .then((events) => events.reverse()), // Most recent first
    enabled: !!id,
  });

  // Mock skills and education (in a real app, this would come from the database)
  const skills = candidate?.skills || ['React', 'JavaScript', 'Node.js'];
  const education = [
    {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'University of Example',
      year: '2020',
    },
  ];

  const handleRefetch = () => {
    // In a real app, invalidate queries
    console.log('Refreshing candidate data...');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-4 bg-gray-200 rounded col-span-2"></div>
                <div className="h-4 bg-gray-200 rounded col-span-1"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Candidate not found</h2>
        <p className="text-gray-600">The requested candidate could not be found.</p>
        <Button onClick={() => navigate('/candidates')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Candidates
        </Button>
      </div>
    );
  }

  const currentStageIndex = STAGES.findIndex((stage) => stage.id === candidate.stage);
  const currentStage = STAGES[currentStageIndex] || STAGES[0];

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/candidates">
            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {candidate.name}
            </h1>
            <p className="text-gray-600">
              Applied for {job?.title || 'Unknown Position'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={cn('flex items-center gap-2 px-3 py-1', currentStage.color)}>
            <currentStage.icon className="h-4 w-4" />
            {currentStage.name}
          </Badge>
          <Button variant="outline" onClick={() => navigate()}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Contact Information */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <User className="h-5 w-5 text-blue-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <a
                  href={`mailto:${candidate.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {candidate.email}
                </a>
              </div>
              {candidate.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <a
                    href={`tel:${candidate.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {candidate.phone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700">
                  Applied on {new Date(candidate.appliedDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <a
                  href="#"
                  className="text-blue-600 hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Resume viewer would open here');
                  }}
                >
                  View Resume
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Briefcase className="h-5 w-5 text-blue-600" />
                Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {education.map((edu, index) => (
                <div key={index} className="flex items-start gap-3">
                  <GraduationCap className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{edu.degree}</p>
                    <p className="text-gray-600">{edu.institution}</p>
                    <p className="text-sm text-gray-500">{edu.year}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notes */}
          <NotesSection
            candidateId={candidate.id}
            notes=""
            onUpdate={handleRefetch}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Application Stats */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl">Application Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Stage</span>
                <Badge className={currentStage.color}>
                  <currentStage.icon className="h-3 w-3 mr-1" />
                  {currentStage.name}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Days in Process</span>
                <span className="font-medium">
                  {Math.floor(
                    (Date.now() - new Date(candidate.appliedDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )} days
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Timeline Events</span>
                <span className="font-medium">{timeline.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => alert('Schedule interview')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Interview
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => alert('Send email')}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => alert('Move to next stage')}
              >
                <ChevronRight className="h-4 w-4 mr-2" />
                Move to Next Stage
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Step-by-Step Timeline */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Application Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {STAGES.map((stage, index) => {
              const isCompleted = index < currentStageIndex;
              const isCurrent = index === currentStageIndex;
              const isRejected = candidate.stage === 'rejected' && index === currentStageIndex;
              const StageIcon = stage.icon;

              return (
                <div key={stage.id} className="flex flex-col items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                        isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : isCurrent
                          ? isRejected
                            ? 'bg-red-500 border-red-500 text-white'
                            : 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <StageIcon className="h-5 w-5" />
                      )}
                    </div>
                    <p
                      className={cn(
                        'text-xs mt-2 text-center font-medium',
                        isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                      )}
                    >
                      {stage.name}
                    </p>
                  </div>
                  {index < STAGES.length - 1 && (
                    <div
                      className={cn(
                        'flex-1 h-0.5 mt-5 w-full',
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Current stage: <span className="font-medium">{currentStage.name}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Timeline Events */}
      {/*{timeline.length > 0 && (
        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {timeline.slice(0, 5).map((event, index) => {
                const EventIcon = TIMELINE_ICONS[event.type] || MessageSquare;
                const formattedDescription = formatTimelineDescription(event);
                return (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      {index < timeline.slice(0, 5).length - 1 && (
                        <div className="w-px h-full bg-gray-200 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{formattedDescription}</p>
                          {event.userName && (
                            <p className="text-sm text-gray-600">by {event.userName}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <EventIcon className="h-4 w-4 text-gray-400" />
                          <time className="text-xs text-gray-500">
                            {new Date(event.timestamp).toLocaleString()}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )} */}
    </div>
  );
};

export default CandidateDetail;
