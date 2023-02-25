import dTree from './helper/dtree';

const children = (...m: any[]) =>
  Array(25)
    .fill('')
    .map((v, i) => ({
      name: `User ${i}`,
      class: i % 2 === 0 ? 'woman' : 'man',
      marriages: m[i]
        ? [
            {
              spouse: {
                name: 'Iliana',
                class: i % 2 === 0 ? 'man' : 'woman',
              },
              children: m[i],
            },
          ]
        : undefined,
    }));

const j = {
  name: 'Niclas',
  class: 'man',
  textClass: 'emphasis',
  marriages: Array(2).fill({
    spouse: {
      name: 'Iliana',
      class: 'woman',
    },
    children:
      children(),
      // children(),
      // children(
      //   undefined,
      //   undefined,
      //   children(
      //     children(
      //       children(),
      //       children(undefined, undefined, children()),
      //       undefined
      //     ),
      //     children(
      //       children(),
      //       children(undefined, undefined, children()),
      //       undefined
      //     )
      //   )
      // ),
      // undefined
  }),
};

// @ts-ignore
dTree.init([j, j], {
  target: '#root',
  debug: true,
  hideMarriageNodes: true,
  marriageNodeSize: 5,
  height: 800,
  width: 1200,
  callbacks: {
    // @ts-ignore
    nodeClick: function (name, extra) {
      alert('Click: ' + name);
    },
    // @ts-ignore
    nodeRightClick: function (name, extra) {
      alert('Right-click: ' + name);
    },
    // @ts-ignore
    textRenderer: function (name, extra, textClass) {
      if (extra && extra.nickname) name = name + ' (' + extra.nickname + ')';
      return "<p align='center' class='" + textClass + "'>" + name + '</p>';
    },
    // @ts-ignore
    marriageClick: function (extra, id) {
      alert('Clicked marriage node' + id);
    },
    // @ts-ignore
    marriageRightClick: function (extra, id) {
      alert('Right-clicked marriage node' + id);
    },
  },
});

export {};
