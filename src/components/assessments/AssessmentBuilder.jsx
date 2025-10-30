import { useState } from "react";
import { Plus, Save, Eye, Settings, Layers } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { SectionBuilder } from "./SectionBuilder";
import { AssessmentPreview } from "./AssessmentPreview";
import { useToast } from "@/hooks/use-toast";

/**
 * AssessmentBuilder Component
 * 
 * A React component for building and previewing assessments.
 * Allows users to create, edit, and save assessments with sections and questions.
 * 
 * @param {string} jobId - The ID of the associated job.
 * @param {string} jobTitle - The title of the associated job.
 * @param {object} initialAssessment - Initial assessment data (optional).
 * @param {function} onSave - Callback function to handle saving the assessment.
 */
export const AssessmentBuilder = ({
  jobId,
  jobTitle,
  initialAssessment = {},
  onSave,
}) => {
  const { toast } = useToast();

  // State for assessment details
  const [title, setTitle] = useState(initialAssessment?.title || `${jobTitle} Assessment`);
  const [description, setDescription] = useState(initialAssessment?.description || "");
  const [sections, setSections] = useState(initialAssessment?.sections || []);
  const [activeTab, setActiveTab] = useState("builder");
  const [errors, setErrors] = useState({});

  /**
   * Validates the entire assessment form.
   * Checks for required fields, lengths, and logical constraints.
   * 
   * @returns {boolean} True if valid, false otherwise.
   */
  const validateAssessment = () => {
    const newErrors = {};

    // Validate title
    if (!title.trim()) {
      newErrors.title = "Assessment title is required.";
    }

    // Validate description
    if (description.length > 500) {
      newErrors.description = "Description must be 500 characters or less.";
    }

    // Validate sections
    if (sections.length === 0) {
      newErrors.sections = "At least one section is required.";
    }

    sections.forEach((section, index) => {
      // Validate section title
      if (!section.title.trim()) {
        newErrors[`section-${index}-title`] = "Section title is required.";
      }

      // Validate questions in section
      if (section.questions.length === 0) {
        newErrors[`section-${index}-questions`] = "Each section must have at least one question.";
      }

      section.questions.forEach((question, qIndex) => {
        // Validate question text
        if (!question.question.trim()) {
          newErrors[`question-${index}-${qIndex}-text`] = "Question text is required.";
        }

        // Validate options for choice questions
        if (["single-choice", "multi-choice"].includes(question.type) && (!question.options || question.options.length < 1)) {
          newErrors[`question-${index}-${qIndex}-options`] = "Choice questions must have at least one option.";
        }

        // Validate numeric question ranges
        if (question.type === "numeric" && question.validation) {
          const min = parseFloat(question.validation.min);
          const max = parseFloat(question.validation.max);
          if (min >= max) {
            newErrors[`question-${index}-${qIndex}-validation`] = "Min value must be less than max value.";
          }
        }

        // Validate text question lengths
        if (["short-text", "long-text"].includes(question.type) && question.validation) {
          const minLen = parseInt(question.validation.minLength);
          const maxLen = parseInt(question.validation.maxLength);
          if (minLen >= maxLen) {
            newErrors[`question-${index}-${qIndex}-validation`] = "Min length must be less than max length.";
          }
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Adds a new section to the assessment.
   */
  const addSection = () => {
    const newSection = {
      id: crypto.randomUUID(),
      title: "New Section",
      description: "",
      questions: [],
    };
    setSections([...sections, newSection]);
  };

  /**
   * Updates a specific section with new data.
   * 
   * @param {string} sectionId - The ID of the section to update.
   * @param {object} updates - The updates to apply.
   */
  const updateSection = (sectionId, updates) => {
    setSections(sections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s)));
  };

  /**
   * Deletes a section by ID.
   * 
   * @param {string} sectionId - The ID of the section to delete.
   */
  const deleteSection = (sectionId) => {
    setSections(sections.filter((s) => s.id !== sectionId));
  };

  /**
   * Moves a section up or down in the list.
   * 
   * @param {string} sectionId - The ID of the section to move.
   * @param {string} direction - "up" or "down".
   */
  const moveSection = (sectionId, direction) => {
    const index = sections.findIndex((s) => s.id === sectionId);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sections.length - 1)
    ) {
      return;
    }

    const newSections = [...sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    // Swap sections
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setSections(newSections);
  };

  /**
   * Handles saving the assessment after validation.
   */
  const handleSave = () => {
    if (!validateAssessment()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      });
      return;
    }

    const assessment = {
      id: initialAssessment?.id || crypto.randomUUID(),
      jobId,
      title,
      description,
      sections,
      createdAt: initialAssessment?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(assessment);

    toast({
      title: "Assessment saved",
      description: "Your assessment has been saved successfully.",
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold text-primary">Assessment Builder</h2>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setActiveTab(activeTab === "builder" ? "preview" : "builder")}
            className="hover:shadow-md transition-shadow"
          >
            {activeTab === "builder" ? (
              <>
                <Eye className="mr-2 h-4 w-4" /> Preview
              </>
            ) : (
              "Back to Builder"
            )}
          </Button>
          <Button onClick={handleSave} className="shadow-md hover:shadow-lg transition-shadow">
            <Save className="mr-2 h-4 w-4" /> Save Assessment
          </Button>
        </div>
      </div>

      {/* Tabs for Builder and Preview */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-8 shadow-md">
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> Builder
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" /> Preview
          </TabsTrigger>
        </TabsList>

        {/* Builder Tab Content */}
        <TabsContent value="builder" className="space-y-8">
          {/* Assessment Details Card */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-muted/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Assessment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-foreground">
                  Title
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter assessment title..."
                  className={`transition-colors ${errors.title ? "border-destructive focus:border-destructive" : "focus:border-primary"}`}
                />
                {errors.title && (
                  <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-destructive rounded-full"></span>
                    {errors.title}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-foreground">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide assessment description and instructions..."
                  rows={4}
                  className={`transition-colors ${errors.description ? "border-destructive focus:border-destructive" : "focus:border-primary"}`}
                />
                <p className="text-xs text-muted-foreground">
                  {description.length}/500 characters
                </p>
                {errors.description && (
                  <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-destructive rounded-full"></span>
                    {errors.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sections Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-semibold flex items-center gap-2">
                <Layers className="h-6 w-6 text-primary" />
                Sections
              </h3>
              <Button onClick={addSection} size="sm" className="shadow-md hover:shadow-lg transition-shadow">
                <Plus className="mr-2 h-4 w-4" /> Add Section
              </Button>
            </div>

            <div className="space-y-6">
              {sections.map((section, index) => (
                <SectionBuilder
                  key={section.id}
                  section={section}
                  sectionNumber={index + 1}
                  onUpdate={(updates) => updateSection(section.id, updates)}
                  onDelete={() => deleteSection(section.id)}
                  onMoveUp={() => moveSection(section.id, "up")}
                  onMoveDown={() => moveSection(section.id, "down")}
                  isFirst={index === 0}
                  isLast={index === sections.length - 1}
                  errors={errors}
                  sectionIndex={index}
                />
              ))}

              {sections.length === 0 && (
                <Card className="border-2 border-dashed border-muted-foreground/50 rounded-xl p-12 text-center bg-muted/10 hover:bg-muted/20 transition-colors">
                  <Layers className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground text-lg mb-2">No sections added yet</p>
                  <p className="text-muted-foreground text-sm">Click 'Add Section' to get started building your assessment.</p>
                  {errors.sections && (
                    <p className="text-destructive text-xs mt-4 flex items-center justify-center gap-1">
                      <span className="w-1 h-1 bg-destructive rounded-full"></span>
                      {errors.sections}
                    </p>
                  )}
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Preview Tab Content */}
        <TabsContent value="preview">
          <AssessmentPreview
            title={title}
            description={description}
            sections={sections}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
