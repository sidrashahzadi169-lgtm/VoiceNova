import re

with open('d:/VoiceNova/04-frontend/src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace handleToggleSuspend
suspend_find = '''const handleToggleSuspend = (id: number) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" } : u
      )
    );
    showToast("User status updated.");
  };'''

suspend_repl = '''const handleToggleSuspend = async (id: number | string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    const newStatus = user.status === "Active" ? "Suspended" : "Active";
    
    try {
      const res = await fetch(https://voice-nova-sooty.vercel.app/api/admin/users/\/status, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": Bearer \
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === id ? { ...u, status: newStatus as any } : u
          )
        );
        showToast("User status updated.");
      } else {
        showToast("Failed to update status", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    }
  };'''
content = content.replace(suspend_find, suspend_repl)

# Replace handleChangePlan
plan_find = '''const handleChangePlan = (id: number) => {
    const newPlan = prompt("Enter new plan name (Free Plan, Starter Plan, Pro Plan, Enterprise):");
    if (newPlan) {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, plan: newPlan } : u))
      );
      showToast("User plan updated successfully.");
    }
  };'''

plan_repl = '''const handleChangePlan = async (id: number | string) => {
    const newPlan = prompt("Enter new plan name (Free Plan, Starter Plan, Pro Plan, Enterprise):");
    if (newPlan) {
      try {
        const res = await fetch(https://voice-nova-sooty.vercel.app/api/admin/users/\/plan, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": Bearer \
          },
          body: JSON.stringify({ plan: newPlan })
        });
        if (res.ok) {
          setUsers((prev) =>
            prev.map((u) => (u.id === id ? { ...u, plan: newPlan } : u))
          );
          showToast("User plan updated successfully.");
        } else {
          showToast("Failed to update plan", "error");
        }
      } catch (err) {
        showToast("Network error", "error");
      }
    }
  };'''
content = content.replace(plan_find, plan_repl)

# Replace handleDeleteUser
delete_find = '''const handleDeleteUser = (id: number) => {
    if (confirm("Permanently delete this user account?")) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast("User account deleted.");
    }
  };'''

delete_repl = '''const handleDeleteUser = async (id: number | string) => {
    if (confirm("Permanently delete this user account?")) {
      try {
        const res = await fetch(https://voice-nova-sooty.vercel.app/api/admin/users/\, {
          method: "DELETE",
          headers: {
            "Authorization": Bearer \
          }
        });
        if (res.ok) {
          setUsers((prev) => prev.filter((u) => u.id !== id));
          showToast("User account deleted.");
        } else {
          showToast("Failed to delete user", "error");
        }
      } catch (err) {
        showToast("Network error", "error");
      }
    }
  };'''
content = content.replace(delete_find, delete_repl)

with open('d:/VoiceNova/04-frontend/src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Admin User actions injected")
