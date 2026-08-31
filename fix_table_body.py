import re

with open('d:/VoiceNova/04-frontend/src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# I will find the exact table body and replace it.
body_start = content.find("<tbody>", content.find("TAB 4: PAYMENTS"))
body_end = content.find("</tbody>", body_start)

if body_start != -1 and body_end != -1:
    old_body = content[body_start + 7:body_end]
    new_body = '''
                      {payments.map((p, idx) => (
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
                      ))}
                    '''
    content = content[:body_start + 7] + new_body + content[body_end:]

    with open('d:/VoiceNova/04-frontend/src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Table body replaced successfully.")
else:
    print("Could not find table body.")
