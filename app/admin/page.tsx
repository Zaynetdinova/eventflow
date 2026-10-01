"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import AdminEventManager from "./AdminEventManager";
import styles from "./page.module.css";

type AccessState = "checking" | "signed-out" | "admin" | "forbidden" | "unconfigured";

export default function AdminPage() {
    const [access, setAccess] = useState<AccessState>("checking");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSigningIn, setIsSigningIn] = useState(false);
    const supabase = getSupabaseBrowserClient();

    useEffect(function() {
        if (!supabase) {
            setAccess("unconfigured");
            return;
        }

        function updateAccess(user: User | null) {
            if (!user) {
                setAccess("signed-out");
            } else if (user.app_metadata.role === "admin") {
                setAccess("admin");
            } else {
                setAccess("forbidden");
            }
        }

        void supabase.auth.getUser().then(({ data, error: userError }) => {
            if (userError) {
                setAccess("signed-out");
            } else {
                updateAccess(data.user);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            updateAccess(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    async function handleSignIn(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!supabase) {
            setError("Supabase не настроен.");
            return;
        }

        setIsSigningIn(true);
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        setIsSigningIn(false);

        if (signInError) {
            if (signInError.message.toLowerCase().includes("email not confirmed")) {
                setError("Email администратора не подтвержден. Проверь статус пользователя в Supabase → Authentication → Users.");
            } else {
                setError(`Supabase не принял вход: ${signInError.message}`);
            }
            return;
        }

        if (data.user.app_metadata.role !== "admin") {
            await supabase.auth.signOut();
            setError("У этой учетной записи нет прав администратора.");
            return;
        }

        setAccess("admin");
    }

    async function handleSignOut() {
        await supabase?.auth.signOut();
        setAccess("signed-out");
    }

    return (
        <main className={styles.container}>
            <Link href="/">← К каталогу событий</Link>
            <h1>Управление событиями</h1>

            {access === "checking" && <p>Проверяем доступ…</p>}
            {access === "unconfigured" && <p role="alert">Сначала подключи Supabase по инструкции в README.</p>}
            {access === "signed-out" && (
                <form className={styles.loginForm} onSubmit={handleSignIn}>
                    <h2>Вход администратора</h2>
                    <label>
                        Email
                        <input
                            type="email"
                            autoComplete="username"
                            required
                            value={email}
                            onChange={(input) => setEmail(input.target.value)}
                        />
                    </label>
                    <label>
                        Пароль
                        <input
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(input) => setPassword(input.target.value)}
                        />
                    </label>
                    {error && <p role="alert">{error}</p>}
                    <button type="submit" disabled={isSigningIn}>
                        {isSigningIn ? "Входим…" : "Войти"}
                    </button>
                </form>
            )}
            {access === "forbidden" && (
                <section className={styles.loginForm}>
                    <p role="alert">Аккаунт вошел, но не имеет прав администратора.</p>
                    <button type="button" onClick={handleSignOut}>Выйти</button>
                </section>
            )}
            {access === "admin" && (
                <>
                    <button className={styles.signOut} type="button" onClick={handleSignOut}>Выйти</button>
                    <AdminEventManager />
                </>
            )}
        </main>
    );
}
