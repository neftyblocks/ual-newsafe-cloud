export function handleTokenResponse() {
  const query = new URLSearchParams(window.location.search);
  window.opener.postMessage({ newstack_login: query.get("newsafe_jwt") }, "*");
  window.close();
}
