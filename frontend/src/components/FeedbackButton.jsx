import React, { useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { THEME } from '../utils/theme.jsx';
import FeedbackModal from './FeedbackModal.jsx'; // adjust path if needed

/**
 * Drop this button into any section's page header.
 *
 * Usage:
 *   <FeedbackButton section="performance" />
 *   <FeedbackButton section="alerts" />
 *   <FeedbackButton />   ← auto-detects from URL
 *
 * The `section` prop is optional — if omitted, FeedbackModal will
 * auto-detect the section from window.location.pathname.
 */
const FeedbackButton = ({ section }) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                title="Give feedback on this section"
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 8,
                    border: `1px solid ${THEME.grid}`,
                    background: 'transparent',
                    color: THEME.textDim,
                    fontSize: 12, fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.borderColor = THEME.primary;
                    e.currentTarget.style.color = THEME.primary;
                    e.currentTarget.style.background = `${THEME.primary}10`;
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.borderColor = THEME.grid;
                    e.currentTarget.style.color = THEME.textDim;
                    e.currentTarget.style.background = 'transparent';
                }}
            >
                <MessageSquarePlus size={14} />
                Feedback
            </button>

            <FeedbackModal
                isOpen={open}
                onClose={() => setOpen(false)}
                initialSection={section}
            />
        </>
    );
};

export default FeedbackButton;