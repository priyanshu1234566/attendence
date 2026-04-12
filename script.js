let count = 0;

/* ✅ DOM Load Safe */
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("addBtn").addEventListener("click", addRow);
});

/* ✅ Add Row */
function addRow() {
    count++;

    let tbody = document.getElementById("tbody");
    let tr = document.createElement("tr");

    tr.innerHTML = `
        <td>${count}</td>
        <td><input type="text" placeholder="Name"></td>
        <td><input type="text" placeholder="Class"></td>
        <td><input type="text" placeholder="Roll"></td>
        <td><input type="text" maxlength="1" placeholder="P/A" class="att"></td>
        <td><input type="text" maxlength="1" placeholder="P/A" class="att"></td>
        <td><input type="text" maxlength="1" placeholder="P/A" class="att"></td>
        <td><input type="text" maxlength="1" placeholder="P/A" class="att"></td>
        <td><input type="text" maxlength="1" placeholder="P/A" class="att"></td>
        <td><input type="text" maxlength="1" placeholder="P/A" class="att"></td>
        <td class="total">0</td>
    `;

    tbody.appendChild(tr);
}

/* ✅ Delete Row */
function deleteRow() {
    let tbody = document.getElementById("tbody");

    if (tbody.rows.length > 0) {
        tbody.deleteRow(tbody.rows.length - 1);
        count--;
        updateSerial();
    }
}

/* ✅ Update Serial Number */
function updateSerial() {
    let rows = document.querySelectorAll("#tbody tr");
    rows.forEach((row, index) => {
        row.cells[0].innerText = index + 1;
    });
}

/* ✅ Calculate Total (P Count) */
function calculate() {
    let rows = document.querySelectorAll("#tbody tr");

    rows.forEach(row => {
        let inputs = row.querySelectorAll(".att");
        let present = 0;

        inputs.forEach(input => {
            let val = input.value.toUpperCase();
            if (val === "P") present++;
        });

        row.querySelector(".total").innerText = present;
    });
}

/* ✅ Download CSV (Main Table Only) */
function downloadCSV() {
    let rows = document.querySelectorAll("#table tr");
    let csv = [];

    rows.forEach(row => {
        let cols = row.querySelectorAll("td, th");
        let data = [];

        cols.forEach(col => {
            let input = col.querySelector("input");
            data.push(input ? input.value : col.innerText);
        });

        csv.push(data.join(","));
    });

    let blob = new Blob([csv.join("\n")], { type: "text/csv" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "attendance.csv";
    a.click();
}

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

        let attInputs = row.querySelectorAll(".att");
        let totalPresent = 0;

        attInputs.forEach(i => {
            if (i.value.toUpperCase() === "P") totalPresent++;
        });

        let totalDays = attInputs.length;
        let totalAbsent = totalDays - totalPresent;

        output += `
        <tr>
            <td>${university}</td>
            <td>${college}</td>
            <td>${course}</td>
            <td>${name}</td>
            <td>${className}</td>
            <td>${roll}</td>
            <td>${totalPresent}</td>
            <td>${totalAbsent}</td>
            <td><button onclick="deleteOutputRow(this)">Delete</button></td>
        </tr>
        `;
    });

    document.getElementById("outputBody").innerHTML = output;
    document.getElementById("outputBox").style.display = "block";
}

/* ✅ Delete Output Row */
function deleteOutputRow(btn) {
    btn.parentElement.parentElement.remove();
}

/* ✅ Clear All Output */
function clearAllData() {
    document.getElementById("outputBody").innerHTML = "";
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

/* ✅ P/A Validation + Auto Uppercase */
document.addEventListener("input", function(e) {
    if (e.target.classList.contains("att")) {
        let val = e.target.value.toUpperCase();

        if (val !== "P" && val !== "A") {
            e.target.value = "";
        } else {
            e.target.value = val;
        }
    }
});