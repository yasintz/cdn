// @ts-ignore
import TreeBuilder from './builder.js';
import _ from 'lodash';
// @ts-ignore
import d3 from './d3';
import './style.scss';

const dTree = {
  VERSION: '/* @echo DTREE_VERSION */',

  init: function (data: any, options = {}) {
    var opts = _.defaultsDeep(options || {}, {
      target: '#graph',
      debug: false,
      width: 600,
      height: 600,
      hideMarriageNodes: true,
      callbacks: {
        nodeHeightSeperation: (nodeWidth: number, nodeMaxHeight: number) =>
          TreeBuilder._nodeHeightSeperation(nodeWidth, nodeMaxHeight),
        nodeRenderer: function (
          // @ts-ignore
          name,
          // @ts-ignore
          x,
          // @ts-ignore
          y,
          // @ts-ignore
          height,
          // @ts-ignore
          width,
          // @ts-ignore
          extra,
          // @ts-ignore
          id,
          // @ts-ignore
          nodeClass,
          // @ts-ignore
          textClass,
          // @ts-ignore
          textRenderer
          // @ts-ignore
        ) {
          return TreeBuilder._nodeRenderer(
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
          );
        },
        // @ts-ignore
        nodeSize: function (nodes, width, textRenderer) {
          return TreeBuilder._nodeSize(nodes, width, textRenderer);
        },
        // @ts-ignore
        nodeSorter: function (aName, aExtra, bName, bExtra) {
          return 10;
        },
        // @ts-ignore
        textRenderer: function (name, extra, textClass) {
          return TreeBuilder._textRenderer(name, extra, textClass);
        },
        // @ts-ignore
        marriageSize: function (nodes, size) {
          return TreeBuilder._marriageSize(nodes, size);
        },
      },
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      nodeWidth: 132,
      marriageNodeSize: 10,
      styles: {
        node: 'node',
        marriageNode: 'marriageNode',
        linage: 'linage',
        marriage: 'marriage',
        text: 'nodeText',
      },
    });

    // @ts-ignore
    var data = this._preprocess(data, opts);
    var treeBuilder = new TreeBuilder(data.root, data.siblings, opts);
    treeBuilder.create();

    // @ts-ignore
    function _zoomTo(x, y, zoom = 1, duration = 500) {
      treeBuilder.svg
        .transition()
        .duration(duration)
        .call(
          treeBuilder.zoom.transform,
          d3.zoomIdentity
            .translate(opts.width / 2, opts.height / 2)
            .scale(zoom)
            .translate(-x, -y)
        );
    }

    return {
      resetZoom: function (duration = 500) {
        treeBuilder.svg
          .transition()
          .duration(duration)
          .call(
            treeBuilder.zoom.transform,
            d3.zoomIdentity.translate(opts.width / 2, opts.margin.top).scale(1)
          );
      },
      zoomTo: _zoomTo,
      // @ts-ignore
      zoomToNode: function (nodeId, zoom = 2, duration = 500) {
        const node = _.find(treeBuilder.allNodes, { data: { id: nodeId } });
        if (node) {
          _zoomTo(node.x, node.y, zoom, duration);
        }
      },
      zoomToFit: function (duration = 500) {
        const groupBounds = treeBuilder.g.node().getBBox();
        const width = groupBounds.width;
        const height = groupBounds.height;
        const fullWidth = treeBuilder.svg.node().clientWidth;
        const fullHeight = treeBuilder.svg.node().clientHeight;
        const scale = 0.95 / Math.max(width / fullWidth, height / fullHeight);

        treeBuilder.svg
          .transition()
          .duration(duration)
          .call(
            treeBuilder.zoom.transform,
            d3.zoomIdentity
              .translate(
                fullWidth / 2 - scale * (groupBounds.x + width / 2),
                fullHeight / 2 - scale * (groupBounds.y + height / 2)
              )
              .scale(scale)
          );
      },
    };
  },

  // @ts-ignore
  _preprocess: function (data, opts) {
    var siblings: any[] = [];

    var root = {
      name: '',
      id: 'root',
      hidden: true,
      children: [],
    };

    function reconstructTree(
      person: any,
      parent: any,
      index: number | string,
      mappedParent: any[]
    ) {
      const parentChildren = [];
      var node = {
        name: person.name,
        id: person.extra.person.id,
        hidden: false,
        children: [],
        extra: person.extra,
        textClass: person.textClass ? person.textClass : opts.styles.text,
        class: person.class ? person.class : opts.styles.node,
        index,
        mappedParent,
        noParent: parent === root,
      };

      for (var i = 0; i < person.depthOffset; i++) {
        var pushNode = {
          name: '',
          id: `${person.extra.person.id}_depth_offset_${i}`,
          hidden: true,
          children: [],
          noParent: node.noParent,
        };
        parentChildren.push(pushNode);
        parent = pushNode;
      }

      // sort children
      dTree._sortPersons(person.children, opts);

      // node.children = person.children
      // add "direct" children
      _.forEach(person.children, function (child, index) {
        reconstructTree(child, node, index, person.children);
      });

      //sort marriages
      dTree._sortMarriages(person.marriages, opts);

      if (person.marriages.length < 2) {
        parentChildren.push(node);
      }

      let isPushed = false;
      _.forEach(person.marriages, function (marriage, index) {
        var sp = marriage.spouse;
        var m = {
          name: '',
          id: `${sp.extra.person.id}_partner_connection`,
          hidden: opts.hideMarriageNodes,
          noParent: true,
          children: [],
          isMarriage: true,
          extra: marriage.extra,
          class: marriage.class ? marriage.class : opts.styles.marriageNode,
        };

        var spouse = {
          name: sp.name,
          id: sp.extra.person.id,
          hidden: false,
          noParent: true,
          children: [],
          textClass: sp.textClass ? sp.textClass : opts.styles.text,
          class: sp.class ? sp.class : opts.styles.node,
          extra: sp.extra,
          marriageNode: m,
        };

        if (person.marriages.length >= 2 && !isPushed) {
          parentChildren.push(spouse, m);
          isPushed = true;
          parentChildren.push(node);
        } else {
          parentChildren.push(m, spouse);
        }

        dTree._sortPersons(marriage.children, opts);
        _.forEach(marriage.children, function (child, index) {
          reconstructTree(child, m, index, marriage.children);
        });

        siblings.push({
          source: {
            __node: node,
            id: node.id,
          },
          target: {
            __node: spouse,
            id: spouse.id,
          },
          number: index,
        });
      });

      parent.children.push(...parentChildren);
    }

    _.forEach(data, function (person, index) {
      reconstructTree(person, root, index, data);
    });

    return {
      root: d3.hierarchy(root),
      siblings,
    };
  },

  // @ts-ignore
  _sortPersons: function (persons, opts) {
    if (persons != undefined) {
      // @ts-ignore
      persons.sort(function (a, b) {
        return opts.callbacks.nodeSorter.call(
          // @ts-ignore
          this,
          a.name,
          a.extra,
          b.name,
          b.extra
        );
      });
    }
    return persons;
  },

  // @ts-ignore
  _sortMarriages: function (marriages, opts) {
    if (marriages != undefined && Array.isArray(marriages)) {
      marriages.sort(function (marriageA, marriageB) {
        var a = marriageA.spouse;
        var b = marriageB.spouse;
        return opts.callbacks.nodeSorter.call(
          // @ts-ignore
          this,
          a.name,
          a.extra,
          b.name,
          b.extra
        );
      });
    }
    return marriages;
  },
};

export default dTree;
