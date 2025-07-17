const Candidature = require('../models/Candidature');

// Créer une candidature
exports.createCandidature = async (req, res) => {
  try {
    const { chercheurId, jobId, message } = req.body;
    const candidature = await Candidature.create({ chercheurId, jobId, message });
    res.status(201).json(candidature);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Récupérer toutes les candidatures
exports.getAllCandidatures = async (req, res) => {
  try {
    const candidatures = await Candidature.find()
      .populate('chercheurId', 'nom prenom email photoProfil')
      .populate('jobId', 'titre');
    res.json(candidatures);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer une candidature par ID
exports.getCandidatureById = async (req, res) => {
  try {
    const candidature = await Candidature.findById(req.params.id)
      .populate('chercheurId', 'nom prenom email photoProfil')
      .populate('jobId', 'titre');
    if (!candidature) return res.status(404).json({ error: 'Candidature non trouvée' });
    res.json(candidature);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mettre à jour une candidature (statut/message)
exports.updateCandidature = async (req, res) => {
  try {
    const candidature = await Candidature.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate('chercheurId', 'nom prenom email photoProfil')
      .populate('jobId', 'titre');
    if (!candidature) return res.status(404).json({ error: 'Candidature non trouvée' });
    res.json(candidature);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Supprimer une candidature
exports.deleteCandidature = async (req, res) => {
  try {
    const candidature = await Candidature.findByIdAndDelete(req.params.id);
    if (!candidature) return res.status(404).json({ error: 'Candidature non trouvée' });
    res.json({ message: 'Candidature supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Vérifier si un chercheur a déjà candidaté à un job
exports.checkIfCandidated = async (req, res) => {
  try {
    const { chercheurId, jobId } = req.query;
    if (!chercheurId || !jobId) {
      return res.status(400).json({ error: "Paramètres manquants" });
    }

    const exists = await Candidature.exists({ chercheurId, jobId });
    res.json({ exists: !!exists });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};