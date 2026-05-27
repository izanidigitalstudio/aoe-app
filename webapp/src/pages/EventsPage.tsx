import { useQuery, useMutation } from "convex/react";
import { Utensils, MapPin, Globe, Calendar, Users, Diamond } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { colors } from "../theme";
import { useDemoContext } from "../App";

export default function EventsPage() {
  const { isDemo, exitDemo } = useDemoContext();
  const events = useQuery(api.events.listEvents, {});
  const rsvpEvent = useMutation(api.events.rsvpEvent);

  const handleRsvp = async (eventId: any) => {
    if (isDemo) {
      if (confirm("Create an account to RSVP for events. Sign up now?")) exitDemo();
      return;
    }
    try { await rsvpEvent({ eventId }); }
    catch (e: any) { alert(e.message || "Failed to RSVP"); }
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>The Future is Here</h1>
        <p style={{ fontSize: 14, color: colors.primary, fontWeight: 600, marginTop: 4 }}>Dinner Tour Events</p>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {events?.map((event) => (
          <div key={event._id} className="event-card">
            <div className="event-top">
              <div className="event-icon"><Utensils size={22} color={colors.primary} /></div>
              <div className="status-badge">
                <div className="status-dot" style={{ background: event.status === "upcoming" ? colors.success : colors.primary }} />
                <span style={{ fontSize: 12, color: colors.textSecondary, fontWeight: 600, textTransform: "capitalize" }}>{event.status}</span>
              </div>
            </div>
            <div className="event-title">{event.title}</div>
            <div className="event-details">
              <div className="detail-row"><MapPin size={16} color={colors.primary} /> {event.venue}</div>
              <div className="detail-row"><Globe size={16} color={colors.primary} /> {event.city}, {event.country}</div>
              <div className="detail-row"><Calendar size={16} color={colors.primary} /> {new Date(event.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
              <div className="detail-row"><Users size={16} color={colors.primary} /> {event.rsvpCount} / {event.capacity} attendees</div>
            </div>
            <p style={{ fontSize: 14, color: colors.textMuted, lineHeight: 1.5, marginBottom: 16 }}>{event.description}</p>

            {/* Sponsors */}
            {event.sponsors && event.sponsors.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: colors.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Sponsored by</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {event.sponsors.map((sp: any, i: number) => (
                    <a
                      key={i}
                      href={sp.website || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="badge"
                      style={{
                        background: sp.tier === "title" ? colors.primary + "20" : sp.tier === "gold" ? "#FFD70015" : colors.surface,
                        border: `1px solid ${sp.tier === "title" ? colors.primary + "40" : colors.border}`,
                        cursor: sp.website ? "pointer" : "default",
                      }}
                    >
                      <Diamond size={12} color={sp.tier === "title" ? colors.primary : sp.tier === "gold" ? "#FFD700" : sp.tier === "silver" ? "#C0C0C0" : "#CD7F32"} />
                      <span style={{ fontWeight: 700, color: colors.text }}>{sp.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="capacity-bar">
              <div className="capacity-fill" style={{ width: `${Math.min(100, (event.rsvpCount! / event.capacity) * 100)}%` }} />
            </div>

            <button
              className="btn-outline"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => handleRsvp(event._id)}
              disabled={event.rsvpCount! >= event.capacity}
            >
              {event.ticketPrice ? `Register & Pay ${event.ticketPrice} ${event.currency}` : "RSVP Now"}
            </button>
          </div>
        ))}

        {(!events || events.length === 0) && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Calendar size={48} color={colors.textMuted} style={{ margin: "0 auto 16px" }} />
            <div style={{ fontSize: 18, fontWeight: 600, color: colors.textSecondary }}>No events available yet</div>
            <div style={{ fontSize: 14, color: colors.textMuted, marginTop: 4 }}>Check back soon for upcoming dinner tours</div>
          </div>
        )}
      </div>
    </div>
  );
}
