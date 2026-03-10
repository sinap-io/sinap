UPDATE instrumento SET
    monto_maximo = 'USD 500.000',
    cobertura_porcentaje = 80,
    plazo_ejecucion = '18 meses (extendible a 24)',
    contrapartida = '20% (puede incluir aportes en especie)',
    gastos_elegibles = 'Recursos humanos, consultoría, bienes de capital, licencias de software',
    descripcion_extendida = 'ANR para conformar Consorcio Tecnológico-Productivo (CTP) para desarrollo e implementación de IA y Ciencia de Datos. Requiere integrar capacidad tecnológica + capacidad productiva + gestión. Ventanilla abierta.'
WHERE nombre = 'ANR FONARSEC - Economía del Conocimiento con IA';

SELECT nombre, monto_maximo, cobertura_porcentaje, plazo_ejecucion FROM instrumento WHERE nombre LIKE '%FONARSEC%IA%';
