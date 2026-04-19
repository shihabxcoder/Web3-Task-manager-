let tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// --- TON Connect UI ইনিশিয়ালাইজ ---
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://web3-task-manager.vercel.app/ui/tonconnect-manifest.json',
    buttonRootId: 'ton-connect'
});

// কানেকশন স্ট্যাটাস চেক করা
tonConnectUI.onStatusChange(wallet => {
    if (wallet) {
        tg.showAlert(`Wallet Connected Successfully!\nAddress: ${wallet.account.address.substring(0, 6)}...${wallet.account.address.substring(wallet.account.address.length - 4)}`);
    }
});

// --- টাইমার লজিক ---
function startTimer(id, hours, minutes, seconds) {
    let element = document.getElementById(id);
    if (!element) return;
    
    let time = hours * 3600 + minutes * 60 + seconds;

    setInterval(() => {
        let h = Math.floor(time / 3600);
        let m = Math.floor((time % 3600) / 60);
        let s = time % 60;

        element.innerText = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        if (time > 0) time--;
    }, 1000);
}

if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    window.onload = () => {
        startTimer('timer-ton', 4, 59, 59);
        startTimer('timer-monad', 12, 30, 0);
    };
}

// --- ন্যাভিগেশন ---
function goToDetailsPage(projectId) {
    localStorage.setItem('currentProject', projectId);
    window.location.href = 'details.html';
}

// --- টাস্ক কমপ্লিট (Cloud Storage) ---
function completeTask(taskId) {
    let btn = document.getElementById(taskId);
    if (!btn) return;

    btn.innerText = "Saving...";
    btn.style.backgroundColor = "gray";

    tg.CloudStorage.setItem(taskId, "completed", (error, success) => {
        if (error) {
            console.error("Error saving task:", error);
            btn.innerText = "Failed";
            btn.style.backgroundColor = "red";
        } else {
            btn.innerText = "Completed";
            btn.style.backgroundColor = "#28a745";
            btn.disabled = true;
        }
    });
}

// --- DETAILS PAGE LOGIC (Merged + Clean) ---
if (window.location.pathname.includes('details.html')) {

    // Back Button
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
        tg.BackButton.hide();
        window.location.href = 'index.html';
    });

    // Project Title সেট করা
    let project = localStorage.getItem('currentProject');
    let titleElement = document.getElementById('project-title');

    if (titleElement) {
        if (project === 'ton_project') {
            titleElement.innerText = "TON Foundation Tasks";
        } else if (project === 'monad_project') {
            titleElement.innerText = "Monad Testnet Tasks";
        }
    }

    // --- Cloud থেকে টাস্ক স্টেট লোড ---
    let taskIds = ['task_1', 'task_2', 'task_3'];

    tg.CloudStorage.getItems(taskIds, (error, values) => {
        if (error) {
            console.error("Error loading tasks:", error);
            return;
        }

        taskIds.forEach(id => {
            if (values[id] === "completed") {
                let btn = document.getElementById(id);
                if (btn) {
                    btn.innerText = "Completed";
                    btn.style.backgroundColor = "#28a745";
                    btn.disabled = true;
                }
            }
        });
    });
}
