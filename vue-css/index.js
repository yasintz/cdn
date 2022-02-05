function VueCss() {
  const getHashCode = s =>
    s.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

  const el = document.createElement("style");

  const cache = {};

  function extendableCss({ strList, vars, extended }) {
    if (typeof strList === "string") {
      return { ...cache[strList], ...extended };
    }

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

    const idRegex = /\/\* \#(.*?) \*\//g;
    const firstLine = content
      .split("\n")
      .map(i => i.trim())
      .filter(i => i)[0];

    const id = (new RegExp(idRegex).exec(firstLine) || [])[1];

    if (id) {
      const idHash = getHashCode(`jss_${id}_jss`);
      const prefix = `/*${idHash}*/`;

      const [prev, old, after] = el.innerHTML.split(prefix);
      el.innerHTML = [
        //
        prev,
        after,
        prefix,
        newContent,
        prefix
      ].join("\n");

      cache[id] = accessObject;
    }

    return { ...accessObject, ...extended };
  }

  this.css = (strList, ...vars) => extendableCss({ strList, vars });
  this.el = el;
}