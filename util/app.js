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
        // ওয়ালেট কানেক্ট হলে টেলিগ্রাম ইউজারকে একটি নোটিফিকেশন দেখাবে
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

// --- ন্যাভিগেশন লজিক ---
function goToDetailsPage(projectId) {
    localStorage.setItem('currentProject', projectId);
    window.location.href = 'details.html';
}

if (window.location.pathname.includes('details.html')) {
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
        tg.BackButton.hide();
        window.location.href = 'index.html';
    });

    let project = localStorage.getItem('currentProject');
    let titleElement = document.getElementById('project-title');
    
    if (titleElement) {
        if(project === 'ton_project') titleElement.innerText = "TON Foundation Tasks";
        else if(project === 'monad_project') titleElement.innerText = "Monad Testnet Tasks";
    }
}
