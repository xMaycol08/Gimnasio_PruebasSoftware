-- Modelo físico (PostgreSQL) - Control de Membresías de Gimnasio

CREATE TABLE cliente (
    id_cliente    SERIAL PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    cedula        VARCHAR(10)  NOT NULL UNIQUE CHECK (char_length(cedula) = 10),
    telefono      VARCHAR(15),
    email         VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE membresia (
    id_membresia  SERIAL PRIMARY KEY,
    nombre        VARCHAR(30)  NOT NULL UNIQUE,
    precio        NUMERIC(8,2) NOT NULL CHECK (precio > 0),
    duracion_dias INTEGER      NOT NULL CHECK (duracion_dias > 0)
);

CREATE TABLE pago (
    id_pago           SERIAL PRIMARY KEY,
    id_cliente        INTEGER      NOT NULL REFERENCES cliente (id_cliente)     ON DELETE RESTRICT,
    id_membresia      INTEGER      NOT NULL REFERENCES membresia (id_membresia) ON DELETE RESTRICT,
    fecha_pago        DATE         NOT NULL,
    fecha_vencimiento DATE         NOT NULL,
    monto             NUMERIC(8,2) NOT NULL CHECK (monto > 0),
    estado            VARCHAR(10)  NOT NULL CHECK (estado IN ('PAGADO', 'PENDIENTE', 'ANULADO')),
    CHECK (fecha_vencimiento >= fecha_pago)
);

CREATE TABLE acceso (
    id_acceso           SERIAL PRIMARY KEY,
    id_cliente          INTEGER   NOT NULL REFERENCES cliente (id_cliente) ON DELETE RESTRICT,
    fecha_hora_entrada  TIMESTAMP NOT NULL,
    fecha_hora_salida   TIMESTAMP,
    CHECK (fecha_hora_salida IS NULL OR fecha_hora_salida >= fecha_hora_entrada)
);

CREATE INDEX idx_pago_cliente_vencimiento ON pago (id_cliente, fecha_vencimiento);
CREATE INDEX idx_acceso_cliente_entrada   ON acceso (id_cliente, fecha_hora_entrada);
