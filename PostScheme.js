import mongoose from 'mongoose'
  
  const Schema = new mongoose.Schema({
    rank: { type: String, required: true },
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    assaultRifle: { type: String, required: true },
    serialNumberAssaultRifle: { type: String, required: true },
    pistol: { type: String, required: true },
    serialNumberPistol: { type: String, required: true }
  },{
    versionKey:false
  });

export default Schema