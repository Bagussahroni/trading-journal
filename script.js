let trades = JSON.parse(localStorage.getItem("trades")) || [];
let balance = localStorage.getItem("balance") || 0;
let chart;

document.getElementById("balance").value = balance;

// SAVE
function saveData() {
    localStorage.setItem("trades", JSON.stringify(trades));
    localStorage.setItem("balance", balance);
}

// ADD TRADE
function tambahTrade() {
    let tanggal = document.getElementById("tanggal").value;
    let pair = document.getElementById("pair").value;
    let price = parseFloat(document.getElementById("price").value);
    let type = document.getElementById("type").value;
    let lot = parseFloat(document.getElementById("lot").value);
    let profit = parseFloat(document.getElementById("profit").value);

    balance = parseFloat(document.getElementById("balance").value) || 0;

    if (!tanggal || !pair || isNaN(price) || isNaN(lot) || isNaN(profit)) {
        alert("Lengkapi data!");
        return;
    }

    trades.push({
        tanggal,
        pair,
        price,
        type,
        lot,
        profit,
        balance: balance + profit
    });

    saveData();
    render();
}

// DELETE
function hapus(i) {
    trades.splice(i, 1);
    saveData();
    render();
}

// RENDER (OPTIMIZED)
function render() {
    let table = document.getElementById("tableData");
    let html = "";

    let totalProfit = 0;
    let win = 0;
    let loss = 0;
    let best = -Infinity;
    let worst = Infinity;
    let currentBalance = parseFloat(balance) || 0;

    for (let i = 0; i < trades.length; i++) {
        let t = trades[i];
        let profit = t.profit;

        currentBalance += profit;
        totalProfit += profit;

        if (profit > 0) {
            win++;
            if (profit > best) best = profit;
        } else {
            loss++;
            if (profit < worst) worst = profit;
        }

        html += `
            <tr>
                <td>${t.tanggal}</td>
                <td>${t.pair}</td>
                <td>${t.price}</td>
                <td>${t.type.toUpperCase()}</td>
                <td>${t.lot}</td>
                <td class="${profit >= 0 ? 'profit' : 'loss'}">${profit}</td>
                <td>${currentBalance.toFixed(2)}</td>
                <td><button onclick="hapus(${i})">Hapus</button></td>
            </tr>
        `;
    }

    table.innerHTML = html;

    let winrate = trades.length ? ((win / trades.length) * 100).toFixed(1) : 0;

    document.getElementById("totalProfit").innerText = totalProfit.toFixed(2);
    document.getElementById("winrate").innerText = winrate + "%";

    document.getElementById("totalTrade").innerText = trades.length;
    document.getElementById("winTrade").innerText = win;
    document.getElementById("lossTrade").innerText = loss;
    document.getElementById("bestProfit").innerText = best === -Infinity ? 0 : best;
    document.getElementById("worstLoss").innerText = worst === Infinity ? 0 : worst;

    renderChart();
}

// CHART (FAST + NO RESET)
function renderChart() {
    let labels = [];
    let data = [];

    let currentBalance = parseFloat(balance) || 0;

    for (let i = 0; i < trades.length; i++) {
        currentBalance += trades[i].profit;
        labels.push(i + 1);
        data.push(currentBalance);
    }

    const ctx = document.getElementById("chart");

    if (!chart) {
        chart = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Equity Curve",
                    data: data,
                    borderWidth: 2,
                    tension: 0.3
                }]
            }
        });
    } else {
        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.update();
    }
}

// PAGE SWITCH
function showPage(page) {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    document.getElementById(page).style.display = "block";
}

render();
