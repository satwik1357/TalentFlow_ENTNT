import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Users,
  Calendar,
  Briefcase,
  Tag,
  FileText,
  Link as LinkIcon,
  User,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";

/**
 * JobDetail Component
 * 
 * Displays detailed information about a specific job, including stats,
 * job details, and associated candidates.
 * 
 * @param {string} jobId - The job ID from URL params.
 */
const JobDetail = () => {
  const { jobId } = useParams();

  // Fetch job data
  const { data: job, isLoading: isJobLoading, error: jobError } = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${jobId}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch job");
      }
      return response.json();
    },
  });

  // Fetch candidates count
  const { data: candidatesCount } = useQuery({
    queryKey: ["job-candidates-count", jobId],
    queryFn: async () => {
      const candidates = await db.candidates.where("jobId").equals(jobId).toArray();
      return candidates.length;
    },
    enabled: !!jobId,
  });

  // Fetch candidates for the job
  const { data: candidates = [], isLoading: isCandidatesLoading } = useQuery({
    queryKey: ["candidates-for-job", jobId],
    queryFn: async () => {
      const response = await fetch(`/api/candidates?jobId=${jobId}`);
      if (!response.ok) return [];
      return (await response.json()).data || [];
    },
    enabled: !!jobId,
  });

  if (isJobLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="text-center py-16 space-y-6">
        <div className="text-6xl">😔</div>
        <h2 className="text-2xl font-bold">Job not found</h2>
        <p className="text-muted-foreground">The requested job could not be found.</p>
        <Button onClick={() => window.history.back()} className="mt-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 rounded-2xl shadow-lg">
        <div className="flex items-center gap-6">
          <Link to="/jobs">
            <Button variant="ghost" size="icon" className="hover:bg-white/20">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
            <p className="text-muted-foreground text-lg">{job.department}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-md border-0 bg-white hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Briefcase className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <Badge
              variant={job.status === "active" ? "default" : "secondary"}
              className="text-lg px-3 py-1"
            >
              {job.status}
            </Badge>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0 bg-white hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidates</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidatesCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0 bg-white hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posted</CardTitle>
            <Calendar className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {new Date(job.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Details */}
      <Card className="shadow-md border-0 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Job Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.tags?.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {tag}
                </Badge>
              )) || <span className="text-muted-foreground">No tags</span>}
            </div>
          </div>

          {job.description && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </p>
              </div>
            </>
          )}

          <Separator />
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              URL Slug
            </h3>
            <code className="text-sm bg-muted px-3 py-2 rounded-lg border">
              {job.slug}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Candidates */}
      <Card className="shadow-md border-0 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Candidates ({candidates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isCandidatesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : !candidates.length ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No candidates for this job yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={candidate.avatar} alt={candidate.name} />
                    <AvatarFallback>
                      {candidate.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{candidate.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {candidate.email}
                    </div>
                  </div>
                  <Badge variant="outline">{candidate.stage}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JobDetail;
