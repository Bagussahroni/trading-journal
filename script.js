let trades = JSON.parse(localStorage.getItem("trades")) || [];
let balance = localStorage.getItem("balance") || 0;
let chart;

document.getElementById("balance").value = balance;

function saveData() {
    localStorage.setItem("trades", JSON.stringify(trades));
    localStorage.setItem("balance", balance);
}

function calcProfit(entry, exit, lot, type) {
    return type === "buy"
        ? (exit - entry) * lot
        : (entry - exit) * lot;
}

function render() {
    let table = document.getElementById("tableData");
    table.innerHTML = "";

    let totalProfit = 0;
    let win = 0;
    let loss = 0;
    let best = 0;
    let worst = 0;
    let totalLoss = 0; // 🔥 tambahan
    let currentBalance = parseFloat(balance) || 0;

    trades.forEach((t, i) => {
        let profit = calcProfit(t.entry, t.exit, t.lot, t.type);

        totalProfit += profit;
        currentBalance += profit;

        if (profit > 0) {
            win++;
            if (profit > best) best = profit;
        } else {
            loss++;
            totalLoss += profit; // 🔥 hitung total loss
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

    // Dashboard
    document.getElementById("totalProfit").innerText = totalProfit.toFixed(2);
    document.getElementById("winrate").innerText = winrate + "%";

    // Analytics
    document.getElementById("totalTrade").innerText = trades.length;
    document.getElementById("winTrade").innerText = win;
    document.getElementById("lossTrade").innerText = loss;
    document.getElementById("bestProfit").innerText = best.toFixed(2);
    document.getElementById("worstLoss").innerText = worst.toFixed(2);
    document.getElementById("totalLoss").innerText = Math.abs(totalLoss).toFixed(2); // 🔥 tampilkan positif

    renderChart();
}

function renderChart() {
    let labels = [];
    let dataChart = [];

    let currentBalance = parseFloat(balance) || 0;

    trades.forEach((t, i) => {
        let profit = calcProfit(t.entry, t.exit, t.lot, t.type);
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

function tambahTrade() {
    let tanggal = document.getElementById("tanggal").value;
    let pair = document.getElementById("pair").value;
    let type = document.getElementById("type").value;
    let entry = parseFloat(document.getElementById("entry").value);
    let exit = parseFloat(document.getElementById("exit").value);
    let lot = parseFloat(document.getElementById("lot").value);
    balance = parseFloat(document.getElementById("balance").value);

    if (!tanggal || !pair || isNaN(entry) || isNaN(exit) || isNaN(lot)) {
        alert("Lengkapi data!");
        return;
    }

    trades.push({ tanggal, pair, type, entry, exit, lot });
    saveData();
    render();
}

function hapus(i) {
    trades.splice(i, 1);
    saveData();
    render();
}

function showPage(page) {
    document.querySelectorAll(".page").forEach(p => {
        p.style.display = "none";
    });
    document.getElementById(page).style.display = "block";
}

render();
