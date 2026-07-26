ALTER TABLE membros
ADD COLUMN IF NOT EXISTS membership_card_expires_at DATE;
