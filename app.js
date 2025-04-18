  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
  import { 
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    deleteDoc,
    updateDoc,
    deleteField,

   } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

  import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword ,
    onAuthStateChanged,
    signOut,
   } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

   

   const firebaseConfig = {
     API KEYS
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // If user is logged in and on login/signup page, redirect to admin
      if (
        location.pathname.endsWith("index.html") &&
        location.pathname.endsWith("login.html")
      ) {
        location.href = "./admin.html";
      }
    } else {
      // If user is NOT logged in and tries to access admin page, redirect to login
      if (location.pathname.endsWith("admin.html")) {
        location.href = "./login.html";
      }
    }
  });
  let getSbtn = document.getElementById('sBtn')
  if(getSbtn){
    getSbtn.addEventListener('click', ()=>{
      let getSemail = document.getElementById('sEmail')
      let getSpassword = document.getElementById('sPassword')
      createUserWithEmailAndPassword(auth, getSemail.value, getSpassword.value)
      .then((userCredential) => {
        const user = userCredential.user;
  
        Swal.fire({
          title: "Sign up success!",
          text: `Congrats ${getSemail.value}`,
          icon: "success",
        }).then(() => {
          location.href = "./login.html";
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Invalid Credentials"
        });
      });
  });
  }

let getLbtn = document.getElementById('lBtn')
if(getLbtn){
  getLbtn.addEventListener('click',()=>{
    let getLemail = document.getElementById('lEmail')
    let getLpassword = document.getElementById('lPassword')
    signInWithEmailAndPassword(auth, getLemail.value, getLpassword.value)
    .then((userCredential) => {
      const user = userCredential.user;
      Swal.fire({
        title: "Login success!",
        text: `Congrats ${getLemail.value}`,
        icon: "success",
      }).then(() => {
        location.href = "./admin.html";
      });
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Invalid Credentials"
      });
    });
  })
}
let getObtn = document.getElementById('obtn')
getObtn.addEventListener('click',()=>{
  signOut(auth)
    .then(() => {
      Swal.fire({
        title: "User Signed Out Successfully",
        text: `Byee Byee <3`,
        icon: "success",
      }).then(() => {
        window.location.href = "login.html";
      });
    })
    .catch((error) => {
      console.error("Error signing out:", error);
      Swal.fire({
        icon: "error",
        title: "Oops ...",
        text: "Abhi na jaao Chor kr",
      });
    });
})

let getItems = document.getElementById('addItems')
getItems.addEventListener('click',async ()=>{
  getProductListDiv.innerHTML = "";

  const product_id = document.getElementById("productId").value;
  const product_name = document.getElementById("productName").value;
  const product_price = document.getElementById("productPrice").value;
  const product_des = document.getElementById("productDesc").value;
  const product_url = document.getElementById("productImage").value;
  try {
    const docRef = await addDoc(collection(db, "items"), {
      product_id: product_id,
      product_name: product_name,
      product_price: product_price,
      product_des: product_des,
      product_url: product_url,
    });
    Swal.fire({
      title: "Product Added Successfully",
      text: `your order id is ${docRef.id}`,
      icon: "success",
    });
    getProductList();
  } catch (e) {
    console.error("Error adding document: ", e);
  }
})

let getProductListDiv = document.getElementById("product-list");

async function getProductList() {
  const querySnapshot = await getDocs(collection(db, "items"));
  querySnapshot.forEach((doc) => {
    getProductListDiv.innerHTML += `<div class="card" style="width: 22rem;">
    <img src=${doc.data().product_url} class="card-img-top" alt="Image">
    <div class="card-body">
      <h5 class="card-title">${doc.data().product_name}</h5>
      <p class="card-text">${doc.data().product_des}</p>
      <h5 class="card-title">${doc.data().product_price}</h5>
      <button onclick='openEditModal("${doc.id}", "${
      doc.data().product_name
    }", "${doc.data().product_price}", "${doc.data().product_des}", "${
      doc.data().product_url
    }")' class='btn btn-info'> Edit </button>
      <button onclick='delItem("${
        doc.id
      }")' class='btn btn-danger'> Delete </button>
      </div>
  </div>`;
  });
}
if (getProductListDiv) {
  getProductList();
}

async function delItem(params) {
  getProductListDiv.innerHTML = "";
  const cityRef = doc(db, "items", params);
  await deleteDoc(cityRef, {
    capital: deleteField(),
  });
  getProductList();
}
window.delItem = delItem;

window.openEditModal = function (id, name, price, desc, url) {
  document.getElementById("editProductId").value = id;
  document.getElementById("editProductName").value = name;
  document.getElementById("editProductPrice").value = price;
  document.getElementById("editProductDesc").value = desc;
  document.getElementById("editProductImage").value = url;

  let editModal = new bootstrap.Modal(
    document.getElementById("editProductModal")
  );
  editModal.show();
};

window.saveProductChanges = async function () {
  const id = document.getElementById("editProductId").value;
  const name = document.getElementById("editProductName").value;
  const price = document.getElementById("editProductPrice").value;
  const desc = document.getElementById("editProductDesc").value;
  const url = document.getElementById("editProductImage").value;

  const productRef = doc(db, "items", id);

  try {
    await updateDoc(productRef, {
      product_id: id,
      product_name: name,
      product_price: price,
      product_des: desc,
      product_url: url,
    });
    Swal.fire({
      title: "Updated!",
      text: "Product updated successfully.",
      icon: "success",
    });
    getProductListDiv.innerHTML = "";
    getProductList();
    bootstrap.Modal.getInstance(
      document.getElementById("editProductModal")
    ).hide();
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Update Failed",
      text: error.message,
    });
  }
};
