var web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
const eventTime = ((new Date("December 12, 2021 20:00:00")).getTime()) /1000;
const CONTRACT_ADDRESS = "0x9CD4f3D3EE197EF245D1dA5dbeB4Bfe412886Db1";
document.getElementById("price").textContent = 0.03


async function checkLogin() {
    let user = await web3.eth.getAccounts();
    if (!user[0]) {
        document.getElementById("btn-login").addEventListener("click", async () =>{
            const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
            if (!accounts) {
                alert('no acc detected, make one');
                return;
            } else {
                renderThings();
            }    
        });
    } else {
        renderThings();
    }  
}

checkLogin();

async function renderThings(){
    document.getElementById("btn-login").style.display = "none";
    document.getElementById("MustBeLoggedIn").style.display = "none";
    let abi = await getAbi();
    let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
    let price = await contract.methods.price().call({});
    document.getElementById("price").textContent = price/1000000000000000000;
    contract.methods.totalSupply().call({}).then( (result) => {
        document.getElementById("totalSupply").textContent = result;
        if (checkTime()==true){
            if (result>= 10) {
                document.getElementById("message").textContent = "Unfortunately, minting is over... Better luck next time!";
                document.getElementById("cost").style.display = "none";
    
            } else if (result == 9){
                document.getElementById("message").textContent = "There is only " + (10-result) + " masterpiece left, you better be fast!";
                document.getElementById("mint-button").style.display = "block";
    
            } else {
                document.getElementById("message").textContent = "There are only " + (10-result) + " masterpieces left, you better be fast!";
                document.getElementById("mint-button").style.display = "block";    
            }            
        } else {
            document.getElementById("message").textContent = "Unfortunately, minting hasn't started yet";
            var i = setInterval(function() {
                if (checkTime() === true){
                    document.getElementById("message").textContent = "There are only " + (10-result) + " masterpieces left, you better be fast!";
                    document.getElementById("mint-button").style.display = "block";
                    clearInterval(i);
                }
              }, 1000);
        }
    })
}

document.getElementById("mint-button").addEventListener("click", async () => {
    document.getElementById("mint-button").style.display = "none";
    let abi = await getAbi();
    let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
    let account = await web3.eth.getAccounts();
    let price = await contract.methods.price().call({});
    console.log(account[0]);
    contract.methods.mint(1).send({
        from: account[0],
        value: price,
    }).once("error", (err) => {
        console.log(err);
        document.getElementById("mint-button").style.display = "block";
    }).then((receipt) => {
        console.log("succes")
        contract.methods.totalSupply().call({}).then( (result) => {  
            document.getElementById("totalSupply").textContent = result;  
            if (result>= 10) {
                document.getElementById("message").textContent = "Unfortunately, minting is over... Better luck next time!";
                document.getElementById("mint-button").style.display = "none";
                document.getElementById("cost").style.display = "none";
            } else if (result == 9){
                document.getElementById("message").textContent = "There is only " + (10-result) + " masterpiece left, you better be fast!";
                document.getElementById("mint-button").style.display = "block"; 
            } else {
                document.getElementById("message").textContent = "There are only " + (10-result) + " masterpieces left, you better be fast!";
                document.getElementById("mint-button").style.display = "block";    
            }   
        })
    })
})

function getAbi(){
    return new Promise( (res) => {
        $.getJSON("/abi.json", ( (json) => {
            res(json);
        }))
    })}

function checkTime(){
    var now = new Date(Date.now());
    if ((now.getTime())/1000 >= eventTime){
        return true;
    } else {
        return false;
    }
}
 