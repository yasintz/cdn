function VueCss() {
  const getHashCode = s =>
    s.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

  const el = document.createElement("style");

  const cache = {};

  function cx() {
    var hasOwn = {}.hasOwnProperty;
    var classes = [];

    for (var i = 0; i < arguments.length; i++) {
      var arg = arguments[i];
      if (!arg) continue;

      var argType = typeof arg;

      if (argType === "string" || argType === "number") {
        classes.push((this && this[arg]) || arg);
      } else if (Array.isArray(arg)) {
        classes.push(classNames.apply(this, arg));
      } else if (argType === "object") {
        if (arg.toString === Object.prototype.toString) {
          for (var key in arg) {
            if (hasOwn.call(arg, key) && arg[key]) {
              classes.push((this && this[key]) || key);
            }
          }
        } else {
          classes.push(arg.toString());
        }
      }
    }

    return classes.join(" ");
  }

  function css(strList, ...vars) {
    if (typeof strList === "string") {
      return cache[strList];
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

    accessObject.cx = cx.bind(accessObject);

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

    return accessObject;
  }
  css.cx = id => {
    return (...args) => cx.bind(cache[id])(...args);
  };
  this.css = css;
  this.el = el;
}
