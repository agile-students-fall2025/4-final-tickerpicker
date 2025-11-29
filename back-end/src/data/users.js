import mongoose from "mongoose";

/*export const USERS = [

];*/

// Schema by which user data is structured
const userSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // cyptographic password fields
    salt: { type: String, required: true },
    hash: { type: String, required: true },
    iterations: { type: Number, required: true, default: 100000 },
    keylen: { type: Number, required: true, default: 32 },
    digest: { type: String, required: true, default: "sha256" },
    // end of cryptographic password fields

    email: { type: String, required: true, unique: false },
    // arary of watchlists, each is an OBJECT with 'name' and array of 'tickers'
    watchlists: 
    { 
        type: [
            { // array of wacthlist objects
                name: { type: String, required: true }, 
                tickers: [ {type: String} ] 
            }
        ],
        default: [],
    }
});

// Compile user Schema into a Model
export const User = mongoose.model('User', userSchema);