import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  generateLeadInsights,
  getLeadById,
  type LeadDetail,
  type LeadStatus,
  updateLeadFinance,
  updateLeadNotes,
  updateLeadStatus,
  updateLeadTestDrive,
} from "../api/client";

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
    return "insight-score-hot";
  }

  if (score >= 40) {
    return "insight-score-warm";
  }

  return "insight-score-cold";
}

function getOptionalValue(value: string | null | undefined) {
  return value?.trim() ? value : "-";
}

function AdminLeadDetailPage() {
  const { id } = useParams();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [status, setStatus] = useState<LeadStatus>("NEW");
  const [notes, setNotes] = useState("");
  const [testDriveRequested, setTestDriveRequested] = useState(false);
  const [preferredTestDriveDate, setPreferredTestDriveDate] = useState("");
  const [preferredTestDriveTime, setPreferredTestDriveTime] = useState("");
  const [testDriveLocation, setTestDriveLocation] = useState("");
  const [financeAssistanceRequested, setFinanceAssistanceRequested] = useState(false);
  const [monthlyIncomeRange, setMonthlyIncomeRange] = useState("");
  const [downPaymentBudget, setDownPaymentBudget] = useState("");
  const [loanTenurePreference, setLoanTenurePreference] = useState("");
  const [emiBudget, setEmiBudget] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [testDriveError, setTestDriveError] = useState("");
  const [testDriveSuccess, setTestDriveSuccess] = useState("");
  const [testDriveLoading, setTestDriveLoading] = useState(false);
  const [financeError, setFinanceError] = useState("");
  const [financeSuccess, setFinanceSuccess] = useState("");
  const [financeLoading, setFinanceLoading] = useState(false);
  const [insightError, setInsightError] = useState("");
  const [insightSuccess, setInsightSuccess] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);

  function syncFormState(nextLead: LeadDetail) {
    setStatus(nextLead.status);
    setNotes(nextLead.notes ?? "");
    setTestDriveRequested(nextLead.testDriveRequested);
    setPreferredTestDriveDate(nextLead.preferredTestDriveDate ?? "");
    setPreferredTestDriveTime(nextLead.preferredTestDriveTime ?? "");
    setTestDriveLocation(nextLead.testDriveLocation ?? "");
    setFinanceAssistanceRequested(nextLead.financeAssistanceRequested);
    setMonthlyIncomeRange(nextLead.monthlyIncomeRange ?? "");
    setDownPaymentBudget(nextLead.downPaymentBudget ?? "");
    setLoanTenurePreference(nextLead.loanTenurePreference ?? "");
    setEmiBudget(nextLead.emiBudget ?? "");
  }

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
          syncFormState(response.lead);
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
      syncFormState(response.lead);
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
      syncFormState(response.lead);
      setSaveSuccess("Notes updated.");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to update notes");
    }
  }

  async function handleTestDriveSave() {
    if (!id) {
      return;
    }

    setTestDriveError("");
    setTestDriveSuccess("");
    setTestDriveLoading(true);

    try {
      const response = await updateLeadTestDrive(id, {
        testDriveRequested,
        ...(preferredTestDriveDate.trim() ? { preferredTestDriveDate: preferredTestDriveDate.trim() } : {}),
        ...(preferredTestDriveTime.trim() ? { preferredTestDriveTime: preferredTestDriveTime.trim() } : {}),
        ...(testDriveLocation.trim() ? { testDriveLocation: testDriveLocation.trim() } : {}),
      });
      setLead(response.lead);
      syncFormState(response.lead);
      setTestDriveSuccess("Test drive details updated.");
    } catch (error) {
      setTestDriveError(error instanceof Error ? error.message : "Failed to update test drive details");
    } finally {
      setTestDriveLoading(false);
    }
  }

  async function handleFinanceSave() {
    if (!id) {
      return;
    }

    setFinanceError("");
    setFinanceSuccess("");
    setFinanceLoading(true);

    try {
      const response = await updateLeadFinance(id, {
        financeAssistanceRequested,
        ...(monthlyIncomeRange.trim() ? { monthlyIncomeRange: monthlyIncomeRange.trim() } : {}),
        ...(downPaymentBudget.trim() ? { downPaymentBudget: downPaymentBudget.trim() } : {}),
        ...(loanTenurePreference.trim() ? { loanTenurePreference: loanTenurePreference.trim() } : {}),
        ...(emiBudget.trim() ? { emiBudget: emiBudget.trim() } : {}),
      });
      setLead(response.lead);
      syncFormState(response.lead);
      setFinanceSuccess("Finance details updated.");
    } catch (error) {
      setFinanceError(error instanceof Error ? error.message : "Failed to update finance details");
    } finally {
      setFinanceLoading(false);
    }
  }

  async function handleGenerateInsights() {
    if (!id) {
      return;
    }

    setSaveError("");
    setSaveSuccess("");
    setInsightError("");
    setInsightSuccess("");
    setInsightLoading(true);

    try {
      const response = await generateLeadInsights(id);
      setLead(response.lead);
      syncFormState(response.lead);
      setInsightSuccess("Insights generated.");
    } catch (error) {
      setInsightError(error instanceof Error ? error.message : "Failed to generate insights");
    } finally {
      setInsightLoading(false);
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
              <dt>Test drive</dt>
              <dd>{lead.testDriveRequested ? "Requested" : "Not requested"}</dd>
            </div>
            <div>
              <dt>Test drive date</dt>
              <dd>{getOptionalValue(lead.preferredTestDriveDate)}</dd>
            </div>
            <div>
              <dt>Test drive time</dt>
              <dd>{getOptionalValue(lead.preferredTestDriveTime)}</dd>
            </div>
            <div>
              <dt>Test drive location</dt>
              <dd>{getOptionalValue(lead.testDriveLocation)}</dd>
            </div>
            <div>
              <dt>Finance assistance</dt>
              <dd>{lead.financeAssistanceRequested ? "Requested" : "Not requested"}</dd>
            </div>
            <div>
              <dt>Monthly income range</dt>
              <dd>{getOptionalValue(lead.monthlyIncomeRange)}</dd>
            </div>
            <div>
              <dt>Down payment budget</dt>
              <dd>{getOptionalValue(lead.downPaymentBudget)}</dd>
            </div>
            <div>
              <dt>Loan tenure preference</dt>
              <dd>{getOptionalValue(lead.loanTenurePreference)}</dd>
            </div>
            <div>
              <dt>EMI budget</dt>
              <dd>{getOptionalValue(lead.emiBudget)}</dd>
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
          <h2>Lead insights</h2>
          <div className="insight-summary">
            <div className="insight-score-row">
              <span className={`insight-score-label ${getLeadScoreTone(lead.leadScore)}`}>
                {getLeadScoreLabel(lead.leadScore)}
              </span>
              <span className="insight-score-value">
                {lead.leadScore != null ? `${lead.leadScore}/100` : "No score yet"}
              </span>
            </div>
            <p className="insight-text">{lead.chatSummary || "Generate insights to create a short chat summary."}</p>
            <p className="insight-reason">
              {lead.leadScoreReason || "Generate insights to see the score breakdown."}
            </p>
          </div>
          <div className="insight-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => void handleGenerateInsights()}
              disabled={insightLoading}
            >
              {insightLoading ? "Generating..." : "Generate insights"}
            </button>
          </div>
          {insightError ? <div className="alert alert-error">{insightError}</div> : null}
          {insightSuccess ? <div className="alert alert-success">{insightSuccess}</div> : null}

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

      <section className="detail-grid">
        <div className="detail-card">
          <h2>Update test drive</h2>
          <div className="stack">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={testDriveRequested}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setTestDriveRequested(checked);
                  if (!checked) {
                    setPreferredTestDriveDate("");
                    setPreferredTestDriveTime("");
                    setTestDriveLocation("");
                  }
                }}
              />
              <span>Test drive requested</span>
            </label>
            <label>
              <span>Preferred date</span>
              <input
                value={preferredTestDriveDate}
                onChange={(event) => setPreferredTestDriveDate(event.target.value)}
                type="date"
              />
            </label>
            <label>
              <span>Preferred time</span>
              <input
                value={preferredTestDriveTime}
                onChange={(event) => setPreferredTestDriveTime(event.target.value)}
                type="text"
                placeholder="Morning"
              />
            </label>
            <label>
              <span>Location / showroom / city</span>
              <input
                value={testDriveLocation}
                onChange={(event) => setTestDriveLocation(event.target.value)}
                type="text"
                placeholder="Hyderabad showroom"
              />
            </label>
            <button type="button" className="primary-button" onClick={() => void handleTestDriveSave()} disabled={testDriveLoading}>
              {testDriveLoading ? "Saving..." : "Save test drive"}
            </button>
            {testDriveError ? <div className="alert alert-error">{testDriveError}</div> : null}
            {testDriveSuccess ? <div className="alert alert-success">{testDriveSuccess}</div> : null}
          </div>
        </div>

        <div className="detail-card">
          <h2>Update finance</h2>
          <div className="stack">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={financeAssistanceRequested}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setFinanceAssistanceRequested(checked);
                  if (!checked) {
                    setMonthlyIncomeRange("");
                    setDownPaymentBudget("");
                    setLoanTenurePreference("");
                    setEmiBudget("");
                  }
                }}
              />
              <span>Finance assistance requested</span>
            </label>
            <label>
              <span>Monthly income range</span>
              <input
                value={monthlyIncomeRange}
                onChange={(event) => setMonthlyIncomeRange(event.target.value)}
                type="text"
                placeholder="1-2 lakh"
              />
            </label>
            <label>
              <span>Down payment budget</span>
              <input
                value={downPaymentBudget}
                onChange={(event) => setDownPaymentBudget(event.target.value)}
                type="text"
                placeholder="5 lakh"
              />
            </label>
            <label>
              <span>Loan tenure preference</span>
              <input
                value={loanTenurePreference}
                onChange={(event) => setLoanTenurePreference(event.target.value)}
                type="text"
                placeholder="5 years"
              />
            </label>
            <label>
              <span>EMI budget</span>
              <input
                value={emiBudget}
                onChange={(event) => setEmiBudget(event.target.value)}
                type="text"
                placeholder="30000"
              />
            </label>
            <button type="button" className="primary-button" onClick={() => void handleFinanceSave()} disabled={financeLoading}>
              {financeLoading ? "Saving..." : "Save finance"}
            </button>
            {financeError ? <div className="alert alert-error">{financeError}</div> : null}
            {financeSuccess ? <div className="alert alert-success">{financeSuccess}</div> : null}
          </div>
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
