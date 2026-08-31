import re

with open('d:/VoiceNova/04-frontend/src/app/(console)/settings/page.tsx', 'r') as f:
    content = f.read()

# Add states for token and apikeys array
states_find = '''const [apiKey, setApiKey] = useState("vn_live_d84f9328a9b2d83c27e8a931d8e12c80");
  const [isKeyMasked, setIsKeyMasked] = useState(true);'''
  
states_repl = '''const [apiKey, setApiKey] = useState("");
  const [isKeyMasked, setIsKeyMasked] = useState(true);
  const [apiKeysList, setApiKeysList] = useState<any[]>([]);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  
  const loadApiKeys = async (token: string) => {
    try {
      const res = await fetch("https://voice-nova-sooty.vercel.app/api/users/apikeys", {
        headers: { "Authorization": "Bearer " + token }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setApiKeysList(data.data);
          if (data.data.length > 0) {
            setApiKey(data.data[0].maskedKey);
          }
        }
      }
    } catch (err) {}
  };'''
content = content.replace(states_find, states_repl)

# Update the useEffect to load data
effect_find = '''useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("userFullName");
      if (storedName) {
        setFullName(storedName);
        setUsername(storedName.toLowerCase().replace(/\s+/g, "_"));
      }
    }
  }, []);'''

effect_repl = '''useEffect(() => {
    async function initSettings() {
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData.authenticated && sessionData.token) {
            setSessionToken(sessionData.token);
            
            // Get profile
            const profileRes = await fetch("https://voice-nova-sooty.vercel.app/api/users/profile", {
              headers: { "Authorization": "Bearer " + sessionData.token }
            });
            if (profileRes.ok) {
              const pData = await profileRes.json();
              if (pData.success && pData.data) {
                setFullName(pData.data.name);
                setUsername(pData.data.email);
              }
            }
            
            // Get API Keys
            loadApiKeys(sessionData.token);
          }
        }
      } catch (err) {}
    }
    initSettings();
  }, []);'''
content = content.replace(effect_find, effect_repl)

# Update handleGeneralSave
gen_save_find = '''const handleGeneralSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("userFullName", fullName);
    }
    showToast("General settings updated successfully!");
  };'''

gen_save_repl = '''const handleGeneralSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToken) return;
    try {
      const res = await fetch("https://voice-nova-sooty.vercel.app/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + sessionToken
        },
        body: JSON.stringify({ name: fullName })
      });
      if (res.ok) {
        showToast("General settings updated successfully!");
        if (typeof window !== "undefined") {
          localStorage.setItem("userFullName", fullName);
        }
      } else {
        showToast("Failed to update profile", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    }
  };'''
content = content.replace(gen_save_find, gen_save_repl)

# Update handleSecuritySave
sec_save_find = '''const handleSecuritySave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match!", "error");
      return;
    }
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showToast("Password updated successfully!");
  };'''

sec_save_repl = '''const handleSecuritySave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match!", "error");
      return;
    }
    if (!sessionToken) return;
    try {
      const res = await fetch("https://voice-nova-sooty.vercel.app/api/users/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + sessionToken
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        showToast("Password updated successfully!");
      } else {
        showToast(data.message || "Failed to update password", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    }
  };'''
content = content.replace(sec_save_find, sec_save_repl)

# Update handleRegenKey
regen_find = '''const handleRegenKey = () => {
    const randomKey = "vn_live_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiKey(randomKey);
    showToast("New live API key regenerated successfully!");
  };'''

regen_repl = '''const handleRegenKey = async () => {
    if (!sessionToken) return;
    try {
      const res = await fetch("https://voice-nova-sooty.vercel.app/api/users/apikeys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + sessionToken
        },
        body: JSON.stringify({ name: "Live API Key" })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setApiKey(data.data.rawKey);
        setIsKeyMasked(false);
        showToast("New API key generated! Please copy it now.");
        loadApiKeys(sessionToken);
      } else {
        showToast("Failed to generate key", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    }
  };'''
content = content.replace(regen_find, regen_repl)

with open('d:/VoiceNova/04-frontend/src/app/(console)/settings/page.tsx', 'w') as f:
    f.write(content)
print("Settings real features injected")
