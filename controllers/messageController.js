const Message = require('../models/Message');
const Job = require('../models/Job'); // Pour peupler l'offre 
const User = require('../models/User');
const conversationId = require('../models/Conversation'); // modèle Conversation
let io; // défini dans le fichier principal (server.js)
exports.setSocketIo = (socketIoInstance) => {
  io = socketIoInstance;
};
const mongoose = require('mongoose'); // Assurez-vous d'importer mongoose pour ObjectId
const Conversation = require('../models/Conversation');
const Candidature = require('../models/Candidature'); // pour vérifier la candidature existante


exports.createMessage = async (req, res) => {
  try {
    const { jobId, senderId, receiverId, contenu , candidatureId} = req.body;
console.log(" Données reçues dans req.body :", req.body);
    // Vérification des données reçues

    // Étape 1 : déterminer le candidatureId à utiliser
    let finalCandidatureId = candidatureId;

    if (!finalCandidatureId) {
      // Si le front ne l'a pas envoyé, on cherche automatiquement
      const candidature = await Candidature.findOne({ jobId, chercheurId: senderId });
      if (candidature) {
        finalCandidatureId = candidature._id;
        console.log("Candidature trouvée automatiquement :", finalCandidatureId);
      } else {
        console.log("Aucune candidature trouvée pour ce job et ce chercheur.");
      }
    } else {
      console.log("CandidatureId fourni par le front :", finalCandidatureId);
    }



    // 📦 Vérifie si une conversation existe déjà
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
      jobId: jobId // Assurez-vous que la conversation est liée à l'offre
    });

    if (!conversation) {
      conversation = new Conversation({
        jobId,
        participants: [senderId, receiverId],
        candidatureId: finalCandidatureId // Associe la candidature si trouvée
      });
      await conversation.save();
      console.log("Nouvelle conversation créée:", conversation._id);
    } else if (!conversation._id) {
      conversation._id = new mongoose.Types.ObjectId();
      await conversation.save();
      console.log("ID attribué à la conversation existante:", conversation._id);
    } else {
      console.log("Conversation existante trouvée:", conversation._id);
    }

    // 📨 Créer le message avec ou sans candidature
    const message = new Message({
      jobId,
      conversationId: conversation._id,
      senderId,
      receiverId,
      contenu,
      dateEnvoi: new Date(),
      candidatureId: candidatureId || finalCandidatureId // Utilise le candidatureId trouvé ou celui envoyé
    });

    await message.save();

    // 🔊 Émettre le message à tous les clients de la conversation
    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'nom prenom email photoProfil')
      .populate('receiverId', 'nom prenom email photoProfil')
      .populate('jobId', 'titre');

    // Émettre le message peuplé à tous les clients de la conversation
// côté serveur
io.to(conversation._id.toString()).emit("receiveMessage", populatedMessage);
      console.log("Message envoyé et peuplé :", populatedMessage);

    res.status(201).json(populatedMessage);

  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    res.status(500).json({ message: "Erreur lors de l'envoi du message." });
  }
};


// Récupérer tous les messages
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('senderId', 'nom prenom email photoProfil')
      .populate('receiverId', 'nom prenom email photoProfil')
      .populate('jobId', 'titre')
      .populate('conversationId');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer un message par ID
exports.getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('senderId', 'nom prenom email photoProfil')
      .populate('receiverId', 'nom prenom email photoProfil')
      .populate('jobId', 'titre')
      .populate('conversationId');
    if (!message) return res.status(404).json({ error: 'Message non trouvé' });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mettre à jour un message
exports.updateMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('senderId', 'nom prenom email photoProfil')
      .populate('receiverId', 'nom prenom email photoProfil')
      .populate('jobId', 'titre');
    if (!message) return res.status(404).json({ error: 'Message non trouvé' });
    res.json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Supprimer un message
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id)
      .populate('senderId', 'nom prenom email photoProfil')
      .populate('receiverId', 'nom prenom email photoProfil')
      .populate('jobId', 'titre');
    if (!message) return res.status(404).json({ error: 'Message non trouvé' });
    res.json({ message: 'Message supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer les messages liés à un job
exports.getMessagesByJob = async (req, res) => {
  try {
    const messages = await Message.find({ jobId: req.params.jobId })
      .populate('senderId', 'nom prenom email photoProfil')
      .populate('receiverId', 'nom prenom email photoProfil')
      .populate('jobId', 'titre')
      .populate('conversationId');

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer tous les messages entre deux utilisateurs (et lier une offre si possible)
exports.getConversation = async (req, res) => {
  const { userId, otherUserId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    })
      .populate('senderId', 'nom prenom email photoProfil')
      .populate('receiverId', 'nom prenom email photoProfil')
      .populate('jobId', 'titre')
      .populate('conversationId')
      .sort({ dateEnvoi: 1 })
      .lean();

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
