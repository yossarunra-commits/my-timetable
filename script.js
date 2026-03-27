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
        console.log("🔄 กำลังตรวจสอบข้อมูลจาก Cloud...");
        // เพิ่มตัวแปรสุ่ม ?t= เพื่อป้องกัน Browser จำค่าเก่า (Cache)
        const response = await fetch(G_SCRIPT_URL + "?t=" + new Date().getTime());
        const text = await response.text(); 
        
        if (!text || text === "{}" || text === "[]") {
            console.log("☁️ ยังไม่มีข้อมูลบน Cloud");
            return;
        }

        const cloudData = JSON.parse(text);
        
        // เช็คว่ามีข้อมูลตาราง (finalSchedule) ส่งมาจริงไหม
        if (cloudData && cloudData.finalSchedule) {
            // ✅ นำข้อมูลจาก Cloud มาใส่ในตัวแปรเครื่องเรา
            finalSchedule = cloudData.finalSchedule;
            appData = cloudData.appData || appData;
            
            // เซฟลง LocalStorage ของเครื่องนั้นๆ
            localStorage.setItem('my_timetable_data', text);
            
            console.log("✅ Sync สำเร็จ! ข้อมูลล่าสุด: " + (cloudData.lastUpdated || "ไม่ระบุเวลา"));

            // 🔥 สั่งให้หน้าเว็บวาดตารางใหม่ทันที
            updateAllViews(); 
        }
    } catch (err) {
        console.error("❌ Sync Error:", err);
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
