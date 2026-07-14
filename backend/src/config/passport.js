import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { User } from "../models/user.model.js";

// Finds an existing user by (provider, providerId). If none, links the
// provider onto an existing account matched by email (lets one person sign
// in with Google today and GitHub tomorrow and land on the same account).
// Otherwise creates a brand new user. No passwords anywhere in this flow.
const findOrCreateOAuthUser = async ({ provider, providerId, name, email, avatarUrl }) => {
    let user = await User.findOne({
        providers: { $elemMatch: { provider, providerId } },
    });
    if (user) return user;

    if (email) {
        user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            user.providers.push({ provider, providerId });
            if (!user.avatarUrl && avatarUrl) user.avatarUrl = avatarUrl;
            await user.save({ validateBeforeSave: false });
            return user;
        }
    }

    return User.create({
        name: name || "DevAtlas User",
        email: email ? email.toLowerCase() : `${provider}-${providerId}@devatlas.local`,
        avatarUrl: avatarUrl || "",
        providers: [{ provider, providerId }],
    });
};

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const user = await findOrCreateOAuthUser({
                    provider: "google",
                    providerId: profile.id,
                    name: profile.displayName,
                    email: profile.emails?.[0]?.value,
                    avatarUrl: profile.photos?.[0]?.value,
                });
                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CALLBACK_URL,
            scope: ["user:email"],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const user = await findOrCreateOAuthUser({
                    provider: "github",
                    providerId: profile.id,
                    name: profile.displayName || profile.username,
                    email: profile.emails?.[0]?.value,
                    avatarUrl: profile.photos?.[0]?.value,
                });
                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

export default passport;
