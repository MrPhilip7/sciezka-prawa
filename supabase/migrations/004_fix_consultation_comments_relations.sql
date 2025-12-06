-- Naprawa relacji consultation_comments - zmiana z auth.users na profiles
-- Problem: "Could not find a relationship between 'consultation_comments' and 'user_id'"

-- Usuń starą tabelę jeśli istnieje
DROP TABLE IF EXISTS consultation_comment_reactions CASCADE;
DROP TABLE IF EXISTS consultation_comments CASCADE;

-- Ponowne utworzenie z poprawną relacją do profiles
CREATE TABLE consultation_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES consultation_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeksy
CREATE INDEX idx_consultation_comments_bill_id ON consultation_comments(bill_id);
CREATE INDEX idx_consultation_comments_user_id ON consultation_comments(user_id);
CREATE INDEX idx_consultation_comments_parent ON consultation_comments(parent_comment_id);
CREATE INDEX idx_consultation_comments_created ON consultation_comments(created_at DESC);

-- RLS
ALTER TABLE consultation_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view consultation comments" ON consultation_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON consultation_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON consultation_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON consultation_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger
CREATE TRIGGER update_consultation_comments_updated_at
  BEFORE UPDATE ON consultation_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Tabela reakcji
CREATE TABLE consultation_comment_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES consultation_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'support', 'insightful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

CREATE INDEX idx_comment_reactions_comment_id ON consultation_comment_reactions(comment_id);
CREATE INDEX idx_comment_reactions_user_id ON consultation_comment_reactions(user_id);

ALTER TABLE consultation_comment_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions" ON consultation_comment_reactions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add reactions" ON consultation_comment_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" ON consultation_comment_reactions
  FOR DELETE USING (auth.uid() = user_id);
