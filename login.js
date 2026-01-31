let selectedRole = 'client'; // UI ONLY (not used for auth decisions)

// ===== UI TOGGLE LOGIC (SAFE) =====
const roleContainer = document.getElementById('roleContainer');
const loginTitle = document.getElementById('login-title');
const btnRoleText = document.getElementById('btnRoleText');
const clientBtn = document.getElementById('btn-client');
const lawyerBtn = document.getElementById('btn-lawyer');
const loginForm = document.getElementById('loginForm');

function updateUI(role) {
    selectedRole = role; // visual only

    if (role === 'lawyer') {
        roleContainer.classList.add('lawyer-active');
        loginTitle.innerText = "Lawyer Login";
        btnRoleText.innerText = "Lawyer";
        clientBtn.classList.remove('active');
        lawyerBtn.classList.add('active');
    } else {
        roleContainer.classList.remove('lawyer-active');
        loginTitle.innerText = "Client Login";
        btnRoleText.innerText = "Client";
        lawyerBtn.classList.remove('active');
        clientBtn.classList.add('active');
    }
}

clientBtn.addEventListener('click', () => updateUI('client'));
lawyerBtn.addEventListener('click', () => updateUI('lawyer'));

// ===== AUTH LOGIC (SOURCE OF TRUTH = FIRESTORE) =====
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        // 1️⃣ Firebase Authentication (ONLY ONCE)
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const uid = userCredential.user.uid;

        // 2️⃣ Fetch Firestore profile
        const doc = await db.collection("users").doc(uid).get();

        if (!doc.exists) {
            alert("User profile not found in database.");
            await auth.signOut();
            return;
        }

        const userData = doc.data();
        const role = userData.role;

        // 3️⃣ ROLE-BASED REDIRECT (FINAL & CORRECT)

        // 🔥 ADMIN
        if (role === "admin") {
            window.location.href = "admin_dashboard.html";
            return;
        }

        // 👨‍⚖️ LAWYER (approval required)
        if (role === "lawyer") {
            if (userData.isApproved === false) {
                alert("Lawyer account is pending admin approval.");
                await auth.signOut();
                return;
            }
            window.location.href = "lawyer_dashboard.html";
            return;
        }

        // 👤 CLIENT (NO approval check)
        if (role === "client") {
            window.location.href = "home.html";
            return;
        }

        // ❌ Unknown role safety
        alert("Invalid user role.");
        await auth.signOut();

    } catch (error) {
        alert("Authentication Error: " + error.message);
    }
});
