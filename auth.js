const SESSION_KEY = 'isg_session';
function setSession({ uid, fullName, employeeId }){
  localStorage.setItem(SESSION_KEY, JSON.stringify({ uid, fullName, employeeId }));
}
function getSession(){
  try{ return JSON.parse(localStorage.getItem(SESSION_KEY)||'null'); }catch(e){ return null }
}
function clearSession(){ localStorage.removeItem(SESSION_KEY); }

async function handleRegister(form){
  const fullName   = form.fullName.value.trim();
  const employeeId = form.employeeId.value.trim();
  const password   = form.password.value;
  if(!fullName || !employeeId || !password){ alert('Lütfen tüm alanları doldurun.'); return; }
  const user = await createUser(fullName, employeeId, password);
  setSession(user);
  location.href = 'dashboard.html';
}
async function handleLogin(form){
  const employeeId = form.employeeId.value.trim();
  const password   = form.password.value;
  const user = await verifyUser(employeeId, password);
  if(!user){ alert('Bilgiler hatalı.'); return; }
  setSession(user);
  location.href = 'dashboard.html';
}
// Firestore'da kullanıcı oluşturur
async function createUser(fullName, employeeId, password) {
  const passHash = await hasString(password);
  const docRef = await db.collection("users").add({
    fullName: fullName,
    employeeId: employeeId,
    passHash: passHash,
    createdAt: new Date().toISOString()
  });
  return { uid: docRef.id, fullName, employeeId };
}

// Firestore'dan kullanıcıyı doğrular
async function verifyUser(employeeId, password) {
  const passHash = await hasString(password);
  const snapshot = await db.collection("users")
    .where("employeeId", "==", employeeId)
    .get();

  if (snapshot.empty) return null;
  const userDoc = snapshot.docs[0].data();
  if (userDoc.passHash !== passHash) return null;
  return { uid: snapshot.docs[0].id, fullName: userDoc.fullName, employeeId };
}
