const { JSDOM } = require('jsdom');
const { promisify } = require('util');
const rimraf = require('rimraf');
const path = require('path');
const fse = require('fs-extra');
const fetch = require('node-fetch');

const basePath = path.join(__dirname, 'public/data');
const imgPath = path.join(basePath, '../img');

const saveImage = async url => {
  const name = path.basename(url);
  const assetUrl = `../img/${name}`;
  const filePath = path.join(basePath, assetUrl);
  const exists = await fse.exists(filePath);

  if (!exists) {
    const buffer = await fetch(url).then(r => r.buffer());
    await fse.writeFile(filePath, buffer);
  }

  return assetUrl;
};

let items = [];
let chains = [];
let materials = new Map();

const getImageSrc = element => {
  let { src, srcset } = element;
  if (srcset) {
    src = srcset
      .split(/,\s+/g)
      .map(v => v.replace(/\s+[\d.]+x/, ''))
      .pop();
  }

  return src;
};

const getMaterial = (element, list, base) => {
  const href = element.querySelector('[href]').href;
  const id = path.basename(href);
  const count = parseInt(element.textContent.trim());
  const src = getImageSrc(element.querySelector('img'));
  const name = element.querySelector('[title]').title;

  list.push([id, count]);
  materials.set(id, [new URL(src, base).href, { name, infoLink: new URL(href, base).href }]);
};

const getChain = (recipes, buildings = null, href) => {
  const chain = {
    id: null,
    recipe: [],
    output: [],
    duration: null,
    building: [],
  };

  for (const recipe of recipes.querySelectorAll('.tt_recipe_item')) {
    getMaterial(recipe, chain.recipe, href);
  }

  for (const output of recipes.querySelectorAll('.tt_output_item')) {
    getMaterial(output, chain.output, href);
  }

  let duration = recipes.querySelector('.tt_rec_arrow > div')?.textContent;
  if (duration) {
    duration = parseFloat(duration?.match(/(?<count>[\d.]+)\s*s/)?.groups.count);
    if (`${duration}` === 'NaN') duration = null;
    chain.duration = duration;
  }

  for (const building of buildings ?? []) {
    let buildingId = path.basename(building.href);
    if (buildingId && buildingId !== 'Blank') {
      materials.set(buildingId, [
        new URL(getImageSrc(building.querySelector('img')), href).href,
        { name: building.title, infoLink: new URL(building.href, href).href },
      ]);
      chain.building.push(buildingId);
    }
  }

  const join = pairs =>
    pairs
      .map(pair => pair.join('*'))
      .sort()
      .join(',');

  chain.id = `{${join(chain.recipe)}}=>{${join(chain.output)}}(${chain.duration})`;

  return chain;
};

const done = async () => {
  chains = [...new Set(chains.map(v => JSON.stringify(v)))].map(v => JSON.parse(v));

  await fse.writeJson(path.join(basePath, 'items.json'), items);
  await fse.writeJson(path.join(basePath, 'production-chains.json'), chains);
};

const getPower = content => {
  let { num, unit } = content.match(/^\s*(?<num>[\d.]+)\s*(?<unit>[kmg]?w)\s*$/i).groups;
  unit = 10 ** ({ kw: 3, mw: 6, gw: 9 }[unit.toLowerCase()] ?? 0);
  return parseFloat(num) * unit;
};

let location;

const infoGetterMap = new Map([
  ['Stack Size', { key: 'stackSize', getter: v => parseInt(v, 10) }],
  ['Work Consumption', { key: 'workConsumption', getter: getPower }],
  ['Idle Consumption', { key: 'idleConsumption', getter: getPower }],
  ['Power', { key: 'power', getter: getPower }],
  ['Production Speed', { key: 'produceSpeed', getter: v => parseFloat(v) }],
]);

