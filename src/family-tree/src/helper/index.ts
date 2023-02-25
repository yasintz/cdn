export function getPersonUrl(id: string, url: string) {
  const currentUrl = new URL(url);

  currentUrl.searchParams.set('user', id);

  return currentUrl.toString();
}
