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
    document.getElementById("tokenCount")?.textContent=tokens;
    document.getElementById("brushName")?.textContent=brush;
    updateClaimStatus();
}


/* LOGIN */
function loadUserList(){
    const list = document.getElementById("userList");
    if(!list) return;
    list.innerHTML="<h3>Existing Users:</h3>";
    Object.keys(users).forEach(u=>{
        let b=document.createElement("button");
        b.textContent=u;
        b.onclick=()=>login(u);
        list.appendChild(b);
    });
}
loadUserList();


function createUser(){
    let name=document.getElementById("newUserName").value.trim();
    if(!name) return alert("Enter name");
    if(users[name]) return alert("User exists");
    users[name]={tokens:10,brush:"circle",lastReward:0,lastClaim:0};
    saveUsers(); loadUserList();
}
function login(name){
    currentUser=name;
    tokens=users[name].tokens;
    brush=users[name].brush;
    lastClaim=users[name].lastClaim;
    document.getElementById("loginContainer").classList.add("hidden");
    document.getElementById("mainUI").classList.remove("hidden");
    updateUI();
    dailyRewardCheck();
}
function logout(){
    currentUser=null;
    document.getElementById("mainUI").classList.add("hidden");
    document.getElementById("loginContainer").classList.remove("hidden");
}


/* DAILY REWARD */
function dailyRewardCheck(){
    const today=Math.floor(Date.now()/(1000*60*60*24));
    if(users[currentUser].lastReward!==today){
        tokens+=5;
        users[currentUser].lastReward=today;
        users[currentUser].tokens=tokens;
        saveUsers();
        updateUI();
        document.getElementById("dailyReward").textContent="🎁 Daily reward: +5 tokens!";
    }else{
        document.getElementById("dailyReward").textContent="";
    }
}


/* SHOP */
function openShop(){ document.getElementById("shopContainer").classList.remove("hidden"); updateClaimStatus();}
function closeShop(){ document.getElementById("shopContainer").classList.add("hidden"); }


function updateClaimStatus(){
    const now = Date.now();
    const oneDay = 24*60*60*1000;
    if(now - lastClaim >= oneDay){
        document.getElementById("claimBtn").disabled=false;
        document.getElementById("claimStatus").textContent="Available now!";
    } else {
        document.getElementById("claimBtn").disabled=true;
        let hours=Math.ceil((oneDay - (now - lastClaim))/(1000*60*60));
        document.getElementById("claimStatus").textContent="Come back in "+hours+" hours";
    }
}


function buyTokens(){
    const now = Date.now();
    if(now - lastClaim < 24*60*60*1000) return;
    tokens+=10;
    lastClaim=now;
    users[currentUser].tokens=tokens;
    users[currentUser].lastClaim=lastClaim;
    saveUsers();
    updateUI();
}


function buyBrush(type){ brush=type; users[currentUser].brush=type; saveUsers(); updateUI(); }


/* GAME LOGIC */
let revealed = 0;
let revealedSymbols = [];


document.getElementById("playBtn")?.addEventListener("click",()=>{
    if(tokens<=0) return alert("Not enough tokens");
    tokens--; users[currentUser].tokens=tokens; saveUsers(); updateUI(); startGame();
});


function startGame(){
    revealed=0;
    revealedSymbols=[];
    document.getElementById("result").style.opacity=0;
    const grid=document.getElementById("grid");
    grid.innerHTML="";
    const tileSymbols=Array.from({length:9},()=>symbols[Math.floor(Math.random()*symbols.length)]);
    tileSymbols.forEach((sym,i)=>{
        let tile=document.createElement("div");
        tile.className="tile";
        tile.dataset.symbol=sym;
        tile.onclick=()=>revealTile(tile);
        tile.innerHTML="";
        grid.appendChild(tile);
    });
}


function revealTile(tile){
    if(tile.classList.contains("revealed")) return;
    if(revealed>=3) return;
    tile.classList.add("revealed");
    tile.textContent=tile.dataset.symbol;
    revealed++;
    revealedSymbols.push(tile.dataset.symbol);
    if(revealed===3) evaluateResult();
}


function evaluateResult(){
    const [a,b,c]=revealedSymbols;
    const win=(a===b && b===c);
    let res=document.getElementById("result");
    if(win){
        tokens+=20;
        users[currentUser].tokens=tokens;
        saveUsers();
        updateUI();
        res.textContent="🎉 MATCH 3! +20 Tokens!";
        launchConfetti();
    } else {
        res.textContent="❌ No Match!";
        revealAllTiles(); // show all symbols on loss
    }
    res.style.opacity=1;
}


function revealAllTiles(){
    const tiles=document.querySelectorAll(".tile");
    tiles.forEach(tile=>{
        if(!tile.classList.contains("revealed")){
            tile.classList.add("revealed");
            tile.textContent=tile.dataset.symbol;
        }
    });
}


/* CONFETTI */
function launchConfetti(){
    for(let i=0;i<60;i++){
        let c=document.createElement("div");
        c.className="confetti";
        c.style.left=Math.random()*100+"vw";
        c.style.background=randomColor();
        c.style.animationDuration=(2+Math.random()*3)+"s";
        document.body.appendChild(c);
        setTimeout(()=>c.remove(),5000);
    }
}
function randomColor(){
    const colors=["#ff595e","#ffca3a","#8ac926","#1982c4","#6a4c93"];
    return colors[Math.floor(Math.random()*colors.length)];
}