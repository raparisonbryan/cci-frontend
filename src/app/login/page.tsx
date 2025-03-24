"use client"

import styles from "./page.module.scss";
import bg from "@/assets/cci.png";
import Image from "next/image";
import Img from "@/components/image/Img";
import logo from "@/assets/cci_logo_white.png";
import LoginForm from "@/components/login/LoginForm";
import {Suspense} from "react";

const Login = () => {

    return (
        <div className={styles.container}>
            <div className={styles.logo}>
                <Img src={logo} width={150} height={80} objectFit="contain" alt="icone planning" />
            </div>
            <div className={styles.modal_wrapper}>
                <div className={styles.modal}>
                    <Suspense fallback={<p>Chargement...</p>}>
                        <LoginForm />
                    </Suspense>
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