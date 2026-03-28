// --- 1. การตั้งค่าตัวแปรและ Firebase (คงเดิม) ---
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

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// --- 2. ฟังก์ชันบันทึกอัตโนมัติ (ทำงานเบื้องหลัง) ---
async function autoSave() {
    const dataToSave = {
        appData: appData,
        finalSchedule: finalSchedule,
        lastUpdated: new Date().toLocaleString('th-TH')
    };

    try {
        await database.ref('timetable').set(dataToSave);
        console.log("☁️ Auto-saved to Firebase at " + new Date().toLocaleTimeString());
        
        // แสดงสถานะเล็กๆ มุมจอ (ถ้ามี Element id="sync-status")
        const statusEl = document.getElementById('sync-status');
        if (statusEl) statusEl.innerHTML = '<i class="fas fa-check-circle text-green-500"></i> บันทึกอัตโนมัติแล้ว';
    } catch (err) {
        console.error("❌ Auto-save failed:", err);
    }
}

// --- 3. ระบบดึงข้อมูลเมื่อโหลดหน้าจอ (ป้องกันข้อมูลหาย) ---
function startSync() {
    database.ref('timetable').on('value', (snapshot) => {
        const cloudData = snapshot.val();
        if (cloudData) {
            // อัปเดตข้อมูลจาก Cloud ลงในตัวแปร
            appData = cloudData.appData || appData;
            finalSchedule = cloudData.finalSchedule || [];
            
            // วาดหน้าจอใหม่ทันที
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

// --- 4. จุดสำคัญ: นำ autoSave() ไปใส่ในฟังก์ชันที่มีการเปลี่ยนข้อมูล ---

// ก) เมื่อนำเข้าไฟล์ Excel เสร็จ
function handleExcelImport(event) {
    // ... โค้ดอ่านไฟล์ Excel ของคุณ ...
    
    // เมื่อประมวลผลข้อมูลลงใน appData เสร็จแล้ว
    // เรียกใช้ autoSave ทันที
    autoSave(); 
}

// ข) เมื่อกด "จัดตารางสอน" หรือแก้ไขตาราง
function generateSchedule() {
    // ... โค้ดคำนวณตารางสอน ...
    
    // เมื่อจัดเสร็จและเก็บใน finalSchedule แล้ว
    autoSave();
}

// ค) เมื่อมีการลบหรือเพิ่มชื่อครู/วิชาด้วยมือ
function addTeacher() {
    // ... โค้ดเพิ่มครู ...
    autoSave();
}

// --- 5. รันระบบเมื่อเปิดเว็บ ---
window.addEventListener('load', startSync);
