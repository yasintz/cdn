const API_URL = ' https://api.npoint.io/4aab6a5e7a2ec2d31ab5';

let cache: string[] = [];
const input = document.getElementById('input');

function publish() {
  return fetch(API_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cache),
  }).then(() => {
    // @ts-ignore
    input.value = '';
    alert('Islem Basarili');
  });
}

fetch(API_URL)
  .then((res) => res.json())
  .then((json) => {
    cache = json;
  });

function $send() {
  const text = (input as any).value;
  if (text.length !== 5) {
    alert('5 karakterli bir yazi yazin');
    return;
  }
  cache.push(text);
  publish();
}
function $clear() {
  console.log('working');
  cache = [];
  publish();
}

Object.assign(window, {
  $send,
  $clear,
});

export default cache;
