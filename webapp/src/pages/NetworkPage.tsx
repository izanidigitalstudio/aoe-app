import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import {
  Search, UserPlus, MessageCircle, Clock, X, Check,
  MapPin, ArrowLeft, Send, Users as UsersIcon,
  Briefcase, CheckCircle, Globe, Mail, Phone, Linkedin,
} from "lucide-react";
import { api } from "../../convex/_generated/api";
import { colors } from "../theme";
import { useDemoContext } from "../App";

type Tab = "discover" | "connections" | "messages";

const INDUSTRIES = [
  "All", "Agriculture", "Fintech", "Healthcare", "Energy",
  "Education", "Logistics", "Construction", "Cybersecurity",
  "Venture Capital", "Creative & Media", "Other",
];

export default function NetworkPage() {
  const { isDemo, exitDemo } = useDemoContext();
  const [tab, setTab] = useState<Tab>("discover");
  const [search, setSearch] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("All");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [chatMember, setChatMember] = useState<any>(null);
  const [chatConvoId, setChatConvoId] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const members = useQuery(api.users.listMembers, {});
  const connections = useQuery(api.connections.getMyConnections);
  const currentUser = useQuery(api.users.getCurrentUser);
  const conversations = useQuery(api.messaging.getMyConversations);
  const chatMessages = useQuery(
    api.messaging.getMessages,
    chatConvoId ? { conversationId: chatConvoId } : "skip"
  );

  const sendRequest = useMutation(api.connections.sendRequest);
  const respondToRequest = useMutation(api.connections.respondToRequest);
  const getOrCreateConvo = useMutation(api.messaging.getOrCreateConversation);
  const sendMsg = useMutation(api.messaging.sendMessage);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const connectedIds = new Set(connections?.filter(c => c.status === "accepted").map(c => c.userId) || []);
  const pendingIds = new Set(connections?.filter(c => c.status === "pending").map(c => c.userId) || []);

  const filteredMembers = members?.filter((m) => {
    if (m._id === currentUser?._id) return false;
    const s = search.toLowerCase();
    const matchSearch = !search || m.name?.toLowerCase().includes(s) || m.company?.toLowerCase().includes(s) || m.country?.toLowerCase().includes(s) || m.industry?.toLowerCase().includes(s);
    const matchIndustry = filterIndustry === "All" || m.industry === filterIndustry;
    return matchSearch && matchIndustry;
  });

  const pendingIncoming = connections?.filter(c => c.status === "pending" && c.isIncoming);
  const acceptedConnections = connections?.filter(c => c.status === "accepted");

  const demoGuard = (action: string) => {
    if (isDemo) { if (confirm(`Create an account to ${action}. Sign up?`)) exitDemo(); return true; }
    return false;
  };

  const handleConnect = async (userId: any) => {
    if (demoGuard("connect with members")) return;
    try { await sendRequest({ toUserId: userId }); } catch (e: any) { alert(e.message); }
  };

  const handleRespond = async (connId: any, accept: boolean) => {
    if (demoGuard("manage connections")) return;
    try { await respondToRequest({ connectionId: connId, accept }); } catch (e: any) { alert(e.message); }
  };

  const handleMessage = async (member: any) => {
    if (demoGuard("message members")) return;
    try {
      const convoId = await getOrCreateConvo({ otherUserId: member._id || member.userId });
      setChatConvoId(convoId);
      setChatMember(member);
    } catch (e: any) { alert(e.message); }
  };

  const handleSend = async () => {
    if (!messageText.trim() || !chatConvoId) return;
    try { await sendMsg({ conversationId: chatConvoId, content: messageText.trim() }); setMessageText(""); }
    catch (e: any) { alert(e.message); }
  };

  const getStatus = (id: string) => connectedIds.has(id as any) ? "connected" : pendingIds.has(id as any) ? "pending" : "none";

  const formatTime = (ts: number) => {
    const d = Date.now() - ts;
    if (d < 60000) return "Now";
    if (d < 3600000) return `${Math.floor(d / 60000)}m`;
    if (d < 86400000) return `${Math.floor(d / 3600000)}h`;
    return `${Math.floor(d / 86400000)}d`;
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Network</h1>
        <p style={{ fontSize: 14, color: colors.primary, fontWeight: 600, marginTop: 4 }}>{members?.length || 0} Entrepreneurs</p>
      </div>

      {/* Tabs */}
      <div className="tab-row">
        {(["discover", "connections", "messages"] as Tab[]).map((t) => (
          <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t === "discover" ? "Discover" : t === "connections" ? `Connections${pendingIncoming?.length ? ` (${pendingIncoming.length})` : ""}` : "Messages"}
          </button>
        ))}
      </div>

      {/* Discover Tab */}
      {tab === "discover" && (
        <>
          <div className="search-box" style={{ marginBottom: 12 }}>
            <Search size={18} />
            <input placeholder="Search name, company, country..." value={search} onChange={(e) => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch("")} style={{ color: colors.textMuted }}><X size={16} /></button>}
          </div>
          <div className="chip-row" style={{ marginBottom: 16 }}>
            {INDUSTRIES.map((ind) => (
              <button key={ind} className={`chip ${filterIndustry === ind ? "active" : ""}`} onClick={() => setFilterIndustry(ind)}>{ind}</button>
            ))}
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {filteredMembers?.map((m) => {
              const st = getStatus(m._id);
              return (
                <div key={m._id} className="member-card" onClick={() => setSelectedMember(m)}>
                  {m.image ? <img src={m.image} className="member-avatar" alt="" /> : <div className="member-avatar-fallback">{(m.name || "A").charAt(0)}</div>}
                  <div className="member-info">
                    <div className="member-name">{m.name || "Anonymous"}</div>
                    <div className="member-role">{m.role}{m.company ? ` at ${m.company}` : ""}</div>
                    <div className="member-meta">
                      {m.country && <span className="member-meta-chip"><MapPin size={10} /> {m.city ? `${m.city}, ` : ""}{m.country}</span>}
                      {m.industry && <span className="member-meta-chip" style={{ background: colors.accent + "20", color: colors.accentLight }}>{m.industry}</span>}
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    {st === "connected" ? (
                      <button style={{ width: 40, height: 40, borderRadius: "50%", background: colors.primary + "20", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => handleMessage(m)}>
                        <MessageCircle size={16} color={colors.primary} />
                      </button>
                    ) : st === "pending" ? (
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: colors.warning + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Clock size={14} color={colors.warning} />
                      </div>
                    ) : (
                      <button style={{ width: 40, height: 40, borderRadius: "50%", border: `1.5px solid ${colors.primary}`, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent" }} onClick={() => handleConnect(m._id)}>
                        <UserPlus size={14} color={colors.primary} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {(!filteredMembers || filteredMembers.length === 0) && (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <Search size={48} color={colors.textMuted} style={{ margin: "0 auto 16px" }} />
                <div style={{ fontSize: 18, fontWeight: 600, color: colors.textSecondary }}>No members found</div>
                <div style={{ fontSize: 14, color: colors.textMuted }}>Try adjusting your search or filters</div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Connections Tab */}
      {tab === "connections" && (
        <div>
          {pendingIncoming && pendingIncoming.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                Pending Requests ({pendingIncoming.length})
              </h3>
              {pendingIncoming.map((conn) => (
                <div key={conn._id} className="member-card">
                  {conn.image ? <img src={conn.image} className="member-avatar" alt="" /> : <div className="member-avatar-fallback">{(conn.name || "A").charAt(0)}</div>}
                  <div className="member-info">
                    <div className="member-name">{conn.name}</div>
                    <div className="member-role">{conn.role}{conn.company ? ` at ${conn.company}` : ""}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={{ width: 36, height: 36, borderRadius: "50%", background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => handleRespond(conn._id, true)}><Check size={16} color="#000" /></button>
                    <button style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid ${colors.error}`, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent" }} onClick={() => handleRespond(conn._id, false)}><X size={16} color={colors.error} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <h3 style={{ fontSize: 13, fontWeight: 700, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
            Your Network ({acceptedConnections?.length ?? 0})
          </h3>
          {acceptedConnections?.map((conn) => (
            <div key={conn._id} className="member-card" onClick={() => { const m = members?.find(mm => mm._id === conn.userId); if (m) setSelectedMember(m); }}>
              {conn.image ? <img src={conn.image} className="member-avatar" alt="" /> : <div className="member-avatar-fallback">{(conn.name || "A").charAt(0)}</div>}
              <div className="member-info">
                <div className="member-name">{conn.name}</div>
                <div className="member-role">{conn.role}{conn.company ? ` at ${conn.company}` : ""}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); handleMessage(conn); }} style={{ width: 40, height: 40, borderRadius: "50%", background: colors.primary + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MessageCircle size={16} color={colors.primary} />
              </button>
            </div>
          ))}
          {(!acceptedConnections || acceptedConnections.length === 0) && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <UsersIcon size={48} color={colors.textMuted} style={{ margin: "0 auto 16px" }} />
              <div style={{ fontSize: 18, fontWeight: 600, color: colors.textSecondary }}>No connections yet</div>
              <div style={{ fontSize: 14, color: colors.textMuted }}>Start connecting with entrepreneurs in the Discover tab</div>
            </div>
          )}
        </div>
      )}

      {/* Messages Tab */}
      {tab === "messages" && (
        <div>
          {conversations?.map((convo) => (
            <div key={convo._id} className="member-card" onClick={() => {
              setChatConvoId(convo._id);
              setChatMember({ _id: convo.otherUserId, name: convo.otherUserName, image: convo.otherUserImage, company: convo.otherUserCompany, role: convo.otherUserRole });
            }}>
              {convo.otherUserImage ? <img src={convo.otherUserImage} className="member-avatar" alt="" /> : <div className="member-avatar-fallback">{(convo.otherUserName || "?").charAt(0)}</div>}
              <div className="member-info">
                <div className="member-name">{convo.otherUserName || "Unknown"}</div>
                <div className="member-role" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{convo.lastMessage || "No messages yet"}</div>
              </div>
              {convo.lastMessageAt && <span style={{ fontSize: 12, color: colors.textMuted }}>{formatTime(convo.lastMessageAt)}</span>}
            </div>
          ))}
          {(!conversations || conversations.length === 0) && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <MessageCircle size={48} color={colors.textMuted} style={{ margin: "0 auto 16px" }} />
              <div style={{ fontSize: 18, fontWeight: 600, color: colors.textSecondary }}>No messages yet</div>
              <div style={{ fontSize: 14, color: colors.textMuted }}>Connect with members and start a conversation</div>
            </div>
          )}
        </div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="modal-overlay" onClick={() => setSelectedMember(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Profile</h2>
              <button className="modal-close" onClick={() => setSelectedMember(null)}><X size={18} /></button>
            </div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              {selectedMember.image
                ? <img src={selectedMember.image} alt="" style={{ width: 100, height: 100, borderRadius: "50%", border: `3px solid ${colors.primary}`, objectFit: "cover", margin: "0 auto" }} />
                : <div style={{ width: 100, height: 100, borderRadius: "50%", background: colors.primary + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 700, color: colors.primary, margin: "0 auto" }}>{(selectedMember.name || "A").charAt(0)}</div>
              }
              <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 12 }}>{selectedMember.name}</h2>
              <p style={{ color: colors.textSecondary, marginTop: 4 }}>{selectedMember.role}{selectedMember.company ? ` at ${selectedMember.company}` : ""}</p>
              {selectedMember.country && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 8 }}>
                  <MapPin size={14} color={colors.primary} />
                  <span style={{ color: colors.primary, fontSize: 14 }}>{selectedMember.city ? `${selectedMember.city}, ` : ""}{selectedMember.country}</span>
                </div>
              )}
              {selectedMember.industry && (
                <span className="badge" style={{ background: colors.accent + "25", color: colors.accentLight, marginTop: 8, display: "inline-block" }}>{selectedMember.industry}</span>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {getStatus(selectedMember._id) === "connected" ? (
                <>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 12, borderRadius: 12, border: `1px solid ${colors.success}`, background: colors.success + "10" }}>
                    <CheckCircle size={18} color={colors.success} />
                    <span style={{ color: colors.success, fontWeight: 600 }}>Connected</span>
                  </div>
                  <button className="btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => { setSelectedMember(null); handleMessage(selectedMember); }}>
                    <MessageCircle size={18} /> Message
                  </button>
                </>
              ) : getStatus(selectedMember._id) === "pending" ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 12, borderRadius: 12, border: `1px solid ${colors.warning}` }}>
                  <Clock size={18} color={colors.warning} /><span style={{ color: colors.warning, fontWeight: 600 }}>Pending</span>
                </div>
              ) : (
                <button className="btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => handleConnect(selectedMember._id)}>
                  <UserPlus size={18} /> Connect
                </button>
              )}
            </div>

            {selectedMember.bio && <div className="card" style={{ marginBottom: 12 }}><h4 style={{ fontWeight: 700, marginBottom: 6 }}>About</h4><p style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 1.5 }}>{selectedMember.bio}</p></div>}
            {selectedMember.achievements && <div className="card" style={{ marginBottom: 12 }}><h4 style={{ fontWeight: 700, marginBottom: 6 }}>Achievements</h4><p style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 1.5 }}>{selectedMember.achievements}</p></div>}
            {selectedMember.skills?.length > 0 && (
              <div className="card" style={{ marginBottom: 12 }}>
                <h4 style={{ fontWeight: 700, marginBottom: 8 }}>Expertise</h4>
                <div className="chip-row">
                  {selectedMember.skills.map((s: string, i: number) => <span key={i} className="badge" style={{ background: colors.primary + "15", color: colors.primary }}>{s}</span>)}
                </div>
              </div>
            )}

            <div className="card">
              <h4 style={{ fontWeight: 700, marginBottom: 8 }}>Contact</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {selectedMember.contactEmail && <a href={`mailto:${selectedMember.contactEmail}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: colors.textSecondary }}><Mail size={16} color={colors.primary} /> {selectedMember.contactEmail}</a>}
                {selectedMember.contactPhone && <a href={`tel:${selectedMember.contactPhone}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: colors.textSecondary }}><Phone size={16} color={colors.primary} /> {selectedMember.contactPhone}</a>}
                {selectedMember.linkedIn && <a href={`https://${selectedMember.linkedIn}`} target="_blank" rel="noopener" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: colors.textSecondary }}><Linkedin size={16} color="#0A66C2" /> {selectedMember.linkedIn}</a>}
                {selectedMember.website && <a href={`https://${selectedMember.website}`} target="_blank" rel="noopener" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: colors.textSecondary }}><Globe size={16} color={colors.primary} /> {selectedMember.website}</a>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {chatMember && (
        <div className="modal-overlay" onClick={() => { setChatMember(null); setChatConvoId(null); }}>
          <div className="modal-content" style={{ display: "flex", flexDirection: "column", height: "80vh", padding: 0 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: `1px solid ${colors.border}` }}>
              <button onClick={() => { setChatMember(null); setChatConvoId(null); }} style={{ color: colors.text }}><ArrowLeft size={22} /></button>
              {(chatMember.image || chatMember.otherUserImage) ? <img src={chatMember.image || chatMember.otherUserImage} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} alt="" /> : <div className="member-avatar-fallback" style={{ width: 36, height: 36, fontSize: 14 }}>{((chatMember.name || chatMember.otherUserName || "?").charAt(0))}</div>}
              <div><div style={{ fontWeight: 700 }}>{chatMember.name || chatMember.otherUserName}</div><div style={{ fontSize: 12, color: colors.textSecondary }}>{chatMember.role || ""}</div></div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
              {(!chatMessages || chatMessages.length === 0) && (
                <div style={{ textAlign: "center", padding: "40px 0", color: colors.textMuted }}>
                  <MessageCircle size={48} style={{ margin: "0 auto 12px" }} />
                  <div style={{ fontWeight: 600 }}>Start the conversation</div>
                </div>
              )}
              {chatMessages?.map((msg) => (
                <div key={msg._id} style={{
                  maxWidth: "75%", padding: 12, borderRadius: 16, marginBottom: 8,
                  marginLeft: msg.isMine ? "auto" : 0,
                  background: msg.isMine ? colors.primary : colors.surface,
                  border: msg.isMine ? "none" : `1px solid ${colors.border}`,
                  borderBottomRightRadius: msg.isMine ? 4 : 16,
                  borderBottomLeftRadius: msg.isMine ? 16 : 4,
                }}>
                  <div style={{ fontSize: 14, color: msg.isMine ? "#000" : colors.text, lineHeight: 1.4 }}>{msg.content}</div>
                  <div style={{ fontSize: 9, color: msg.isMine ? "rgba(0,0,0,.5)" : colors.textMuted, marginTop: 4, textAlign: "right" }}>
                    {new Date(msg._creationTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div style={{ display: "flex", gap: 8, padding: "12px 20px", borderTop: `1px solid ${colors.border}` }}>
              <input
                className="input"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                style={{ flex: 1 }}
              />
              <button
                style={{ width: 40, height: 40, borderRadius: "50%", background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", opacity: messageText.trim() ? 1 : .4 }}
                onClick={handleSend}
                disabled={!messageText.trim()}
              >
                <Send size={18} color="#000" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
