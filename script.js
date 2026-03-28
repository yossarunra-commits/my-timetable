// --- 1. Firebase Configuration ---
// ใช้ Config ชุดเต็มที่คุณส่งมาก่อนหน้านี้ (รวม apiKey, projectId ฯลฯ)
const firebaseConfig = {
    apiKey: "AIzaSyBCtIQkl0sS4g5r767LUs5vshAHv9wkbd8", // ใส่ให้ครบตามที่คุณมี
    databaseURL: "https://my-timetable-8e9c0-default-rtdb.asia-southeast1.firebasedatabase.app"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// --- 2. Realtime Sync ---
function startSync() {
    console.log("🔄 กำลังดึงข้อมูลจาก Cloud...");
    
    database.ref('timetable').on('value', (snapshot) => {
        const cloudData = snapshot.val();
        
        if (cloudData) {
            console.log("✅ ข้อมูลจาก Cloud มาถึงแล้ว");
            
            // อัปเดตตัวแปรหลัก (ป้องกัน Error ถ้าข้อมูลบางส่วนหาย)
            appData = cloudData.appData || { teachers: [], subjects: [], rooms: {} };
            finalSchedule = cloudData.finalSchedule || [];

            // 🔥 บังคับวาดหน้าจอใหม่ทันที
            refreshUI();
        }
    });
}

function refreshUI() {
    if (typeof renderSchedule === 'function') renderSchedule();
    if (typeof renderTeacherTable === 'function') renderTeacherTable();
    if (typeof updateTeacherList === 'function') updateTeacherList();
    if (typeof updateSubjectList === 'function') updateSubjectList();
    
    // สำคัญ: ถ้าหน้าเว็บว่าง ให้แสดงหน้าปัจจุบัน
    // showSection(currentSection || 'section-import');
}

// --- 3. บันทึกข้อมูล ---
async function saveToCloud() {
    // เช็คก่อนว่ามีข้อมูลให้เซฟไหม
    if (!appData) return alert("ไม่มีข้อมูลให้บันทึก");

    const dataToSave = {
        appData: appData,
        finalSchedule: finalSchedule,
        lastUpdated: new Date().toLocaleString('th-TH')
    };

    try {
        await database.ref('timetable').set(dataToSave);
        alert("🔥 บันทึกสำเร็จ! ทุกเครื่องจะเห็นข้อมูลนี้ทันที");
    } catch (err) {
        alert("❌ บันทึกไม่สำเร็จ: " + err.message);
    }
}

// --- 4. Navigation & Sidebar ---
function toggleSidebar() {
    const sidebar = document.getElementById('main-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.toggle('-translate-x-full');
    if (overlay) overlay.classList.toggle('hidden');
}

function handleMenuClick(section) {
    if (section === 'teacher-schedule') {
        showTeacherScheduleSection();
    } else {
        showSection(section);
    }
    if (window.innerWidth < 1024) toggleSidebar();
}

// เรียกทำงานเพียงครั้งเดียว
window.addEventListener('load', startSync);
