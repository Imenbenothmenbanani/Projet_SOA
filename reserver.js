const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002; // le même que dans ton code HTML

app.use(cors());
app.use(express.json());

app.post('/reservation', (req, res) => {
  console.log(req.body);
  res.json({ message: 'Réservation bien reçue', data: req.body });


  // Tu peux ici ajouter l’enregistrement dans une base de données si besoin

  res.json({
    message: 'Réservation enregistrée avec succès !',
    reservation: req.body
  });
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
