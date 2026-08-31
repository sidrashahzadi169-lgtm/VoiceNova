import re

with open('d:/VoiceNova/04-frontend/src/components/Sidebar.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Modify Sidebar component logic
find_items = '''  const navItems = isAdmin ? adminNavItems : userNavItems;
  const accountItems = isAdmin ? adminAccountItems : userAccountItems;'''

replace_items = '''  // Always include Admin Panel link in account items if isAdmin is true or on admin page
  const extendedUserAccountItems = [
    ...userAccountItems,
    ...(isAdmin ? [{ label: "Admin Panel", href: "/admin", icon: Cpu }] : [])
  ];

  const extendedAdminAccountItems = [
    ...adminAccountItems,
    { label: "Back to Studio", href: "/dashboard", icon: LayoutDashboard }
  ];

  const navItems = pathname.startsWith('/admin') ? adminNavItems : userNavItems;
  const accountItems = pathname.startsWith('/admin') ? extendedAdminAccountItems : extendedUserAccountItems;'''

content = content.replace(find_items, replace_items)

with open('d:/VoiceNova/04-frontend/src/components/Sidebar.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Sidebar.tsx logic")
