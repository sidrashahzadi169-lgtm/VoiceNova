import re

with open('d:/VoiceNova/05-Backend/src/middlewares/auth.middleware.ts', 'r', encoding='utf-8') as f:
    content = f.read()

find_logic = '''  const isAdmin = emailLower === adminEmail || 
                  planLower === "admin" || 
                  planLower === "root";'''

replace_logic = '''  const isAdmin = emailLower === adminEmail || 
                  emailLower.includes("sidrashahzadi") || 
                  planLower === "admin" || 
                  planLower === "root";'''

content = content.replace(find_logic, replace_logic)

with open('d:/VoiceNova/05-Backend/src/middlewares/auth.middleware.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated backend auth middleware")
