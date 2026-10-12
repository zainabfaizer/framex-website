// ================= FRAME X BOOKING FLOW (frontend prototype) =================
(() => {
    "use strict";

    const config = window.FRAMEX_CONFIG || {};

    /* ---- SAMPLE DATA ONLY ----------------------------------------------------
       These are NOT real availability. Replace this block with data from the real
       booking service when it is connected. */
    const SAMPLE_SLOTS = [
        { label: "9:00 AM", available: true },
        { label: "10:00 AM", available: true },
        { label: "11:30 AM", available: true },
        { label: "1:00 PM", available: false },
        { label: "2:30 PM", available: true },
        { label: "4:00 PM", available: true },
    ];
    const isSampleAvailable = (date) => date.getDay() >= 1 && date.getDay() <= 5; // Mon–Fri
    const MAX_MONTHS_AHEAD = 2;
    /* ------------------------------------------------------------------------ */

    function initPrototypeNotes() {
        if (config.prototypeMode === false) {
            document.querySelectorAll("[data-prototype-note]").forEach((el) => el.remove());
        }
    }

    function initFooterYear() {
        document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
    }

    /* Booking page: date, time and meeting type selection */
    function initBookingPage() {
        const grid = document.querySelector("[data-cal-grid]");
        if (!grid) return;

        const monthLabel = document.getElementById("cal-month");
        const prev = document.querySelector("[data-cal-prev]");
        const next = document.querySelector("[data-cal-next]");
        const slotsEl = document.querySelector("[data-slots]");
        const hint = document.querySelector("[data-time-hint]");
        const dateShort = document.querySelector("[data-date-short]");
        const outDate = document.querySelector("[data-out-date]");
        const outTime = document.querySelector("[data-out-time]");
        const outMeeting = document.querySelector("[data-out-meeting]");
        const state = document.querySelector("[data-state]");
        const confirm = document.querySelector("[data-confirm]");

        const fmtMonth = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });
        const fmtLong = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
        const fmtShort = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });
        const fmtSummary = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const view = new Date(startMonth);
        const selection = { date: null, time: null };

        function monthsFromStart() {
            return (view.getFullYear() - startMonth.getFullYear()) * 12 + view.getMonth() - startMonth.getMonth();
        }

        function renderCalendar() {
            monthLabel.textContent = fmtMonth.format(view);
            grid.replaceChildren();

            const firstWeekday = new Date(view.getFullYear(), view.getMonth(), 1).getDay(); // Sun = 0
            for (let i = 0; i < (firstWeekday + 6) % 7; i += 1) {
                const blank = document.createElement("span");
                blank.className = "cal__blank";
                grid.append(blank);
            }

            const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
            for (let day = 1; day <= daysInMonth; day += 1) {
                const date = new Date(view.getFullYear(), view.getMonth(), day);
                const available = date > today && isSampleAvailable(date);
                const button = document.createElement("button");
                button.type = "button";
                button.className = "cal__day";
                button.textContent = day;
                button.setAttribute("aria-label", fmtLong.format(date));
                if (date.getTime() === today.getTime()) button.classList.add("is-today");

                if (!available) {
                    button.disabled = true;
                } else {
                    button.classList.add("is-available");
                    const selected = selection.date && date.getTime() === selection.date.getTime();
                    if (selected) button.classList.add("is-selected");
                    button.setAttribute("aria-pressed", String(Boolean(selected)));
                    button.addEventListener("click", () => {
                        selection.date = date;
                        selection.time = null;
                        renderCalendar();
                        renderSlots();
                        updateSummary();
                        const selectedDay = grid.querySelector(".is-selected");
                        if (selectedDay) selectedDay.focus();
                    });
                }
                grid.append(button);
            }

            prev.disabled = monthsFromStart() <= 0;
            next.disabled = monthsFromStart() >= MAX_MONTHS_AHEAD;
        }

        function renderSlots() {
            slotsEl.replaceChildren();
            dateShort.textContent = selection.date ? fmtShort.format(selection.date) : "";
            hint.textContent = selection.date ? "Select a time that works for you." : "Select a date to see times.";
            if (!selection.date) return;

            SAMPLE_SLOTS.forEach((slot) => {
                const button = document.createElement("button");
                button.type = "button";
                button.className = "slot";
                const label = document.createElement("span");
                label.textContent = slot.label;
                button.append(label);

                if (!slot.available) {
                    button.disabled = true;
                    const note = document.createElement("small");
                    note.textContent = "Unavailable";
                    button.append(note);
                } else {
                    const selected = selection.time === slot.label;
                    button.classList.toggle("is-selected", selected);
                    button.setAttribute("aria-pressed", String(selected));
                    button.addEventListener("click", () => {
                        selection.time = slot.label;
                        renderSlots();
                        updateSummary();
                        const selectedSlot = slotsEl.querySelector(".is-selected");
                        if (selectedSlot) selectedSlot.focus();
                    });
                }
                slotsEl.append(button);
            });
        }

        function updateSummary() {
            const meeting = document.querySelector('input[name="meeting"]:checked');
            const ready = Boolean(selection.date && selection.time);
            outDate.textContent = selection.date ? fmtSummary.format(selection.date) : "—";
            outTime.textContent = selection.time || "—";
            outMeeting.textContent = meeting ? meeting.dataset.label : "—";
            state.textContent = ready ? "Ready to confirm" : "Choose a date and time";
            confirm.disabled = !ready;
        }

        prev.addEventListener("click", () => {
            view.setMonth(view.getMonth() - 1);
            renderCalendar();
        });
        next.addEventListener("click", () => {
            view.setMonth(view.getMonth() + 1);
            renderCalendar();
        });
        document.querySelectorAll('input[name="meeting"]').forEach((radio) => radio.addEventListener("change", updateSummary));

        // Prototype step only: nothing is booked or saved. The real booking call goes here later.
        confirm.addEventListener("click", () => {
            window.location.assign(config.confirmationPageUrl || "booking-confirmed.html");
        });

        renderCalendar();
        renderSlots();
        updateSummary();
    }

    /* Confirmation page: "Add to Calendar" is prepared but not connected.
       When a real booking exists, set window.FRAMEX_BOOKING before this runs:
       { title, start, end, details, location }  (start/end as ISO date-time strings) */
    function initAddToCalendar() {
        const button = document.querySelector("[data-add-to-calendar]");
        if (!button) return;
        const status = document.querySelector("[data-calendar-status]");

        button.addEventListener("click", () => {
            const booking = window.FRAMEX_BOOKING;
            if (!booking || !booking.start || !booking.end) {
                status.textContent = "Not connected yet: calendar details will be available once a real booking exists.";
                return;
            }
            const stamp = (value) => new Date(value).toISOString().replace(/[-:]|\.\d{3}/g, "");
            const params = new URLSearchParams({
                action: "TEMPLATE",
                text: booking.title || "FrameX Prime Strategy Call",
                dates: `${stamp(booking.start)}/${stamp(booking.end)}`,
                details: booking.details || "",
                location: booking.location || "",
            });
            window.open(`https://calendar.google.com/calendar/render?${params}`, "_blank", "noopener");
        });
    }

    initPrototypeNotes();
    initFooterYear();
    initBookingPage();
    initAddToCalendar();
})();