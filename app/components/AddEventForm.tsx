"use client";

import styles from "./AddEventForm.module.css";
import React, { useEffect, useState } from "react";
import { Event } from "../types";
export default function AddEventForm({
    onAddEvent,
    onEditEvent,
    onCancelEdit,
    eventToEdit
}: {
    onAddEvent: (event: Event) => void | Promise<void>;
    onEditEvent?: (event: Event) => void | Promise<void>;
    onCancelEdit?: () => void;
    eventToEdit?: Event;
}) {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [location, setLocation] = useState("");
    const [price, setPrice] = useState("");

    const [titleError, setTitleError] = useState("");
    const [categoryError, setCategoryError] = useState("");
    const [dateError, setDateError] = useState("");
    const [timeError, setTimeError] = useState("");
    const [locationError, setLocationError] = useState("");
    const [priceError, setPriceError] = useState("");
    const [saveError, setSaveError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(function() {
        if (!eventToEdit) {
            setTitle("");
            setCategory("");
            setDate("");
            setTime("");
            setLocation("");
            setPrice("");
            return;
        }

        setTitle(eventToEdit.title);
        setCategory(eventToEdit.category);
        setDate(eventToEdit.date);
        setTime(eventToEdit.time);
        setLocation(eventToEdit.location);
        setPrice(String(eventToEdit.price));
    }, [eventToEdit]);


    async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaveError("");

        if (!title.trim()) {
            setTitleError("Введите название события");
            return;
        }

        setTitleError("");

        if (!category.trim()) {
            setCategoryError("Введите категорию");
            return;
        }

        setCategoryError("");

        if (!date) {
            setDateError("Выберите дату");
            return;
        }

        setDateError("");

        if (!time) {
            setTimeError("Выберите время");
            return;
        }

        setTimeError("");

        if (!location.trim()) {
            setLocationError("Введите место проведения");
            return;
        }

        setLocationError("");

        if (!price.trim()) {
            setPriceError("Введите цену");
            return;
        }
        if (Number(price) > 10000) {
            setPriceError("Цена не может быть больше 10000 ₽");
            return;
        }

        setPriceError("");


        const newEvent: Event = {
            id: eventToEdit ? eventToEdit.id : Date.now(),
            title: title.trim(),
            category:
    category.trim().charAt(0).toUpperCase() +
    category.trim().slice(1).toLowerCase(),
            date: date,
            time: time,
            location: location.trim(),
            price: Number(price)
        };

        setIsSaving(true);
        try {
            if (eventToEdit) {
                await onEditEvent?.(newEvent);
            } else {
                await onAddEvent(newEvent);
            }
        } catch (error) {
            setSaveError(error instanceof Error ? error.message : "Не удалось сохранить событие.");
            setIsSaving(false);
            return;
        }

        setIsSaving(false);

        setTitle("");
        setCategory("");
        setDate("");
        setTime("");
        setLocation("");
        setPrice("");
    }
    return (
        <form
    className={styles.form}
    onSubmit={handleSubmit}
    noValidate
>
            <div className={styles.field}>
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Название события"
                    value={title}
                    onChange={function(event) {
                        setTitle(event.target.value);
                        setTitleError("");
                    }}
                    required
                />

                <p className={styles.error}>
                    {titleError}
                </p>
            </div>
            <div className={styles.field}>
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Категория"
                    value={category}
                    onChange={function(event) {
                        setCategory(event.target.value);
                        setCategoryError("");
                    }}
                    required
                />

                <p className={styles.error}>
                    {categoryError}
                </p>
            </div>
            <div className={styles.field}>
    <input
        className={styles.input}
        type="date"
        value={date}
        onChange={function(event) {
            setDate(event.target.value);
            setDateError("");
        }}
        required
        min={new Date().toLocaleDateString("en-CA")}
    />

    <p className={styles.error}>
        {dateError}
    </p>
</div>

<div className={styles.field}>
    <input
        className={styles.input}
        type="time"
        value={time}
        onChange={function(event) {
            setTime(event.target.value);
            setTimeError("");
        }}
        required
    />

    <p className={styles.error}>
        {timeError}
    </p>
</div>

<div className={styles.field}>
    <input
        className={styles.input}
        type="text"
        placeholder="Место проведения"
        value={location}
        onChange={function(event) {
            setLocation(event.target.value);
            setLocationError("");
        }}
        required
    />

    <p className={styles.error}>
        {locationError}
    </p>
</div>
        <div className={styles.field}>
            <input
                className={styles.input}
                type="number"
                placeholder="Цена"
                value={price}
                onChange={function(event) {
                    setPrice(event.target.value);
                    setPriceError("");
                }}
                required
                min="0"
                max="10000"
            />
            <p className={styles.error}>
        {priceError}
    </p>
        </div>

<button
    className={styles.button}
    type="submit"
    disabled={isSaving}
>
    {isSaving ? "Сохраняем…" : eventToEdit ? "Сохранить изменения" : "Добавить событие"}
</button>
{saveError && <p className={styles.error} role="alert">{saveError}</p>}
{eventToEdit && (
    <button
    className={styles.cancelButton}
        type="button"
        onClick={function() {
            onCancelEdit?.();
        }}
    >
        Отмена
    </button>
)}
        </form>
    );
}
