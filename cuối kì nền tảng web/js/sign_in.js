document.addEventListener("DOMContentLoaded", ()=>{
    const btn_sign_in = document.getElementById("sign-in");
    if(btn_sign_in){
        btn_sign_in.addEventListener("click", ()=>{
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            let users = JSON.parse(localStorage.getItem("users")) || [];
            let check_account = true;
            let admin = JSON.parse(localStorage.getItem("admin"));
            if(email === admin.email && password === admin.password){
                alert("Xin chao Admin!");
                check_account = false;
                let sign_admin = {
                    email: admin.email,
                    password: admin.password,
                    role: "admin"
                }
                localStorage.setItem("sign-in", JSON.stringify(sign_admin));
                window.location.href="../html/index.html";

            }
            for(let i = 0; i < users.length; i++){
                if(email === users[i].email && password === users[i].password){
                alert("Đăng nhập thành công!");
                check_account = false;
                let user ={
                    email: email,
                    password: password,
                    role: "user"
                }
                localStorage.setItem("sign_in", JSON.stringify(user));
                window.location.href="../html/index.html";
                }
            }
            if(check_account){
                alert("Tài khoản không tồn tại!");
                return
            }
        })
    }
})