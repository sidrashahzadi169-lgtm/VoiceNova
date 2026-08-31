import re

with open('d:/VoiceNova/04-frontend/src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the dangling return block
# It looks like:
#   };
#         }
#         return u;
#       })
#     );
#   };
# 
#   const handleChangePlan = ...

dangling_find = '''  };
        }
        return u;
      })
    );
  };'''

dangling_repl = '''  };'''

content = content.replace(dangling_find, dangling_repl)

with open('d:/VoiceNova/04-frontend/src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Dangling syntax fixed")
