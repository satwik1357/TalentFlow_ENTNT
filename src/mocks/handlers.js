import { http, HttpResponse, delay } from 'msw';
import { db } from '@/lib/db';

const API_BASE = '/api';

// Simulate network conditions
const simulateNetwork = async (isWrite = false) => {
  // Random latency between 200-1200ms
  await delay(Math.random() * 1000 + 200);
  // 5-10% error rate on write operations
  if (isWrite && Math.random() < 0.075) {
    throw new Error('Simulated network error');
  }
};

const handleError = (error) => {
  console.error('API Error:', error);
  return HttpResponse.json(
    { error: error.message || 'Internal Server Error' },
    { status: 500 }
  );
};

export const handlers = [
  // Jobs endpoints
  http.get(`${API_BASE}/jobs`, async ({ request }) => {
    try {
      await simulateNetwork();
      const url = new URL(request.url);
      const search = url.searchParams.get('search') || '';
      const status = url.searchParams.get('status');
      const page = parseInt(url.searchParams.get('page') || '1');
      const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
      const sort = url.searchParams.get('sort') || '-createdAt';
      
      let jobs = await db.jobs.toArray();
      
      // Apply filters
      if (search) {
        const searchLower = search.toLowerCase();
        jobs = jobs.filter(job => 
          job.title.toLowerCase().includes(searchLower) ||
          job.description.toLowerCase().includes(searchLower) ||
          job.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      if (status) {
        jobs = jobs.filter(job => job.status === status);
      }
      
      // Apply sorting
      const [field, direction] = sort.startsWith('-') 
        ? [sort.slice(1), 'desc'] 
        : [sort, 'asc'];
      
      jobs.sort((a, b) => {
        if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
        if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
        return 0;
      });
      
      // Apply pagination
      const total = jobs.length;
      const totalPages = Math.ceil(total / pageSize);
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const data = jobs.slice(start, end);
      
      return HttpResponse.json({
        data,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      return handleError(error);
    }
  }),
  
  http.post(`${API_BASE}/jobs`, async ({ request }) => {
    try {
      await simulateNetwork(true);
      const job = await request.json();
      const newJob = {
        ...job,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: job.status || 'active',
        order: job.order || Date.now()
      };
      
      await db.jobs.add(newJob);
      return HttpResponse.json(newJob, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  }),
  
  http.patch(`${API_BASE}/jobs/:id`, async ({ params, request }) => {
    try {
      await simulateNetwork(true);
      const { id } = params;
      const updates = await request.json();
      const job = await db.jobs.get(id);
      
      if (!job) {
        return HttpResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      
      const updatedJob = {
        ...job,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await db.jobs.update(id, updatedJob);
      return HttpResponse.json(updatedJob);
    } catch (error) {
      return handleError(error);
    }
  }),
  
  http.patch(`${API_BASE}/jobs/:id/reorder`, async ({ params, request }) => {
    try {
      await simulateNetwork(true);
      const { id } = params;
      const { fromOrder, toOrder } = await request.json();
      
      // Simulate occasional failure for testing rollback
      if (Math.random() < 0.1) {
        throw new Error('Failed to reorder jobs');
      }
      
      const job = await db.jobs.get(id);
      if (!job) {
        return HttpResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      
      // Update the order of the moved job
      await db.jobs.update(id, { order: toOrder });
      
      // Update other jobs' orders if needed
      if (fromOrder < toOrder) {
        // Moving down
        await db.jobs
          .where('order')
          .between(fromOrder + 1, toOrder, true, true)
          .modify(job => {
            job.order -= 1;
          });
      } else {
        // Moving up
        await db.jobs
          .where('order')
          .between(toOrder, fromOrder - 1, true, true)
          .modify(job => {
            job.order += 1;
          });
      }
      
      return HttpResponse.json({ success: true });
    } catch (error) {
      return handleError(error);
    }
  }),
  http.get(`${API_BASE}/jobs/:id`, async ({ params }) => {
    try {
      await simulateNetwork();
      const { id } = params;
      const job = await db.jobs.get(id);
      if (!job) {
        return HttpResponse.json({ error: 'Job not found' }, { status: 404 });
      }
      return HttpResponse.json(job);
    } catch (error) {
      return handleError(error);
    }
  }),

  
  // Candidates endpoints
  http.get(`${API_BASE}/candidates`, async ({ request }) => {
    try {
      await simulateNetwork();
      const url = new URL(request.url);
      const search = url.searchParams.get('search') || '';
      const jobId = url.searchParams.get('jobId');
      const stage = url.searchParams.get('stage');
      const page = parseInt(url.searchParams.get('page') || '1');
      const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
      
      let candidates = await db.candidates.toArray();
      
      // Apply filters
      if (search) {
        const searchLower = search.toLowerCase();
        candidates = candidates.filter(candidate => 
          candidate.name.toLowerCase().includes(searchLower) ||
          candidate.email.toLowerCase().includes(searchLower) ||
          candidate.skills?.some(skill => skill.toLowerCase().includes(searchLower))
        );
      }
      
      if (stage) {
        candidates = candidates.filter(candidate => candidate.stage === stage);
      }

      if (jobId) {
        candidates = candidates.filter(candidate => candidate.jobId === jobId);
      }
      
      // Apply pagination
      const total = candidates.length;
      const totalPages = Math.ceil(total / pageSize);
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const data = candidates.slice(start, end);
      
      // Include related job data
      const candidatesWithJob = await Promise.all(data.map(async candidate => {
        const job = await db.jobs.get(candidate.jobId);
        return { ...candidate, job };
      }));
      
      return HttpResponse.json({
        data: candidatesWithJob,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      return handleError(error);
    }
  }),
  
  http.post(`${API_BASE}/candidates`, async ({ request }) => {
    try {
      await simulateNetwork(true);
      const candidate = await request.json();
      const newCandidate = {
        ...candidate,
        id: crypto.randomUUID(),
        appliedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await db.candidates.add(newCandidate);
      
      // Add to timeline
      await db.timeline.add({
        id: crypto.randomUUID(),
        candidateId: newCandidate.id,
        type: 'applied',
        title: 'Application Submitted',
        description: 'Candidate applied for the position',
        timestamp: new Date().toISOString(),
        metadata: {}
      });
      
      return HttpResponse.json(newCandidate, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  }),
  
  http.patch(`${API_BASE}/candidates/:id`, async ({ params, request }) => {
    try {
      await simulateNetwork(true);
      const { id } = params;
      const updates = await request.json();
      const candidate = await db.candidates.get(id);
      
      if (!candidate) {
        return HttpResponse.json(
          { error: 'Candidate not found' },
          { status: 404 }
        );
      }
      
      const updatedCandidate = {
        ...candidate,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // If stage changed, add to timeline
      if (updates.stage && updates.stage !== candidate.stage) {
        await db.timeline.add({
          id: crypto.randomUUID(),
          candidateId: id,
          type: 'stage_change',
          title: `Moved to ${updates.stage} stage`,
          description: `Candidate moved from ${candidate.stage} to ${updates.stage}`,
          timestamp: new Date().toISOString(),
          metadata: {
            from: candidate.stage,
            to: updates.stage
          }
        });
      }
      
      await db.candidates.update(id, updatedCandidate);
      return HttpResponse.json(updatedCandidate);
    } catch (error) {
      return handleError(error);
    }
  }),
  
  http.get(`${API_BASE}/candidates/:id/timeline`, async ({ params }) => {
    try {
      await simulateNetwork();
      const { id } = params;
      const timeline = await db.timeline
        .where('candidateId')
        .equals(id)
        .sortBy('timestamp');
      
      return HttpResponse.json(timeline);
    } catch (error) {
      return handleError(error);
    }
  }),
  
  // Assessments endpoints
  http.get(`${API_BASE}/assessments/:jobId`, async ({ params }) => {
    try {
      await simulateNetwork();
      const { jobId } = params;
      const assessment = await db.assessments.get({ jobId });
      
      if (!assessment) {
        return HttpResponse.json(
          { error: 'Assessment not found' },
          { status: 404 }
        );
      }
      
      return HttpResponse.json(assessment);
    } catch (error) {
      return handleError(error);
    }
  }),
  
  http.put(`${API_BASE}/assessments/:jobId`, async ({ params, request }) => {
    try {
      await simulateNetwork(true);
      const { jobId } = params;
      const assessment = await request.json();
      
      const existing = await db.assessments.get({ jobId });
      
      const assessmentData = {
        ...assessment,
        jobId,
        updatedAt: new Date().toISOString()
      };
      
      if (existing) {
        await db.assessments.update(jobId, assessmentData);
      } else {
        assessmentData.id = crypto.randomUUID();
        assessmentData.createdAt = new Date().toISOString();
        await db.assessments.add(assessmentData);
      }
      
      return HttpResponse.json(assessmentData);
    } catch (error) {
      return handleError(error);
    }
  }),
  
  http.post(`${API_BASE}/assessments/:jobId/submit`, async ({ params, request }) => {
    try {
      await simulateNetwork(true);
      const { jobId } = params;
      const { candidateId, responses } = await request.json();
      
      const responseId = crypto.randomUUID();
      const response = {
        id: responseId,
        jobId,
        candidateId,
        responses,
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      };
      
      await db.responses.add(response);
      
      // Add to timeline
      await db.timeline.add({
        id: crypto.randomUUID(),
        candidateId,
        type: 'assessment_submitted',
        title: 'Assessment Submitted',
        description: 'Candidate has submitted the assessment',
        timestamp: new Date().toISOString(),
        metadata: { responseId }
      });
      
      return HttpResponse.json(response, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  }),
  
  http.post(`${API_BASE}/assessments/:jobId/submit`, async ({ params, request }) => {
     try {
       await simulateNetwork(true);
       const { jobId } = params;
       const { candidateId, responses } = await request.json();
       
       const responseId = crypto.randomUUID();
       const response = {
         id: responseId,
         jobId,
         candidateId,
         responses,
         submittedAt: new Date().toISOString(),
         status: 'submitted'
       };
       
       await db.responses.add(response);
       
       // Add to timeline
       await db.timeline.add({
         id: crypto.randomUUID(),
         candidateId,
         type: 'assessment_submitted',
         title: 'Assessment Submitted',
         description: 'Candidate has submitted the assessment',
         timestamp: new Date().toISOString(),
         metadata: { responseId }
       });
       
       return HttpResponse.json(response, { status: 201 });
     } catch (error) {
       return handleError(error);
     }
   }),
  http.patch(`${API_BASE}/jobs/:id`, async ({ request, params }) => {
    await simulateNetwork();
    const { id } = params;
    const updates = await request.json();
    await db.jobs.update(id, updates);
    const updated = await db.jobs.get(id);
    return HttpResponse.json(updated);
  }),
  http.patch(`${API_BASE}/jobs/:id/reorder`, async ({ request, params }) => {
    await simulateNetwork();
    // Simulate 500 error 20% of the time to test rollback
    if (Math.random() < 0.2) {
      return new HttpResponse(
        { error: 'Simulated server error during reorder' }, 
        { status: 500 }
      );
    }
    const { id } = params;
    const { fromOrder, toOrder } = await request.json();
    const jobs = await db.jobs.orderBy('order').toArray();
    const job = jobs.find(j => j.id === id);
    if (!job) {
      return new HttpResponse(null, { status: 404 });
    }
    // Reorder logic
    const updates = [];
    if (fromOrder < toOrder) {
      jobs.forEach(j => {
        if (j.order > fromOrder && j.order <= toOrder) {
          updates.push({ id: j.id, order: j.order - 1 });
        }
      });
    } else {
      jobs.forEach(j => {
        if (j.order >= toOrder && j.order < fromOrder) {
          updates.push({ id: j.id, order: j.order + 1 });
        }
      });
    }
    updates.push({ id: id, order: toOrder });
    // Apply all updates in a transaction
    await db.transaction('rw', db.jobs, async () => {
      await Promise.all(
        updates.map(({ id, order }) => db.jobs.update(id, { order }))
      );
    });
    return HttpResponse.json({ success: true });
  }),
  // Candidates endpoints
  http.get(`${API_BASE}/candidates`, async ({ request }) => {
    await simulateNetwork();
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const stage = url.searchParams.get('stage') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50');
    let candidates = await db.candidates.toArray();
    // Filter
    if (search) {
      candidates = candidates.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (stage) {
      candidates = candidates.filter(c => c.stage === stage);
    }
    // Sort by application date
    candidates.sort((a, b) => 
      new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
    );
    // Paginate
    const total = candidates.length;
    const start = (page - 1) * pageSize;
    const paginatedCandidates = candidates.slice(start, start + pageSize);
    return HttpResponse.json({
      data: paginatedCandidates,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  }),
  http.post(`${API_BASE}/candidates`, async ({ request }) => {
    await simulateNetwork();
    const body = await request.json();
    const newCandidate = {
      id: crypto.randomUUID(),
      name: body.name || '',
      email: body.email || '',
      stage: body.stage || 'applied',
      jobId: body.jobId || '',
      appliedAt: new Date().toISOString(),
      phone: body.phone || '',
      resume: body.resume || '',
      notes: body.notes,
    };
    await db.candidates.add(newCandidate);
    return HttpResponse.json(newCandidate, { status: 201 });
  }),
  http.patch(`${API_BASE}/candidates/:id`, async ({ request, params }) => {
    await simulateNetwork();
    const { id } = params;
    const updates = await request.json();
    await db.candidates.update(id, updates);
    // Add timeline event for stage changes
    if (updates.stage) {
      await db.timeline.add({
        id,
        candidateId: id,
        type: 'stage_change',
        description: `Stage changed to ${updates.stage}`,
        timestamp: new Date().toISOString(),
        userName: 'Current User',
      });
    }
    const updated = await db.candidates.get(id);
    return HttpResponse.json(updated);
  }),
  http.get(`${API_BASE}/candidates/:id/timeline`, async ({ params }) => {
    await simulateNetwork();
    const { id } = params;
    const events = await db.timeline
      .where('candidateId')
      .equals(id)
      .sortBy('timestamp');
    return HttpResponse.json(events);
  }),
  // Assessments endpoints
  http.get(`${API_BASE}/assessments/:jobId`, async ({ params }) => {
    await simulateNetwork();
    const { jobId } = params;
    const assessment = await db.assessments
      .where('jobId')
      .equals(jobId)
      .first();
    return HttpResponse.json(assessment || null);
  }),
  http.put(`${API_BASE}/assessments/:jobId`, async ({ request, params }) => {
    await simulateNetwork();
    const { jobId } = params;
    const body = await request.json();
    const existing = await db.assessments
      .where('jobId')
      .equals(jobId)
      .first();
    if (existing) {
      await db.assessments.update(existing.id, {
        ...body,
        updatedAt: new Date().toISOString()
      });
      const updated = await db.assessments.get(existing.id);
      return HttpResponse.json(updated);
    } else {
      const newAssessment = {
        id: crypto.randomUUID(),
        jobId: jobId,
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.assessments.add(newAssessment);
      return HttpResponse.json(newAssessment, { status: 201 });
    }
  }),
  http.post(`${API_BASE}/assessments/:jobId/responses`, async ({ request, params }) => {
    await simulateNetwork();
    const { jobId } = params;
    const body = await request.json();
    const response = {
      id: crypto.randomUUID(),
      jobId: jobId,
      candidateId: body.candidateId,
      assessmentId: body.assessmentId,
      answers: body.answers,
      submittedAt: new Date().toISOString(),
    };
    await db.responses.add(response);
    // Add timeline event
    await db.timeline.add({
      id,
      candidateId: body.candidateId,
      type: 'assessment_completed',
      description: 'Completed assessment',
      timestamp: new Date().toISOString(),
    });
    return HttpResponse.json(response, { status: 201 });
  }),
];