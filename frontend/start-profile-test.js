// start-profile-test.js
const express = require('express');
const path = require('path');

const app = express();
const port = 3001;

// Configuration des types MIME pour les modules ES6
app.use((req, res, next) => {
    if (req.url.endsWith('.js')) {
        res.type('application/javascript');
    }
    next();
});

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname), {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.set('Content-Type', 'application/javascript');
        }
    }
}));

// Route pour gérer les routes React
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-profile.html'));
});

app.listen(port, () => {
    console.log(`Serveur de test démarré sur http://localhost:${port}`);
    console.log('Appuyez sur Ctrl+C pour arrêter');
});
