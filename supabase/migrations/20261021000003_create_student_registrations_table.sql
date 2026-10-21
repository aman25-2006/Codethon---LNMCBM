-- ==============================================================================
-- LALIT NARAYAN MISHRA COLLEGE OF BUSINESS MANAGEMENT (LNMCBM)
-- CODETHON 2026: CANDIDATE SELF-REGISTRATION & ID VERIFICATION SCHEMA
-- ==============================================================================

CREATE TABLE IF NOT EXISTS student_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  email TEXT NOT NULL,
  department TEXT NOT NULL,
  semester TEXT NOT NULL,
  mobile TEXT NOT NULL,
  id_card_data TEXT NOT NULL,
  id_card_mime TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_registrations_status ON student_registrations(status);
CREATE INDEX IF NOT EXISTS idx_student_registrations_roll ON student_registrations(roll_number);
CREATE INDEX IF NOT EXISTS idx_student_registrations_email ON student_registrations(email);

