import re

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

bad_end = '''        )}
      </div>
    </div>
  );
}'''

good_end = '''        )}
      </div>
  );
}'''

content = content.replace(bad_end, good_end)

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed extra div")
