// Firebase init (compat)
// DOLDUR: aşağıdaki config'i Firebase web app ayarlarından kopyala.
const firebaseConfig = {
  apiKey: "AIzaSyC2MZPMHMDvAAINKFzvSEcEJxodyYksLOI",
  authDomain: "isgetitim-c80c8.firebaseapp.com",
  projectId: "isgetitim-c80c8",
  storageBucket: "isgetitim-c80c8.appspot.com",
  messagingSenderId: "59098251463",
  appId: "1:59098251463:web:d1cf916484ad4c21703b62"
};


// CDN compat yükleri (index.html gibi sayfalarda head içinde çağrılmalı)
if (!window.firebase || !window.firebase.apps) {
  // no-op; scriptler HTML içinde yüklenecek
}

const app = firebase.initializeApp(firebaseConfig);
const db  = firebase.firestore();

const COL_USERS = "users";
const COL_ATTEND = "attendance";
const COL_EXAMS  = "examResults";

async function hashString(str){
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
}

async function createUser(fullName, employeeId, password){
  const passHash = await hashString(password);
  const uid = employeeId;
  await db.collection(COL_USERS).doc(uid).set({ fullName, employeeId, passHash, createdAt: Date.now() }, { merge:true });
  return { uid, fullName, employeeId };
}

async function verifyUser(employeeId, password){
  const doc = await db.collection(COL_USERS).doc(employeeId).get();
  if(!doc.exists) return null;
  const passHash = await hashString(password);
  return doc.data().passHash === passHash ? { uid: employeeId, ...doc.data() } : null;
}

function saveAttendance(uid, moduleId, startedAt, finishedAt){
  const durationSec = Math.max(0, Math.round((finishedAt - startedAt)/1000));
  return db.collection(COL_ATTEND).add({ uid, moduleId, startedAt, finishedAt, durationSec });
}

function saveExamResult(uid, moduleId, score, total, answers){
  return db.collection(COL_EXAMS).add({ uid, moduleId, score, total, answers, takenAt: Date.now() });
}

async function getUserById(uid){
  const d = await db.collection(COL_USERS).doc(uid).get();
  return d.exists ? d.data() : null;
}

async function getModuleStats(moduleId){
  const exams = await db.collection(COL_EXAMS).where('moduleId','==',moduleId).get();
  const rows = exams.docs.map(x=>x.data());
  const count = rows.length;
  const avg = count? rows.reduce((a,b)=>a+b.score,0)/count : 0;
  return { count, avg };
}
async function hasString(str) {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}
