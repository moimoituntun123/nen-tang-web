document.addEventListener("DOMContentLoaded", function(){
    const confirm = document.getElementById("confirm");
    if(confirm){
        confirm.addEventListener("click", function(){
            const email = document.getElementById("email").value;
            users = JSON.parse(localStorage.getItem("users")) || [];
            if(email.trim() == ""){
                alert("Vui lòng nhập đầy đủ email");
                return;
            }
            else{
                if(email == "admin@gmail.com"){
                    alert("Tai khoan khong ton tai");
                }
                else{
                    check = false;
                    for(let i = 0; i < users.length; i++){
                        if(email == users[i].email){
                            check = true;
                            alert("Mat khau cua ban la: " + users[i].password);
                            break;
                        }
                    }
                    if(!check){
                        alert("Tai khoan khong ton tai");
                        return;
                    }
                }
            }
        })
    }

})