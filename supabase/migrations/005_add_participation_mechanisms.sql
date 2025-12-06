-- Mechanizmy partycypacyjne zgodnie z zaleceniem UE z 12.12.2023
-- Ankiety, sondy, głosowania, propozycje zmian w procesie współtworzenia

-- ============================================================================
-- 1. ANKIETY I SONDY W KONSULTACJACH
-- ============================================================================

CREATE TYPE survey_question_type AS ENUM ('single_choice', 'multiple_choice', 'text', 'rating', 'yes_no');
CREATE TYPE survey_status AS ENUM ('draft', 'active', 'closed', 'archived');

-- Tabela główna ankiet/sond
CREATE TABLE consultation_surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status survey_status DEFAULT 'draft',
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_anonymous BOOLEAN DEFAULT false,
  max_responses INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pytania w ankietach
CREATE TABLE survey_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID NOT NULL REFERENCES consultation_surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type survey_question_type NOT NULL,
  is_required BOOLEAN DEFAULT false,
  order_index INT NOT NULL,
  options JSONB, -- Dla pytań wielokrotnego wyboru: ["Opcja A", "Opcja B", ...]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Odpowiedzi użytkowników
CREATE TABLE survey_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID NOT NULL REFERENCES consultation_surveys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL jeśli anonimowe
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Odpowiedzi na poszczególne pytania
CREATE TABLE survey_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id UUID NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  selected_options JSONB, -- Dla wielokrotnego wyboru: ["Opcja A", "Opcja C"]
  rating_value INT CHECK (rating_value >= 1 AND rating_value <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. GŁOSOWANIA NA PROPOZYCJE ZMIAN
-- ============================================================================

CREATE TYPE proposal_status AS ENUM ('draft', 'voting', 'accepted', 'rejected', 'implemented');
CREATE TYPE vote_type AS ENUM ('support', 'oppose', 'neutral');

-- Propozycje zmian zgłaszane przez obywateli
CREATE TABLE amendment_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  proposed_text TEXT,
  rationale TEXT, -- Uzasadnienie
  status proposal_status DEFAULT 'draft',
  voting_starts_at TIMESTAMPTZ,
  voting_ends_at TIMESTAMPTZ,
  vote_threshold INT DEFAULT 100, -- Minimalna liczba głosów za
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Głosy na propozycje
CREATE TABLE proposal_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES amendment_proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vote vote_type NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(proposal_id, user_id)
);

-- ============================================================================
-- 3. WARSZTATY ONLINE I SESJE COLLABORATIVE EDITING
-- ============================================================================

CREATE TYPE workshop_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- Warsztaty konsultacyjne
CREATE TABLE consultation_workshops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status workshop_status DEFAULT 'scheduled',
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 120,
  max_participants INT,
  meeting_url TEXT, -- Link do videokonferencji
  facilitator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Uczestnicy warsztatów
CREATE TABLE workshop_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workshop_id UUID NOT NULL REFERENCES consultation_workshops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  attended BOOLEAN DEFAULT false,
  UNIQUE(workshop_id, user_id)
);

-- Notatki ze współpracy (collaborative notes)
CREATE TABLE collaborative_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workshop_id UUID REFERENCES consultation_workshops(id) ON DELETE CASCADE,
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  last_edited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. REPOZYTORIUM DOBRYCH PRAKTYK
-- ============================================================================

CREATE TYPE practice_category AS ENUM ('consultation', 'participation', 'transparency', 'accessibility', 'communication');

-- Dobre praktyki z konsultacji
CREATE TABLE best_practices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category practice_category NOT NULL,
  bill_id UUID REFERENCES bills(id) ON DELETE SET NULL,
  ministry TEXT,
  success_metrics JSONB, -- {"participation_rate": 45, "satisfaction": 4.2}
  lessons_learned TEXT,
  submitted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEKSY
-- ============================================================================

CREATE INDEX idx_consultation_surveys_bill_id ON consultation_surveys(bill_id);
CREATE INDEX idx_consultation_surveys_status ON consultation_surveys(status);
CREATE INDEX idx_survey_questions_survey_id ON survey_questions(survey_id);
CREATE INDEX idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX idx_survey_responses_user_id ON survey_responses(user_id);
CREATE INDEX idx_survey_answers_response_id ON survey_answers(response_id);

