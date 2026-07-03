import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getLeads, type LeadStatus } from "../api/client";

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function getLeadScoreLabel(score: number | null | undefined) {
  if (score == null) {
    return "Not generated";
  }

  if (score >= 75) {
    return `Hot lead (${score})`;
  }

  if (score >= 40) {
    return `Warm lead (${score})`;
  }

  return `Cold lead (${score})`;
}

function getLeadScoreTone(score: number | null | undefined) {
  if (score == null) {
    return "lead-score-none";
  }

  if (score >= 75) {
    return "lead-score-hot";
  }

  if (score >= 40) {
    return "lead-score-warm";
  }

  return "lead-score-cold";
}

function AdminLeadsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [leads, setLeads] = useState<Awaited<ReturnType<typeof getLeads>>["leads"]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const filters = useMemo(
    () => ({
      status: (searchParams.get("status") || undefined) as LeadStatus | undefined,
      city: searchParams.get("city") || undefined,
      interestedModel: searchParams.get("interestedModel") || undefined,
    }),
    [searchParams]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadLeads() {
      setIsLoading(true);
      setError("");

      try {
        const response = await getLeads(filters);
        if (!cancelled) {
          setLeads(response.leads);
        }
      } catch (error) {
        if (!cancelled) {
          setError(error instanceof Error ? error.message : "Failed to load leads");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadLeads();

    return () => {
      cancelled = true;
    };
  }, [filters]);

  function updateFilter(name: string, value: string) {
    const nextParams = new URLSearchParams(searchParams);

    if (value) {
      nextParams.set(name, value);
    } else {
      nextParams.delete(name);
    }

    setSearchParams(nextParams);
  }

  return (
    <main className="admin-card">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">Admin dashboard</p>
          <h1>Leads</h1>
          <p className="subcopy">Track chat-generated leads and follow up with interested customers.</p>
        </div>
      </div>

      <section className="filters-grid">
        <label>
          <span>Status</span>
          <select value={filters.status ?? ""} onChange={(event) => updateFilter("status", event.target.value)}>
            <option value="">All</option>
            <option value="NEW">NEW</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="TEST_DRIVE_SCHEDULED">TEST_DRIVE_SCHEDULED</option>
            <option value="CONVERTED">CONVERTED</option>
            <option value="LOST">LOST</option>
          </select>
        </label>
        <label>
          <span>City</span>
          <input
            value={filters.city ?? ""}
            onChange={(event) => updateFilter("city", event.target.value)}
            type="text"
            placeholder="Hyderabad"
          />
        </label>
        <label>
          <span>Interested model</span>
          <input
            value={filters.interestedModel ?? ""}
            onChange={(event) => updateFilter("interestedModel", event.target.value)}
            type="text"
            placeholder="Innova Hycross"
          />
        </label>
      </section>

      {error ? <div className="alert alert-error">{error}</div> : null}

      {isLoading ? (
        <div className="empty-state">Loading leads...</div>
      ) : (
        <div className="leads-table">
          <div className="leads-row leads-head">
            <span>Name</span>
            <span>Phone</span>
            <span>City</span>
            <span>Model</span>
            <span>Budget</span>
            <span>Timeline</span>
            <span>Status</span>
            <span>Score</span>
            <span>Created</span>
            <span>Session</span>
          </div>
          {leads.length === 0 ? (
            <div className="empty-state">No leads found.</div>
          ) : (
            leads.map((lead) => (
              <Link to={`/admin/leads/${lead.id}`} key={lead.id} className="leads-row lead-link">
                <span>{lead.name || "Unknown"}</span>
                <span>{lead.phone || "-"}</span>
                <span>{lead.city || "-"}</span>
                <span>{lead.interestedModel || "-"}</span>
                <span>{lead.budget || "-"}</span>
                <span>{lead.purchaseTimeline || "-"}</span>
                <span className={`status-badge status-${lead.status.toLowerCase()}`}>{lead.status}</span>
                <span className={`lead-score-label ${getLeadScoreTone(lead.leadScore)}`}>
                  {getLeadScoreLabel(lead.leadScore)}
                </span>
                <span>{formatDate(lead.createdAt)}</span>
                <span>{lead.chatSession?.sessionId ?? "-"}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </main>
  );
}

export default AdminLeadsPage;
