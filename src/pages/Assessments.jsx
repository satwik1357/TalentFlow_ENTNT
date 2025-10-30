import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { ClipboardList, Plus, Briefcase, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AssessmentBuilder } from "@/components/assessments/AssessmentBuilder";
import { db } from "@/lib/db";

/**
 * Seed data for assessments with meaningful questions.
 */


/**
 * Custom hook to seed initial assessment data.
 */
function useSeedData() {
  useEffect(() => {
    db.assessments.count().then((count) => {
      if (count === 0) {
        initialAssessments.forEach((a) => {
          db.assessments.add({
            ...a,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        });
      }
    });
  }, []);
}

/**
 * Calculates the total number of questions in an assessment.
 * @param {object} assessment - The assessment object.
 * @returns {number} - The total question count.
 */
const getQuestionCount = (assessment) => {
  if (Array.isArray(assessment.questions)) {
    return assessment.questions.length;
  }
  if (Array.isArray(assessment.sections)) {
    return assessment.sections.reduce(
      (sum, section) => sum + (Array.isArray(section.questions) ? section.questions.length : 0),
      0
    );
  }
  return 0;
};

/**
 * Assessments Component
 * 
 * Manages the display and creation of assessments for jobs.
 * Includes job selection, assessment builder, and a list of all assessments.
 */
const Assessments = () => {
  const [selectedJobId, setSelectedJobId] = useState("");
  const [showBuilder, setShowBuilder] = useState(false);

  useSeedData();

  // Fetch active jobs
  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs-for-assessment"],
    queryFn: () => db.jobs.where("status").equals("active").toArray(),
  });

  // Fetch assessment for selected job
  const { data: assessment } = useQuery({
    queryKey: ["assessment", selectedJobId],
    queryFn: async () => {
      if (!selectedJobId) return null;
      return db.assessments.where("jobId").equals(selectedJobId).first();
    },
    enabled: !!selectedJobId,
  });

  // Live query for reactive assessments list
  const assessments = useLiveQuery(
    () => db.assessments.orderBy("createdAt").reverse().toArray(),
    []
  ) || [];

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  /**
   * Handles saving an assessment.
   * @param {object} assessmentData - The assessment data to save.
   */
  const handleSaveAssessment = async (assessmentData) => {
    try {
      await db.assessments.put({
        ...assessmentData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setShowBuilder(false);
      // Optionally show success toast here
    } catch (error) {
      console.error("Error saving assessment:", error);
      // Handle error, e.g., show error toast
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 rounded-2xl shadow-lg">
        <div className="flex items-center gap-4">
          <ClipboardList className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-primary">Assessments</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage assessments for your job positions
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {assessments.length} Total Assessments
          </Badge>
        </div>
      </div>

      {/* Job Selection */}
      <Card className="shadow-md border-0 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Select a Job
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedJobId}
            onValueChange={(value) => {
              setSelectedJobId(value);
              setShowBuilder(false);
            }}
          >
            <SelectTrigger className="w-full max-w-md hover:border-primary transition-colors">
              <SelectValue placeholder="Choose a job to manage assessment" />
            </SelectTrigger>
            <SelectContent>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Assessment Content */}
      {selectedJobId && (
        <>
          {!assessment && !showBuilder ? (
            <Card className="shadow-md border-0 bg-gradient-to-br from-muted/20 to-white">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FileText className="h-16 w-16 text-muted-foreground mb-6" />
                <h3 className="text-2xl font-semibold mb-2">No Assessment Yet</h3>
                <p className="text-muted-foreground text-center mb-8 max-w-md">
                  Create a comprehensive assessment for <strong>{selectedJob?.title}</strong> to evaluate candidates effectively.
                </p>
                <Button
                  onClick={() => setShowBuilder(true)}
                  className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Plus className="h-5 w-5" />
                  Create Assessment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <AssessmentBuilder
              jobId={selectedJobId}
              jobTitle={selectedJob?.title || ""}
              initialAssessment={assessment}
              onSave={handleSaveAssessment}
            />
          )}
        </>
      )}

      {!selectedJobId && (
        <Card className="shadow-md border-0 bg-muted/10">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ClipboardList className="h-16 w-16 text-muted-foreground mb-6" />
            <p className="text-muted-foreground text-lg">Select a job to get started</p>
          </CardContent>
        </Card>
      )}

      {/* All Assessments List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          All Assessments
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assessments.map((assessment) => (
            <Card
              key={assessment.id}
              className="shadow-md border-0 bg-white hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {assessment.title}
                  </CardTitle>
                  <Badge
                    variant={assessment.status === "active" ? "default" : "secondary"}
                    className="flex items-center gap-1"
                  >
                    <CheckCircle className="h-3 w-3" />
                    {assessment.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{assessment.job}</p>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{assessment.description}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{getQuestionCount(assessment)} questions</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Assessments;
