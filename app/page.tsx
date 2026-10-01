"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import EventCard from "./components/EventCard";
import { fromEventRow, EventRow } from "../lib/events";
import { getSupabaseBrowserClient } from "../lib/supabase/client";
import { Event } from "./types";
import styles from "./page.module.css";

export default function Home() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [category, setCategory] = useState("Все");
    const [search, setSearch] = useState("");
    const [maxPrice, setMaxPrice] = useState(10000);

    useEffect(function() {
        let isActive = true;

        async function loadEvents() {
            const supabase = getSupabaseBrowserClient();

            if (!supabase) {
                setLoadError("Для загрузки каталога нужно подключить Supabase.");
                setIsLoaded(true);
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
                setLoadError("Не удалось загрузить события. Проверь подключение Supabase.");
            } else {
                setEvents((data || []).map((row) => fromEventRow(row as EventRow)));
            }

            setIsLoaded(true);
        }

        void loadEvents();

        return function() {
            isActive = false;
        };
    }, []);

    const categories = ["Все", ...new Set(events.map((event) => event.category))];
    const filteredEvents = events.filter((event) => {
        const matchesPrice = event.price <= maxPrice;
        const matchesCategory = category === "Все" || event.category === category;
        const matchesSearch =
            event.title.toLowerCase().includes(search.toLowerCase()) ||
            event.location.toLowerCase().includes(search.toLowerCase());

        return matchesCategory && matchesSearch && matchesPrice;
    });

    return (
        <main className={styles.container}>
            <h1 className={styles.title}>EventFlow</h1>
            <p className={styles.subtitle}>Найди интересные события рядом с тобой</p>
            <input
                className={styles.search}
                type="text"
                placeholder="Поиск событий..."
                value={search}
                onChange={(input) => setSearch(input.target.value)}
            />

            <div className={styles.priceFilter}>
                <label className={styles.priceLabel}>Максимальная цена: {maxPrice} ₽</label>
                <input
                    className={styles.priceRange}
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={maxPrice}
                    onChange={(input) => setMaxPrice(Number(input.target.value))}
                />
            </div>

            <div className={styles.categories}>
                {categories.map((categoryName) => (
                    <button
                        className={category === categoryName ? styles.categoryButtonActive : styles.categoryButton}
                        key={categoryName}
                        onClick={() => setCategory(categoryName)}
                    >
                        {categoryName}
                    </button>
                ))}
            </div>

            {!isLoaded && <p>Загружаем события…</p>}
            {loadError && <p role="alert">{loadError}</p>}
            {isLoaded && !loadError && filteredEvents.length === 0 && <p>Пока нет подходящих событий.</p>}

            <div className={styles.grid}>
                {filteredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>

            <Link href="/admin">Для организаторов</Link>
        </main>
    );
}
