// Même détection que next-auth/jwt (getToken) pour le préfixe __Secure-
const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith('https://') ?? !!process.env.VERCEL;

// Nom lu aussi par le backend (cci-backend/utils/session.js) : à garder synchronisé
export const SESSION_COOKIE_NAME = `${useSecureCookies ? '__Secure-' : ''}cci.session-token`;

// Domaine parent (ex: .cci-api.com) pour que le cookie soit aussi envoyé à l'API
const cookieDomain = process.env.NEXTAUTH_COOKIE_DOMAIN || undefined;

export const sessionCookie = {
    name: SESSION_COOKIE_NAME,
    options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: useSecureCookies,
        domain: cookieDomain,
    },
};
