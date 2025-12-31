// ACCESS CODE FOR LOGIN
const ACCESS_CODE="WSJ2027";
let editIndex=null;
let paymentFilter="All";

// DOM ELEMENTS
const loginScreen=document.getElementById("loginScreen");
const app=document.getElementById("app");

const totalBadgesEl=document.getElementById("totalBadges");
const totalPaymentEl=document.getElementById("totalPayment");
const completedOrdersEl=document.getElementById("completedOrders");

const form=document.getElementById("orderForm");
const table=document.getElementById("orderTable");
const searchInput=document.getElementById("searchInput");
const statusFilter=document.getElementById("statusFilter");

// LOAD ORDERS FROM LOCALSTORAGE
let orders=JSON.parse(localStorage.getItem("sewingOrders"))||[];

// LOGIN FUNCTIONS
function login(){
  if(loginCode.value===ACCESS_CODE){
    sessionStorage.setItem("loggedIn","true");
    loginScreen.classList.add("hidden");
    app.classList.remove("hidden");
  } else {
    loginError.textContent="Incorrect code";
  }
}

function logout(){
  sessionStorage.clear();
  location.reload();
}

// SHOW APP IF LOGGED IN
if(sessionStorage.getItem("loggedIn")){
  loginScreen.classList.add("hidden");
  app.classList.remove("hidden");
}

// BADGES INPUT → UPDATE PAYMENT
badges.addEventListener("input",()=>{
  const count=badges.value||0;
  payment.value=count?`£${(count*0.5).toFixed(2)}`:"";
});

// SAVE ORDERS TO LOCALSTORAGE
function saveOrders(){ localStorage.setItem("sewingOrders",JSON.stringify(orders)); }

// FILTER BY PAYMENT
function setPaymentFilter(value){ paymentFilter=value; renderOrders(); }

// RENDER ORDERS TABLE & SUMMARY
function renderOrders(){
  table.innerHTML="";
  let totalBadges=0;
  let totalPayment=0;
  let completedCount=0;
  const today=new Date().toISOString().split("T")[0];

  orders.forEach((o,i)=>{
    if((statusFilter.value!=="All" && o.status!==statusFilter.value) ||
       (paymentFilter!=="All" && o.paid!==paymentFilter) ||
       (!o.name.toLowerCase().includes(searchInput.value.toLowerCase()) &&
        !String(o.badges).includes(searchInput.value))) return;

    const overdue=o.collection && o.collection<today && o.status!=="Completed";
    const unpaid=o.paid==="No";

    table.innerHTML+=`
      <tr class="${overdue?"overdue":""} ${unpaid?"unpaid":""}">
        <td contenteditable="true" onblur="updateOrder(${i},'name',this.textContent)">${o.name}</td>
        <td contenteditable="true" onblur="updateOrder(${i},'badges',this.textContent);updatePayment(${i})">${o.badges}</td>
        <td>£${(o.badges*0.5).toFixed(2)}</td>
        <td contenteditable="true" onblur="updateOrder(${i},'dropoff',this.textContent)">${o.dropoff||""}</td>
        <td contenteditable="true" onblur="updateOrder(${i},'collection',this.textContent)">${o.collection||""}</td>
        <td contenteditable="true" onblur="updateOrder(${i},'status',this.textContent)">${o.status}</td>
        <td contenteditable="true" onblur="updateOrder(${i},'paid',this.textContent)">${o.paid==="Yes"?"Yes":"No"}</td>
      </tr>`;

    // Update totals
    totalBadges+=parseInt(o.badges)||0;
    if(o.paid==="Yes") totalPayment+=(o.badges*0.5);
    if(o.status==="Completed") completedCount++;
  });

  totalBadgesEl.textContent=totalBadges;
  totalPaymentEl.textContent=totalPayment.toFixed(2);
  completedOrdersEl.textContent=completedCount;
}

// INLINE EDITING FUNCTIONS
function updateOrder(i,field,value){
  if(field==="badges") value=parseInt(value)||0;
  orders[i][field]=value;
  saveOrders();
  renderOrders();
}

function updatePayment(i){
  orders[i].payment=`£${(orders[i].badges*0.5).toFixed(2)}`;
  saveOrders();
  renderOrders();
}

// FORM SUBMIT
form.addEventListener("submit",e=>{
  e.preventDefault();
  const order={
    name:name.value,
    badges:parseInt(badges.value)||0,
    payment:`£${(badges.value*0.5).toFixed(2)}`,
    dropoff:dropoff.value,
    collection:collection.value,
    status:status.value,
    paid:paid.value
  };
  if(editIndex!==null){ orders[editIndex]=order; editIndex=null; } else { orders.push(order); }
  saveOrders(); form.reset(); renderOrders();
});

// SEARCH & STATUS FILTER
searchInput.addEventListener("input", renderOrders);
statusFilter.addEventListener("change", renderOrders);

// INITIAL RENDER
renderOrders();


