const Candidature = require('../models/Candidature');
const Job = require('../models/Job'); // Pour vérifier le quota

// Créer une candidature
exports.createCandidature = async (req, res) => {
  try {
    const { chercheurId, jobId, message } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: "Offre introuvable" });

    const existing = await Candidature.findOne({ chercheurId, jobId });
    if (existing) return res.status(400).json({ error: "Vous avez déjà candidaté à cette offre" });

    const newCandidature = new Candidature({
      chercheurId,
      jobId,
      message,
      statut: "en_attente" // Par défaut
    });

    await newCandidature.save();

    res.status(201).json(newCandidature);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur lors de la candidature" });
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
// Mettre à jour une candidature (statut/message) avec logique de quota et statut job
exports.updateCandidature = async (req, res) => {
  try {
    const { statut } = req.body;
    const candidature = await Candidature.findById(req.params.id);

    if (!candidature) return res.status(404).json({ error: 'Candidature non trouvée' });

    // Mettre à jour les champs
    candidature.statut = statut || candidature.statut;
    if (req.body.message) candidature.message = req.body.message;
    await candidature.save();

    const job = await Job.findById(candidature.jobId);
    if (!job) return res.status(404).json({ error: 'Job lié non trouvé' });

    // ✅ Cas : on accepte une candidature => statut job = "en_attente"
    if (statut === "acceptee") {
      job.statut = "en_attente";
      await job.save();
    }

    // ✅ Vérifier combien de candidatures ACCEPTÉES existent
    const acceptedCount = await Candidature.countDocuments({
      jobId: job._id,
      statut: "acceptee"
    });

    // ✅ Si quota atteint => job = en_cours
    if (acceptedCount >= job.quota && job.statut !== "en_cours") {
      job.statut = "en_cours";
      await job.save();
    }

    // ✅ Si quota NON atteint mais il est en "en_cours" => le remettre à "en_attente"
    if (acceptedCount < job.quota && job.statut === "en_cours") {
      job.statut = "en_attente";
      await job.save();
    }

    const updated = await Candidature.findById(candidature._id)
      .populate('chercheurId', 'nom prenom email photoProfil')
      .populate('jobId', 'titre');

    res.json(updated);
  } catch (err) {
    console.error(err);
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
// Vérifier si un utilisateur a déjà candidaté à une offre
exports.checkIfCandidated = async (req, res) => {
  try {
    const { jobId, chercheurId } = req.params;

    if (!jobId || !chercheurId) {
      return res.status(400).json({ error: "Paramètres manquants" });
    }

    const exists = await Candidature.exists({ jobId, chercheurId });
    res.json({ exists: !!exists });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//verifier si le quota est atteint pour un job
exports.checkQuota = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({ error: "Job ID manquant" });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job non trouvé" });
    }

    // ✅ Compter le nombre de candidatures pour ce job
    const candidaturesCount = await Candidature.countDocuments({ jobId });

    // ✅ Calcul du quota restant
    const quotaRestant = Math.max(0, job.quota - candidaturesCount);
    const quotaReached = candidaturesCount >= job.quota;

    // ✅ Réponse complète
    res.json({ quotaReached, quotaRestant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
