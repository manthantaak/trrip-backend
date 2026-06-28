const Document = require('../models/Document');
const Itinerary = require('../models/Itinerary');
const { generateItineraryFromText, createShareToken } = require('../services/geminiService');

exports.generateItinerary = async (req, res, next) => {
  try {
    const { documentIds } = req.body;

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({ message: 'At least one document ID is required' });
    }

    const documents = await Document.find({ _id: { $in: documentIds }, userId: req.user._id });
    if (documents.length !== documentIds.length) {
      return res.status(404).json({ message: 'One or more documents were not found' });
    }

    const combinedText = documents.map((doc) => doc.extractedText).join('\n\n');
    if (!combinedText.trim()) {
      return res.status(400).json({ message: 'No text available to generate itinerary' });
    }

    const generatedItinerary = await generateItineraryFromText(combinedText);

    const itinerary = await Itinerary.create({
      userId: req.user._id,
      title: generatedItinerary.title,
      destination: generatedItinerary.destination,
      startDate: generatedItinerary.startDate,
      endDate: generatedItinerary.endDate,
      summary: generatedItinerary.summary,
      days: generatedItinerary.days,
      tips: generatedItinerary.tips,
      sourceDocuments: documents.map((doc) => ({
        documentType: doc.documentType,
        originalName: doc.originalName,
      })),
      shareToken: createShareToken(),
    });

    res.status(201).json(itinerary);
  } catch (error) {
    next(error);
  }
};

exports.getAllItineraries = async (req, res, next) => {
  try {
    const itineraries = await Itinerary.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(itineraries);
  } catch (error) {
    next(error);
  }
};

exports.getItineraryById = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOne({ _id: req.params.id, userId: req.user._id });
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    res.status(200).json(itinerary);
  } catch (error) {
    next(error);
  }
};

exports.deleteItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    res.status(200).json({ message: 'Itinerary deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getSharedItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOne({ shareToken: req.params.token });
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    res.status(200).json(itinerary);
  } catch (error) {
    next(error);
  }
};
