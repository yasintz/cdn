import _ from 'lodash';
import d3 from './d3';

const stringToColor = (str) => {
  let hash = 0;
  str.split('').forEach((char) => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  });
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += value.toString(16).padStart(2, '0');
  }
  return color;
};

class TreeBuilder {
  constructor(root, siblings, opts) {
    TreeBuilder.DEBUG_LEVEL = opts.debug ? 1 : 0;

    this.root = root;
    this.siblings = siblings;
    this.opts = opts;

    // flatten nodes
    this.allNodes = this._flatten(this.root);

    // calculate node sizes
    this.nodeSize = opts.callbacks.nodeSize.call(
      this,
      // filter hidden and marriage nodes
      _.filter(
        this.allNodes,
        (node) => !(node.hidden || _.get(node, 'data.isMarriage'))
      ),
      opts.nodeWidth,
      opts.callbacks.textRenderer
    );
    this.marriageSize = opts.callbacks.marriageSize.call(
      this,
      // filter hidden and non marriage nodes
      _.filter(
        this.allNodes,
        (node) => !node.hidden && _.get(node, 'data.isMarriage')
      ),
      this.opts.marriageNodeSize
    );
  }

  create() {
    let opts = this.opts;
    let nodeSize = this.nodeSize;

    let width = opts.width + opts.margin.left + opts.margin.right;
    let height = opts.height + opts.margin.top + opts.margin.bottom;

    // create zoom handler
    const zoom = (this.zoom = d3
      .zoom()
      .scaleExtent([0.1, 10])
      .on('zoom', function () {
        g.attr('transform', d3.event.transform);
      }));

    // make a svg
    const svg = (this.svg = d3
      .select(opts.target)
      .append('svg')
      .attr('viewBox', [0, 0, width, height])
      .call(zoom));

    // create svg group that holds all nodes
    const g = (this.g = svg.append('g'));

    // set zoom identity
    svg.call(
      zoom.transform,
      d3.zoomIdentity.translate(width / 2, opts.margin.top).scale(1)
    );

    // Compute the layout.
    this.tree = d3
      .tree()
      .nodeSize([
        nodeSize[0] * 2,
        opts.callbacks.nodeHeightSeperation.call(
          this,
          nodeSize[0],
          nodeSize[1]
        ),
      ]);

    this.tree.separation(function separation(a, b) {
      if (a.data.hidden || b.data.hidden) {
        return 0.3;
      } else {
        return 0.6;
      }
    });

    this._update(this.root);
  }

  _update(source) {
    let opts = this.opts;
    let allNodes = this.allNodes;
    let nodeSize = this.nodeSize;
    let marriageSize = this.marriageSize;

    let treenodes = this.tree(source);
    let links = treenodes.links();

    // Create the link lines.
    this.g
      .selectAll('.link')
      .data(links)
      .enter()
      // filter links with no parents to prevent empty nodes
      .filter(function (l) {
        return !l.target.data.noParent;
      })
      .append('path')
      .attr('class', opts.styles.linage)
      .attr('d', this._elbow)
      .attr('stroke', (d, i) =>
        stringToColor(`sibling ${d.source.id} ${d.target.id}${i}`)
      );

    let nodes = this.g.selectAll('.node').data(treenodes.descendants()).enter();

    this._linkSiblings();

    // Draw siblings (marriage)
    this.g
      .selectAll('.sibling')
      .data(this.siblings)
      .enter()
      .append('path')
      .attr('class', opts.styles.marriage)
      .attr('d', _.bind(this._siblingLine, this))
      .attr('stroke', (d, i) =>
        stringToColor(`marriage ${d.source.id} ${d.target.id}${i}`)
      );

    // Create the node rectangles.

    nodes
      .append('foreignObject')
      .filter(function (d) {
        return d.data.hidden ? false : true;
      })
      .attr('x', function (d) {
        return Math.round(d.x - d.cWidth / 2) + 'px';
      })
      .attr('y', function (d) {
        return Math.round(d.y - d.cHeight / 2) + 'px';
      })
      .attr('width', function (d) {
        return d.cWidth + 'px';
      })
      .attr('height', function (d) {
        return d.cHeight + 'px';
      })
      .attr('id', function (d) {
        return d.id;
      })
      .html(function (d) {
        return opts.callbacks.nodeRenderer.call(
          this,
          d.data.name,
          d.x,
          d.y,
          nodeSize[0],
          nodeSize[1],
          d.data.extra,
          d.data.id,
          d.data.class,
          d.data.textClass,
          opts.callbacks.textRenderer
        );
      })
      .on('dblclick', function () {
        // do not propagate a double click on a node
        // to prevent the zoom from being triggered
        d3.event.stopPropagation();
      })
      .on('click', function (d) {
        // ignore double-clicks and clicks on hidden nodes
        if (d3.event.detail === 2 || d.data.hidden) {
          return;
        }
        if (d.data.isMarriage) {
          opts.callbacks.marriageClick.call(this, d.data.extra, d.data.id);
        } else {
          opts.callbacks.nodeClick.call(
            this,
            d.data.name,
            d.data.extra,
            d.data.id
          );
        }
      })
      .on('contextmenu', function (d) {
        if (d.data.hidden) {
          return;
        }
        d3.event.preventDefault();
        if (d.data.isMarriage) {
          opts.callbacks.marriageRightClick.call(this, d.data.extra, d.data.id);
        } else {
          opts.callbacks.nodeRightClick.call(
            this,
            d.data.name,
            d.data.extra,
            d.data.id
          );
        }
      });
  }

