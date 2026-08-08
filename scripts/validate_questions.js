/* global process */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const QUESTIONS_DIR = path.join(__dirname, '../src/data/questions');

const VALID_CATEGORIES = new Set([
  'JavaScript',
  'React',
  'DBMS',
  'Data Structures',
  'Computer Science',
  'Operating Systems',
  'Networking',
  'General Knowledge'
]);

const VALID_DIFFICULTIES = new Set(['Easy', 'Medium', 'Hard']);

const normalizeText = (str) =>
  str ? str.toLowerCase().replace(/\s+/g, ' ').trim() : '';

function validateQuestionBank() {
  console.log('=== QUIZELLE QUESTION BANK VALIDATION REPORT ===\n');

  if (!fs.existsSync(QUESTIONS_DIR)) {
    console.error(`Error: Questions directory not found at ${QUESTIONS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(QUESTIONS_DIR).filter((f) => f.endsWith('.json'));

  let totalQuestions = 0;
  let validQuestions = 0;
  let invalidQuestions = 0;

  const seenIds = new Set();
  const seenQuestionTexts = new Set();
  const duplicates = [];
  const errors = [];
  const categoryStats = {};
  const difficultyStats = {};

  files.forEach((file) => {
    const filePath = path.join(QUESTIONS_DIR, file);
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const questions = JSON.parse(raw);

      questions.forEach((q, idx) => {
        totalQuestions++;
        let isValid = true;
        const qLoc = `${file} [index ${idx}]`;

        // ID check
        if (!q.id || typeof q.id !== 'string') {
          errors.push(`${qLoc}: Invalid or missing 'id'`);
          isValid = false;
        } else if (seenIds.has(q.id)) {
          duplicates.push(`${qLoc}: Duplicate ID '${q.id}'`);
          isValid = false;
        } else {
          seenIds.add(q.id);
        }

        // Question text check
        if (!q.question || typeof q.question !== 'string' || q.question.trim().length < 10) {
          errors.push(`${qLoc}: Question text missing or too short`);
          isValid = false;
        } else {
          const normQ = normalizeText(q.question);
          if (seenQuestionTexts.has(normQ)) {
            duplicates.push(`${qLoc}: Duplicate question text -> "${q.question.substring(0, 40)}..."`);
            isValid = false;
          } else {
            seenQuestionTexts.add(normQ);
          }
        }

        // Options check
        if (!Array.isArray(q.options) || q.options.length < 2) {
          errors.push(`${qLoc}: Options must be an array of at least 2 items`);
          isValid = false;
        } else {
          const uniqueOpts = new Set(q.options.map((o) => o?.trim()));
          if (uniqueOpts.size !== q.options.length) {
            errors.push(`${qLoc}: Duplicate choices found inside options array`);
            isValid = false;
          }
        }

        // Answer check
        if (!q.answer || typeof q.answer !== 'string') {
          errors.push(`${qLoc}: Invalid or missing 'answer'`);
          isValid = false;
        } else if (Array.isArray(q.options) && !q.options.some((opt) => opt.trim() === q.answer.trim())) {
          errors.push(`${qLoc}: Correct answer '${q.answer}' is NOT present in options`);
          isValid = false;
        }

        // Category check
        if (!q.category || !VALID_CATEGORIES.has(q.category)) {
          errors.push(`${qLoc}: Invalid category '${q.category}'`);
          isValid = false;
        }

        // Difficulty check
        if (!q.difficulty || !VALID_DIFFICULTIES.has(q.difficulty)) {
          errors.push(`${qLoc}: Invalid difficulty '${q.difficulty}'`);
          isValid = false;
        }

        if (isValid) {
          validQuestions++;
          categoryStats[q.category] = (categoryStats[q.category] || 0) + 1;
          difficultyStats[q.difficulty] = (difficultyStats[q.difficulty] || 0) + 1;
        } else {
          invalidQuestions++;
        }
      });
    } catch (err) {
      errors.push(`Failed to parse file ${file}: ${err.message}`);
    }
  });

  console.log(`Files Processed:      ${files.length}`);
  console.log(`Total Questions:      ${totalQuestions}`);
  console.log(`Valid Questions:      ${validQuestions}`);
  console.log(`Invalid Questions:    ${invalidQuestions}`);
  console.log(`Duplicate Questions:  ${duplicates.length}`);

  console.log('\n--- CATEGORY BREAKDOWN ---');
  Object.entries(categoryStats).forEach(([cat, count]) => {
    console.log(`  - ${cat.padEnd(20)}: ${count} questions`);
  });

  console.log('\n--- DIFFICULTY BREAKDOWN ---');
  Object.entries(difficultyStats).forEach(([diff, count]) => {
    console.log(`  - ${diff.padEnd(20)}: ${count} questions`);
  });

  if (duplicates.length > 0) {
    console.log('\n⚠️ DUPLICATES FOUND:');
    duplicates.forEach((d) => console.log(`  ${d}`));
  }

  if (errors.length > 0) {
    console.log('\n❌ VALIDATION ERRORS:');
    errors.forEach((e) => console.log(`  ${e}`));
  } else {
    console.log('\n✅ ALL QUESTIONS PASSED VALIDATION PERFECTLY!');
  }
}

validateQuestionBank();
