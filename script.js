// --- 1. การตั้งค่าตัวแปร (สำคัญ: ห้ามใส่ค่าว่างทับในฟังก์ชันอื่น) ---
let appData = { teachers: [], subjects: [], rooms: {} };
let finalSchedule = [];

const firebaseConfig = {
  apiKey: "AIzaSyBCtIQkl0sS4g5r767LUs5vshAHv9wkbd8",
  authDomain: "my-timetable-8e9c0.firebaseapp.com",
  databaseURL: "https://my-timetable-8e9c0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "my-timetable-8e9c0",
  storageBucket: "my-timetable-8e9c0.firebasestorage.app",
  messagingSenderId: "838052306956",
  appId: "1:838052306956:web:077a6c0913419dd7fa4e29"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// --- 2. ระบบดึงข้อมูล Realtime (แก้ปัญหา Refresh แล้วหาย) ---
function startSync() {
    console.log("🔄 กำลังเชื่อมต่อ Cloud...");
    database.ref('timetable').on('value', (snapshot) => {
        const cloudData = snapshot.val();
        if (cloudData) {
            console.log("✅ ข้อมูลอัปเดตจาก Cloud แล้ว");
            appData = cloudData.appData || appData;
            finalSchedule = cloudData.finalSchedule || [];
            
            // สั่งวาดหน้าจอใหม่ทันทีที่มีข้อมูลมา
            refreshAllUI();
        }
    });
}

function refreshAllUI() {
    if (typeof renderSchedule === 'function') renderSchedule();
    if (typeof renderTeacherTable === 'function') renderTeacherTable();
    if (typeof updateTeacherList === 'function') updateTeacherList();
    if (typeof updateSubjectList === 'function') updateSubjectList();
}

// --- 3. ระบบบันทึกข้อมูล ---
async function saveToCloud() {
    const dataToSave = {
        appData: appData,
        finalSchedule: finalSchedule,
        lastUpdated: new Date().toLocaleString('th-TH')
    };

    try {
        await database.ref('timetable').set(dataToSave);
        alert("💾 บันทึกสำเร็จ! ข้อมูลอัปเดตทุกเครื่องแล้ว");
    } catch (err) {
        alert("❌ บันทึกไม่สำเร็จ: " + err.message);
    }
}

// --- 4. ระบบจัดการหน้าจอ (Responsive) ---
function toggleSidebar() {
    const sidebar = document.getElementById('main-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
}

function handleMenuClick(sectionId) {
    // ปิดเมนูอัตโนมัติถ้าเป็นมือถือ
    if (window.innerWidth < 1024) toggleSidebar();
    
    // เรียกฟังก์ชันเปลี่ยนหน้าเดิมของคุณ
    if (sectionId === 'teacher-schedule') {
        showTeacherScheduleSection();
    } else {
        showSection(sectionId);
    }
}

// --- เริ่มการทำงานเมื่อโหลดหน้าเว็บ ---
window.addEventListener('load', () => {
    startSync(); // ดึงข้อมูลทันที
});
