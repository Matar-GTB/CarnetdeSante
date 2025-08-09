UPDATE utilisateurs 
SET mot_de_passe = '$2b$12$MObCvlFGXOwJIPIauZDOl.9p4/qZkMZZb7i4XXMheB7agEMordoie' 
WHERE email = 'ouedbricerp24@gmail.com';

SELECT email, LENGTH(mot_de_passe) as longueur, SUBSTRING(mot_de_passe, 1, 15) as debut 
FROM utilisateurs 
WHERE email = 'ouedbricerp24@gmail.com';
