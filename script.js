let count = 0;

/* ✅ DOM Load */
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("addBtn").addEventListener("click", addRow);
    loadData(); 
    // ❌ output load remove (as per your requirement)
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

/* ✅ Serial Fix */
function updateSerial() {
    document.querySelectorAll("#tbody tr").forEach((row, i) => {
        row.cells[0].innerText = i + 1;
    });
}

/* ✅ Calculate + Color */
function calculate() {
    document.querySelectorAll("#tbody tr").forEach(row => {
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

        let percent = checks.length ? ((present / checks.length) * 100).toFixed(0) : 0;

        row.querySelector(".total").innerText = present;
        row.querySelector(".percent").innerText = percent + "%";
    });

    saveData();
}

/* ✅ Auto Calculate */
document.addEventListener("change", e => {
    if (e.target.classList.contains("att-check")) {
        calculate();
    }
});

/* ✅ Search */
function searchData() {
    let val = document.getElementById("search").value.toLowerCase();

    document.querySelectorAll("#tbody tr").forEach(row => {
        let name = row.cells[1].querySelector("input").value.toLowerCase();
        row.style.display = name.includes(val) ? "" : "none";
    });
}

/* ✅ Show Data (ONLY ON CLICK) */
function getHeaderData() {

    let university = document.getElementById("university").value || "-";
    let college = document.getElementById("college").value || "-";
    let course = document.getElementById("course").value || "-";

    let output = "";

    document.querySelectorAll("#tbody tr").forEach(row => {

        let inputs = row.querySelectorAll("input");
        let name = inputs[0].value.trim();
        if (!name) return;

        let className = inputs[1].value.trim();
        let roll = inputs[2].value.trim();

        let checks = row.querySelectorAll(".att-check");
        let present = [...checks].filter(c => c.checked).length;

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

    saveOutputData();
}

/* ✅ Delete Output Row */
function deleteOutputRow(btn) {
    btn.closest("tr").remove();
    saveOutputData();
}

/* ✅ Clear Output */
function clearAllData() {
    document.getElementById("outputBody").innerHTML = "";
    localStorage.removeItem("outputData");
}

/* ✅ Filter */
function toggleFilter() {
    let box = document.getElementById("filterBox");
    box.style.display = box.style.display === "none" ? "block" : "none";
}

function applyFilter() {
    let n = filterName.value.toLowerCase();
    let c = filterClass.value.toLowerCase();
    let r = filterRoll.value.toLowerCase();

    document.querySelectorAll("#outputBody tr").forEach(row => {
        let td = row.querySelectorAll("td");

        let match =
            td[3].innerText.toLowerCase().includes(n) &&
            td[4].innerText.toLowerCase().includes(c) &&
            td[5].innerText.toLowerCase().includes(r);

        row.style.display = match ? "" : "none";
    });
}

/* ✅ Save Main Table */
function saveData() {
    let data = [];

    document.querySelectorAll("#tbody tr").forEach(row => {
        let inputs = row.querySelectorAll("input");
        let checks = row.querySelectorAll(".att-check");

        data.push({
            name: inputs[0].value,
            className: inputs[1].value,
            roll: inputs[2].value,
            days: [...checks].map(c => c.checked)
        });
    });

    localStorage.setItem("attendanceData", JSON.stringify(data));
}

/* ✅ Load Main Table */
function loadData() {
    let data = JSON.parse(localStorage.getItem("attendanceData")) || [];
    data.forEach(d => addRow(d));
}

/* ✅ Save Output */
function saveOutputData() {
    let data = [];

    document.querySelectorAll("#outputBody tr").forEach(row => {
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

/* ✅ CSV FIXED */
function downloadCSV() {
    let rows = document.querySelectorAll("#table tr");
    let csv = [];

    rows.forEach(row => {
        let cols = row.querySelectorAll("td, th");
        let rowData = [];

        cols.forEach(col => {
            let input = col.querySelector("input");

            if (input) {
                if (input.type === "checkbox") {
                    rowData.push(input.checked ? "P" : "A");
                } else {
                    rowData.push(input.value);
                }
            } else {
                rowData.push(col.innerText);
            }
        });

        csv.push(rowData.join(","));
    });

    let blob = new Blob([csv.join("\n")], { type: "text/csv;charset=utf-8;" });

    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "attendance.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/* ✅ Excel Export */
function exportExcel() {
    let table = document.getElementById("table");

    let wb = XLSX.utils.table_to_book(table, { sheet: "Attendance" });

    XLSX.writeFile(wb, "Attendance.xlsx");
}



/* 🌙 Dark Mode Toggle */
const toggleBtn = document.getElementById("darkToggle");

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    toggleBtn.innerText = "☀️";
}

// Toggle click
toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        toggleBtn.innerText = "☀️";
    } else {
        localStorage.setItem("theme", "light");
        toggleBtn.innerText = "🌙";
    }
});



function logout(){
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}