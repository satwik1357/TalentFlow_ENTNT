/**
 * @typedef {Object} AssessmentQuestion
 * @property {string} id - Unique identifier for the question
 * @property {string} type - Type of question (e.g., 'short-text', 'long-text', 'multiple-choice')
 * @property {string} question - The question text
 * @property {string[]} [options] - Available options for multiple choice questions
 * @property {boolean} [required] - Whether the question is required
 */

/**
 * @typedef {Object} AssessmentSection
 * @property {string} id - Unique identifier for the section
 * @property {string} title - Section title
 * @property {string} [description] - Optional section description
 * @property {AssessmentQuestion[]} questions - Array of questions in this section
 */

export {}; // This file only contains type definitions
