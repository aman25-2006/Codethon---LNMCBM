-- ==============================================================================
-- PHASE J: MONITORING ENHANCEMENTS & AUDIT EVENT TYPES
-- Lalit Narayan Mishra College of Business Management, Muzaffarpur
-- ==============================================================================

-- Expand event_type CHECK constraint on monitoring_events table to support
-- warning acknowledgments and administrative technical exceptions.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'monitoring_events_event_type_check'
    ) THEN
        ALTER TABLE monitoring_events DROP CONSTRAINT monitoring_events_event_type_check;
    END IF;
END $$;

ALTER TABLE monitoring_events ADD CONSTRAINT monitoring_events_event_type_check CHECK (
    event_type IN (
        'fullscreen_exit',
        'window_blur',
        'tab_switch',
        'devtools_open',
        'warning_threshold_exceeded',
        'auto_terminated',
        'warning_acknowledged',
        'technical_exception_granted'
    )
);

-- Index for speedy invigilator timeline retrieval
CREATE INDEX IF NOT EXISTS idx_monitoring_events_session_created 
    ON monitoring_events (session_id, created_at ASC);

