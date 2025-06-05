-- Drop existing tables and types if they exist
DROP TABLE IF EXISTS results CASCADE;
DROP TABLE IF EXISTS predictions CASCADE;
DROP TABLE IF EXISTS scraping_logs CASCADE;
DROP TABLE IF EXISTS lottery_results CASCADE;
DROP TABLE IF EXISTS lotteries CASCADE;
DROP TABLE IF EXISTS prediction_types CASCADE;
DROP TABLE IF EXISTS quiniela_predictions CASCADE;
DROP TABLE IF EXISTS points_pale_predictions CASCADE;
DROP TYPE IF EXISTS game_type;

-- Create enum for game types
CREATE TYPE game_type AS ENUM (
  'Quiniela Loteka',
  'Mega Chances',
  'Mega Chances Repartidera',
  'El Extra',
  'Toca 3',
  'Mega Lotto',
  'Quiniela Leidsa',
  'Pega 3',
  'Loto Pool',
  'Juega+ Pega+',
  'Gana Más',
  'Quiniela Nacional',
  'Billetes Jueves',
  'Billetes Domingo',
  'Quiniela La Primera',
  'Quinielita Real',
  'Pega 4 Real',
  'Quiniela Real',
  'Loto Real'
);

-- Create lotteries table
CREATE TABLE lotteries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  url_slug VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create prediction_types table
CREATE TABLE prediction_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create predictions table
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lottery_id UUID NOT NULL REFERENCES lotteries(id) ON DELETE CASCADE,
  prediction_type_id UUID NOT NULL REFERENCES prediction_types(id) ON DELETE CASCADE,
  numbers INTEGER[] NOT NULL,
  confidence DECIMAL NOT NULL,
  predicted_for_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lottery FOREIGN KEY (lottery_id) REFERENCES lotteries(id),
  CONSTRAINT fk_prediction_type FOREIGN KEY (prediction_type_id) REFERENCES prediction_types(id)
);

-- Create points_pale_predictions table
CREATE TABLE points_pale_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('punto', 'pale', 'tripleta')),
  numbers INTEGER[] NOT NULL,
  confidence DECIMAL(4,3) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_prediction FOREIGN KEY (prediction_id) REFERENCES predictions(id)
);

-- Create lottery_results table
CREATE TABLE lottery_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lottery_id UUID NOT NULL REFERENCES lotteries(id) ON DELETE CASCADE,
  draw_date DATE NOT NULL,
  draw_time TIME NOT NULL,
  game_type game_type NOT NULL,
  numbers INTEGER[] NOT NULL,
  subtitle TEXT,
  result_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(lottery_id, draw_date, draw_time, game_type),
  CONSTRAINT fk_lottery_result FOREIGN KEY (lottery_id) REFERENCES lotteries(id)
);

-- Create results table (for backward compatibility)
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lottery_id UUID NOT NULL REFERENCES lotteries(id) ON DELETE CASCADE,
  draw_date DATE NOT NULL,
  draw_time TIME NOT NULL,
  numbers INTEGER[] NOT NULL,
  subtitle TEXT,
  game_type TEXT,
  result_order INTEGER,
  error_log TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lottery_result_legacy FOREIGN KEY (lottery_id) REFERENCES lotteries(id)
);

-- Create scraping_logs table
CREATE TABLE scraping_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lottery_id UUID NOT NULL REFERENCES lotteries(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  message TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lottery_log FOREIGN KEY (lottery_id) REFERENCES lotteries(id)
);

-- Create indexes for faster queries
CREATE INDEX idx_lottery_results_lottery_date ON lottery_results(lottery_id, draw_date);
CREATE INDEX idx_lottery_results_game_type ON lottery_results(game_type);
CREATE INDEX idx_results_lottery_date ON results(lottery_id, draw_date);
CREATE INDEX idx_predictions_lottery_date ON predictions(lottery_id, predicted_for_date);
CREATE INDEX idx_predictions_type ON predictions(prediction_type_id);
CREATE INDEX idx_points_pale_prediction ON points_pale_predictions(prediction_id);
CREATE INDEX idx_scraping_logs_lottery_date ON scraping_logs(lottery_id, created_at);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lotteries_updated_at
  BEFORE UPDATE ON lotteries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lottery_results_updated_at
  BEFORE UPDATE ON lottery_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_results_updated_at
  BEFORE UPDATE ON results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_predictions_updated_at
  BEFORE UPDATE ON predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_points_pale_predictions_updated_at
  BEFORE UPDATE ON points_pale_predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial lottery data
INSERT INTO lotteries (name, url_slug) VALUES
  ('Loteka', 'loteka'),
  ('Leidsa', 'leidsa'),
  ('Nacional', 'loteria-nacional'),
  ('La Primera', 'la-primera'),
  ('Real', 'loto-real');

-- Insert initial prediction types
INSERT INTO prediction_types (name, description) VALUES
  ('punto', 'Un solo número'),
  ('pale', 'Dos números'),
  ('tripleta', 'Tres números');

-- Actualizar la tabla points_pale_predictions existente
ALTER TABLE points_pale_predictions 
  DROP CONSTRAINT IF EXISTS points_pale_predictions_type_check,
  ADD CONSTRAINT points_pale_predictions_type_check 
  CHECK (type IN ('punto', 'pale', 'tripleta')); 