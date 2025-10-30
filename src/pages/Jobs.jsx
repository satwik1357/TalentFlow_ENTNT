import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, Users, BarChart2, Settings, Bell, Check, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge"; // Added missing Badge import
import { JobCard } from "@/components/jobs/JobCard";
import { JobDialog } from "@/components/jobs/JobDialog";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link } from "react-router-dom";
import { db } from "@/lib/db"; // Added import for Dexie DB

// Removed fetchJobs function as we're replacing API fetches with Dexie DB queries

const Jobs = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [activeTab, setActiveTab] = useState('jobs');
  const [notifications, setNotifications] = useState([]);
  const { toast } = useToast();
  const [tag, setTag] = useState('');
  
  // Replaced useQuery with direct Dexie usage for jobs
  const { data: jobs = { data: [], pagination: { totalPages: 0, page: 1 } }, isLoading, refetch } = useQuery({
    queryKey: ['jobs', search, status, tag, page],
    queryFn: async () => {
      let allJobs = await db.jobs.toArray();

      // Filter
      if (search) {
        allJobs = allJobs.filter(job =>
          job.title.toLowerCase().includes(search.toLowerCase()) ||
          (job.description || "").toLowerCase().includes(search.toLowerCase())
        );
      }
      if (status) {
        allJobs = allJobs.filter(job => job.status === status);
      }
      if (tag) {
        allJobs = allJobs.filter(job => job.tags?.includes(tag));
      }

      // Pagination
      const pageSize = 10;
      const start = (page - 1) * pageSize;
      const pagedJobs = allJobs.slice(start, start + pageSize);

      return {
        data: pagedJobs,
        pagination: {
          totalPages: Math.ceil(allJobs.length / pageSize),
          page,
        }
      };
    }
  });

  // Admin stats — query from db as well
  const { data: candidateCount = 0 } = useQuery({
    queryKey: ['candidates-count'],
    queryFn: async () => await db.candidates.count()
  });
  const { data: jobsCount = 0 } = useQuery({
    queryKey: ['jobs-count'],
    queryFn: async () => await db.jobs.count()
  });

  // Add after the jobsCount query
  const { data: assessmentsCount = 18 } = useQuery({
    queryKey: ['assessments-count'],
    queryFn: async () => await db.assessments?.count() || 18  // Fallback to 18 if table doesn't exist
  });

  // Query for recent candidates (slice to 5 for the list)
  const { data: recentCandidates = [] } = useQuery({
    queryKey: ['recent-candidates'],
    queryFn: async () => {
      const candidates = await db.candidates.toArray();
      return candidates.slice(0, 5);  // Get first 5 recent candidates
    }
  });

  // Query for recent assessments (slice to 4 for the list)
  const { data: recentAssessments = [] } = useQuery({
    queryKey: ['recent-assessments'],
    queryFn: async () => {
      const assessments = await db.assessments?.toArray() || [];
      return assessments.slice(0, 4);  // Get first 4 assessment templates
    }
  });

  // Add other stats as needed (interviews, open positions, etc.) — for now, keeping others as sample or querying if possible

  // Use these in your adminStats cards.
  const adminStats = [
    { title: 'Total Jobs', value: jobsCount, icon: <BarChart2 className="h-5 w-5" /> },
    { title: 'Active Candidates', value: candidateCount, icon: <Users className="h-5 w-5" /> },
    { title: 'Interviews This Week', value: '18', icon: <Users className="h-5 w-5" /> }, // Keep as sample or query from DB if table exists
    { title: 'Open Positions', value: '12', icon: <BarChart2 className="h-5 w-5" /> }, // Keep as sample or query from DB if table exists
  ];
  
  // Sample notifications — to make persistent, consider adding a notifications table in DB and querying from there
  useEffect(() => {
    setNotifications([
      { id: 1, title: 'New Application', description: 'John Doe applied for Senior Frontend Developer', time: '2m ago', read: false },
      { id: 2, title: 'Interview Scheduled', description: 'Interview with Jane Smith at 2:00 PM', time: '1h ago', read: false },
      { id: 3, title: 'New Job Posted', description: 'You have successfully posted a new job', time: '3h ago', read: true },
    ]);
  }, []);
  
  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    
    // Only show toast if not already read
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      toast({
        title: 'Notification marked as read',
        description: notification.title
      });
    }
  };
  
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    
    const jobsList = jobs?.data || [];
    const oldIndex = jobsList.findIndex((job) => job.id === active.id);
    const newIndex = jobsList.findIndex((job) => job.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return;
    
    // Reorder the jobs array
    const reorderedJobs = [...jobsList];
    const [movedJob] = reorderedJobs.splice(oldIndex, 1);
    reorderedJobs.splice(newIndex, 0, movedJob);
    
    // Update order in DB (assuming jobs have an 'order' field; if not, add one)
    for (let i = 0; i < reorderedJobs.length; i++) {
      await db.jobs.update(reorderedJobs[i].id, { order: i });
    }
    
    toast({
      title: 'Job order updated',
      description: 'The job order has been updated successfully.'
    });
    
    // Refetch to get the latest data
    await refetch();
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setDialogOpen(true);
  };

  const handleDialogClose = (success) => {
    setDialogOpen(false);
    setEditingJob(null);
    
    if (success) {
      // In a real app, we would refetch the data
      // For the mock implementation, we'll just refetch to simulate the update
      refetch();
      toast({
        title: editingJob ? 'Job updated' : 'Job created',
        description: `Job has been ${editingJob ? 'updated' : 'created'} successfully.`
      });
    }
  };

  const allTags = React.useMemo(() => {
    if (!jobs?.data) return [];
    const tagSet = new Set();
    jobs.data.forEach(job => {
      if (Array.isArray(job.tags))
        job.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [jobs]);

  // Add before the return statement
const CandidatePreviewList = ({ candidates }) => (
  <>
    {candidates?.slice(0, 5).map(candidate => (
      <div key={candidate.id} className="flex items-center justify-between p-3 rounded-lg bg-[#FFA500] mb-2">
        <div>
          <span className="font-semibold">{candidate.name}</span>
          <span className="block text-xs text-gray-600">{candidate.email}</span>
          <span className="block text-xs text-black">{candidate.currentRole}</span>
        </div>
        <span className={`ml-2 px-2 py-1 text-xs rounded ${candidate.stage === "rejected" ? "bg-red-500/20 text-red-300" : "bg-yellow-500/20 text-yellow-300"}`}>
          {candidate.stage}
        </span>
      </div>
    ))}
  </>
);

const AssessmentTemplateList = ({ assessments }) => (
    <>
      {assessments?.slice(0, 4).map(template => (
        <div key={template.id} className="flex items-center justify-between p-3 rounded-lg bg-[#FFA500] mb-2">
          <div>
            <span className="font-semibold">{template.title}</span>
            <span className="block text-xs text-gray-600">{template.sections?.length || 2} sections</span>
          </div>
          <span className="ml-2 px-2 py-1 text-xs rounded bg-indigo-500/20 text-indigo-300">Template</span>
        </div>
      ))}
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {activeTab === 'admin' ? 'Admin Dashboard' : 'Jobs'}
          </h1>
          <p className="text-muted-foreground">
            {activeTab === 'admin' ? 'Manage your recruitment analytics and settings' : 'Manage your job postings and opportunities'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'admin' ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <Card className="border-0 shadow-none">
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                      {notifications.some(n => !n.read) && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNotifications(notifications.map(n => ({ ...n, read: true })));
                            toast({
                              title: 'All notifications marked as read',
                              description: 'Your notifications have been marked as read.'
                            });
                          }}
                        >
                          Mark all as read
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No notifications
                      </div>
                    ) : (
                      <div className="divide-y">
                        {notifications.map((notification) => (
                          <div 
                            key={notification.id}
                            className={`p-4 hover:bg-accent/50 transition-colors cursor-pointer ${!notification.read ? 'bg-accent/30' : ''}`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start">
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {notification.description}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {notification.time}
                                </p>
                              </div>
                              {!notification.read && (
                                <span className="h-2 w-2 rounded-full bg-primary mt-1"></span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  {notifications.length > 0 && (
                    <CardFooter className="border-t p-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setActiveTab('admin')}
                      >
                        View all notifications
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </PopoverContent>
            </Popover>
          ) : (
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Job
            </Button>
          )}
        </div>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 max-w-xs">
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>
        
        <TabsContent value="jobs" className="mt-6">
      {/* Jobs Tab Content */}
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select value={status || 'all'} onValueChange={(value) => { setStatus(value === 'all' ? '' : value); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tag || 'all'} onValueChange={(value) => { setTag(value === 'all' ? '' : value); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tags</SelectItem>
            {/* Map dynamic tag options here */}
            {allTags.map(tag => (
              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Jobs List */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading jobs...</div>
      ) : !jobs?.data?.length ? (
        <div className="text-center py-12 text-muted-foreground">No jobs found</div>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={jobs.data.map((job) => job.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {jobs.data.map((job) => (
                <JobCard key={job.id} job={job} onEdit={handleEdit} onUpdate={refetch} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      {/* Pagination */}
      {jobs?.pagination && jobs.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page} of {jobs.pagination.totalPages}
          </div>
          <Button
            variant="outline"
            onClick={() => setPage(p => p + 1)}
            disabled={page === jobs.pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
      <JobDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSuccess={refetch}
        job={editingJob}
      />
      </div>
      </TabsContent>
      
      {/* Admin Tab Content */}
      <TabsContent value="admin" className="mt-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="flex flex-row justify-between items-center pb-2">
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                Total Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{jobsCount}</div>
              <div className="mt-2 text-green-600 text-sm font-medium">
                {jobsCount - 5} active
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="flex flex-row justify-between items-center pb-2">
              <CardTitle className="text-green-900 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Total Candidates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{candidateCount}</div>
              <div className="mt-2 text-green-600 text-sm font-medium">
                +122 this week
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="flex flex-row justify-between items-center pb-2">
              <CardTitle className="text-indigo-900 flex items-center gap-2">
                <Check className="h-5 w-5" />
                Assessment Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-900">{assessmentsCount}</div>
              <div className="mt-2 text-indigo-600 text-sm font-medium">
                Ready to use
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Lists Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recent Jobs List */}
          <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Recent Jobs
              </CardTitle>
              <CardDescription>Your latest job postings and their status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {jobs?.data?.slice(0, 5).map((job) => (
                <div
                  key={job.id}
                  className="flex justify-between items-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 shadow-sm border"
                >
                  <div>
                    <span className="font-semibold text-gray-900">{job.title}</span>
                    <span className="block text-xs text-gray-600">
                      {job.location} - {job.tags?.[0]}
                    </span>
                    <span className="block text-xs text-gray-800">
                      {job.candidateCount || Math.floor(Math.random() * 60)} candidates
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 hover:bg-green-200 border border-green-200"
                  >
                    {job.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Candidates List */}
          <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Recent Candidates
              </CardTitle>
              <CardDescription>Latest candidate applications and their status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentCandidates?.slice(0, 5).map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 shadow-sm border"
                >
                  <div>
                    <span className="font-semibold text-gray-900">{candidate.name}</span>
                    <span className="block text-xs text-gray-600">{candidate.email}</span>
                    <span className="block text-xs text-gray-800">{candidate.currentRole}</span>
                  </div>
                  <span
                    className={`ml-2 px-2 py-1 text-xs rounded border ${
                      candidate.stage === "rejected"
                        ? "bg-red-100 text-red-800 border-red-200"
                        : "bg-yellow-100 text-yellow-800 border-yellow-200"
                    }`}
                  >
                    {candidate.stage}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Assessments List */}
          <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Assessments
              </CardTitle>
              <CardDescription>Available assessment templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentAssessments?.slice(0, 4).map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 shadow-sm border"
                >
                  <div>
                    <span className="font-semibold text-gray-900">{template.title}</span>
                    <span className="block text-xs text-gray-600">
                      {template.sections?.length || 2} sections
                    </span>
                  </div>
                  <span className="ml-2 px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Template
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </TabsContent>


          </Tabs>
    </div>
  );
};

export default Jobs;
