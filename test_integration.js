const http = require('http');

async function runTests() {
    console.log("Starting API Tests...");
    let passed = 0;
    let failed = 0;
    let errors = [];

    const API_BASE = "http://localhost:5000/api";
    let token = "";

    async function test(name, fn) {
        try {
            await fn();
            console.log(`✅ ${name}`);
            passed++;
        } catch (e) {
            console.error(`❌ ${name} - ${e.message}`);
            failed++;
            errors.push({ name, error: e.message });
        }
    }

    // 1. Test Auth
    await test("Auth Login", async () => {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@voicenova.ai', password: 'superSecret123' })
        });
        const data = await res.json();
        if (!data.success || !data.data.accessToken) throw new Error("Login failed");
        token = data.data.accessToken;
    });

    // 2. Test Protected Routes
    await test("Get User Profile", async () => {
        const res = await fetch(`${API_BASE}/users/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!data.success) throw new Error("Profile fetch failed");
    });

    // 3. Test Voices
    await test("Get Public Voices", async () => {
        const res = await fetch(`${API_BASE}/voices`);
        const data = await res.json();
        if (!data.success) throw new Error("Failed to fetch voices");
    });

    // 4. Test Projects
    let projectId = "";
    await test("Create Project", async () => {
        const res = await fetch(`${API_BASE}/projects`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test Project', scriptText: 'Hello', status: 'Draft' })
        });
        const data = await res.json();
        if (!data.success) throw new Error("Failed to create project");
        projectId = data.data.id;
    });

    await test("Get Projects", async () => {
        const res = await fetch(`${API_BASE}/projects`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!data.success || data.data.length === 0) throw new Error("Failed to get projects");
    });

    await test("Update Project", async () => {
        const res = await fetch(`${API_BASE}/projects/${projectId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Renamed Project' })
        });
        const data = await res.json();
        if (!data.success || data.data.name !== 'Renamed Project') throw new Error("Failed to update project");
    });

    await test("Delete Project", async () => {
        const res = await fetch(`${API_BASE}/projects/${projectId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to delete project");
    });

    // 5. Test Admin
    await test("Admin Users List", async () => {
        const res = await fetch(`${API_BASE}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!data.success) throw new Error("Failed to get admin users");
    });

    await test("Admin Voices List", async () => {
        const res = await fetch(`${API_BASE}/admin/voices`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!data.success) throw new Error("Failed to get admin voices");
    });

    await test("Admin Tickets List", async () => {
        const res = await fetch(`${API_BASE}/admin/tickets`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!data.success) throw new Error("Failed to get admin tickets");
    });

    // 6. Test Billing
    await test("Billing Info", async () => {
        const res = await fetch(`${API_BASE}/payments/info`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!data.success) throw new Error("Failed to get billing info");
    });

    // 7. Test ElevenLabs Status
    await test("ElevenLabs Status", async () => {
        const res = await fetch(`${API_BASE}/elevenlabs/status`);
        const data = await res.json();
        // Just checking endpoint works, even if API key is mock, it should return success: false with code: NO_API_KEY
        if (data.code === 'NO_API_KEY') {
            console.log("   (ElevenLabs API key is mock, which is expected)");
        } else if (!data.success) {
            throw new Error(`Failed to verify elevenlabs status: ${data.message}`);
        }
    });

    console.log(`\nResults: ${passed} Passed, ${failed} Failed`);
    if (errors.length > 0) {
        console.log("Errors:");
        errors.forEach(e => console.log(` - ${e.name}: ${e.error}`));
    }
}

runTests();
