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
    watchlists: { type: [watchlistSchema], required: false, default: [] },
});

// Compile user Schema into a Model
export const User = mongoose.model('User', userSchema);

// Watchlist schema
const watchlistSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    userId: { type: String, required: true }, // watchlists belong to users, therefore userId = owner reference (username, foreign key)
    name: { type: String, required: true },
    // array of ticker symbols as strings
    tickers: { type: [String], required: true },
});

export const Watchlist = mongoose.model('Watchlist', watchlistSchema);