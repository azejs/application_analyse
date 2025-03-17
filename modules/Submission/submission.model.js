const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const elasticsearchService = require('./../../config/elasticsearch');

const submissionSchema = new mongoose.Schema({
  type: { 
    type: String,
    enum: ['file', 'url', 'domain', 'ip'], 
    required: true },
  is_hashed: {
    type: Boolean,
     default: false },
  file: {
    filename: { type: String },
    size: { type: Number },
    mime_type: { type: String },
    hash: { type: String, unique: true },
    gridfs_id: { type: mongoose.Schema.Types.ObjectId }
  },
  url: {
    full_url: { type: String, unique: true },
    domain: { type: String },
    path: { type: String }
  },
  domain: {
    name: { type: String, unique: true },
    registrar: { type: String },
    creation_date: { type: Date },
    expiration_date: { type: Date }
  },
  ip: {
    address: { type: String, unique: true },
    geolocation: {
      country: { type: String },
      city: { type: String },
      isp: { type: String }
    }
  },
  
  risk_score: { type: Number, default: 0 },
  submitted_by: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'User',
      required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'analyzed', 'failed'], 
    default: 'pending' },
  submitted_at: { 
    type: Date, 
    default: Date.now 
  },
  analysis_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Analysis' }
});

submissionSchema.plugin(mongoosePaginate);

// 🔹 Hook pour indexer dans ElasticSearch après insertion ou mise à jour
submissionSchema.post("save", async function (doc) {
  try {
    await elasticsearchService.indexDocument("submissions", doc._id.toString(), doc.toObject());
    console.log(` Soumission ${doc._id} indexée dans ElasticSearch.`);
  } catch (error) {
    console.error(" Erreur d'indexation ElasticSearch :", error.message);
  }
});

// 🔹 Hook pour supprimer un document de ElasticSearch après suppression
submissionSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    try {
      await elasticsearchService.deleteDocument("submissions", doc._id.toString());
      console.log(` Soumission ${doc._id} supprimée de ElasticSearch.`);
    } catch (error) {
      console.error(" Erreur de suppression ElasticSearch :", error.message);
    }
  }
});

module.exports = mongoose.model('Submission', submissionSchema);