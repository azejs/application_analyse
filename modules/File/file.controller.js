const File = require('../models/file.model');
const mongoose = require('mongoose');
const GridFSBucket = require('mongodb').GridFSBucket;
const Analysis = require('../models/analysis.model');
const capeService = require('../services/capeService');
const rabbitMQ = require('../services/rabbitMQService');
const elasticsearchService = require('../services/elasticsearchService');

const conn = mongoose.connection;
let gfs;
conn.once('open', () => {
    gfs = new GridFSBucket(conn.db, { bucketName: 'uploads' });
});

exports.uploadFile = async (req, res) => {
    try {
        const { filename, size, mime_type, submitted_by } = req.body;
        const file = await File.create({ filename, size, mime_type, submitted_by, status: 'pending' });
        
        // 🔹 Indexation dans ElasticSearch
        await elasticsearchService.indexDocument("files", file._id.toString(), file.toObject());
        
        res.status(201).json({ message: 'Fichier uploadé avec succès', file });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getFileById = async (req, res) => {
    try {
        const { id } = req.params;
        const file = await File.findById(id).populate('analysis_id');
        if (!file) return res.status(404).json({ message: 'Fichier non trouvé' });
        res.status(200).json(file);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.analyzeFile = async (req, res) => {
    try {
        const { id } = req.params;
        const file = await File.findById(id);
        if (!file) return res.status(404).json({ message: 'Fichier non trouvé' });

        const analysisResult = await capeService.analyzeFile(file.filename);
        const analysis = await Analysis.create({
            submission_id: id,
            analysis_type: 'dynamic',
            results: analysisResult,
            threat_level: analysisResult.threat_level || 'medium',
            risk_score: analysisResult.risk_score || 50,
        });

        file.status = 'analyzed';
        file.analysis_id = analysis._id;
        await file.save();

        await rabbitMQ.sendMessage('analysis_queue', { fileId: file._id, analysisId: analysis._id });
        
        // 🔹 Mise à jour de l'indexation ElasticSearch
        await elasticsearchService.indexDocument("files", file._id.toString(), file.toObject());

        res.status(200).json({ message: 'Analyse effectuée', analysis });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
