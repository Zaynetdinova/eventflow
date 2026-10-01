"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { Event } from "../../types";
import { EventRow, fromEventRow } from "../../../lib/events";
import { getSupabaseBrowserClient } from "../../../lib/supabase/client";
import CalendarButton from "../../components/CalendarButton";
import styles from "./page.module.css";

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState("");

    useEffect(function() {
        let isActive = true;

        async function loadEvent() {
            const supabase = getSupabaseBrowserClient();

            if (!supabase) {
                setLoadError("Supabase не настроен.");
                setIsLoaded(true);
                return;
            }

            const { data, error } = await supabase
                .from("events")
                .select("*")
                .eq("id", Number(id))
                .maybeSingle();

            if (!isActive) {
                return;
            }

            if (error) {
                setLoadError("Не удалось загрузить событие.");
            } else if (data) {
                setEvent(fromEventRow(data as EventRow));
            }

            setIsLoaded(true);
        }

        void loadEvent();
        return () => {
            isActive = false;
        };
    }, [id]);

    if (!isLoaded) {
        return <p>Загрузка…</p>;
    }

    if (loadError) {
        return <main className={styles.container}><p role="alert">{loadError}</p></main>;
    }

    if (!event) {
        return <main className={styles.container}><p>Событие не найдено</p></main>;
    }

    return (
        <main className={styles.container}>
            <Link className={styles.backLink} href="/">← Все события</Link>
            <p className={styles.category}>{event.category}</p>
            <h1 className={styles.title}>{event.title}</h1>
            <div className={styles.info}>
                <p>📅 {event.date}</p>
                <p>🕐 {event.time}</p>
                <p>📍 {event.location}</p>
            </div>
            <p className={styles.price}>{event.price === 0 ? "Бесплатно" : `${event.price} ₽`}</p>
            <CalendarButton event={event} />
        </main>
    );
}
