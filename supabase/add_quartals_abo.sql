-- Preis Personal Training 1:1 aktualisieren
UPDATE services SET price = 75.00 WHERE title LIKE '%Personal Training 1:1%';

-- Neues Quartals-Abo einfügen
INSERT INTO services (title, description, price, duration_minutes, features, is_active, sort_order)
VALUES (
  'Quartals-Abo – Personal Training',
  'Dein regelmässiges Training zum Vorteilspreis. 4 Sessions à 60 Minuten pro Monat, frei wählbar.',
  600.00,
  60,
  ARRAY[
    '4 Sessions pro Monat (frei wählbar)',
    'Persönliche 1:1 Betreuung',
    'Trainingsplan inklusive',
    'Ernährungstipps inklusive',
    'Fortschritts-Tracking',
    'Priorität bei Terminvergabe',
    'CHF 300 Ersparnis gegenüber Einzelbuchungen'
  ],
  true,
  3
);
