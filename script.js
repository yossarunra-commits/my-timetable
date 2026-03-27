const G_SCRIPT_URL = "https://script.google.com/a/macros/prasartvidnon.ac.th/s/AKfycbxhUFdfclZKI3_gazfSqlGzLvGXoY7sZsbaq5OQTDEZw6QsCvVyPdhIubS3K32MnBoFGw/exec";

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
        const response = await fetch(G_SCRIPT_URL);
        const text = await response.text(); // รับค่าเป็น Text ก่อนเพื่อป้องกัน Error
        const cloudData = JSON.parse(text);
        
        if (cloudData && cloudData.finalSchedule) {
            // อัปเดตข้อมูลในตัวแปรหลัก
            appData = cloudData.appData || appData;
            finalSchedule = cloudData.finalSchedule || [];
            
            // บันทึกลง LocalStorage ของเครื่องนั้นๆ ไว้ด้วย
            localStorage.setItem('my_timetable_data', text);
            
            console.log("Data synced from cloud.");
            
            // สั่งให้ตารางวาดใหม่ (ใช้ชื่อฟังก์ชันวาดตารางของคุณ)
            if (typeof renderSchedule === 'function') renderSchedule(); 
            if (typeof renderTeacherTable === 'function') renderTeacherTable();
        }
    } catch (err) {
        console.error("Sync error:", err);
    }
}