CREATE INDEX idx_amendment_proposals_bill_id ON amendment_proposals(bill_id);
CREATE INDEX idx_amendment_proposals_status ON amendment_proposals(status);
CREATE INDEX idx_amendment_proposals_author_id ON amendment_proposals(author_id);
CREATE INDEX idx_proposal_votes_proposal_id ON proposal_votes(proposal_id);
CREATE INDEX idx_proposal_votes_user_id ON proposal_votes(user_id);

CREATE INDEX idx_consultation_workshops_bill_id ON consultation_workshops(bill_id);
CREATE INDEX idx_consultation_workshops_status ON consultation_workshops(status);
CREATE INDEX idx_consultation_workshops_scheduled_at ON consultation_workshops(scheduled_at);
CREATE INDEX idx_workshop_participants_workshop_id ON workshop_participants(workshop_id);
CREATE INDEX idx_workshop_participants_user_id ON workshop_participants(user_id);

CREATE INDEX idx_collaborative_notes_workshop_id ON collaborative_notes(workshop_id);
CREATE INDEX idx_collaborative_notes_bill_id ON collaborative_notes(bill_id);

CREATE INDEX idx_best_practices_category ON best_practices(category);
CREATE INDEX idx_best_practices_bill_id ON best_practices(bill_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Ankiety - wszyscy mogą czytać aktywne, tylko admini tworzą
ALTER TABLE consultation_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active surveys" ON consultation_surveys
  FOR SELECT USING (status IN ('active', 'closed'));

CREATE POLICY "Admins can manage surveys" ON consultation_surveys
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- Pytania ankiet - publiczny odczyt
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view questions" ON survey_questions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage questions" ON survey_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- Odpowiedzi - użytkownicy mogą dodawać, admini czytać
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit responses" ON survey_responses
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL
  );

CREATE POLICY "Users can view own responses" ON survey_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all responses" ON survey_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- Odpowiedzi na pytania
ALTER TABLE survey_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit answers" ON survey_answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM survey_responses
      WHERE survey_responses.id = response_id
      AND (survey_responses.user_id = auth.uid() OR survey_responses.user_id IS NULL)
    )
  );

CREATE POLICY "Users can view own answers" ON survey_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM survey_responses
      WHERE survey_responses.id = response_id
      AND survey_responses.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all answers" ON survey_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- Propozycje zmian - wszyscy czytają, zalogowani tworzą
ALTER TABLE amendment_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view proposals" ON amendment_proposals
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create proposals" ON amendment_proposals
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own proposals" ON amendment_proposals
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own proposals" ON amendment_proposals
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all proposals" ON amendment_proposals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- Głosy na propozycje
ALTER TABLE proposal_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view votes" ON proposal_votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON proposal_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vote" ON proposal_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vote" ON proposal_votes
  FOR DELETE USING (auth.uid() = user_id);

-- Warsztaty - publiczny odczyt, admin zarządza
ALTER TABLE consultation_workshops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view workshops" ON consultation_workshops
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage workshops" ON consultation_workshops
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- Uczestnicy warsztatów
ALTER TABLE workshop_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view participants count" ON workshop_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can register for workshops" ON workshop_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unregister from workshops" ON workshop_participants
  FOR DELETE USING (auth.uid() = user_id);

-- Notatki współpracy - uczestnicy mogą edytować
ALTER TABLE collaborative_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view notes" ON collaborative_notes
  FOR SELECT USING (true);

CREATE POLICY "Workshop participants can edit notes" ON collaborative_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workshop_participants
      WHERE workshop_participants.workshop_id = collaborative_notes.workshop_id
      AND workshop_participants.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- Dobre praktyki - wszyscy czytają, zalogowani dodają, admini weryfikują
ALTER TABLE best_practices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified practices" ON best_practices
  FOR SELECT USING (is_verified = true OR submitted_by = auth.uid());

CREATE POLICY "Authenticated users can submit practices" ON best_practices
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Admins can verify practices" ON best_practices
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- ============================================================================
-- TRIGGERY
-- ============================================================================

CREATE TRIGGER update_consultation_surveys_updated_at
  BEFORE UPDATE ON consultation_surveys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_amendment_proposals_updated_at
  BEFORE UPDATE ON amendment_proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultation_workshops_updated_at
  BEFORE UPDATE ON consultation_workshops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaborative_notes_updated_at
  BEFORE UPDATE ON collaborative_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_best_practices_updated_at
  BEFORE UPDATE ON best_practices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
