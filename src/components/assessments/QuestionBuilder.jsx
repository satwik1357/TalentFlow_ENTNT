import { Trash2, Plus, X, FileText, Hash, CheckSquare, Square, Upload, Settings, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

/**
 * QuestionBuilder Component
 * 
 * A React component for building individual questions within an assessment section.
 * Supports various question types, validation, options, and conditional logic.
 * 
 * @param {object} question - The question object to edit.
 * @param {Array} allQuestions - Array of all questions for conditional logic.
 * @param {function} onUpdate - Callback to update the question.
 * @param {function} onDelete - Callback to delete the question.
 * @param {object} errors - Object containing validation errors.
 * @param {number} sectionIndex - Index of the parent section.
 * @param {number} questionIndex - Index of the question within the section.
 */
export const QuestionBuilder = ({
  question,
  allQuestions = [],
  onUpdate,
  onDelete,
  errors = {},
  sectionIndex,
  questionIndex,
}) => {
  const hasOptions = ["single-choice", "multi-choice"].includes(question?.type || "");
  const hasValidation = ["short-text", "long-text", "numeric"].includes(question?.type || "");

  /**
   * Adds a new option to the question.
   */
  const addOption = () => {
    const options = question?.options || [];
    onUpdate({
      ...question,
      options: [...options, `Option ${options.length + 1}`],
    });
  };

  /**
   * Updates an existing option at the specified index.
   * 
   * @param {number} index - The index of the option to update.
   * @param {string} value - The new value for the option.
   */
  const updateOption = (index, value) => {
    const options = [...(question?.options || [])];
    options[index] = value;
    onUpdate({ ...question, options });
  };

  /**
   * Removes an option at the specified index.
   * 
   * @param {number} index - The index of the option to remove.
   */
  const removeOption = (index) => {
    const options = (question?.options || []).filter((_, i) => i !== index);
    onUpdate({ ...question, options });
  };

  const questionErrors = errors[`question-${sectionIndex}-${questionIndex}`] || {};

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
    <Card className="shadow-md border-0 bg-gradient-to-br from-card to-muted/20 hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            {typeIcons[question?.type] || <FileText className="h-5 w-5" />}
            Question {questionIndex + 1}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Question Text */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Question Text</Label>
          <Input
            value={question?.question || ""}
            onChange={(e) => onUpdate({ ...question, question: e.target.value })}
            placeholder="Enter your question here..."
            className={`transition-colors ${questionErrors.text ? "border-destructive focus:border-destructive" : "focus:border-primary"}`}
          />
          {questionErrors.text && (
            <p className="text-destructive text-xs flex items-center gap-1">
              <span className="w-1 h-1 bg-destructive rounded-full"></span>
              {questionErrors.text}
            </p>
          )}
        </div>

        {/* Question Type and Required Toggle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Question Type
            </Label>
            <Select
              value={question?.type || "short-text"}
              onValueChange={(value) => onUpdate({ ...question, type: value })}
            >
              <SelectTrigger className="hover:border-primary transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short-text">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Short Text
                  </div>
                </SelectItem>
                <SelectItem value="long-text">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Long Text
                  </div>
                </SelectItem>
                <SelectItem value="single-choice">
                  <div className="flex items-center gap-2">
                    <Square className="h-4 w-4" />
                    Single Choice
                  </div>
                </SelectItem>
                <SelectItem value="multi-choice">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Multiple Choice
                  </div>
                </SelectItem>
                <SelectItem value="numeric">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Numeric
                  </div>
                </SelectItem>
                <SelectItem value="file-upload">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    File Upload
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
            <Switch
              checked={!!question?.required}
              onCheckedChange={(checked) => onUpdate({ ...question, required: checked })}
              id={`required-${question.id}`}
            />
            <Label htmlFor={`required-${question.id}`} className="text-sm font-medium cursor-pointer">
              Required Question
            </Label>
          </div>
        </div>

        {/* Options for Choice Questions */}
        {hasOptions && (
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Options
            </Label>
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 hover:border-primary transition-colors"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addOption}
              className="w-full gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Option
            </Button>
            {questionErrors.options && (
              <p className="text-destructive text-xs flex items-center gap-1">
                <span className="w-1 h-1 bg-destructive rounded-full"></span>
                {questionErrors.options}
              </p>
            )}
          </div>
        )}

        {/* Validation for Text/Numeric Questions */}
        {hasValidation && (
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Validation Rules
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {question.type === "numeric" ? (
                <>
                  <Input
                    type="number"
                    placeholder="Min value"
                    value={question.validation?.min || ""}
                    onChange={(e) =>
                      onUpdate({
                        ...question,
                        validation: {
                          ...question.validation,
                          min: e.target.value,
                        },
                      })
                    }
                    className="hover:border-primary transition-colors"
                  />
                  <Input
                    type="number"
                    placeholder="Max value"
                    value={question.validation?.max || ""}
                    onChange={(e) =>
                      onUpdate({
                        ...question,
                        validation: {
                          ...question.validation,
                          max: e.target.value,
                        },
                      })
                    }
                    className="hover:border-primary transition-colors"
                  />
                </>
              ) : (
                <>
                  <Input
                    type="number"
                    placeholder="Min length"
                    value={question.validation?.minLength || ""}
                    onChange={(e) =>
                      onUpdate({
                        ...question,
                        validation: {
                          ...question.validation,
                          minLength: e.target.value,
                        },
                      })
                    }
                    className="hover:border-primary transition-colors"
                  />
                  <Input
                    type="number"
                    placeholder="Max length"
                    value={question.validation?.maxLength || ""}
                    onChange={(e) =>
                      onUpdate({
                        ...question,
                        validation: {
                          ...question.validation,
                          maxLength: e.target.value,
                        },
                      })
                    }
                    className="hover:border-primary transition-colors"
                  />
                </>
              )}
            </div>
            {questionErrors.validation && (
              <p className="text-destructive text-xs flex items-center gap-1">
                <span className="w-1 h-1 bg-destructive rounded-full"></span>
                {questionErrors.validation}
              </p>
            )}
          </div>
        )}

        {/* Conditional Logic */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Conditional Logic (Optional)
          </Label>
          <div className="flex gap-3">
            <Select
              value={question.conditionalOn?.questionId || "none"}
              onValueChange={(value) =>
                onUpdate({
                  ...question,
                  conditionalOn:
                    value !== "none"
                      ? { questionId: value, answer: question.conditionalOn?.answer || "" }
                      : undefined,
                })
              }
            >
              <SelectTrigger className="flex-1 hover:border-primary transition-colors">
                <SelectValue placeholder="Show when..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No condition</SelectItem>
                {allQuestions
                  .filter((q) => q.id !== question.id)
                  .map((q) => (
                    <SelectItem key={q.id} value={q.id}>
                      {q.question || "Untitled question"}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {question.conditionalOn && (
              <Input
                placeholder="equals..."
                value={question.conditionalOn.answer || ""}
                onChange={(e) =>
                  onUpdate({
                    ...question,
                    conditionalOn: {
                      ...question.conditionalOn,
                      answer: e.target.value,
                    },
                  })
                }
                className="flex-1 hover:border-primary transition-colors"
              />
            )}
          </div>
          {question.conditionalOn && (
            <Badge variant="secondary" className="text-xs w-fit">
              Only shown conditionally
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
