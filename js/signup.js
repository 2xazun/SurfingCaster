// 회원가입 페이지
const signupForm = document.querySelector("#signup-form");
const signupMessage = document.querySelector("#signup-message");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.querySelector("#signup-name").value.trim();
  const loginId = document.querySelector("#signup-id").value.trim();
  const password = document.querySelector("#signup-password").value;

  // 서버에서도 검사하지만, 바로 알려주기 위해 프론트에서도 한 번 검사
  if (!name || !loginId || !password) {
    signupMessage.textContent = "이름, 아이디, 비밀번호를 모두 입력해주세요.";
    return;
  }
  if (!/^[a-zA-Z0-9_]{4,20}$/.test(loginId)) {
    signupMessage.textContent = "아이디는 영문/숫자/_ 4~20자로 입력해주세요.";
    return;
  }
  if (password.length < 4) {
    signupMessage.textContent = "비밀번호는 4자 이상이어야 합니다.";
    return;
  }

  const button = signupForm.querySelector("button");
  button.disabled = true;
  signupMessage.textContent = "";

  try {
    await apiRequest("/auth/signup", {
      method: "POST",
      body: { name, loginId, password },
    });
    location.href = "/login.html?signup=done";
  } catch (error) {
    signupMessage.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
