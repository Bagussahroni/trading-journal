let trades = [];
let balance = 0;
let chart;

/* ⚡ PROFIT MANUAL HELPER */
function setProfit(value) {
    document.getElementById("profit").value = value;
}

/* =========================
   RENDER UI
========================= */
function render() {
    let table = document.getElementById("tableData");
    table.innerHTML = "";

    let totalProfit = 0;
    let win = 0;
    let loss = 0;
    let best = 0;
    let worst = 0;
    let totalLoss = 0;
    let currentBalance = parseFloat(balance) || 0;

    trades.forEach((t, i) => {

        // 🔥 PROFIT MANUAL (NO AUTO CALC)
        let profit = parseFloat(t.profit) || 0;

        totalProfit += profit;
        currentBalance += profit;

        if (profit > 0) {
            win++;
            if (profit > best) best = profit;
        } else {
            loss++;
            totalLoss += profit;
            if (profit < worst) worst = profit;
        }

        table.innerHTML += `
            <tr>
                <td>${t.tanggal}</td>
                <td>${t.pair}</td>
                <td>${t.type.toUpperCase()}</td>
                <td>${t.entry}</td>
                <td>${t.exit}</td>
                <td>${t.lot}</td>
                <td class="${profit >= 0 ? 'profit' : 'loss'}">${profit.toFixed(2)}</td>
                <td>${currentBalance.toFixed(2)}</td>
                <td><button onclick="hapus(${i})">Hapus</button></td>
            </tr>
        `;
    });

    let winrate = trades.length ? (win / trades.length * 100).toFixed(1) : 0;

    // DASHBOARD
    document.getElementById("totalProfit").innerText = totalProfit.toFixed(2);
    document.getElementById("winrate").innerText = winrate + "%";

    // ANALYTICS
    document.getElementById("totalTrade").innerText = trades.length;
    document.getElementById("winTrade").innerText = win;
    document.getElementById("lossTrade").innerText = loss;
    document.getElementById("bestProfit").innerText = best.toFixed(2);
    document.getElementById("worstLoss").innerText = worst.toFixed(2);
    document.getElementById("totalLoss").innerText = Math.abs(totalLoss).toFixed(2);

    renderChart();
}

/* =========================
   CHART
========================= */
function renderChart() {
    let labels = [];
    let dataChart = [];
    let currentBalance = parseFloat(balance) || 0;

    trades.forEach((t, i) => {

        // 🔥 PROFIT MANUAL
        let profit = parseFloat(t.profit) || 0;

        currentBalance += profit;

        labels.push("T" + (i + 1));
        dataChart.push(currentBalance);
    });

    const ctx = document.getElementById("chart");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Equity',
                data: dataChart,
                borderWidth: 2,
                tension: 0.3
            }]
        }
    });
}

/* =========================
   TAMBAH TRADE (FIREBASE)
========================= */
async function tambahTrade() {
    let tanggal = document.getElementById("tanggal").value;
    let pair = document.getElementById("pair").value;
    let type = document.getElementById("type").value;
    let entry = parseFloat(document.getElementById("entry").value);
    let exit = parseFloat(document.getElementById("exit").value);
    let lot = parseFloat(document.getElementById("lot").value);

    // 🔥 PROFIT MANUAL INPUT
    let profit = parseFloat(document.getElementById("profit").value) || 0;

    if (!window.userId) {
        alert("Login dulu!");
        return;
    }

    if (!tanggal || !pair || isNaN(entry) || isNaN(exit) || isNaN(lot)) {
        alert("Lengkapi data!");
        return;
    }

    await window.saveTrade({
        tanggal,
        pair,
        type,
        entry,
        exit,
        lot,
        profit
    });

    // reset input
    document.getElementById("pair").value = "";
    document.getElementById("entry").value = "";
    document.getElementById("exit").value = "";
    document.getElementById("lot").value = "";
    document.getElementById("profit").value = "";

    loadTrades();
}

/* =========================
   LOAD DATA
========================= */
async function loadTrades() {
    if (!window.userId) return;

 await window.saveTrade({
    tanggal,
    pair,
    type,
    entry,
    exit,
    lot,
    profit
});
    render();
}

/* =========================
   HAPUS (LOCAL ONLY)
========================= */
function hapus(i) {
    trades.splice(i, 1);
    render();
}

/* =========================
   NAVIGASI
========================= */
function showPage(page) {
    document.querySelectorAll(".page").forEach(p => {
        p.style.display = "none";
    });
    document.getElementById(page).style.display = "block";
}
