const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  motDePasse: { type: String, required: true },
  telephone: String,
  adresse: String,
  
  role: { type: String, enum: ['posteur', 'chercheur', 'admin'], required: false },
  bio: String,
  competences: Object,
  photoProfil: String,
  dateInscription: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
