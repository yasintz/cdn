function create(dayForPerWeek, week) {
  const title = `Do it ${dayForPerWeek * week} times in ${week} week`;

  const items = [];

  for (let i = 1; i <= week; i++) {
    let added = false;
    for (let j = 1; j <= dayForPerWeek; j++) {
      items.push({
        text: `${j}`,
        bottomText: !added ? `(week ${i})` : undefined,
      });
      added = true;
    }
  }

  console.log(JSON.stringify({ title, items }));
}

create(3, 15);
