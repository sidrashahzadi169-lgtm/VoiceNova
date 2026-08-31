import re

with open('d:/VoiceNova/04-frontend/src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the simple Mocks Data States with useEffect states
mock_find = '''// Mocks Data States
  const [users, setUsers] = useState<AdminUser[]>([
    { id: 1, name: "Sidra Rehman", email: "sidra.rehman@voicenova.ai", plan: "Pro Plan", registered: "July 1, 2026", status: "Active" },
    { id: 2, name: "Alex Morgan", email: "alex.morgan@example.com", plan: "Free Plan", registered: "June 30, 2026", status: "Active" },
    { id: 3, name: "Sarah Jenkins", email: "sarah.j@agency.co", plan: "Enterprise", registered: "June 28, 2026", status: "Active" },
    { id: 4, name: "Omar Farooq", email: "omar.f@domain.pk", plan: "Pro Plan", registered: "June 25, 2026", status: "Suspended" },
    { id: 5, name: "Ayesha Khan", email: "ayesha@startup.io", plan: "Starter Plan", registered: "June 20, 2026", status: "Active" },
  ]);'''

mock_repl = '''// Real Data States
  const [users, setUsers] = useState<any[]>([]);
  const [overview, setOverview] = useState({ totalUsers: 0, revenue: 0, generations: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  React.useEffect(() => {
    async function loadAdminData() {
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData.authenticated && sessionData.token) {
            setSessionToken(sessionData.token);
            
            // Fetch overview
            const overviewRes = await fetch("https://voice-nova-sooty.vercel.app/api/admin/overview", {
              headers: { "Authorization": "Bearer " + sessionData.token }
            });
            if (overviewRes.ok) {
              const data = await overviewRes.json();
              if (data.success) setOverview(data.data);
            }
            
            // Fetch users
            const usersRes = await fetch("https://voice-nova-sooty.vercel.app/api/admin/users", {
              headers: { "Authorization": "Bearer " + sessionData.token }
            });
            if (usersRes.ok) {
              const data = await usersRes.json();
              if (data.success) setUsers(data.data);
            }
          } else {
             // Not authenticated, redirect
             router.push("/login");
          }
        }
      } catch (err) {}
      setIsLoading(false);
    }
    loadAdminData();
  }, []);'''
content = content.replace(mock_find, mock_repl)

# Update Dashboard overview stats
dash_find = '''<div className="stat-card glass-panel" style={{ padding: "20px" }}>
                  <span className="stat-label">Total Registered Users</span>
                  <span className="stat-num" style={{ fontSize: "1.6rem", fontWeight: 700 }}>1,245 Users</span>
                </div>
                <div className="stat-card glass-panel" style={{ padding: "20px" }}>
                  <span className="stat-label">Total SaaS Revenue</span>
                  <span className="stat-num" style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--color-secondary)" }}>,520 USD</span>
                </div>'''

dash_repl = '''<div className="stat-card glass-panel" style={{ padding: "20px" }}>
                  <span className="stat-label">Total Registered Users</span>
                  <span className="stat-num" style={{ fontSize: "1.6rem", fontWeight: 700 }}>{overview.totalUsers} Users</span>
                </div>
                <div className="stat-card glass-panel" style={{ padding: "20px" }}>
                  <span className="stat-label">Total SaaS Revenue</span>
                  <span className="stat-num" style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--color-secondary)" }}> USD</span>
                </div>
                <div className="stat-card glass-panel" style={{ padding: "20px" }}>
                  <span className="stat-label">Total Generations</span>
                  <span className="stat-num" style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--color-accent)" }}>{overview.generations}</span>
                </div>'''
content = content.replace(dash_find, dash_repl)

with open('d:/VoiceNova/04-frontend/src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Admin data fetching injected")
