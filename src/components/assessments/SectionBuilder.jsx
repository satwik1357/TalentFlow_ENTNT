import { ChevronUp, ChevronDown, Trash2, Plus, Layers, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { QuestionBuilder } from "./QuestionBuilder";
import { useState } from "react";

/**
 * SectionBuilder Component
 * 
 * A React component for building and editing assessment sections.
 * Allows adding, updating, and deleting questions within a section,
 * as well as moving the section up or down.
 * 
 * @param {object} section - The section object containing title, description, and questions.
 * @param {number} index - The index of this section in the list.
 * @param {number} totalSections - The total number of sections.
 * @param {function} onUpdate - Callback to update the section.
 * @param {function} onDelete - Callback to delete the section.
 * @param {function} onMove - Callback to move the section (up or down).
 */
export const SectionBuilder = ({
  section,
  index,
  totalSections,
  onUpdate,
  onDelete,
  onMove,
}) => {
  const [errors, setErrors] = useState({});

  /**
   * Validates the section for required fields.
   * 
   * @returns {boolean} True if valid, false otherwise.
   */
  const validateSection = () => {
    const newErrors = {};
    if (!section.title?.trim()) newErrors.title = "Section title is required.";
    if (!section.questions || section.questions.length === 0) newErrors.questions = "At least one question is required per section.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Adds a new question to the section.
   */
  const addQuestion = () => {
    const newQuestion = {
      id: crypto.randomUUID(),
      type: "short-text",
      question: "",
      required: false,
    };
    onUpdate({
      questions: [...(section.questions || []), newQuestion],
    });
    setErrors({ ...errors, questions: undefined }); // Clear questions error if adding
  };

  /**
   * Updates a specific question within the section.
   * 
   * @param {string} questionId - The ID of the question to update.
   * @param {object} updates - The updates to apply to the question.
   */
  const updateQuestion = (questionId, updates) => {
    onUpdate({
      questions: section.questions.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    });
  };

  /**
   * Deletes a question from the section.
   * 
   * @param {string} questionId - The ID of the question to delete.
   */
  const deleteQuestion = (questionId) => {
    const updatedQuestions = section.questions.filter((q) => q.id !== questionId);
    onUpdate({
      questions: updatedQuestions,
    });
    if (updatedQuestions.length === 0) {
      setErrors({ ...errors, questions: "At least one question is required per section." });
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-muted/20 hover:shadow-xl transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          {/* Move Controls */}
          <div className="flex flex-col gap-1 p-1 bg-muted/30 rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMove("up")}
              disabled={index === 0}
              className="h-7 w-7 hover:bg-primary/10 disabled:opacity-50 transition-colors"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMove("down")}
              disabled={index === totalSections - 1}
              className="h-7 w-7 hover:bg-primary/10 disabled:opacity-50 transition-colors"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Section Details */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-semibold">Section {index + 1}</CardTitle>
            </div>
            <div className="space-y-2">
              <Input
                value={section.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                onBlur={() => {
                  if (!section.title?.trim()) {
                    setErrors({ ...errors, title: "Section title is required." });
                  } else {
                    setErrors({ ...errors, title: undefined });
                  }
                }}
                placeholder="Enter section title..."
                className={`font-medium transition-colors ${errors.title ? "border-destructive focus:border-destructive" : "focus:border-primary"}`}
              />
              {errors.title && (
                <p className="text-destructive text-xs flex items-center gap-1">
                  <span className="w-1 h-1 bg-destructive rounded-full"></span>
                  {errors.title}
                </p>
              )}
            </div>
            <Textarea
              value={section.description || ""}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Add a description for this section (optional)..."
              rows={2}
              className="hover:border-primary transition-colors"
            />
          </div>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Questions Error */}
        {errors.questions && (
          <p className="text-destructive text-sm flex items-center gap-1 bg-destructive/5 p-3 rounded-lg">
            <span className="w-1 h-1 bg-destructive rounded-full"></span>
            {errors.questions}
          </p>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {section.questions.map((question, qIndex) => (
            <QuestionBuilder
              key={question.id}
              question={question}
              allQuestions={section.questions}
              onUpdate={(updates) => updateQuestion(question.id, updates)}
              onDelete={() => deleteQuestion(question.id)}
              sectionIndex={index}
              questionIndex={qIndex}
            />
          ))}
        </div>

        {/* Add Question Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={addQuestion}
          className="w-full gap-2 hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Question
        </Button>
      </CardContent>
    </Card>
  );
};
