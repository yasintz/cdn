function VueCss() {
  function getHashCode(s) {
    for (var h = 0, i = 0; i < s.length; h &= h) h = 31 * h + s.charCodeAt(i++);
    return h;
  }

  const el = document.createElement("style");

  function css(strList, ...vars) {
    const content = strList.reduce(
      (acc, cur, index) =>
        `${acc}${cur}${index < strList.length - 1 ? vars[index] : ""}`,
      ""
    );

    const minContent = content
      .replace(/\n/g, " ")
      .replace(/ +/g, " ")
      .replace(/\/\*.+?\*\//gs, "");

    const onlySelectors = minContent.replace(/{(.*?)}/g, " ");

    const allClasses =
      onlySelectors.match(
        /(?:[\.]{1})([a-zA-Z_]+[\w-_]*)(?:[\s\.\,\{\>#\:]{0})/gim
      ) || [];

    const uniqueClasses = allClasses.filter((v, i, s) => s.indexOf(v) === i);

    const orderedByLength = uniqueClasses.sort((a, b) => b.length - a.length);

    const contentHashCode = getHashCode(minContent);

    const hashMap = orderedByLength.map(c => ({
      className: c.substring(1),
      hash: `jss_${getHashCode(`${c}${contentHashCode}`)}`,
      class: c
    }));

    const newContent = hashMap.reduce(
      (acc, cur) => acc.split(cur.class).join(`.${cur.hash}`),
      content
    );

    const accessObject = hashMap.reduce((acc, cur) => {
      acc[cur.className] = cur.hash;
      return acc;
    }, {});

    el.innerHTML += newContent;

    return accessObject;
  }

  this.css = css;
  this.el = el;
}
