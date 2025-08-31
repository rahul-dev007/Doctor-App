// services/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const mongoose = require('mongoose');
const User = mongoose.model('User'); // User মডেল ইম্পোর্ট করা

// .env ফাইল থেকে ভ্যারিয়েবল লোড করা (যদি server.js এ আগেই করা থাকে তবে এখানে দরকার নেই)
// require('dotenv').config(); 

// Passport সেশন সেটআপ (ইউজারকে সিরিয়ালাইজ এবং ডিসিরিয়ালাইজ করা)
// ইউজারকে সেশনে কিভাবে স্টোর করবে (সাধারণত শুধু আইডি)
passport.serializeUser((user, done) => {
    done(null, user.id); // MongoDB এর _id ব্যবহার করা
});

// আইডি থেকে ইউজারকে কিভাবে খুঁজে বের করবে
passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user);
    });
});

// Google OAuth স্ট্র্যাটেজি সেটআপ
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            proxy: true // যদি প্রোডাকশনে প্রক্সি সার্ভারের পেছনে থাকে
        },
        async (accessToken, refreshToken, profile, done) => {
            // প্রোফাইল ডেটা দিয়ে ইউজার তৈরি বা খুঁজে বের করা
            const existingUser = await User.findOne({ googleId: profile.id });

            if (existingUser) {
                // ইউজার ইতিমধ্যেই আছে
                return done(null, existingUser);
            }

            // নতুন ইউজার তৈরি করা
            const newUser = await new User({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
                // এখানে পাসওয়ার্ড দরকার নেই, কারণ এটি সোশ্যাল লগইন
            }).save();
            done(null, newUser);
        }
    )
);

// Facebook OAuth স্ট্র্যাটেজি সেটআপ
passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: process.env.FACEBOOK_CALLBACK_URL,
            profileFields: ['id', 'displayName', 'emails'], // Facebook থেকে কি কি ফিল্ড চাই
            proxy: true
        },
        async (accessToken, refreshToken, profile, done) => {
            // প্রোফাইল ডেটা দিয়ে ইউজার তৈরি বা খুঁজে বের করা
            const existingUser = await User.findOne({ facebookId: profile.id });

            if (existingUser) {
                // ইউজার ইতিমধ্যেই আছে
                return done(null, existingUser);
            }

            // নতুন ইউজার তৈরি করা
            const newUser = await new User({
                facebookId: profile.id,
                name: profile.displayName,
                email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
                // এখানে পাসওয়ার্ড দরকার নেই
            }).save();
            done(null, newUser);
        }
    )
);