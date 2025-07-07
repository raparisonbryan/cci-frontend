import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const authorizedEmails = [
    "raparisonbryan@yahoo.fr",
    "raveloarison.tiana@gmail.com",
    "cci.madeco2023@gmail.com",
    "logistique.cci@madeco.mg",
    "braparison@wemadeya.fr",
    "raparisonvalisoa@gmail.com"
];

const adminEmails = [
    "raparisonbryan@yahoo.fr",
    "raveloarison.tiana@gmail.com"
];

const userEmails = [
    "cci.madeco2023@gmail.com",
    "braparison@wemadeya.fr"
];

const visitorEmails = [
    "raparisonvalisoa@gmail.com",
    "logistique.cci@madeco.mg"
];

const handler = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            return authorizedEmails.includes(user.email?.toLowerCase() || '');
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub as string;
                session.user.role = token.role as string;
            }
            return session;
        },
        async jwt({ token, user, account }) {
            if (user && account) {
                const email = user.email?.toLowerCase() || '';
                if (adminEmails.includes(email)) {
                    token.role = 'admin';
                } else if (userEmails.includes(email)) {
                    token.role = 'user';
                } else if (visitorEmails.includes(email)) {
                    token.role = 'visitor';
                } else {
                    token.role = 'visitor';
                }
            }
            return token;
        }
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
});

export { handler as GET, handler as POST };