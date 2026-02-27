// This file is intentionally left as a re-export.
// The canonical FeedbackModal lives at:
//   frontend/src/components/views/FeedbackModal.jsx
//
// Do NOT import from this file directly — this path is outside the Vite
// build context and will not be bundled.  It is kept here only to avoid
// breaking any external tooling that references the root path; all
// application code should import from the path above.

export { default } from './frontend/src/components/views/FeedbackModal.jsx';
