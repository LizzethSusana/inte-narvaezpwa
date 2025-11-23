export function saveAuth(token, role) {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
}
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  location.reload();
}
export function currentRole() {
  return localStorage.getItem("role");
}
