"use client";

import { useEffect, useState } from "react";
import AddEventForm from "../components/AddEventForm";
import EventCard from "../components/EventCard";
import { Event } from "../types";
import { EventRow, fromEventRow, toEventRow } from "../../lib/events";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import styles from "./page.module.css";

export default function AdminEventManager() {
    const [events, setEvents] = useState<Event[]>([]);
    const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const supabase = getSupabaseBrowserClient();

    useEffect(function() {
        let isActive = true;

        async function loadEvents() {
            if (!supabase) {
                setLoadError("Supabase не настроен.");
                setIsLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("events")
                .select("*")
                .order("date")
                .order("time");

            if (!isActive) {
                return;
            }

            if (error) {
                setLoadError(error.message);
            } else {
                setEvents((data || []).map((row) => fromEventRow(row as EventRow)));
            }

            setIsLoading(false);
        }

        void loadEvents();
        return () => {
            isActive = false;
        };
    }, [supabase]);

    async function handleAddEvent(event: Event) {
        if (!supabase) {
            throw new Error("Supabase не настроен.");
        }

        const { data, error } = await supabase
            .from("events")
            .insert(toEventRow(event))
            .select("*")
            .single();

        if (error) {
            throw new Error(error.message);
        }

        setEvents((current) => [...current, fromEventRow(data as EventRow)]);
    }

    async function handleEditEvent(event: Event) {
        if (!supabase) {
            throw new Error("Supabase не настроен.");
        }

        const { data, error } = await supabase
            .from("events")
            .update(toEventRow(event))
            .eq("id", event.id)
            .select("*")
            .single();

        if (error) {
            throw new Error(error.message);
        }

        const savedEvent = fromEventRow(data as EventRow);
        setEvents((current) => current.map((item) => item.id === savedEvent.id ? savedEvent : item));
        setEventToEdit(null);
    }

    async function handleDeleteEvent(id: number) {
        if (!supabase) {
            setLoadError("Supabase не настроен.");
            return;
        }

        const { error } = await supabase.from("events").delete().eq("id", id);

        if (error) {
            setLoadError(error.message);
            return;
        }

        setEvents((current) => current.filter((event) => event.id !== id));
    }

    return (
        <>
            <section className={styles.formSection}>
                <h2>{eventToEdit ? "Редактировать событие" : "Добавить событие"}</h2>
                <AddEventForm
                    onAddEvent={handleAddEvent}
                    onEditEvent={handleEditEvent}
                    onCancelEdit={() => setEventToEdit(null)}
                    eventToEdit={eventToEdit || undefined}
                />
            </section>

            {isLoading && <p>Загружаем события…</p>}
            {loadError && <p role="alert">Не удалось загрузить или сохранить события: {loadError}</p>}
            <section>
                <h2>Опубликованные события</h2>
                {events.length === 0 && !isLoading && <p>В каталоге пока нет событий.</p>}
                <div className={styles.grid}>
                    {events.map((event) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            onEditEvent={setEventToEdit}
                            onDeleteEvent={handleDeleteEvent}
                        />
                    ))}
                </div>
            </section>
        </>
    );
}
