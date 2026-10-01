import { Event } from "../app/types";

export type EventRow = {
    id: number | string;
    title: string;
    category: string;
    date: string;
    time: string;
    location: string;
    price: number | string;
};

export function fromEventRow(row: EventRow): Event {
    return {
        id: Number(row.id),
        title: row.title,
        category: row.category,
        date: row.date,
        time: row.time.slice(0, 5),
        location: row.location,
        price: Number(row.price)
    };
}

export function toEventRow(event: Event) {
    return {
        title: event.title,
        category: event.category,
        date: event.date,
        time: event.time,
        location: event.location,
        price: event.price
    };
}
