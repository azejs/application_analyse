const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const elasticsearchService = require('../services/elasticsearchService');

const threatSchema = new mongoose.Schema({
  type: { type: String, required: true },
  source: { type: String, required: true },
  threat_level: { type: String, enum: ['low', 'medium', 'high'], required: true },
  risk_score: { type: Number, default: 0 },
  
  hashes: { type: [String], index: true },
  domains: { type: [String], index: true },
  ips: { type: [String], index: true },
  urls: { type: [String], index: true },

  last_seen: { type: Date, default: Date.now }
});

threatSchema.plugin(mongoosePaginate);

// 🔹 Hook pour indexer dans ElasticSearch après insertion
threatSchema.post("save", async function (doc) {
  try {
    await elasticsearchService.indexDocument("threats", doc._id.toString(), doc.toObject());
    console.log(` Menace ${doc._id} indexée dans ElasticSearch.`);
  } catch (error) {
    console.error(" Erreur d'indexation ElasticSearch :", error.message);
  }
});

// 🔹 Hook pour supprimer un document de ElasticSearch après suppression
threatSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    try {
      await elasticsearchService.deleteDocument("threats", doc._id.toString());
      console.log(` Menace ${doc._id} supprimée de ElasticSearch.`);
    } catch (error) {
      console.error(" Erreur de suppression ElasticSearch :", error.message);
    }
  }
});

module.exports = mongoose.model('Threat', threatSchema);