// JSDoc type definitions for CandidateStage
/** @typedef {'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected'} CandidateStage */

/**
 * @typedef {Object} Job
 * @property {string} id
 * @property {string} title
 * @property {string} department
 * @property {string} location
 * @property {'Full-time' | 'Part-time' | 'Contract' | 'Internship'} type
 * @property {string} experience
 * @property {string} salary
 * @property {string} postedDate
 */

/**
 * @typedef {Object} Candidate
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} location
 * @property {number} experience
 * @property {string} education
 * @property {string[]} skills
 * @property {CandidateStage} stage
 * @property {string} appliedDate
 * @property {string} lastUpdated
 * @property {string} avatar
 * @property {string} currentRole
 * @property {string} noticePeriod
 * @property {string} salaryExpectation
 * @property {string} jobId
 * @property {Job} [job]
 */

export {}; // This file only contains type definitions
