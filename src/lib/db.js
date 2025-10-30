import Dexie from 'dexie';

class TalentFlowDB extends Dexie {
  constructor() {
    super('TalentFlowDB');
    this.version(1).stores({
      jobs: 'id, slug, status, order',
      candidates: 'id, email, stage, jobId',
      timeline: 'id, candidateId, timestamp',
      assessments: 'id, jobId, createdAt',
      responses: 'id, assessmentId, candidateId, jobId'
    });
    
    // Initialize collections
    this.jobs = this.table('jobs');
    this.candidates = this.table('candidates');
    this.timeline = this.table('timeline');
    this.assessments = this.table('assessments');
    this.responses = this.table('responses');
  }
}

export const db = new TalentFlowDB();