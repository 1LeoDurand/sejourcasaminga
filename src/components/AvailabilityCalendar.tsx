import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval,
  isWithinInterval, isBefore, startOfDay,
} from "date-fns";
import { fr } from "date-fns/locale";

type Availability = {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
};

// Per-status day styling — mirrors the host calendar (CalendarPage)
const STATUS_DAY: Record<string, string> = {
  available: "bg-olive/25 text-olive font-semibold",
  reciprocal_only: "bg-soleil/30 text-soleil-foreground font-semibold",
  unavailable: "bg-muted text-muted-foreground/60 line-through",
};

const WEEK_DAYS = ["LU", "MA", "ME", "JE", "VE", "SA", "DI"];

/**
 * Read-only multi-month availability calendar for the public listing page.
 * Renders an expandable grid of months with days colored by their status.
 */
export default function AvailabilityCalendar({
  availabilities,
  notes,
}: {
  availabilities: Availability[];
  notes?: string | null;
}) {
  const { t } = useTranslation();
  const [monthsShown, setMonthsShown] = useState(3);
  const baseMonth = startOfMonth(new Date());
  const today = startOfDay(new Date());

  const months = Array.from({ length: monthsShown }, (_, i) => addMonths(baseMonth, i));

  const getStatusForDay = (day: Date): string | null => {
    const av = availabilities.find((a) =>
      isWithinInterval(day, { start: new Date(a.start_date), end: new Date(a.end_date) })
    );
    return av?.status ?? null;
  };

  const legend = [
    { status: "available", label: t("listing.statusAvailable"), dot: "bg-olive" },
    { status: "reciprocal_only", label: t("listing.statusReciprocal"), dot: "bg-soleil" },
    { status: "unavailable", label: t("listing.statusUnavailable"), dot: "bg-muted-foreground" },
  ];

  const hasAny = availabilities.length > 0;

  return (
    <div className="mt-8">
      <h2 className="text-lg text-foreground mb-3 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        {t("listing.availabilityTitle")}
      </h2>

      {notes && (
        <div className="rounded-xl bg-crema border p-4 mb-4">
          <p className="text-sm text-muted-foreground whitespace-pre-line">{notes}</p>
        </div>
      )}

      {!hasAny ? (
        <p className="text-sm text-muted-foreground">{t("listing.noDates")}</p>
      ) : (
        <>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-4">
            {legend.map((l) => (
              <div key={l.status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={`h-3 w-3 rounded-full ${l.dot}`} />
                {l.label}
              </div>
            ))}
          </div>

          {/* Month grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {months.map((month) => {
              const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
              const firstDayOfWeek = (startOfMonth(month).getDay() + 6) % 7;

              return (
                <div key={month.toISOString()} className="rounded-2xl border bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground capitalize text-center mb-3">
                    {format(month, "MMMM yyyy", { locale: fr })}
                  </h3>
                  <div className="grid grid-cols-7 gap-1">
                    {WEEK_DAYS.map((d) => (
                      <div key={d} className="text-center text-[10px] font-medium text-muted-foreground/70 py-0.5">
                        {d}
                      </div>
                    ))}
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {days.map((day) => {
                      const status = getStatusForDay(day);
                      const isPast = isBefore(day, today);
                      const dayCls = status ? STATUS_DAY[status] || "" : "";
                      return (
                        <div
                          key={day.toISOString()}
                          className={`
                            flex h-9 items-center justify-center rounded-lg text-xs
                            ${isPast ? "text-muted-foreground/25" : "text-foreground"}
                            ${!isPast ? dayCls : ""}
                          `}
                        >
                          {format(day, "d")}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load more */}
          <div className="flex justify-center mt-5">
            <Button variant="outline" size="sm" onClick={() => setMonthsShown((m) => m + 3)}>
              {t("listing.moreMonths")} <ChevronRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
