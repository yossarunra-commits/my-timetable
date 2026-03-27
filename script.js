const G_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxhUFdfclZKI3_gazfSqlGzLvGXoY7sZsbaq5OQTDEZw6QsCvVyPdhIubS3K32MnBoFGw/exec";

// ฟังก์ชันบันทึกข้อมูลทั้งหมดขึ้น Cloud
async function saveToCloud() {
    const dataToSave = {
        appData: appData,
        finalSchedule: finalSchedule,
        lastUpdated: new Date().toLocaleString('th-TH')
    };

    try {
        // แสดง Loading หรือเปลี่ยนข้อความปุ่ม
        console.log("Saving to cloud...");
        
        await fetch(G_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors", // สำคัญมากสำหรับ Google Apps Script
            cache: "no-cache",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataToSave)
        });

        alert("💾 บันทึกข้อมูลขึ้นระบบ Cloud สำเร็จ!\nทุกคนที่เข้าลิงก์จะเห็นข้อมูลล่าสุดนี้");
    } catch (err) {
        console.error("Save error:", err);
        alert("❌ บันทึกไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต");
    }
}

// ฟังก์ชันดึงข้อมูลจาก Cloud มาแสดงผล
async function syncFromCloud() {
    try {
        console.log("🔄 กำลังดึงข้อมูลล่าสุดจาก Cloud...");
        const response = await fetch(G_SCRIPT_URL, {
            method: 'GET',
            redirect: 'follow' // สำคัญมาก: เพื่อให้ fetch เดินทางไปถึงข้อมูลจริง
        });
        
        const text = await response.text();
        if (!text || text === "" || text === "{}") return;

        const cloudData = JSON.parse(text);
        
        // ตรวจสอบว่าข้อมูลใน Cloud ไม่ว่างเปล่า
        if (cloudData && (cloudData.finalSchedule && cloudData.finalSchedule.length > 0)) {
            // ✅ นำข้อมูลมาใส่ในโปรแกรม
            finalSchedule = cloudData.finalSchedule;
            appData = cloudData.appData || appData;
            
            // เซฟลงเครื่องคนดู (โทรศัพท์)
            localStorage.setItem('my_timetable_data', text);
            
            console.log("✅ ข้อมูลอัปเดตแล้ว!");
            
            // 🔥 สั่งวาดหน้าจอใหม่ทันที
            if (typeof renderSchedule === 'function') renderSchedule();
            if (typeof renderTeacherTable === 'function') renderTeacherTable();
        }
    } catch (err) {
        console.error("❌ ไม่สามารถดึงข้อมูลจาก Cloud ได้:", err);
    }
}

// ฟังก์ชันช่วยสั่งวาดหน้าจอใหม่ทั้งหมด
function updateAllViews() {
    if (typeof renderSchedule === 'function') renderSchedule();
    if (typeof renderTeacherTable === 'function') renderTeacherTable();
    // ถ้าคุณมีฟังก์ชันวาดหน้าแรกหรือหน้าอื่นๆ ให้ใส่เพิ่มที่นี่
}

// ส่วนล่างสุดของไฟล์ script.js
window.addEventListener('load', async () => {
    console.log("ระบบกำลังเริ่มทำงาน...");

    // 1. ลองดึงข้อมูลจากเครื่องตัวเองก่อน (เพื่อให้หน้าเว็บไม่ว่างระหว่างรอเน็ต)
    const localData = localStorage.getItem('my_timetable_data');
    if (localData) {
        try {
            const parsed = JSON.parse(localData);
            // ตรวจสอบชื่อตัวแปรหลักของคุณ (เช่น appData, finalSchedule)
            if (parsed.appData) appData = parsed.appData;
            if (parsed.finalSchedule) finalSchedule = parsed.finalSchedule;
            
            // สั่งวาดตารางทันทีจากข้อมูลในเครื่อง
            if (typeof renderSchedule === 'function') renderSchedule();
            console.log("โหลดข้อมูลจาก LocalStorage สำเร็จ");
        } catch (e) {
            console.error("LocalStorage Parse Error", e);
        }
    }

    // 2. ดึงข้อมูลล่าสุดจาก Google Sheets (Cloud) มาทับ
    // เพื่อให้แน่ใจว่าทุกคนเห็นข้อมูลเดียวกันกับที่คุณเพิ่งอัปเดตไป
    await syncFromCloud(); 
});
