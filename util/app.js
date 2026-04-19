let tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) {
    try { tg.expand(); tg.ready(); } catch (e) { console.error("TG Init Error:", e); }
}

window.goToDetailsPage = function(projectId) {
    localStorage.setItem('currentProject', projectId);
    window.location.href = 'details.html';
};

// --- পয়েন্ট আপডেট লজিক ---
function addPoints(pointsToAdd) {
    if (tg && tg.CloudStorage) {
        tg.CloudStorage.getItem('total_points', (err, value) => {
            let currentPoints = value ? parseInt(value) : 0;
            let newPoints = currentPoints + pointsToAdd;
            tg.CloudStorage.setItem('total_points', newPoints.toString());
            
            let pointsDisplay = document.getElementById('total-points');
            if (pointsDisplay) pointsDisplay.innerText = newPoints;
        });
    } else {
        let currentPoints = parseInt(localStorage.getItem('total_points')) || 0;
        let newPoints = currentPoints + pointsToAdd;
        localStorage.setItem('total_points', newPoints);
        let pointsDisplay = document.getElementById('total-points');
        if (pointsDisplay) pointsDisplay.innerText = newPoints;
    }
}

// --- আসল লিংক ওপেন এবং টাস্ক কমপ্লিট লজিক ---
window.executeTask = function(taskId, link, pointsToAdd) {
    let btn = document.getElementById(taskId);
    if (!btn || btn.disabled) return;

    // লিংক ওপেন করা
    if (tg && tg.openLink) {
        if(link.includes('t.me')) {
            tg.openTelegramLink(link);
        } else {
            tg.openLink(link);
        }
    } else {
        window.open(link, '_blank');
    }

    btn.innerText = "Verifying...";
    btn.style.backgroundColor = "gray";

    // লিংক ওপেন হওয়ার ২ সেকেন্ড পর টাস্ক সেভ ও পয়েন্ট যোগ হবে
    setTimeout(() => {
        if (tg && tg.CloudStorage) {
            tg.CloudStorage.setItem(taskId, "completed", (error, success) => {
                if (!error) {
                    addPoints(pointsToAdd);
                    btn.innerText = "Completed";
                    btn.style.backgroundColor = "#28a745";
                    btn.disabled = true; 
                }
            });
        } else {
            localStorage.setItem(taskId, "completed");
            addPoints(pointsToAdd);
            btn.innerText = "Completed";
            btn.style.backgroundColor = "#28a745";
            btn.disabled = true; 
        }
    }, 2000);
};

window.onload = () => {
    
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

    // --- ড্যাশবোর্ড লজিক (index.html) ---
    if (document.getElementById('timer-ton')) {
        startTimer('timer-ton', 4, 59, 59);
        startTimer('timer-monad', 12, 30, 0);

        // পয়েন্ট শো করা
        if (tg && tg.CloudStorage) {
            tg.CloudStorage.getItem('total_points', (err, value) => {
                let currentPoints = value ? parseInt(value) : 0;
                document.getElementById('total-points').innerText = currentPoints;
            });
        } else {
            document.getElementById('total-points').innerText = localStorage.getItem('total_points') || 0;
        }

        try {
            let tonConnectButton = document.getElementById('ton-connect');
            if (tonConnectButton && typeof TON_CONNECT_UI !== 'undefined') {
                const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
                    manifestUrl: 'https://web3-task-manager.vercel.app/ui/tonconnect-manifest.json',
                    buttonRootId: 'ton-connect'
                });
                tonConnectUI.onStatusChange(wallet => {
                    if (wallet && tg) tg.showAlert(`Wallet Connected!`);
                });
            }
        } catch (error) { console.error(error); }
    }

    // --- ডিটেইলস পেজ লজিক (details.html) ---
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