  _flatten(root) {
    let n = [];
    let i = 0;

    function recurse(node) {
      if (node.children) {
        node.children.forEach(recurse);
      }
      if (!node.id) {
        node.id = ++i;
      }
      n.push(node);
    }
    recurse(root);
    return n;
  }

  // children lline
  _elbow(d) {
    if (d.target.data.noParent) {
      return 'M0,0L0,0';
    }

    const index = d.target.data.index;
    const isPlacedAtLeft = d.target.x > d.source.x;
    const sameDirectionSiblings = d.target.parent.children.filter((i) =>
      isPlacedAtLeft ? i.x > d.source.x : i.x < d.source.x
    );

    const sameDirectionIndex = sameDirectionSiblings.findIndex(
      (i) => i.id === d.target.id
    );

    const lineY =
      d.target.y -
      (d.target.y - d.source.y) / 2 +
      (isPlacedAtLeft
        ? sameDirectionSiblings.length - sameDirectionIndex
        : sameDirectionIndex) /
        2;

    let linedata = [
      {
        x: d.source.x + index * 1.2,
        y: d.source.y,
      },
      {
        x: d.source.x + index * 1.2,
        y: lineY,
      },
      {
        x: d.target.x,
        y: lineY,
      },
      {
        x: d.target.x,
        y: d.target.y,
      },
    ];

    let fun = d3
      .line()
      .x((d) => d.x)
      .y((d) => d.y);

    return fun(linedata);
  }

  _linkSiblings() {
    let allNodes = this.allNodes;

    _.forEach(this.siblings, (sibling) => {
      const source = allNodes.find((v) => sibling.source.id == v.data.id);
      const target = allNodes.find((v) => sibling.target.id == v.data.id);
      sibling.source.x = source.x;
      sibling.source.y = source.y;
      sibling.target.x = target.x;
      sibling.target.y = target.y;

      const marriageId =
        source.data.marriageNode != null
          ? source.data.marriageNode.id
          : target.data.marriageNode.id;

      const marriageNode = allNodes.find((n) => n.data.id == marriageId);
      sibling.source.marriageNode = marriageNode;
      sibling.target.marriageNode = marriageNode;
    });
  }

  // marriage line
  _siblingLine(p, i) {
    const d = p;
    // const d = {
    //   ...p,
    //   source: _.minBy([p.source, p.target], 'x'),
    //   target: _.maxBy([p.source, p.target], 'x'),
    // };

    // console.log({d,p})

    let ny = Math.round(d.target.y + (d.source.y - d.target.y) * 0.5);
    let nodeWidth = this.nodeSize[0];
    let nodeHeight = this.nodeSize[1];

    // Not first marriage
    if (d.number > 0) {
      ny -= Math.round((nodeHeight * 8) / 10);
    }

    let linedata = [
      {
        x: d.source.x,
        y: d.source.y,
      },
      {
        x: d.target.x,
        y: d.target.y,
      },
    ];

    const fun = d3
      .line()
      .curve(d3.curveStepAfter)
      .x(function (d) {
        return d.x;
      })
      .y(function (d) {
        return d.y;
      });

    const result = fun(linedata);
    return result;
  }

  static _nodeHeightSeperation(nodeWidth, nodeMaxHeight) {
    return nodeMaxHeight + 25;
  }

  static _nodeSize(nodes, width, textRenderer) {
    let maxWidth = 0;
    let maxHeight = 45;
    let tmpSvg = document.createElement('svg');
    document.body.appendChild(tmpSvg);

    _.map(nodes, function (n) {
      let container = document.createElement('div');
      container.setAttribute('class', n.data.class);
      container.style.visibility = 'hidden';
      container.style.maxWidth = width + 'px';

      let text = textRenderer(n.data.name, n.data.extra, n.data.textClass);
      container.innerHTML = text;

      tmpSvg.appendChild(container);
      // let height = container.offsetHeight;
      let height = 45;
      tmpSvg.removeChild(container);

      maxHeight = Math.max(maxHeight, height);
      n.cHeight = height;
      if (n.data.hidden) {
        n.cWidth = 0;
      } else {
        n.cWidth = width;
      }
    });
    document.body.removeChild(tmpSvg);

    return [width, maxHeight];
  }

  static _marriageSize(nodes, size) {
    _.map(nodes, function (n) {
      if (!n.data.hidden) {
        n.cHeight = size;
        n.cWidth = size;
      }
    });

    return [size, size];
  }

  static _nodeRenderer(
    name,
    x,
    y,
    height,
    width,
    extra,
    id,
    nodeClass,
    textClass,
    textRenderer
  ) {
    let node = '';
    node += '<div ';
    node += 'style="height:100%;width:100%;" ';
    node += 'class="' + nodeClass + '" ';
    node += 'id="node' + id + '">\n';
    node += textRenderer(name, extra, textClass);
    node += '</div>';
    return node;
  }

  static _textRenderer(name, extra, textClass) {
    let node = '';
    node += '<p ';
    node += 'align="center" ';
    node += 'class="' + textClass + '">\n';
    node += name;
    node += '</p>\n';
    return node;
  }

  static _debug(msg) {
    if (TreeBuilder.DEBUG_LEVEL > 0) {
      console.log(msg);
    }
  }
}

export default TreeBuilder;
