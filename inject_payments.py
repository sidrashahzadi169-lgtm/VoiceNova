import re

with open('d:/VoiceNova/04-frontend/src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix mock payments state to real state
mock_payments = '''  const [payments, setPayments] = useState<AdminPayment[]>([
    { invoice: "INV-2026-006", client: "Sidra Rehman", date: "June 15, 2026", amt: ".00 USD", gateway: "Stripe", status: "Paid" },
    { invoice: "INV-2026-005", client: "Sarah Jenkins", date: "June 12, 2026", amt: ".00 USD", gateway: "Stripe", status: "Paid" },
    { invoice: "INV-2026-004", client: "Omar Farooq", date: "June 10, 2026", amt: ".00 USD", gateway: "PayPal", status: "Refund Pending" },
  ]);'''
content = content.replace(mock_payments, "const [payments, setPayments] = useState<any[]>([]);")

# Add fetch payments inside loadAdminData
fetch_users = '''// Fetch users
            const usersRes = await fetch("https://voice-nova-sooty.vercel.app/api/admin/users", {
              headers: { "Authorization": "Bearer " + sessionData.token }
            });
            if (usersRes.ok) {
              const data = await usersRes.json();
              if (data.success) setUsers(data.data.users);
            }'''
            
fetch_payments = '''// Fetch users
            const usersRes = await fetch("https://voice-nova-sooty.vercel.app/api/admin/users", {
              headers: { "Authorization": "Bearer " + sessionData.token }
            });
            if (usersRes.ok) {
              const data = await usersRes.json();
              if (data.success) setUsers(data.data.users);
            }
            // Fetch Payments
            const payRes = await fetch("https://voice-nova-sooty.vercel.app/api/admin/payments", {
              headers: { "Authorization": "Bearer " + sessionData.token }
            });
            if (payRes.ok) {
              const payData = await payRes.json();
              if (payData.success) setPayments(payData.data);
            }'''
content = content.replace(fetch_users, fetch_payments)

# Fix approve logic
approve_refund = '''// Refund Payments
  const handleApproveRefund = (invoiceId: string) => {
    if (confirm("Approve and trigger refund transaction for invoice?")) {
      setPayments((prev) =>
        prev.map((p) => (p.invoice === invoiceId ? { ...p, status: "Refunded" } : p))
      );
      showToast("Refund transaction successfully approved!");
    }
  };'''
  
approve_new = '''// Approve Payments
  const handleApprovePayment = async (id: string) => {
    if (confirm("Verify TID and approve this payment? This will upgrade the user.")) {
      try {
        const res = await fetch("https://voice-nova-sooty.vercel.app/api/admin/payments/" + id + "/approve", {
          method: "PUT",
          headers: { "Authorization": "Bearer " + sessionToken }
        });
        if (res.ok) {
          setPayments(prev => prev.map(p => p.id === id ? { ...p, status: "Paid" } : p));
          showToast("Payment Approved!");
        } else {
          showToast("Failed to approve payment", "error");
        }
      } catch(e) {
        showToast("Network error", "error");
      }
    }
  };'''
content = content.replace(approve_refund, approve_new)

# Fix Payments Table Render
table_old = '''{payments.map((p, idx) => (
                        <tr key={idx}>
                          <td><strong>{p.invoice}</strong></td>
                          <td>{p.client}</td>
                          <td>{p.date}</td>
                          <td>{p.amt}</td>
                          <td>{p.gateway}</td>
                          <td><span className="status-pill status-pill-success">{p.status}</span></td>
                          <td>
                            {p.status === "Refund Pending" ? (
                              <button className="btn btn-outline btn-xs" onClick={() => handleApproveRefund(p.invoice)}>Approve Refund</button>
                            ) : (
                              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>None</span>
                            )}
                          </td>
                        </tr>
                      ))}'''

table_new = '''{payments.map((p, idx) => (
                        <tr key={idx}>
                          <td><strong>{p.transactionId}</strong></td>
                          <td>{p.user?.name || "Unknown"}</td>
                          <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                          <td> {p.currency}</td>
                          <td>{p.provider}</td>
                          <td><span className={status-pill }>{p.status}</span></td>
                          <td>
                            {p.status === "Pending" ? (
                              <button className="btn btn-primary btn-xs" onClick={() => handleApprovePayment(p.id)}>Approve</button>
                            ) : (
                              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Processed</span>
                            )}
                          </td>
                        </tr>
                      ))}'''
content = content.replace(table_old, table_new)

with open('d:/VoiceNova/04-frontend/src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Payments table wired!")
