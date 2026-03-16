/**
 * Plagiarism Detection using TF-IDF Cosine Similarity
 * Compares text content of submissions to detect similarities
 */

/**
 * Tokenize text into words
 */
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

/**
 * Build term frequency map
 */
function termFrequency(tokens) {
  const tf = {};
  tokens.forEach((token) => {
    tf[token] = (tf[token] || 0) + 1;
  });
  return tf;
}

/**
 * Compute cosine similarity between two TF maps
 */
function cosineSimilarity(tf1, tf2) {
  const allTerms = new Set([...Object.keys(tf1), ...Object.keys(tf2)]);

  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  allTerms.forEach((term) => {
    const v1 = tf1[term] || 0;
    const v2 = tf2[term] || 0;
    dotProduct += v1 * v2;
    mag1 += v1 * v1;
    mag2 += v2 * v2;
  });

  const magnitude = Math.sqrt(mag1) * Math.sqrt(mag2);
  if (magnitude === 0) return 0;

  return dotProduct / magnitude;
}

/**
 * N-gram similarity for short-sentence level matching
 */
function ngramSimilarity(text1, text2, n = 3) {
  const getNgrams = (text, n) => {
    const words = tokenize(text);
    const ngrams = new Set();
    for (let i = 0; i <= words.length - n; i++) {
      ngrams.add(words.slice(i, i + n).join(' '));
    }
    return ngrams;
  };

  const ng1 = getNgrams(text1, n);
  const ng2 = getNgrams(text2, n);

  if (ng1.size === 0 || ng2.size === 0) return 0;

  let intersection = 0;
  ng1.forEach((ng) => {
    if (ng2.has(ng)) intersection++;
  });

  return (2 * intersection) / (ng1.size + ng2.size); // Dice coefficient
}

/**
 * Main plagiarism check function
 * @param {string} newText - The text of the new submission
 * @param {Array} existingSubmissions - Array of { studentId, studentName, text }
 * @returns {{ plagiarismScore: number, details: Array }}
 */
function checkPlagiarism(newText, existingSubmissions) {
  if (!newText || newText.trim().length < 50) {
    return { plagiarismScore: 0, details: [] };
  }

  const tokens1 = tokenize(newText);
  const tf1 = termFrequency(tokens1);

  const details = [];
  let maxScore = 0;

  existingSubmissions.forEach((submission) => {
    if (!submission.text || submission.text.trim().length < 50) return;

    const tokens2 = tokenize(submission.text);
    const tf2 = termFrequency(tokens2);

    const cosScore = cosineSimilarity(tf1, tf2);
    const ngramScore = ngramSimilarity(newText, submission.text);

    // Weighted average: 60% cosine, 40% n-gram
    const combinedScore = Math.round((cosScore * 0.6 + ngramScore * 0.4) * 100);

    if (combinedScore > 15) {
      // Only flag if > 15% similar
      details.push({
        matchedStudentId: submission.studentId,
        matchedStudentName: submission.studentName,
        similarity: combinedScore,
      });
      if (combinedScore > maxScore) maxScore = combinedScore;
    }
  });

  // Sort details by similarity descending
  details.sort((a, b) => b.similarity - a.similarity);

  return {
    plagiarismScore: maxScore,
    details: details.slice(0, 5), // Top 5 matches
  };
}

/**
 * Extract text from file (for .txt files read from disk)
 */
const fs = require('fs');
const path = require('path');

function extractTextFromFile(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.txt') {
      return fs.readFileSync(filePath, 'utf-8');
    }
    // For PDF/DOCX, return filename-based stub (full extraction needs pdf-parse/mammoth)
    // In production, integrate pdf-parse or mammoth here
    return path.basename(filePath, ext).replace(/[-_]/g, ' ');
  } catch (err) {
    return '';
  }
}

module.exports = { checkPlagiarism, extractTextFromFile, cosineSimilarity, tokenize };
