// --- 1. Firebase Configuration ---
const firebaseConfig = {
    databaseURL: "https://my-timetable-8e9c0-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// --- 2. Realtime Sync (ดึงข้อมูลอัตโนมัติ) ---
// 1. ฟังก์ชันดึงข้อมูลแบบ Realtime (ใส่ไว้ใน script.js)
function startSync() {
    console.log("🔄 กำลังเชื่อมต่อฐานข้อมูล...");
    
    // อ้างอิงไปที่ Path 'timetable' ใน Firebase ของคุณ
    database.ref('timetable').on('value', (snapshot) => {
        const cloudData = snapshot.val();
        
        if (cloudData) {
            console.log("✅ ได้รับข้อมูลล่าสุดจาก Cloud");

            // สำคัญมาก: เอาข้อมูลจาก Cloud มาเติมใส่ตัวแปรหลักของโปรแกรม
            appData = cloudData.appData || { teachers: [], subjects: [], rooms: {} };
            finalSchedule = cloudData.finalSchedule || [];

            // สั่งให้หน้าเว็บวาดตารางใหม่ด้วยข้อมูลที่เพิ่งได้มา
            if (typeof renderSchedule === 'function') renderSchedule();
            if (typeof renderTeacherTable === 'function') renderTeacherTable();
            
            // (ถ้ามีหน้าจอสรุปรายชื่อ)
            updateTeacherList(); 
            updateSubjectList();
        } else {
            console.log("❓ ยังไม่มีข้อมูลในฐานข้อมูล Cloud");
        }
    });
}

// 2. เรียกใช้งานทันทีที่เปิดเว็บ (วางไว้ล่างสุดของไฟล์)
window.addEventListener('load', () => {
    startSync(); // เริ่มดึงข้อมูลจาก Firebase ทันทีที่โหลดหน้าจอ
});

// --- 3. บันทึกข้อมูลขึ้น Cloud ---
async function saveToCloud() {
    const dataToSave = {
        appData: appData,
        finalSchedule: finalSchedule,
        lastUpdated: new Date().toLocaleString('th-TH')
    };

    try {
        await database.ref('timetable').set(dataToSave);
        alert("🔥 บันทึกสำเร็จ! ข้อมูลถูกอัปเดตไปยังทุกเครื่องแล้ว");
    } catch (err) {
        alert("❌ บันทึกไม่สำเร็จ: " + err.message);
    }
}

// --- 4. ฟังก์ชันสำหรับ Responsive Sidebar (มือถือ/iPad) ---
function toggleSidebar() {
    const sidebar = document.querySelector('aside'); // หรือ ID ที่คุณตั้งไว้
    const overlay = document.getElementById('sidebar-overlay');
    
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
}

// เริ่มทำงานเมื่อโหลดหน้าเว็บ
window.addEventListener('load', () => {
    startSync();
});

// ฟังก์ชัน เปิด-ปิด Sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('main-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
}

// ฟังก์ชันจัดการเมื่อคลิกเมนู (ให้ปิดเมนูอัตโนมัติถ้าอยู่บนมือถือ)
function handleMenuClick(section) {
    // 1. เรียกฟังก์ชันแสดงหน้าเดิมของคุณ
    if (section === 'teacher-schedule') {
        showTeacherScheduleSection();
    } else {
        showSection(section);
    }

    // 2. ถ้าเป็นหน้าจอเล็ก ให้ปิด Sidebar หลังกดเลือก
    if (window.innerWidth < 1024) {
        toggleSidebar();
    }
}
