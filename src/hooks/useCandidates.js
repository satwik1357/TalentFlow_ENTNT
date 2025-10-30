import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/db";

/**
 * Custom hook for managing candidates data with search and filtering capabilities
 * @param {string} initialSearch - Initial search term
 * @param {string} initialStage - Initial stage filter
 * @returns {Object} Object containing candidates data and methods
 */
export const useCandidates = (initialSearch, initialStage) => {
  // Set default values
  const safeInitialSearch = typeof initialSearch === 'string' ? initialSearch : '';
  const safeInitialStage = typeof initialStage === 'string' ? initialStage : '';

  const [search, setSearch] = useState(safeInitialSearch);
  const [stage, setStage] = useState(safeInitialStage);
  const queryClient = useQueryClient();

  // Query for candidates from DB
  const { data: candidates = [], isLoading, error } = useQuery({
    queryKey: ['candidates', search, stage],
    queryFn: async () => {
      let candidates = await db.candidates.toArray();

      // Apply filters
      if (search) {
        const searchLower = search.toLowerCase();
        candidates = candidates.filter(
          candidate =>
            candidate.name.toLowerCase().includes(searchLower) ||
            candidate.email.toLowerCase().includes(searchLower) ||
            (candidate.skills || []).some(skill => skill.toLowerCase().includes(searchLower)) ||
            (candidate.currentRole?.toLowerCase().includes(searchLower)) ||
            (candidate.job?.title?.toLowerCase().includes(searchLower))
        );
      }
      if (stage) {
        candidates = candidates.filter(candidate => candidate.stage === stage);
      }
      return candidates;
    }
  });

  // Mutation for moving candidate to a different stage
  const moveCandidateMutation = useMutation({
    mutationFn: async ({ id, newStage }) => {
      await db.candidates.update(id, { stage: newStage, lastUpdated: new Date().toISOString() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['candidates']);
    },
    onError: (error) => {
      console.error('Failed to move candidate:', error);
    }
  });

  // Mutation for adding a new candidate
  const addCandidateMutation = useMutation({
    mutationFn: async (candidate) => {
      const newCandidate = {
        ...candidate,
        id: `cand_${Date.now()}`,
        stage: 'applied',
        appliedDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
      await db.candidates.add(newCandidate);
      return newCandidate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['candidates']);
    },
    onError: (error) => {
      console.error('Failed to add candidate:', error);
    }
  });

  // Mutation for updating an existing candidate
  const updateCandidateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      await db.candidates.update(id, { ...updates, lastUpdated: new Date().toISOString() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['candidates']);
    },
    onError: (error) => {
      console.error('Failed to update candidate:', error);
    }
  });

  // Mutation for deleting a candidate
  const deleteCandidateMutation = useMutation({
    mutationFn: async (id) => {
      await db.candidates.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['candidates']);
    },
    onError: (error) => {
      console.error('Failed to delete candidate:', error);
    }
  });

  // Move candidate to a different stage
  const moveCandidate = (candidateId, newStage) => {
    if (!candidateId || !newStage) return;
    moveCandidateMutation.mutate({ id: candidateId, newStage });
  };

  // Add a new candidate
  const addCandidate = (candidate) => {
    addCandidateMutation.mutate(candidate);
  };

  // Update an existing candidate
  const updateCandidate = (id, updates) => {
    if (!id || !updates || typeof updates !== 'object') {
      console.error('Invalid update data');
      return false;
    }
    updateCandidateMutation.mutate({ id, updates });
    return true;
  };

  // Delete a candidate
  const deleteCandidate = (id) => {
    if (!id) return false;
    deleteCandidateMutation.mutate(id);
    return true;
  };

  // Refresh data
  const refresh = () => {
    queryClient.invalidateQueries(['candidates']);
  };

  return {
    // State
    candidates,
    isLoading,
    error,
    search,
    stage,
    
    // Actions
    setSearch: useCallback((value) => {
      if (typeof value === 'string') {
        setSearch(value);
      }
    }, []),
    
    setStage: useCallback((value) => {
      if (typeof value === 'string') {
        setStage(value);
      }
    }, []),
    
    // CRUD operations
    addCandidate,
    updateCandidate,
    deleteCandidate,
    
    // Refresh data
    refresh,
    moveCandidate
  };
};
