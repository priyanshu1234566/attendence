let count = 0;

/* ✅ DOM Load */
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("addBtn").addEventListener("click", addRow);
    loadData();
});

/* ✅ Add Row */
function addRow(data = {}) {
    count++;

    let tr = document.createElement("tr");

    tr.innerHTML = `
        <td>${count}</td>
        <td><input type="text" value="${data.name || ''}"></td>
        <td><input type="text" value="${data.className || ''}"></td>
        <td><input type="text" value="${data.roll || ''}"></td>

        ${[0,1,2,3,4,5].map(i => `
            <td>
                <input type="checkbox" class="att-check" ${data.days?.[i] ? "checked" : ""}>
            </td>
        `).join("")}

        <td class="total">0</td>
        <td class="percent">0%</td>
    `;

    document.getElementById("tbody").appendChild(tr);
    calculate();
}

/* ✅ DELETE LAST ROW */
function deleteRow() {
    let tbody = document.getElementById("tbody");
    if (tbody.lastChild) {
        tbody.removeChild(tbody.lastChild);
        count--;
        calculate();
    }
}

/* ✅ Calculate */
function calculate() {
    document.querySelectorAll("#tbody tr").forEach(row => {
        let checks = row.querySelectorAll(".att-check");
        let present = [...checks].filter(c => c.checked).length;

        checks.forEach(c => {
            c.parentElement.style.background = c.checked ? "#c6f6d5" : "#fed7d7";
        });

        let percent = checks.length ? ((present / checks.length) * 100).toFixed(0) : 0;

        row.querySelector(".total").innerText = present;
        row.querySelector(".percent").innerText = percent + "%";
    });

    saveData();
}

/* ✅ Auto Calculate */
document.addEventListener("change", e => {
    if (e.target.classList.contains("att-check")) calculate();
});

/* ✅ Save Table */
function saveData() {
    let user = localStorage.getItem("loggedInUser");
    if (!user) return;

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

    localStorage.setItem("attendance_" + user, JSON.stringify(data));
}

/* ✅ Load Data */
function loadData() {
    let user = localStorage.getItem("loggedInUser");
    if (!user) return;

    let data = JSON.parse(localStorage.getItem("attendance_" + user)) || [];

    count = 0;
    document.getElementById("tbody").innerHTML = "";
    data.forEach(d => addRow(d));
}

/* ✅ SHOW DATA */
function getHeaderData() {

    let user = localStorage.getItem("loggedInUser");

    let university = document.getElementById("university").value || "-";
    let college = document.getElementById("college").value || "-";
    let course = document.getElementById("course").value || "-";

    let output = [];
    let today = new Date().toISOString().split("T")[0];

    document.querySelectorAll("#tbody tr").forEach(row => {

        let inputs = row.querySelectorAll("input");
        let name = inputs[0].value.trim();
        if (!name) return;

        let className = inputs[1].value;
        let roll = inputs[2].value;

        let checks = row.querySelectorAll(".att-check");
        let present = [...checks].filter(c => c.checked).length;

        let total = checks.length;
        let absent = total - present;
        let percent = total ? ((present / total) * 100).toFixed(0) : 0;

        output.push({
            user,
            date: today,
            university,
            college,
            course,
            name,
            className,
            roll,
            present,
            absent,
            percent
        });
    });

    renderOutput(output);
    saveOutputData(output);
}

/* ✅ Render Output */
function renderOutput(data) {
    let html = "";

    data.forEach((d, i) => {
        html += `
        <tr>
            <td>${d.university}</td>
            <td>${d.college}</td>
            <td>${d.course}</td>
            <td>${d.name}</td>
            <td>${d.className}</td>
            <td>${d.roll}</td>
            <td>${d.present}</td>
            <td>${d.absent}</td>
            <td>${d.percent}%</td>
            <td>${d.date}</td>
            <td><button onclick="deleteOutputRow(${i})">Delete</button></td>
        </tr>`;
    });

    document.getElementById("outputBody").innerHTML = html;
    document.getElementById("outputBox").style.display = "block";
}

/* ✅ Save All Data */
function saveOutputData(newData) {
    let allData = JSON.parse(localStorage.getItem("allAttendance")) || [];
    allData.push(...newData);
    localStorage.setItem("allAttendance", JSON.stringify(allData));
}

/* ✅ DELETE OUTPUT ROW */
function deleteOutputRow(index) {
    let data = JSON.parse(localStorage.getItem("allAttendance")) || [];
    data.splice(index, 1);
    localStorage.setItem("allAttendance", JSON.stringify(data));
    getHeaderData();
}

/* ✅ CLEAR ALL */
function clearAllData() {
    if (confirm("Delete all data?")) {
        localStorage.removeItem("allAttendance");
        document.getElementById("outputBody").innerHTML = "";
    }
}

/* ✅ SEARCH */
function searchData() {
    let value = document.getElementById("search").value.toLowerCase();
    document.querySelectorAll("#tbody tr").forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(value) ? "" : "none";
    });
}

/* ✅ FILTER */
function toggleFilter() {
    let box = document.getElementById("filterBox");
    box.style.display = box.style.display === "block" ? "none" : "block";
}

function applyFilter() {
    let name = document.getElementById("filterName").value.toLowerCase();
    let cls = document.getElementById("filterClass").value.toLowerCase();
    let roll = document.getElementById("filterRoll").value.toLowerCase();

    document.querySelectorAll("#outputBody tr").forEach(row => {
        let text = row.innerText.toLowerCase();

        row.style.display =
            text.includes(name) &&
            text.includes(cls) &&
            text.includes(roll)
                ? ""
                : "none";
    });
}

/* ✅ EXPORT EXCEL */
function exportExcel() {
    let table = document.getElementById("outputTable");
    let wb = XLSX.utils.table_to_book(table, { sheet: "Attendance" });
    XLSX.writeFile(wb, "attendance.xlsx");
}

/* ✅ CSV */
function downloadCSV() {
    let rows = document.querySelectorAll("#table tr");
    let csv = [];

    rows.forEach(row => {
        let cols = row.querySelectorAll("td, th");
        let rowData = [];

        cols.forEach(col => {
            let input = col.querySelector("input");

            if (input) {
                rowData.push(
                    input.type === "checkbox"
                        ? (input.checked ? "P" : "A")
                        : input.value
                );
            } else {
                rowData.push(col.innerText);
            }
        });

        csv.push(rowData.join(","));
    });

    let blob = new Blob([csv.join("\n")], { type: "text/csv" });

    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "attendance.csv";
    a.click();
}

/* 🌙 DARK MODE */
const toggleBtn = document.getElementById("darkToggle");

if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark");
    });
}

/* ✅ LOGOUT */
function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}