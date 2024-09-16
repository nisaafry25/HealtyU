import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, collection, addDoc, setDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-analytics.js";

const contactBtn = document.querySelectorAll(".book-btn");
const formPayment = document.querySelector(".form-payment");
const btnHisClose = document.querySelector(".history-btn-close");
const btnHisOpen = document.querySelector(".history-btn-open");
const historyContainer = document.querySelector(".history-container");

const month = new Date().getMonth() + 1;
let user;

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCITiAJyNQsKHzjVC7rztpuARaIsMLyc8c",
  authDomain: "wellness-tourism.firebaseapp.com",
  projectId: "wellness-tourism",
  storageBucket: "wellness-tourism.appspot.com",
  messagingSenderId: "40738864520",
  appId: "1:40738864520:web:02faf9e8199d01283e0e3d",
  measurementId: "G-V19RRT1GZY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // This throw error for some reason: Uncaught Error: Component analytics has not been registered yet
const auth = getAuth(app);
auth.languageCode = 'en';
const provider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

const googleLogin = document.getElementById("google-login-btn");
googleLogin.addEventListener('click', function(){
  signInWithPopup(auth, provider).then((result) => {
    const credential = GoogleAuthProvider.credentialFromResult(result);
    user = result.user;
    // googleLogin.textContent = user.displayName

    // Reloads the current page
    window.location.reload();
  }).catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorCode);
    console.log(errorMessage);
  });
});

// Reference to the logout button
const logoutBtn = document.getElementById('logout-btn');

// Logout function
logoutBtn.addEventListener('click', function() {
  alert("Anda akan segera Logout!");
  signOut(auth).then(() => {
    // console.log("User has logged out");
    logoutBtn.style.display = 'none'; // Hide logout button
    googleLogin.textContent = "Log In"; // Reset login button text
    googleLogin.style.display = 'block'; // Show login button
  }).catch((error) => {
    console.error('Sign Out Error', error);
  });
  // Reloads the current page
  window.location.reload();
});

// Firebase Auth state change listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, show logout button and hide login button
    logoutBtn.style.display = 'block';
    googleLogin.style.display = 'none';
  } else {
    // No user is signed in, show login button and hide logout button
    logoutBtn.style.display = 'none';
    googleLogin.style.display = 'block';
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, update user info and display it
    document.getElementById('user-pic').src = user.photoURL || 'default-user-image.png'; // Provide a default image if none
    document.getElementById('user-name').textContent = user.displayName;
    // document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-info').style.display = 'block';
    
    document.getElementById('logout-btn').style.display = 'block';
    document.getElementById('google-login-btn').style.display = 'none';
  } else {
    // No user is signed in
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'none';
    document.getElementById('google-login-btn').style.display = 'block';
  }
});

onAuthStateChanged(auth, user => {
    if(month <= 4) {
      contactBtn[0].disable = true
      contactBtn[0].style.cursor = "not-allowed"
    } else if(month >= 5 && month <= 8) {
      contactBtn[0].disable = true
      contactBtn[0].style.cursor = "not-allowed"
  
      contactBtn[1].disable = true
      contactBtn[1].style.cursor = "not-allowed"
    } else if(month >= 8) {
      contactBtn[3].disable = true
      contactBtn[3].style.cursor = "not-allowed"
    }
  
    if(user) {
      contactBtn.forEach((b, i) => {
        // b.removeEventListener("click", showMustLogAlert)
        if(!b.disable) b.addEventListener("click", () => showPayAlert(user, i))
      });    
      
    } else {
      contactBtn.forEach(b => {
        // b.removeEventListener("click", showPayAlert)
        if(!b.disable) b.addEventListener("click", showMustLogAlert)
      });
    }   
});

onAuthStateChanged(auth, user => {
  if(user) {
    getData(user).then(docData => {
      const div = document.createElement("div");
      div.className = "history-item";
      div.innerHTML = `
      <h2 style="text-transform: uppercase;">${docData.layanan}</h2>
      <p>Name: ${docData.nama_pertama} ${docData.nama_terakhir}</p>
      <p>Card Number: ${docData.nomor_kartu}</p>
      <p>Purchase Date: ${docData.tanggal_dipesan}</p>
      <p>Price: ${docData.harga}</p>
      <p>Token: ${docData.token}</p>`;

      historyContainer.appendChild(div);
    });
  
  }
  btnHisOpen.addEventListener("click", () => {
    document.querySelector(".history-container").style.display = "block";
  });
});

// General functions
async function getData(user) {
  const docRef = doc(db, "pembelian", user.email);
  try {
    const docData = await getDoc(docRef);
    return docData.data();
  } catch(err) {
    console.log(err);
  }
}

function showMustLogAlert() {
  alert("LOGIN FIRST!");
}

function showPayAlert(user, i) {
  document.querySelector('.payment-popup').style.display = 'block';

  const fName = document.getElementById('fname')
  const lName = document.getElementById('lname')
  const cardNum = document.getElementById('cardnum')
  const secCode = document.getElementById('seccode')
  const expr  = document.getElementById('expr')
  const price  = document.getElementById('price')
  const email  = document.getElementById('email')
  const plans  = document.getElementById('plans')

  email.value = user.email;

  let bookName;
  let harga;
  if(i == 0) {
    bookName = "meditation"
    harga = 550
  } else if(i == 1) {
    bookName = "zumba"
    harga = 700
  } else if(i == 2) {
    bookName = "cardio"
    harga = 550
  }

  price.value = `${harga}rb`
  plans.value = bookName

  document.querySelector(".form-pay").addEventListener("click", () => {
    if(!fName.value || !lName.value || !cardNum.value || !secCode.value || !expr.value) {
      alert("ISI SEMUA FORM!")
      return
    }
    const token = uuid
    .v4();
    setDoc(doc(db, "pembelian", user.email), {
      nama_pertama: fName.value,
      nama_terakhir: lName.value,
      layanan: bookName,
      tanggal_dipesan: getCurrentDateInWords(),
      layanan_id: i,
      harga,
      nomor_kartu: cardNum.value,
      kartu_expired: expr.value,
      kartu_security_code: secCode.value,
      token,
    }).then(() => {
      alert("Pembayaran berhasil! Cek email mu.");
      document.querySelector('.payment-popup').style.display = 'none';
      window.location.reload();
    });

    fName.value = "";
    lName.value = "";
    cardNum.value = "";
    secCode.value = ""
    expr.value = ""
  });
}

function getCurrentDateInWords() {
  const date = new Date();

  // Arrays for days and months
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Extract day, month, and year
  const dateNum = date.getDate()
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();

  // Format the date
  return `${dateNum} ${dayName}/${monthName}/${year}`;
}

btnHisClose.addEventListener("click", () => {
  document.querySelector(".history-container").style.display = "none";
})
