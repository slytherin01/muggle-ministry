/* Shared Supabase persistence for every Forumotion helpdesk ticket.
 * Forumotion remains the source of truth for topic content; Supabase stores
 * durable workflow metadata and its audit trail. Uses the authenticated client
 * already initialized by tool/index.html. Never embeds a service-role key.
 */
(function (window) {
  "use strict";
  const TABLE = "helpdesk_ticket_metadata";
  const EVENTS = "helpdesk_ticket_events";
  const LOCAL_KEY = "hm_ticket_internal_v2";

  function client() {
    const db = window.hpmwSupabase;
    if (!db) throw new Error("Supabase is nog niet beschikbaar.");
    return db;
  }
  function key(ticket) {
    const forumId = Number(ticket.openForumId || ticket.forumId);
    const topicId = String(ticket.id || "");
    if (!Number.isInteger(forumId) || forumId <= 0 || !/^\d+$/.test(topicId)) {
      throw new Error("Ticket mist een geldig Forumotion-forum- of topicnummer.");
    }
    return forumId + ":" + topicId;
  }
  function readLocal() {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}"); }
    catch (_) { return {}; }
  }
  function writeLocal(value) {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(value)); } catch (_) {}
  }
  function toInternal(row) {
    return {
      status: row.status || "pending",
      priority: row.priority || "normal",
      assignee: row.assignee_forumotion_user_id == null ? "" : String(row.assignee_forumotion_user_id),
      assigneeName: row.assignee_name || "",
      department: row.department || "",
      internalNote: row.internal_note || "",
      createdAt: row.created_at ? new Date(row.created_at).getTime() : 0,
      readAt: 0,
      refusedReason: row.internal_note || ""
    };
  }
  async function sync(tickets) {
    if (!tickets || !tickets.length) return { synced: 0, created: 0 };
    const db = client();
    const ids = Array.from(new Set(tickets.map(t => String(t.id)).filter(x => /^\d+$/.test(x))));
    if (!ids.length) return { synced: 0, created: 0 };
    const { data, error } = await db.from(TABLE)
      .select("ticket_key,forumotion_topic_id,forumotion_forum_id,ticket_number,subject,category,department,status,priority,assignee_forumotion_user_id,assignee_name,internal_note,created_by_forumotion_user_id,created_by_name,created_at,updated_at")
      .in("forumotion_topic_id", ids);
    if (error) throw error;
    const existing = new Map((data || []).map(row => [String(row.forumotion_topic_id), row]));
    const local = readLocal();
    const missing = [];
    for (const ticket of tickets) {
      const row = existing.get(String(ticket.id));
      if (row) {
        local[ticket.id] = Object.assign({}, local[ticket.id] || {}, toInternal(row));
      } else {
        const prior = local[ticket.id] || {};
        const assigneeId = prior.assignee ? Number(prior.assignee) : null;
        missing.push({
          ticket_key: key(ticket),
          forumotion_topic_id: String(ticket.id),
          forumotion_forum_id: Number(ticket.openForumId || ticket.forumId),
          ticket_number: String(ticket.num || ""),
          subject: String(ticket.title || ""),
          category: String(ticket.cat || ""),
          department: String(prior.department || ticket.department || ""),
          status: prior.status || (ticket.closed ? "done" : "pending"),
          priority: prior.priority || "normal",
          assignee_forumotion_user_id: assigneeId,
          assignee_name: prior.assigneeName || (assigneeId === 1 ? "Joost" : assigneeId === 3 ? "Test Account 2" : null),
          internal_note: String(prior.internalNote || prior.refusedReason || ""),
          created_by_forumotion_user_id: Number(ticket.userId) || null,
          created_by_name: String(ticket.user || "")
        });
        local[ticket.id] = Object.assign({ status: "pending", assignee: "", createdAt: Date.now(), readAt: 0 }, local[ticket.id] || {});
      }
    }
    writeLocal(local);
    if (missing.length) {
      const { error: insertError } = await db.from(TABLE).upsert(missing, { onConflict: "forumotion_topic_id", ignoreDuplicates: true });
      if (insertError) throw insertError;
      const { data: inserted, error: reloadError } = await db.from(TABLE)
        .select("forumotion_topic_id,status,priority,assignee_forumotion_user_id,assignee_name,department,internal_note,created_at")
        .in("forumotion_topic_id", missing.map(row => row.forumotion_topic_id));
      if (reloadError) throw reloadError;
      for (const row of inserted || []) local[row.forumotion_topic_id] = Object.assign({}, local[row.forumotion_topic_id] || {}, toInternal(row));
      writeLocal(local);
      for (const row of missing) {
        const { data: insertedRow } = await db.from(TABLE).select("ticket_key").eq("forumotion_topic_id", row.forumotion_topic_id).maybeSingle();
        if (insertedRow) {
          await db.from(EVENTS).insert({ ticket_key: insertedRow.ticket_key, event_type: "created", event_data: { source: "forumotion_ticket_sync" } });
        }
      }
    }
    return { synced: tickets.length, created: missing.length };
  }
  async function save(ticket, internal) {
    const db = client();
    const topicId = String(ticket.id || "");
    const { data: oldRow, error: oldError } = await db.from(TABLE)
      .select("ticket_key,forumotion_forum_id,status,priority,assignee_forumotion_user_id,assignee_name,department,internal_note")
      .eq("forumotion_topic_id", topicId).maybeSingle();
    if (oldError) throw oldError;
    const forumId = Number(oldRow?.forumotion_forum_id || ticket.openForumId || ticket.forumId);
    const assigneeId = internal.assignee ? Number(internal.assignee) : null;
    const row = {
      ticket_key: oldRow?.ticket_key || key(Object.assign({}, ticket, { openForumId: forumId })),
      forumotion_topic_id: topicId,
      forumotion_forum_id: forumId,
      ticket_number: String(ticket.num || ""),
      subject: String(ticket.title || ""),
      category: String(ticket.cat || ""),
      department: String(internal.department || ticket.department || oldRow?.department || ""),
      status: internal.status || oldRow?.status || "pending",
      priority: internal.priority || oldRow?.priority || "normal",
      assignee_forumotion_user_id: assigneeId,
      assignee_name: internal.assigneeName || (assigneeId === 1 ? "Joost" : assigneeId === 3 ? "Test Account 2" : "") || null,
      internal_note: String(internal.internalNote || internal.refusedReason || oldRow?.internal_note || ""),
      created_by_forumotion_user_id: Number(ticket.userId) || null,
      created_by_name: String(ticket.user || "")
    };
    const { error } = await db.from(TABLE).upsert(row, { onConflict: "forumotion_topic_id" });
    if (error) throw error;
    const changed = [];
    if (oldRow && oldRow.status !== row.status) changed.push("status");
    if (oldRow && oldRow.priority !== row.priority) changed.push("priority");
    if (oldRow && String(oldRow.assignee_forumotion_user_id || "") !== String(row.assignee_forumotion_user_id || "")) changed.push("assignee");
    if (!oldRow) changed.push("created");
    else if (!changed.length) changed.push("metadata_updated");
    const eventType = changed.includes("created") ? "created" : changed.includes("status") ? "status_changed" : changed.includes("priority") ? "priority_changed" : changed.includes("assignee") ? "assigned" : "metadata_updated";
    const { error: eventError } = await db.from(EVENTS).insert({ ticket_key: row.ticket_key, event_type: eventType, event_data: { fields: changed } });
    if (eventError) console.warn("Ticket audit event kon niet worden opgeslagen:", eventError.message);
    return row;
  }
  window.HpmwTicketStore = Object.freeze({ sync, save });
})(window);
