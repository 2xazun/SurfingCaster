// 로그인 페이지
const loginForm = document.querySelector("#login-form");
const loginMessage = document.querySelector("#login-message");

// 이미 로그인 상태면 메인으로
if (Auth.isLoggedIn()) {
  location.replace("/index.html");
}

// 회원가입 직후 넘어온 경우 안내
if (new URLSearchParams(location.search).get("signup") === "done") {
  loginMessage.textContent = "회원가입 완료! 로그인해주세요.";
  loginMessage.classList.add("success");
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const loginId = document.querySelector("#login-id").value.trim();
  const password = document.querySelector("#login-password").value;

  loginMessage.classList.remove("success");
  if (!loginId || !password) {
    loginMessage.textContent = "아이디와 비밀번호를 입력해주세요.";
    return;
  }

  const button = loginForm.querySelector("button");
  button.disabled = true;
  loginMessage.textContent = "";

  try {
    const { token, user } = await apiRequest("/auth/login", {
      method: "POST",
      body: { loginId, password },
    });
    Auth.save(token, user);
    location.href = "/index.html";
  } catch (error) {
    loginMessage.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
