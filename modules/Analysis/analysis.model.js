const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const elasticsearchService = require('./../../config/elasticsearch');

const analysisSchema = new mongoose.Schema({
  submission_id: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'Submission', 
     required: true 
    },
  scan_date: { 
    type: Date, 
    default: Date.now 
  },
  analysis_type: { 
    type: String, 
    enum: ['static', 'dynamic'], 
    required: true 
  },
  results: { 
    type: Object, 
    required: true
   },
  threat_level: { 
    type: String,
     enum: ['low', 'medium', 'high'],
      required: true 
    },
  risk_score: { 
    type: Number, 
    default: 0 
  },
  detected_threats: [
    { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Threat' 
  }]
});

analysisSchema.plugin(mongoosePaginate);

// 🔹 Hook pour indexer dans ElasticSearch après insertion ou mise à jour
analysisSchema.post("save", async function (doc) {
  try {
    await elasticsearchService.indexDocument("analyses", doc._id.toString(), doc.toObject());
    console.log(` Analyse ${doc._id} indexée dans ElasticSearch.`);
  } catch (error) {
    console.error(" Erreur d'indexation ElasticSearch :", error.message);
  }
});

// 🔹 Hook pour supprimer un document de ElasticSearch après suppression
analysisSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    try {
      await elasticsearchService.deleteDocument("analyses", doc._id.toString());
      console.log(`Analyse ${doc._id} supprimée de ElasticSearch.`);
    } catch (error) {
      console.error(" Erreur de suppression ElasticSearch :", error.message);
    }
  }
});

module.exports = mongoose.model('Analysis', analysisSchema);