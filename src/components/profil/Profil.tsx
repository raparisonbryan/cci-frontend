"use client"

import {signOut, useSession} from "next-auth/react";
import styles from "./Profil.module.scss";

const Profil = () => {
    const {data: session} = useSession();

    const handleSignOut = () => {
        signOut();
    }

    return (
        <div className={styles.container}>
            <h1>Bonjour, {session?.user.name}</h1>
            <button onClick={handleSignOut}>Se déconnecter</button>
        </div>
    );
}

export default Profil;