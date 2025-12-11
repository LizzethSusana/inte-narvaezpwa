-- Script SQL para agregar la columna last_modified_by a la tabla room
-- Este script es OPCIONAL, Spring Boot lo hará automáticamente con ddl-auto=update

-- Agregar columna para tracking del usuario que modificó
ALTER TABLE room 
ADD COLUMN last_modified_by BIGINT NULL,
ADD CONSTRAINT fk_room_last_modified_by 
    FOREIGN KEY (last_modified_by) 
    REFERENCES users(id) 
    ON DELETE SET NULL;

-- Índice para mejorar rendimiento en consultas
CREATE INDEX idx_room_last_modified_by ON room(last_modified_by);

-- Verificar que la columna se agregó correctamente
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'hotel_cleaning' 
  AND TABLE_NAME = 'room' 
  AND COLUMN_NAME = 'last_modified_by';
