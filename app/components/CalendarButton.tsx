import { Event } from "../types";
import styles from "./CalendarButton.module.css";

const eventTimeZone = "Asia/Yekaterinburg";

function toGoogleDate(dateTime: Date) {
    return dateTime.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function createCalendarUrl(event: Event) {
    const start = new Date(`${event.date}T${event.time}:00+05:00`);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const details = [
        `Категория: ${event.category}`,
        `Цена: ${event.price === 0 ? "Бесплатно" : `${event.price} ₽`}`
    ].join("\n");

    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: event.title,
        dates: `${toGoogleDate(start)}/${toGoogleDate(end)}`,
        stz: eventTimeZone,
        etz: eventTimeZone,
        details,
        location: event.location
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function CalendarButton({ event }: { event: Event }) {
    return (
        <div className={styles.wrapper}>
            <a
                className={styles.button}
                href={createCalendarUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
            >
                Сохранить в Google Calendar
            </a>
        </div>
    );
}
