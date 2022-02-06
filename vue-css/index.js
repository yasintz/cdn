function VueCss() {
  const getHashCode = s =>
    s.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

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

    const hashMap = orderedByLength.map(c => ({
      className: c.substring(1),
      hash: `jss_${getHashCode(c)}`,
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
