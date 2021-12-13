import NextAuth from 'next-auth';
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"

export default NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as  string
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID as string,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string
        })
    ],
    jwt: {
        secret: process.env.SECRET
    },
    secret: process.env.SECRET,
    session: {
        maxAge: 1000 * 60 * 60,
    },
    callbacks: {
        jwt: async ({ token, account }) => {
            if (account) {
                token.accessToken = account.accessToken;
                token.provider = account.provider;
                token.providerAccountId = account.providerAccountId;
            }
            return token;
        },
        session: async ({ session, token }) => {
            
            session.provider = token.provider ?? "";
            session.providerAccountId = token.providerAccountId ?? "";
            return session
        }
    }
});