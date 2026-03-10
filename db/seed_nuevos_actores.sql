-- Nuevos actores del Catálogo del Clúster de Biotecnología de Córdoba
-- 19 actores: 10 empresas, 7 startups, 2 universidades
-- Ejecutar con: \i seed_nuevos_actores.sql

INSERT INTO actor (nombre, tipo, subtipo, mercado, website) VALUES
-- Empresas
('Bio4',           'empresa',    'agroindustrial',   'nacional',       'https://www.bio4.com.ar/'),
('Biogen',         'empresa',    'biotecnologia_reproductiva', 'nacional', 'https://iracbiogen.com/'),
('Biofeed Tech',   'empresa',    'probioticos',      'nacional',       'http://biofeedtech.com.ar/'),
('CAISAL',         'empresa',    'dispositivos_medicos', 'nacional',   'http://www.caisal.com/'),
('Hospital Privado Universitario de Córdoba', 'empresa', 'salud', 'regional', 'https://hospitalprivado.com.ar/'),
('InBiomed',       'empresa',    'biomateriales',    'nacional',       'https://inbiomedsa.com/'),
('Leistung',       'empresa',    'dispositivos_medicos', 'internacional', 'https://leistungargentina.com.ar/'),
('Porta Hnos.',    'empresa',    'agroindustrial',   'nacional',       'https://portahnos.com.ar/'),
('Summabio',       'empresa',    'agrifoodtech',     'nacional',       'https://summabio.com.ar/'),
('Buenas Maltas',  'empresa',    'fermentos',        'regional',       'https://buenasmaltas.com.ar/'),

-- Startups
('Zure Embryotech','startup',    'embriologia',      'nacional',       'https://ar.linkedin.com/company/zure-embryotech'),
('Life Si',        'startup',    'ingenieria_tejidos','nacional',      'https://lifesi.technology/'),
('NovoSens',       'startup',    'biosensores',      'nacional',       'https://ar.linkedin.com/company/novosens'),
('Nanotransfer',   'startup',    'nanoparticulas',   'nacional',       'https://nanotransfer.bio/'),
('Beef Up',        'startup',    'cultivos_celulares','nacional',      NULL),
('Embryoxite',     'startup',    'diagnostico_ia',   'nacional',       'https://embryoxite.life/'),
('Calfix',         'startup',    'bioingenieria_materiales', 'nacional', 'https://calfix.bio/'),

-- Universidades
('Universidad Nacional de Río Cuarto (UNRC)', 'universidad', 'publica', 'regional', 'https://www.unrc.edu.ar/'),
('Universidad Católica de Córdoba (UCC)',     'universidad', 'privada', 'regional', 'https://ucc.edu.ar/');

-- Verificar resultado
SELECT id, nombre, tipo FROM actor ORDER BY tipo, nombre;
