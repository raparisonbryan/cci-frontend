"use client"

import {signOut, useSession} from "next-auth/react";
import styles from "./Profil.module.scss";
import RecentChanges from "@/components/changes/RecentChanges";
import DefaultAvatar from "@/components/avatar/Avatar";

const Profil = () => {
    const {data: session} = useSession();

    const handleSignOut = () => {
        signOut();
    };

    const getUserInitials = () => {
        if (!session?.user?.name) return '';

        return session.user.name
            .split(' ')
            .map(part => part.charAt(0).toUpperCase())
            .join('')
            .slice(0, 2);
    };

    return (
        <div className={styles.container}>
            <div className={styles.profileHeader}>
                <div className={styles.userInfo}>
                    <h1>Bonjour, {session?.user?.name}</h1>
                    <div className={styles.avatarContainer}>
                        {session?.user?.image ? (
                            <img
                                src={session.user.image}
                                alt={`Photo de profil`}
                                className={styles.avatar}
                            />
                        ) : (
                            <DefaultAvatar
                                initials={getUserInitials()}
                                size={80}
                                bgColor="#3b82f6"
                                className={styles.avatar}
                            />
                        )}
                    </div>
                    <p className={styles.email}>{session?.user?.email}</p>
                    <p className={styles.role}>
                        Rôle: <span>{session?.user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</span>
                    </p>
                </div>

                <button
                    onClick={handleSignOut}
                    className={styles.signOutButton}
                >
                    Se déconnecter
                </button>
            </div>

            <RecentChanges />
        </div>
    );
};

export default Profil;