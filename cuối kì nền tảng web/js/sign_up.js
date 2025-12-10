
let admin={
    email: "admin@gmail.com",
    password: "admin",
    role: "admin"
}
localStorage.setItem("admin", JSON.stringify(admin));
document.addEventListener("DOMContentLoaded", () =>{
    const submit = document.getElementById("submit");
    if(submit){
        submit.addEventListener("click", ()=>{
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const confirm_password = document.getElementById("confirm_password").value;
            if(email.trim() ==="" || password.trim() ==="" || confirm_password.trim() ===""){
                alert("Vui lòng nhập đầy đủ dữ liệu!");
                return;
            }

            let check_letter = false;
            let check_number = false;
            let check_spacial_character = false;
            for(let i = 0; i <password.length; i++){
                let character = password[i];
                if(/[A-Za-z]/.test(character)){
                    check_letter = true;
                }
                else if(/[0-9]/.test(character)){
                    check_number = true;
                }
                else{
                    check_spacial_character = true
                }
                
            }
            if(check_letter && check_number && check_spacial_character){
                if(confirm_password === password){
                    let users = JSON.parse(localStorage.getItem("users")) || [];
                    if(email === admin.email){
                        alert("Email đã được lập, vui lòng nhập email khác!");
                        return;
                    }
                    for(let i = 0; i < users.length; i++){
                        if(email === users[i].email){
                            alert("Email đã được lập, vui lòng nhập email khác!");
                        return;
                        }
                    }
                    users.push({
                        email: email,
                        password: password,
                        role: "user"
                    });
                    localStorage.setItem("users", JSON.stringify(users))
                    alert("Đăng nhập thành công!");
                    window.location.href="../html/sign-in.html"
                };
            }
            else{
                alert("Mật khẩu phải chứa ít nhất 1 chữ, 1 số và 1 kí tự!");
                return
            }
            

        })
    }


});
