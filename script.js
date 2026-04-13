let count = 0;

/* ✅ DOM Load */
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("addBtn").addEventListener("click", addRow);
    loadData();        // main table
    loadOutputData();  // output table (🔥 new)
});

/* ✅ Add Row */
function addRow(data = {}) {
    count++;

    let tbody = document.getElementById("tbody");
    let tr = document.createElement("tr");

    tr.innerHTML = `
        <td>${count}</td>
        <td><input type="text" value="${data.name || ''}" placeholder="Name"></td>
        <td><input type="text" value="${data.className || ''}" placeholder="Class"></td>
        <td><input type="text" value="${data.roll || ''}" placeholder="Roll"></td>

        ${[0,1,2,3,4,5].map(i => `
            <td>
                <input type="checkbox" class="att-check" ${data.days?.[i] ? "checked" : ""}>
            </td>
        `).join("")}

        <td class="total">0</td>
        <td class="percent">0%</td>
    `;

    tbody.appendChild(tr);
    calculate();
}

/* ✅ Delete Row */
function deleteRow() {
    let tbody = document.getElementById("tbody");

    if (tbody.rows.length > 0) {
        tbody.deleteRow(tbody.rows.length - 1);
        count--;
        updateSerial();
        saveData();
    }
}

/* ✅ Update Serial */
function updateSerial() {
    let rows = document.querySelectorAll("#tbody tr");
    rows.forEach((row, index) => {
        row.cells[0].innerText = index + 1;
    });
}

/* ✅ Calculate + Color */
function calculate() {
    let rows = document.querySelectorAll("#tbody tr");

    rows.forEach(row => {
        let checks = row.querySelectorAll(".att-check");
        let present = 0;

        checks.forEach(chk => {
            if (chk.checked) {
                present++;
                chk.parentElement.style.background = "#c6f6d5";
            } else {
                chk.parentElement.style.background = "#fed7d7";
            }
        });

        let totalDays = checks.length;
        let percent = totalDays ? ((present / totalDays) * 100).toFixed(0) : 0;

        row.querySelector(".total").innerText = present;
        row.querySelector(".percent").innerText = percent + "%";
    });

    saveData();
}

/* ✅ Auto Calculate */
document.addEventListener("change", function(e) {
    if (e.target.classList.contains("att-check")) {
        calculate();
    }
});

/* ✅ Search */
function searchData() {
    let input = document.getElementById("search").value.toLowerCase();
    let rows = document.querySelectorAll("#tbody tr");

    rows.forEach(row => {
        let name = row.cells[1].querySelector("input").value.toLowerCase();
        row.style.display = name.includes(input) ? "" : "none";
    });
}

/* ✅ Show Data */
function getHeaderData() {

    let university = document.getElementById("university").value || "-";
    let college = document.getElementById("college").value || "-";
    let course = document.getElementById("course").value || "-";

    let rows = document.querySelectorAll("#tbody tr");
    let output = "";

    rows.forEach(row => {

        let inputs = row.querySelectorAll("input");

        let name = inputs[0].value.trim();
        let className = inputs[1].value.trim();
        let roll = inputs[2].value.trim();

        if (!name) return;

        let checks = row.querySelectorAll(".att-check");
        let present = 0;

        checks.forEach(c => { if (c.checked) present++; });

        let totalDays = checks.length;
        let absent = totalDays - present;
        let percent = ((present / totalDays) * 100).toFixed(0);

        output += `
        <tr>
            <td>${university}</td>
            <td>${college}</td>
            <td>${course}</td>
            <td>${name}</td>
            <td>${className}</td>
            <td>${roll}</td>
            <td>${present}</td>
            <td>${absent}</td>
            <td>${percent}%</td>
            <td><button onclick="deleteOutputRow(this)">Delete</button></td>
        </tr>
        `;
    });

    document.getElementById("outputBody").innerHTML = output;
    document.getElementById("outputBox").style.display = "block";

    saveOutputData(); // 🔥 IMPORTANT
}

/* ✅ Delete Output Row */
function deleteOutputRow(btn) {
    btn.parentElement.parentElement.remove();
    saveOutputData(); // update storage
}

/* ✅ Clear All Output */
function clearAllData() {
    document.getElementById("outputBody").innerHTML = "";
    localStorage.removeItem("outputData");
}

/* ✅ Filter Toggle */
function toggleFilter() {
    let box = document.getElementById("filterBox");
    box.style.display = box.style.display === "none" ? "block" : "none";
}

/* ✅ Apply Filter */
function applyFilter() {
    let name = document.getElementById("filterName").value.toLowerCase();
    let cls = document.getElementById("filterClass").value.toLowerCase();
    let roll = document.getElementById("filterRoll").value.toLowerCase();

    let rows = document.querySelectorAll("#outputBody tr");

    rows.forEach(row => {
        let td = row.querySelectorAll("td");

        let match =
            td[3].innerText.toLowerCase().includes(name) &&
            td[4].innerText.toLowerCase().includes(cls) &&
            td[5].innerText.toLowerCase().includes(roll);

        row.style.display = match ? "" : "none";
    });
}

/* ✅ Save Main Table */
function saveData() {
    let rows = document.querySelectorAll("#tbody tr");
    let data = [];

    rows.forEach(row => {
        let inputs = row.querySelectorAll("input");
        let checks = row.querySelectorAll(".att-check");

        data.push({
            name: inputs[0].value,
            className: inputs[1].value,
            roll: inputs[2].value,
            days: Array.from(checks).map(c => c.checked)
        });
    });

    localStorage.setItem("attendanceData", JSON.stringify(data));
}

/* ✅ Load Main Table */
function loadData() {
    let data = JSON.parse(localStorage.getItem("attendanceData")) || [];
    data.forEach(d => addRow(d));
}

/* ✅ Save Output Table */
function saveOutputData() {
    let rows = document.querySelectorAll("#outputBody tr");
    let data = [];

    rows.forEach(row => {
        let td = row.querySelectorAll("td");

        data.push({
            university: td[0].innerText,
            college: td[1].innerText,
            course: td[2].innerText,
            name: td[3].innerText,
            className: td[4].innerText,
            roll: td[5].innerText,
            present: td[6].innerText,
            absent: td[7].innerText,
            percent: td[8].innerText
        });
    });

    localStorage.setItem("outputData", JSON.stringify(data));
}

/* ✅ Load Output Table */
function loadOutputData() {
    let data = JSON.parse(localStorage.getItem("outputData")) || [];

    let output = "";

    data.forEach(d => {
        output += `
        <tr>
            <td>${d.university}</td>
            <td>${d.college}</td>
            <td>${d.course}</td>
            <td>${d.name}</td>
            <td>${d.className}</td>
            <td>${d.roll}</td>
            <td>${d.present}</td>
            <td>${d.absent}</td>
            <td>${d.percent}</td>
            <td><button onclick="deleteOutputRow(this)">Delete</button></td>
        </tr>
        `;
    });

    if (data.length > 0) {
        document.getElementById("outputBody").innerHTML = output;
        document.getElementById("outputBox").style.display = "block";
    }
}