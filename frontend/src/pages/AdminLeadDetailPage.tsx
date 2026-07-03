import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLeadById, type LeadDetail, type LeadStatus, updateLeadNotes, updateLeadStatus } from "../api/client";

const STATUS_OPTIONS: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "TEST_DRIVE_SCHEDULED",
  "CONVERTED",
  "LOST",
];

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function AdminLeadDetailPage() {
  const { id } = useParams();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [status, setStatus] = useState<LeadStatus>("NEW");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadLead() {
      if (!id) {
        setError("Lead not found");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await getLeadById(id);
        if (!cancelled) {
          setLead(response.lead);
          setStatus(response.lead.status);
          setNotes(response.lead.notes ?? "");
        }
      } catch (error) {
        if (!cancelled) {
          setError(error instanceof Error ? error.message : "Failed to load lead");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadLead();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleStatusSave() {
    if (!id) {
      return;
    }

    setSaveError("");
    setSaveSuccess("");

    try {
      const response = await updateLeadStatus(id, status);
      setLead(response.lead);
      setSaveSuccess("Status updated.");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to update status");
    }
  }

  async function handleNotesSave() {
    if (!id) {
      return;
    }

    setSaveError("");
    setSaveSuccess("");

    try {
      const response = await updateLeadNotes(id, notes);
      setLead(response.lead);
      setSaveSuccess("Notes updated.");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to update notes");
    }
  }

  if (isLoading) {
    return <main className="admin-card">Loading lead...</main>;
  }

  if (error || !lead) {
    return (
      <main className="admin-card">
        <div className="empty-state">{error || "Lead not found"}</div>
        <Link className="secondary-link" to="/admin/leads">
          Back to leads
        </Link>
      </main>
    );
  }

  return (
    <main className="admin-card">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">Lead detail</p>
          <h1>{lead.name || "Unknown lead"}</h1>
          <p className="subcopy">Review the lead details, recent chat history, and update follow-up status.</p>
        </div>
        <Link className="secondary-link" to="/admin/leads">
          Back to leads
        </Link>
      </div>

      <section className="detail-grid">
        <div className="detail-card">
          <h2>Lead details</h2>
          <dl className="detail-list">
            <div>
              <dt>Phone</dt>
              <dd>{lead.phone || "-"}</dd>
            </div>
            <div>
              <dt>City</dt>
              <dd>{lead.city || "-"}</dd>
            </div>
            <div>
              <dt>Interested model</dt>
              <dd>{lead.interestedModel || "-"}</dd>
            </div>
            <div>
              <dt>Budget</dt>
              <dd>{lead.budget || "-"}</dd>
            </div>
            <div>
              <dt>Purchase timeline</dt>
              <dd>{lead.purchaseTimeline || "-"}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <span className={`status-badge status-${lead.status.toLowerCase()}`}>{lead.status}</span>
              </dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{formatDate(lead.createdAt)}</dd>
            </div>
            <div>
              <dt>Session</dt>
              <dd>{lead.chatSession?.sessionId ?? "-"}</dd>
            </div>
          </dl>
        </div>

        <div className="detail-card">
          <h2>Update status</h2>
          <div className="stack">
            <select value={status} onChange={(event) => setStatus(event.target.value as LeadStatus)}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <button type="button" className="primary-button" onClick={() => void handleStatusSave()}>
              Save status
            </button>
          </div>

          <h2>Update notes</h2>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} />
          <button type="button" className="primary-button" onClick={() => void handleNotesSave()}>
            Save notes
          </button>

          {saveError ? <div className="alert alert-error">{saveError}</div> : null}
          {saveSuccess ? <div className="alert alert-success">{saveSuccess}</div> : null}
        </div>
      </section>

      <section className="detail-card">
        <h2>Recent chat messages</h2>
        {lead.chatSession?.messages?.length ? (
          <div className="chat-history">
            {lead.chatSession.messages.map((message) => (
              <article key={message.id} className="history-item">
                <div className="history-meta">
                  <strong>{message.role}</strong>
                  <span>{formatDate(message.createdAt)}</span>
                </div>
                <p>{message.message}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">No chat messages available.</div>
        )}
      </section>
    </main>
  );
}

export default AdminLeadDetailPage;
