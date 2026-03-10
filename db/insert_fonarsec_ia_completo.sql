-- Insertar y enriquecer ANR FONARSEC IA
INSERT INTO instrumento (nombre, tipo, organismo, sectores_elegibles, status, url,
    monto_maximo, cobertura_porcentaje, plazo_ejecucion, contrapartida,
    gastos_elegibles, descripcion_extendida)
VALUES (
    'ANR FONARSEC - Economia del Conocimiento con IA',
    'subsidio',
    'Agencia I+D+i - FONARSEC',
    'agroindustria, energia, mineria, salud',
    'activo',
    'https://www.agencia.mincyt.gob.ar',
    'USD 500.000',
    80,
    '18 meses (extendible a 24)',
    '20% puede incluir aportes en especie',
    'Recursos humanos, consultoria, bienes de capital, licencias de software',
    'ANR para conformar Consorcio Tecnologico-Productivo (CTP) para desarrollo e implementacion de IA y Ciencia de Datos. Requiere integrar capacidad tecnologica + capacidad productiva + gestion. Ventanilla abierta.'
);

SELECT id, nombre, monto_maximo, cobertura_porcentaje FROM instrumento ORDER BY id;
