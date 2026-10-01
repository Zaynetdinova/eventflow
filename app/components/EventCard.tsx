import Link from "next/link";
import { Event } from "../types";
import styles from "./EventCard.module.css";
import CalendarButton from "./CalendarButton";

export default function EventCard({
    event,
    onDeleteEvent,
    onEditEvent
}: {
    event: Event;
    onDeleteEvent?: (id: number) => void;
    onEditEvent?: (event: Event) => void;
})
    {

        const formattedDate = new Date(event.date).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long"
        });
            return (
                <div className={styles.card}>
                    <p className={styles.category}>{event.category}</p>

                    <h2 className={styles.title}>
                        <Link href={`/event/${event.id}`}>
                            {event.title}
                        </Link>
                    </h2>

                    <Link href={`/event/${event.id}`}>
                        Подробнее
                    </Link>

                    <p>
                        {formattedDate}, {event.time}
                    </p>

                    <p>{event.location}</p>

                    <p className={styles.price}>{event.price} ₽</p>

                    <CalendarButton event={event} />
                    {onDeleteEvent && onEditEvent && <div className={styles.actions}>
    <button
        className={styles.editButton}
        type="button"
        onClick={function() {
            onEditEvent(event);
        }}
    >
        Редактировать
    </button>

    <button
        className={styles.deleteButton}
        type="button"
        onClick={function() {
            const isConfirmed = window.confirm(
                "Вы уверены, что хотите удалить это событие?"
            );

            if (isConfirmed) {
                onDeleteEvent(event.id);
            }
        }}
    >
        Удалить
    </button>
                    </div>}
                </div>
            );
    }
