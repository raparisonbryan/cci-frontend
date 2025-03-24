import {useSearchParams} from "next/navigation";
import {signIn} from "next-auth/react";

const LoginForm = () => {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const handleLogin = () => {
        signIn("google", { callbackUrl });
    }

    return (
        <>
            <h1>Se connecter</h1>
            <p>Connectez-vous pour accéder au planning</p>
            <button onClick={handleLogin}>Se connecter</button>
        </>
    );
}

export default LoginForm;