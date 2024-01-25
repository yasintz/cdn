const date = new Date('06/05/2021').getTime();
const now = new Date('01/04/2021');

const months = [
  'ocak',
  'subat',
  'mart',
  'nisan',
  'mayis',
  'haziran',
  'temmuz',
  'agustos',
  'eylul',
  'ekim',
  'kasim',
  'aralik',
];

const items = [];

const diff = (date - now.getTime()) / (1000 * 60 * 60 * 24);
for (let leftDay = diff; leftDay > 0; leftDay--) {
  const day = now.getDate();
  items.push({
    text: leftDay.toString(),
    bottomText:
      day === 1 || leftDay === diff
        ? `(${day} ${months[now.getMonth()]})`
        : `(${day})`,
  });

  now.setDate(now.getDate() + 1);
}

console.log(
  JSON.stringify({
    title: 'Sinava Kalan Zaman',
    items,
  })
);
