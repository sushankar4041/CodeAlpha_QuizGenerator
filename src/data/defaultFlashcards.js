/**
 * Default Flashcards Dataset
 * Initial sample collection for Quiz Generator
 * Categories: JavaScript, React, Data Structures, DBMS
 */

export const defaultFlashcards = [
  {
    id: 'fc-1',
    question: 'What is Closure in JavaScript?',
    answer: 'A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment). In JavaScript, closures give inner functions access to an outer function\'s scope even after the outer function has finished executing.',
    category: 'JavaScript',
    difficulty: 'Medium'
  },
  {
    id: 'fc-2',
    question: 'What is the Virtual DOM in React and why is it used?',
    answer: 'The Virtual DOM (VDOM) is a lightweight in-memory representation of the real DOM. React uses it to perform efficient updates by diffing the virtual tree against previous states and patching only the changed nodes in the real DOM (Reconciliation).',
    category: 'React',
    difficulty: 'Easy'
  },
  {
    id: 'fc-3',
    question: 'Explain the difference between SQL Primary Key and Foreign Key.',
    answer: 'A Primary Key uniquely identifies each record in a database table and cannot contain NULL values. A Foreign Key is a field in one table that references the Primary Key of another table, enforcing referential integrity between related entities.',
    category: 'DBMS',
    difficulty: 'Easy'
  },
  {
    id: 'fc-4',
    question: 'What is the time complexity of searching an element in a Binary Search Tree (BST)?',
    answer: 'The average time complexity is O(log n) for a balanced BST. However, in the worst-case scenario (unbalanced/skewed tree), it degrades to O(n).',
    category: 'Data Structures',
    difficulty: 'Medium'
  },
  {
    id: 'fc-5',
    question: 'What are React Hooks and what rule must be followed when using them?',
    answer: 'React Hooks are functions (e.g., useState, useEffect) that let functional components use state and lifecycle features. Main rule: Only call Hooks at the top level of a component — never inside loops, conditions, or nested functions.',
    category: 'React',
    difficulty: 'Easy'
  },
  {
    id: 'fc-6',
    question: 'What is Event Delegation in JavaScript?',
    answer: 'Event Delegation is a pattern where a single event listener is attached to a parent container instead of multiple listeners on individual child elements. It leverages Event Bubbling to handle events efficiently and support dynamic element addition.',
    category: 'JavaScript',
    difficulty: 'Hard'
  },
  {
    id: 'fc-7',
    question: 'What is ACID in Database Management Systems?',
    answer: 'ACID stands for Atomicity (all or nothing), Consistency (valid state transitions), Isolation (independent concurrent transactions), and Durability (persisted committed transactions). It guarantees database transaction reliability.',
    category: 'DBMS',
    difficulty: 'Hard'
  },
  {
    id: 'fc-8',
    question: 'What is the difference between Stack and Queue data structures?',
    answer: 'A Stack follows LIFO (Last-In, First-Out) where elements are added and removed from the top (push/pop). A Queue follows FIFO (First-In, First-Out) where elements are added at the rear and removed from the front (enqueue/dequeue).',
    category: 'Data Structures',
    difficulty: 'Easy'
  }
];

export const sampleCategories = [
  { id: 'cat-all', name: 'All Categories', count: 8, icon: '📚' },
  { id: 'cat-js', name: 'JavaScript', count: 2, icon: '🟨' },
  { id: 'cat-react', name: 'React', count: 2, icon: '⚛️' },
  { id: 'cat-ds', name: 'Data Structures', count: 2, icon: '🌲' },
  { id: 'cat-dbms', name: 'DBMS', count: 2, icon: '🗄️' }
];
