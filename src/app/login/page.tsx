"use client"

import {signIn} from "next-auth/react";
import styles from "./page.module.scss";
import bg from "@/assets/cci.png";
import Image from "next/image";
import Img from "@/components/image/Img";
import logo from "@/assets/cci_logo_white.png";
import {useSearchParams} from "next/navigation";

const Login = () => {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const handleLogin = () => {
        signIn("google", { callbackUrl });
    }

    return (
        <div className={styles.container}>
            <div className={styles.logo}>
                <Img src={logo} width={150} height={80} objectFit="contain" alt="icone planning" />
            </div>
            <div className={styles.modal_wrapper}>
                <div className={styles.modal}>
                    <h1>Se connecter</h1>
                    <p>Connectez-vous pour accéder au planning</p>
                    <button onClick={handleLogin}>Se connecter</button>
                </div>
            </div>
            <div className={styles.bg_wrapper}>
                <div className={styles.bg}>
                    <Image src={bg} alt={"cci"} fill style={{objectFit: "cover"}} />
                </div>
            </div>
        </div>
    )
}

export default Login;