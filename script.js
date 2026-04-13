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

/* ✅ Save Main Table (User Wise) */
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

/* ✅ Load Main Table */
function loadData() {
    let user = localStorage.getItem("loggedInUser");
    if (!user) return;

    let data = JSON.parse(localStorage.getItem("attendance_" + user)) || [];
    data.forEach(d => addRow(d));
}

/* ✅ Show Data (IMPORTANT) */
function getHeaderData() {

    let user = localStorage.getItem("loggedInUser");

    let university = document.getElementById("university").value || "-";
    let college = document.getElementById("college").value || "-";
    let course = document.getElementById("course").value || "-";

    let output = [];

    document.querySelectorAll("#tbody tr").forEach(row => {

        let inputs = row.querySelectorAll("input");
        let name = inputs[0].value.trim();
        if (!name) return;

        let className = inputs[1].value;
        let roll = inputs[2].value;

        let checks = row.querySelectorAll(".att-check");
        let present = [...checks].filter(c => c.checked).length;

        let totalDays = checks.length;
        let absent = totalDays - present;
        let percent = ((present / totalDays) * 100).toFixed(0);

        output.push({
            user,
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

    data.forEach(d => {
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
            <td><button onclick="deleteOutputRow(this)">Delete</button></td>
        </tr>
        `;
    });

    document.getElementById("outputBody").innerHTML = html;
    document.getElementById("outputBox").style.display = "block";
}

/* ✅ Save Output (ALL USERS) */
function saveOutputData(newData) {

    let allData = JSON.parse(localStorage.getItem("allAttendance")) || [];
    let user = localStorage.getItem("loggedInUser");

    // Remove old data of this user
    allData = allData.filter(d => d.user !== user);

    // Add new data
    allData.push(...newData);

    localStorage.setItem("allAttendance", JSON.stringify(allData));
}

/* ✅ Delete Output Row */
function deleteOutputRow(btn) {
    btn.closest("tr").remove();
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

/* 🌙 Dark Mode */
const toggleBtn = document.getElementById("darkToggle");

if (toggleBtn) {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
        toggleBtn.innerText = "☀️";
    }

    toggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark");

        let isDark = document.body.classList.contains("dark");
        localStorage.setItem("theme", isDark ? "dark" : "light");
        toggleBtn.innerText = isDark ? "☀️" : "🌙";
    });
}

/* ✅ Logout */
function logout(){
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}