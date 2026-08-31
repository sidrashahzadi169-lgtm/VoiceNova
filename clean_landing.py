import re

with open('d:/VoiceNova/04-frontend/src/app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace states
content = re.sub(r'const \[isLoginOpen, setIsLoginOpen\] = useState\(false\);\n', '', content)
content = re.sub(r'const \[isSignupOpen, setIsSignupOpen\] = useState\(false\);\n', '', content)

# Replace login form handlers (these are no longer needed but we can remove them)
form_handlers = '''  // Auth form handlers redirects to console dashboard
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail && loginPassword) {
      setIsLoginOpen(false);
      localStorage.setItem("userEmail", loginEmail);
      router.push("/dashboard");
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupName && signupEmail && signupPassword) {
      setIsSignupOpen(false);
      localStorage.setItem("userFullName", signupName);
      localStorage.setItem("userEmail", signupEmail);
      router.push("/dashboard");
    }
  };'''
content = content.replace(form_handlers, '')

# Replace button clicks
content = content.replace('onClick={() => setIsLoginOpen(true)}', 'onClick={() => router.push("/login")}')
content = content.replace('onClick={() => setIsSignupOpen(true)}', 'onClick={() => router.push("/signup")}')

# Remove modal JSX
login_modal_start = content.find('{isLoginOpen && (')
signup_modal_end = content.find('</div>\n      )}\n\n      {/* Mobile Nav Overlay */}', login_modal_start)
if signup_modal_end == -1:
    signup_modal_end = content.find('      {/* Mobile Nav Overlay */}', login_modal_start)

if login_modal_start != -1 and signup_modal_end != -1:
    content = content[:login_modal_start] + content[signup_modal_end:]
    print("Removed auth modals")
else:
    print("Could not find auth modals")

# Fix Watch Demo toast
demo_toast_old = 'showToast("Simulating product demo video playback...")'
demo_toast_new = 'window.open("https://www.youtube.com/results?search_query=voicenova+ai", "_blank")'
content = content.replace(demo_toast_old, demo_toast_new)

# Fix Contact Sales toast
sales_toast_old = 'showToast("Contacting sales channels...")'
sales_toast_new = 'window.location.href = "mailto:admin@voicenova.ai"'
content = content.replace(sales_toast_old, sales_toast_new)

with open('d:/VoiceNova/04-frontend/src/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Landing page cleaned up")
