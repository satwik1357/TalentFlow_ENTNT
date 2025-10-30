import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Hash, CheckSquare, Square } from "lucide-react";

/**
 * AssessmentPreview Component
 * 
 * Renders a preview of an assessment with interactive questions.
 * Supports various question types and conditional logic.
 * 
 * @param {string} title - The title of the assessment.
 * @param {string} description - The description of the assessment.
 * @param {Array} sections - Array of sections containing questions.
 */
export const AssessmentPreview = ({ title = "", description = "", sections = [] }) => {
  const [answers, setAnswers] = useState({});

  /**
   * Updates the answer for a specific question.
   * 
   * @param {string} questionId - The ID of the question.
   * @param {*} value - The new answer value.
   */
  const updateAnswer = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  /**
   * Checks if a question should be displayed based on conditional logic.
   * 
   * @param {object} question - The question object.
   * @returns {boolean} True if the question should be shown.
   */
  const shouldShowQuestion = (question) => {
    if (!question.conditionalOn) return true;
    const dependentAnswer = answers[question.conditionalOn.questionId];
    return dependentAnswer === question.conditionalOn.answer;
  };

  /**
   * Validates if an answer is invalid based on question rules.
   * 
   * @param {*} value - The answer value.
   * @param {object} question - The question object.
   * @returns {boolean} True if invalid.
   */
  const isInvalid = (value, question) => {
    if (question.required && !value) return true;
    if (question.validation) {
      const val = question.validation;
      if (question.type === "numeric") {
        const num = Number(value);
        if (val.min !== undefined && num < val.min) return true;
        if (val.max !== undefined && num > val.max) return true;
      } else {
        const len = String(value || "").length;
        if (val.minLength && len < val.minLength) return true;
        if (val.maxLength && len > val.maxLength) return true;
      }
    }
    return false;
  };

  /**
   * Renders a single question based on its type.
   * 
   * @param {object} question - The question object.
   * @returns {JSX.Element|null} The rendered question or null if hidden.
   */
  const renderQuestion = (question) => {
    if (!question || !shouldShowQuestion(question)) return null;

    const invalid = isInvalid(answers[question.id], question);

    // Icon mapping for question types
    const typeIcons = {
      "short-text": <FileText className="h-4 w-4" />,
      "long-text": <FileText className="h-4 w-4" />,
      "single-choice": <Square className="h-4 w-4" />,
      "multi-choice": <CheckSquare className="h-4 w-4" />,
      "numeric": <Hash className="h-4 w-4" />,
      "file-upload": <Upload className="h-4 w-4" />,
    };

    return (
      <div
        key={question.id}
        className={`space-y-3 p-6 rounded-xl border-2 transition-all duration-200 ${
          invalid
            ? "border-destructive bg-destructive/5"
            : "border-border bg-card hover:border-primary/50 hover:shadow-md"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1 text-primary">
            {typeIcons[question.type] || <FileText className="h-4 w-4" />}
          </div>
          <div className="flex-1">
            <Label className="text-base font-semibold flex items-center gap-2">
              {question.question}
              {question.required && <span className="text-destructive">*</span>}
            </Label>
            {question.conditionalOn && (
              <Badge variant="outline" className="text-xs mt-1">
                Conditional
              </Badge>
            )}
          </div>
        </div>

        {/* Short Text Input */}
        {question.type === "short-text" && (
          <Input
            value={answers[question.id] || ""}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            placeholder="Your answer here..."
            maxLength={question.validation?.maxLength}
            className={invalid ? "border-destructive" : ""}
          />
        )}

        {/* Long Text Input */}
        {question.type === "long-text" && (
          <Textarea
            value={answers[question.id] || ""}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            placeholder="Provide a detailed answer..."
            rows={4}
            maxLength={question.validation?.maxLength}
            className={invalid ? "border-destructive" : ""}
          />
        )}

        {/* Single Choice Radio Group */}
        {question.type === "single-choice" && (
          <RadioGroup
            value={answers[question.id] || ""}
            onValueChange={(value) => updateAnswer(question.id, value)}
            className="space-y-2"
          >
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label htmlFor={`${question.id}-${option}`} className="font-normal cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {/* Multi Choice Checkboxes */}
        {question.type === "multi-choice" && (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={(answers[question.id] || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const current = answers[question.id] || [];
                    updateAnswer(
                      question.id,
                      checked ? [...current, option] : current.filter((v) => v !== option)
                    );
                  }}
                />
                <Label htmlFor={`${question.id}-${option}`} className="font-normal cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )}

        {/* Numeric Input */}
        {question.type === "numeric" && (
          <div className="space-y-2">
            <Input
              type="number"
              value={answers[question.id] || ""}
              onChange={(e) => updateAnswer(question.id, e.target.value)}
              placeholder="Enter a number..."
              min={question.validation?.min}
              max={question.validation?.max}
              className={invalid ? "border-destructive" : ""}
            />
            {(question.validation?.min !== undefined || question.validation?.max !== undefined) && (
              <p className="text-xs text-muted-foreground">
                Range: {question.validation?.min ?? "any"} - {question.validation?.max ?? "any"}
              </p>
            )}
          </div>
        )}

        {/* File Upload Placeholder */}
        {question.type === "file-upload" && (
          <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer group">
            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
            <p className="text-sm font-medium text-muted-foreground group-hover:text-primary">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              (File upload is a placeholder in preview mode)
            </p>
          </div>
        )}

        {/* Validation Hints */}
        {question.validation && (question.type === "short-text" || question.type === "long-text") && (
          <p className="text-xs text-muted-foreground">
            {question.validation.minLength && `Min ${question.validation.minLength} chars`}
            {question.validation.minLength && question.validation.maxLength && " • "}
            {question.validation.maxLength && `Max ${question.validation.maxLength} chars`}
          </p>
        )}

        {/* Error Message */}
        {invalid && (
          <p className="text-xs text-destructive font-medium">
            This field is required or invalid.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {/* Assessment Header */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">
            {title || "Assessment Preview"}
          </CardTitle>
          {description && (
            <CardDescription className="text-lg mt-2">
              {description}
            </CardDescription>
          )}
        </CardHeader>
      </Card>

      {/* Sections and Questions */}
      <div className="space-y-6">
        {Array.isArray(sections) &&
          sections.map((section, sectionIndex) => (
            <Card key={section.id} className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {sectionIndex + 1}
                  </span>
                  {section.title}
                </CardTitle>
                {section.description && (
                  <CardDescription className="mt-2">
                    {section.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {section.questions.map((question) => renderQuestion(question))}
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-6">
        <Button size="lg" className="px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow">
          Submit Assessment
        </Button>
      </div>
    </div>
  );
};
