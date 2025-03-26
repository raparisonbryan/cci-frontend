import {useSearchParams} from "next/navigation";
import {signIn} from "next-auth/react";
import {useEffect, useState} from "react";

const LoginForm = () => {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const error = searchParams.get('error');
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (error) {
            if (error === "AccessDenied") {
                setErrorMessage("Accès refusé.");
            } else {
                setErrorMessage("Une erreur s'est produite lors de la connexion.");
            }
        }
    }, [error]);

    const handleLogin = () => {
        signIn("google", { callbackUrl });
    }

    return (
        <>
            <h1>Se connecter</h1>
            <p>Connectez-vous pour accéder au planning</p>

            {errorMessage && (
                <div style={{
                    backgroundColor: '#FEE2E2',
                    color: '#B91C1C',
                    padding: '12px',
                    borderRadius: '4px',
                    marginBottom: '16px'
                }}>
                    {errorMessage}
                </div>
            )}

            <button onClick={handleLogin}>Se connecter</button>
        </>
    );
}

export default LoginForm;