-- Tabla para tipos de predicciones
CREATE TABLE prediction_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para quinielas
CREATE TABLE quiniela_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prediction_id UUID REFERENCES predictions(id) ON DELETE CASCADE,
    match_number INTEGER NOT NULL,
    prediction VARCHAR(1) NOT NULL CHECK (prediction IN ('1', 'X', '2')),
    confidence DECIMAL(4,3) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para puntos y pale
CREATE TABLE points_pale_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prediction_id UUID REFERENCES predictions(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('points', 'pale')),
    numbers INTEGER[] NOT NULL,
    confidence DECIMAL(4,3) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar tipos de predicciones básicos
INSERT INTO prediction_types (name, description) VALUES
    ('numbers', 'Predicción de números para loterías numéricas'),
    ('quiniela', 'Predicción de resultados de partidos'),
    ('points', 'Predicción de puntos para loterías específicas'),
    ('pale', 'Predicción de pale para loterías específicas');

-- Añadir columna de tipo a la tabla predictions
ALTER TABLE predictions ADD COLUMN prediction_type_id UUID REFERENCES prediction_types(id); 