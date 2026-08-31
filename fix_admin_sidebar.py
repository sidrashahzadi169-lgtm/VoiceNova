import re

with open('d:/VoiceNova/04-frontend/src/app/(console)/layout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

find_sidebar = '''      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />'''

replace_sidebar = '''      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        isAdmin={user?.plan === 'admin' || user?.plan === 'root' || user?.email === 'admin@voicenova.ai' || user?.email === 'info@voicenova.ai'}
      />'''

content = content.replace(find_sidebar, replace_sidebar)

with open('d:/VoiceNova/04-frontend/src/app/(console)/layout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated sidebar to pass isAdmin prop")
