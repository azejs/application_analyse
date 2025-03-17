const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const elasticsearchService = require("../services/elasticsearchService");

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  size: { type: Number, required: true },
  mime_type: { type: String, required: true },
  hash: { type: String, unique: true },
  gridfs_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  risk_score: { type: Number, default: 0 },
  submitted_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "processing", "analyzed", "failed"], default: "pending" },
  uploaded_at: { type: Date, default: Date.now },
  analysis_id: { type: mongoose.Schema.Types.ObjectId, ref: "Analysis" }
});

fileSchema.plugin(mongoosePaginate);

// 🔹 Hook MongoDB : Indexation dans ElasticSearch après insertion
fileSchema.post("save", async function (doc) {
  try {
    await elasticsearchService.indexDocument("files", doc._id.toString(), doc.toObject());
    console.log(`✅ Fichier ${doc.filename} indexé dans ElasticSearch.`);
  } catch (error) {
    console.error("❌ Erreur d'indexation ElasticSearch :", error.message);
  }
});

module.exports = mongoose.model("File", fileSchema);
