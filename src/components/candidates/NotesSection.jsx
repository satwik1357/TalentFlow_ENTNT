import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquarePlus, User, Save, X, AtSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';

// Constants
const TEAM_MEMBERS = [
  'Sarah Johnson',
  'Michael Chen',
  'Emily Rodriguez',
  'David Kim',
  'Jessica Martinez',
  'Alex Thompson',
];

/**
 * NotesSection component allows users to add, edit, and view notes for a candidate.
 * Supports @mentions for team members and integrates with IndexedDB for persistence.
 *
 * @param {string} candidateId - The ID of the candidate.
 * @param {string} notes - The current notes text.
 * @param {Function} onUpdate - Callback function to trigger after updating notes.
 */
export const NotesSection = ({ candidateId, notes, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [noteText, setNoteText] = useState(notes || '');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef(null);
  const { toast } = useToast();

  // Reset note text when notes prop changes
  useEffect(() => {
    setNoteText(notes || '');
  }, [notes]);

  // Handle text changes and mention detection
  const handleTextChange = (e) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    setNoteText(value);
    setCursorPosition(cursorPos);

    // Detect @ mentions
    const textBeforeCursor = value.slice(0, cursorPos);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
    if (lastAtSymbol !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtSymbol + 1);
      if (!textAfterAt.includes(' ')) {
        setMentionSearch(textAfterAt.toLowerCase());
        setShowMentions(true);
        return;
      }
    }
    setShowMentions(false);
  };

  // Insert mention into textarea
  const insertMention = (name) => {
    const textBeforeCursor = noteText.slice(0, cursorPosition);
    const textAfterCursor = noteText.slice(cursorPosition);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
    const newText =
      textBeforeCursor.slice(0, lastAtSymbol) +
      `@${name} ` +
      textAfterCursor;
    setNoteText(newText);
    setShowMentions(false);
    textareaRef.current?.focus();
    // Set cursor after the inserted mention
    setTimeout(() => {
      const newCursorPos = lastAtSymbol + name.length + 2;
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Save notes to database
  const handleSave = async () => {
    if (!candidateId || isSaving) return;

    setIsSaving(true);
    try {
      await db.candidates.update(candidateId, { notes: noteText });

      // Add timeline event
      await db.timeline.add({
        id: `timeline_${Date.now()}`,
        type: 'note_added',
        description: 'Note updated',
        timestamp: new Date().toISOString(),
        candidateId,
        userName: 'Current User',
      });

      toast({
        title: 'Note saved',
        description: 'Your note has been saved successfully.',
        variant: 'default',
      });

      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to save note:', error);
      toast({
        title: 'Failed to save note',
        description: error.message || 'An error occurred while saving the note.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel editing and reset
  const handleCancel = () => {
    setIsEditing(false);
    setNoteText(notes || '');
    setShowMentions(false);
  };

  // Filter team members based on mention search
  const filteredMembers = showMentions
    ? TEAM_MEMBERS.filter((name) => name.toLowerCase().includes(mentionSearch))
    : [];

  // Render notes with highlighted mentions
  const renderNotesWithMentions = (text) => {
    const parts = text.split(/(@[\w\s]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span
            key={index}
            className="text-blue-600 font-medium bg-blue-50 px-1 py-0.5 rounded-md"
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
            <div className="p-2 bg-blue-50 rounded-lg">
              <MessageSquarePlus className="h-5 w-5 text-blue-600" />
            </div>
            Notes
          </CardTitle>
          {!isEditing && (
            <Button
              size="sm"
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {notes ? 'Edit Note' : 'Add Note'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isEditing ? (
          <div className="space-y-4">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={noteText}
                onChange={handleTextChange}
                placeholder="Add notes about this candidate... Type @ to mention team members"
                className="min-h-[150px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                aria-label="Notes textarea"
              />
              {showMentions && filteredMembers.length > 0 && (
                <Card className="absolute z-20 w-64 mt-2 shadow-lg border border-gray-200 rounded-lg">
                  <CardContent className="p-3">
                    <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                      <AtSign className="h-3 w-3" />
                      Mention team member
                    </div>
                    <div className="space-y-1">
                      {filteredMembers.map((member) => (
                        <button
                          key={member}
                          onClick={() => insertMention(member)}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 rounded-md text-sm text-left transition-colors"
                          aria-label={`Mention ${member}`}
                        >
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{member}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <AtSign className="h-3 w-3" />
              Tip: Type @ to mention team members
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Note
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
                className="border-gray-300 hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="min-h-[100px]">
            {notes ? (
              <div className="text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-100">
                {renderNotesWithMentions(notes)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <MessageSquarePlus className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm font-medium">No notes yet</p>
                <p className="text-xs">Click "Add Note" to get started</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
