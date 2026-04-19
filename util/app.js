// টেলিগ্রাম WebApp ইনিশিয়ালাইজ করা (নিরাপদভাবে)
let tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) {
    try { tg.expand(); tg.ready(); } catch (e) { console.error("TG Init Error:", e); }
}

// --- ন্যাভিগেশন লজিক (Global Scope এ দেওয়া হলো যাতে HTML থেকে সরাসরি পায়) ---
window.goToDetailsPage = function(projectId) {
    localStorage.setItem('currentProject', projectId);
    window.location.href = 'details.html';
};

// --- টাস্ক কমপ্লিট করার লজিক ---
window.completeTask = function(taskId) {
    let btn = document.getElementById(taskId);
    if (!btn) return;

    btn.innerText = "Saving...";
    btn.style.backgroundColor = "gray";

    if (tg && tg.CloudStorage) {
        // টেলিগ্রাম ক্লাউডে সেভ
        tg.CloudStorage.setItem(taskId, "completed", (error, success) => {
            if (error) {
                btn.innerText = "Failed";
                btn.style.backgroundColor = "red";
            } else {
                btn.innerText = "Completed";
                btn.style.backgroundColor = "#28a745";
                btn.disabled = true; 
            }
        });
    } else {
        // সাধারণ ব্রাউজারে টেস্ট করার জন্য লোকাল স্টোরেজ
        localStorage.setItem(taskId, "completed");
        btn.innerText = "Completed";
        btn.style.backgroundColor = "#28a745";
        btn.disabled = true; 
    }
};

// পেজ সম্পূর্ণ লোড হওয়ার পর বাকি কাজগুলো হবে
window.onload = () => {
    
    // --- টাইমার ফাংশন ---
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

    // --- ১. ড্যাশবোর্ডের লজিক (index.html) ---
    if (document.getElementById('timer-ton')) {
        startTimer('timer-ton', 4, 59, 59);
        startTimer('timer-monad', 12, 30, 0);

        // TON Connect UI ইনিশিয়ালাইজ (try-catch এর ভেতরে যাতে অন্য কোড ক্র্যাশ না করে)
        try {
            let tonConnectButton = document.getElementById('ton-connect');
            if (tonConnectButton && typeof TON_CONNECT_UI !== 'undefined') {
                const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
                    manifestUrl: 'https://web3-task-manager.vercel.app/ui/tonconnect-manifest.json',
                    buttonRootId: 'ton-connect'
                });

                tonConnectUI.onStatusChange(wallet => {
                    if (wallet && tg) {
                        tg.showAlert(`Wallet Connected Successfully!\nAddress: ${wallet.account.address.substring(0, 6)}...${wallet.account.address.substring(wallet.account.address.length - 4)}`);
                    }
                });
            }
        } catch (error) {
            console.error("TON Connect Error:", error);
        }
    }

    // --- ২. ডিটেইলস পেজের লজিক (details.html) ---
    if (document.getElementById('project-title')) {
        if (tg && tg.BackButton) {
            tg.BackButton.show();
            tg.BackButton.onClick(() => {
                tg.BackButton.hide();
                window.location.href = 'index.html';
            });
        }

        let project = localStorage.getItem('currentProject');
        let titleElement = document.getElementById('project-title');
        
        if (titleElement) {
            if(project === 'ton_project') titleElement.innerText = "TON Foundation Tasks";
            else if(project === 'monad_project') titleElement.innerText = "Monad Testnet Tasks";
        }

        let taskIds = ['task_1', 'task_2', 'task_3'];
        
        // আগে থেকে টাস্ক কমপ্লিট করা আছে কিনা চেক করা
        if (tg && tg.CloudStorage) {
            tg.CloudStorage.getItems(taskIds, (error, values) => {
                if (!error) {
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
                }
            });
        } else {
            // ব্রাউজারে টেস্ট করার জন্য
            taskIds.forEach(id => {
                if (localStorage.getItem(id) === "completed") {
                    let btn = document.getElementById(id);
                    if (btn) {
                        btn.innerText = "Completed";
                        btn.style.backgroundColor = "#28a745";
                        btn.disabled = true;
                    }
                }
            });
        }
    }
};        if (tg && tg.CloudStorage) {
            tg.CloudStorage.getItems(taskIds, (error, values) => {
                if (!error) {
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
                }
            });
        } else {
            // ব্রাউজারে টেস্ট করার জন্য
            taskIds.forEach(id => {
                if (localStorage.getItem(id) === "completed") {
                    let btn = document.getElementById(id);
                    if (btn) {
                        btn.innerText = "Completed";
                        btn.style.backgroundColor = "#28a745";
                        btn.disabled = true;
                    }
                }
            });
        }
    }
};
