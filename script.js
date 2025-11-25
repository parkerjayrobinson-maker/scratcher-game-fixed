/* USERS & STATE */
let users = JSON.parse(localStorage.getItem("scratcherUsers") || "{}");
let currentUser = null;
let tokens = 0;
let brush = "circle";
let lastClaim = 0;

/* GAME SYMBOLS */
const symbols = ["🍒","⭐","🔔","🍋","💎"];

/* UTILS */
function saveUsers(){ localStorage.setItem("scratcherUsers",JSON.stringify(users)); }
function updateUI(){
    document.getElementById("tokenCount").textContent = tokens;
    document.getElementById("brushName").textContent = brush;
    updateClaimStatus();
}

/* LOGIN */
function loadUserList(){
    const list = document.getElementById("userList");
    list.innerHTML="<h3>Existing Users:</h3>";
    Object.keys(users).forEach(username => {
        const btn = document.createElement("button");
        btn.textContent = username;
        btn.onclick = () => login(username);
        list.appendChild(btn);
    });
}
loadUserList();

function createUser(){
    let name = document.getElementById("newUserName").value.trim();
    if(!name) return alert("Enter name");
    if(users[name]) return alert("User exists");
    users[name] = { tokens: 10, brush: "circle", lastReward: 0, lastClaim: 0 };
    saveUsers();
    loadUserList();
}

function login(name){
    currentUser = name;
    tokens = users[name].tokens;
    brush = users[name].brush;
    lastClaim = users[name].lastClaim;

    document.getElementById("loginContainer").classList.add("hidden");
    document.getElementById("mainUI").classList.remove("hidden");

    updateUI();
    dailyRewardCheck();
}

function logout(){
    currentUser = null;
    document.getElementById("mainUI").classList.add("hidden");
    document.getElementById("loginContainer").classList.remove("hidden");
}

/* DAILY REWARD */
function dailyRewardCheck(){
    const today = Math.floor(Date.now()/(1000*60*60*24));
    if(users[currentUser].lastReward !== today){
        tokens += 5;
        users[currentUser].lastReward = today;
        users[currentUser].tokens = tokens;
        saveUsers();
        updateUI();
        document.getElementById("dailyReward").textContent = "🎁 Daily reward: +5 tokens!";
    } else {
        document.getElementById("dailyReward").textContent = "";
    }
}

/* SHOP */
function openShop(){
    document.getElementById("shopContainer").classList.remove("hidden");
    updateClaimStatus();
}
function closeShop(){
    document.getElementById("shopContainer").classList.add("hidden");
}

function updateClaimStatus(){
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if(now - lastClaim >= oneDay){
        document.getElementById("claimBtn").disabled = false;
        document.getElementById("claimStatus").textContent = "Available now!";
    } else {
        document.getElementById("claimBtn").disabled = true;
        let hours = Math.ceil((oneDay - (now - lastClaim))/(1000*60*60));
        document.getElementById("claimStatus").textContent = "Come back in " + hours + " hours";
    }
}

function buyTokens(){
    const now = Date.now();
    if(now - lastClaim < 24*60*60*1000) return;
    tokens += 10;
    lastClaim = now;
    users[currentUser].tokens = tokens;
    users[currentUser].lastClaim = now;
    saveUsers();
    updateUI();
}

function buyBrush(type){
    brush = type;
    users[currentUser].brush = type;
    saveUsers();
    updateUI();
}

/* GAME LOGIC */
let revealed = 0;
let revealedSymbols = [];

document.getElementById("playBtn").addEventListener("click",()=>{
    if(tokens <= 0) return alert("Not enough tokens");
    tokens--;
    users[currentUser].tokens = tokens;
    saveUsers();
    updateUI();
    startGame();
});