const getItem = async (link, retry = 0) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1e3));
    const id = path.basename(link.href);
    if (id === 'Blank') return 0;

    const data = { id };
    items.push(data);
    data.name = link.title;

    const src = getImageSrc(link.querySelector('img'));
    data.assetUrl = await saveImage(new URL(src, location).href);
    data.stackSize = null;
    data.infoLink = new URL(link.href, location).href;
    data.info = [];

    console.log(data);
    const infoPage = await JSDOM.fromURL(data.infoLink);
    const infoDoc = infoPage.window.document;

    const categories = infoDoc.querySelector('.item_panel .tt_category')?.textContent?.trim();
    data.categories = categories ? categories.split(/,\s+/g) : [];
    data.description = infoDoc.querySelector('.item_panel .tt_desc')?.textContent ?? null;

    const infoTableTr = infoDoc.querySelectorAll('.item_panel .tt_info .tt_info_table tr');
    for (const infoTr of infoTableTr ?? []) {
      const child = [].slice.call(infoTr.children);
      const label = child.shift().textContent;
      const content = child.pop().textContent;
      data.info.push({ label, content });

      const setInfo = infoGetterMap.get(label);
      if (setInfo) {
        data[setInfo.key] = setInfo.getter(content, data);
      }
    }

    let fallbackChain = infoDoc.querySelector('.item_panel .tt_recipe');
    if (fallbackChain) fallbackChain = getChain(fallbackChain, null, data.infoLink);

    let el = infoDoc.querySelector('#Production_Chain')?.parentNode;
    if (!el) return 0;
    let max = 10;
    while (el && max > 0) {
      el = el.nextSibling;
      if (el?.classList?.contains('wikitable')) {
        [].slice.call(el.querySelectorAll('tr'), 1).forEach(tr => {
          fallbackChain = null;
          chains.push(getChain(tr.children[0], tr.children[1]?.children, data.infoLink));
        });
        break;
      }
      max -= 1;
    }

    if (fallbackChain) chains.push(fallbackChain);
    return 1;
  } catch {
    if (retry < 5) return -1;
    return getItem(link, retry + 1);
  }
};

const run = async () => {
  await promisify(rimraf)(basePath);
  await fse.mkdir(basePath);
  (await fse.exists(imgPath)) || (await fse.mkdir(imgPath));

  location = 'https://dsp-wiki.com/Items';
  const itemsPage = await JSDOM.fromURL(location);
  const doc = itemsPage.window.document;
  const links = doc.querySelectorAll('.item_icon_container a[href]');

  for (const link of links) await getItem(link);

  const ids = new Set();
  const itemMap = new Map(items.map(v => [v.id, v]));
  chains.forEach(chain => {
    if (itemMap.get(chain.itemId)?.categories?.include('Natural Resource')) return;
    chain.recipe.forEach(([id]) => ids.add(id));
    chain.output.forEach(([id]) => ids.add(id));
    chain.building?.forEach(id => ids.add(id));
  });

  items.forEach(item => {
    ids.delete(item.id);
  });

  for (const id of ids) {
    try {
      let href = `https://dsp-wiki.com/${id}`;
      console.log({ href });
      let dom = await JSDOM.fromURL(href);
      const redirect = dom.window.document.querySelector('.mw-redirectedfrom a[href]');
      if (!redirect) break;

      href = new URL(redirect.href, href).href;
      console.log({ href });
      dom = await JSDOM.fromURL(href);
      let alias = dom.window.document.querySelector('.redirectText a[href]');
      if (alias) alias = itemMap.get(alias.href.split('/').pop());
      if (!alias) break;

      alias = { ...alias };
      alias.id = id;
      items.push(alias);
      itemMap.set(id, alias);
    } catch {}
  }

  for (const [id, [src, object]] of materials) {
    if (!itemMap.has(id)) {
      items.push({
        id,
        ...object,
        assetUrl: await saveImage(new URL(src).href),
      });
    }
  }
};

run().finally(done);
