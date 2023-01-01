/* Last Edit 2022/07/17 */ 

var getVal = (id) => document.getElementById(id).value;
var getElem = (id) => document.getElementById(id);

function copyToClipboard(id) {
  // コピー対象をJavaScript上で変数として定義する
  var copyTarget = getElem(id);

  // コピー対象のテキストを選択する
  copyTarget.select();

  if(copyTarget.value == "") {
    alert("先に結果を出力してください");
  } else {
    // 選択しているテキストをクリップボードにコピーする
    document.execCommand("Copy");
  }

} // https://www.marorika.com/entry/copy-to-clipboard

function stringify(code){
  const str = JSON.stringify(code);
  if(!str.includes('"')) return str.replace(/\{(?!\})|\[(?!\])|,|:/g,'$& ').replace(/(?<!\{)\}|(?<!\[)\]/g,' $&');
  return str.replace(/^(.*?)"|"(.*?)"|"(.*?)$/g,data=>data.replace(/\{(?!\})|\[(?!\])|,|:/g,'$& ').replace(/(?<!\{)\}|(?<!\[)\]/g,' $&'));
}
function shaping(json,limit) {
  if(typeof json === 'string') json = JSON.parse(json.replace(/\/\/.*?\n|\/\*.*?\*\//gs,''));
  return JSON.stringify(json,(_,value)=>{
    if(!_ || typeof value !== 'object') return value;
    const size = JSON.stringify(value).length;
    if(size < limit || !limit) return `<<[${stringify(value)}]>>`;
    if(Object.prototype.toString.call(value).match(/Array/)){
      return value.reduce((a,b)=>{
        const now = a.slice(-1)[0];
        const next = typeof b === 'object' ? JSON.stringify(b):b;
        if(JSON.stringify([...now,next]).length <= limit) now.push(b);
        else a.push(typeof b === 'object' <= limit ? [`<<[${stringify(b)}]>>`]:[b]);
        return a;
      },[[]]).filter(d=>d.length).map(d=>typeof d[0] === 'object' && d.length === 1 ? d[0]:`<<${stringify(d)}>>`);
    }
    return value;
  },2).replace(/\\?"<<.|\\{1,2}(?=")|\s?.>>\\?"/g,'');
}

function tool1() { // 空白・改行消し

  function spaceRemover(inp, spc, rtn) {
    let r = inp;
    if(rtn) { r = r.replace(/\n/g, ""); }
    if(spc) {
      r = r.replace(/\\"/g, "🗨");
      let l = r.split("");
      let [bq, dq, sq] = [0, 0, 0];
      for(let i=1; i<=l.length; i++) {
        let j = l.length - i;
        if(l[j]=="`") {
          bq += (bq)?1:-1;
        } else if(l[j]=="\"") {
          dq += (dq)?1:-1;
        } else if(l[j]=="'") {
          sq += (sq)?1:-1;
        } else if(l[j] == " ") {
          if(bq==0 && dq==0 && sq==0) {
            l[j] = "";
          }
        }
      }
      r = l.join("");
      r = r.replace(/🗨/g, '\\"');
    }
    return r;
  }

  try {
    let inp = getVal("input1");
    let spc = getElem("tool1-remove_space").checked;
    let rtn = getElem("tool1-remove_return").checked;

    getElem("output1").textContent = spaceRemover(inp, spc, rtn);
  } catch(e) {
    getElem("output1").textContent = e;
  }
}

function tool2() { // スマート整形

  try {
    let inp = getVal("input2");
    let num = getVal("tool2-num");

    getElem("output2").textContent = shaping(inp, num);
  } catch(e) {
    getElem("output2").textContent = e;
  }
}

function returnBlock() {
  try {
    document.getElementById("blockOutput").textContent = makeBlock();
  } catch(e) {
    document.getElementById("blockOutput").textContent = e;
  }
}
function returnItem() {
  try {
    document.getElementById("itemOutput").textContent = makeItem();
  } catch(e) {
    document.getElementById("itemOutput").textContent = e;
  }
}
function allange(id, type, to) {
  switch(type) {
    case 0:
      getElem(id + "-number").value = to; break;
    case 1:
      getElem(id.split("-")[0]).value = to;
  }
}

function makeBlock() {
  let err = [];
  let res = {
    format_version: "1.18.0",
    "minecraft:block": {
      description: {
        identifier: `${getVal("prefix")}:${getVal("name")}`
      },
      components: {
        // "minecraft:geometry": `geometry.${getVal("geometry")}`
      }
    }
  }

  let isOverAimBox = Number(getVal("AimCollision_origin_x"))+Number(getVal("AimCollision_size_x")) > 8
    || Number(getVal("AimCollision_origin_y"))+Number(getVal("AimCollision_size_y")) > 16
    || Number(getVal("AimCollision_origin_z"))+Number(getVal("AimCollision_size_z")) > 8;
  let isOverBlockBox = Number(getVal("BlockCollision_origin_x"))+Number(getVal("BlockCollision_size_x")) > 8
    || Number(getVal("BlockCollision_origin_y"))+Number(getVal("BlockCollision_size_y")) > 16
    || Number(getVal("BlockCollision_origin_z"))+Number(getVal("BlockCollision_size_z")) > 8;
  if(getVal("prefix") == "") err.push("ネームスペースは必須項目です");
  if(getVal("name") == "") err.push("名前は必須項目です");
  if(isOverAimBox) err.push("エイムコリジョンはブロックのサイズを超えることができません")
  if(isOverBlockBox) err.push("ブロックコリジョンはブロックのサイズを超えることができません")

  let compone = res["minecraft:block"].components;
  let changeAimBox = Number(getVal("AimCollision_origin_x")) != -8
    || Number(getVal("AimCollision_origin_y")) != 0
    || Number(getVal("AimCollision_origin_z")) != -8
    || Number(getVal("AimCollision_size_x")) != 16
    || Number(getVal("AimCollision_size_y")) != 16
    || Number(getVal("AimCollision_size_z")) != 16;
  let changeBlockBox = Number(getVal("BlockCollision_origin_x")) != -8
    || Number(getVal("BlockCollision_origin_y")) != 0
    || Number(getVal("BlockCollision_origin_z")) != -8
    || Number(getVal("BlockCollision_size_x")) != 16
    || Number(getVal("BlockCollision_size_y")) != 16
    || Number(getVal("BlockCollision_size_z")) != 16;

  if(getElem("hasAimCollision").checked && changeAimBox) {
    compone["minecraft:aim_collision"] = {};
    compone["minecraft:aim_collision"].origin = [
      Number(getVal("AimCollision_origin_x")),
      Number(getVal("AimCollision_origin_y")),
      Number(getVal("AimCollision_origin_z"))
    ];
    compone["minecraft:aim_collision"].size = [
      Number(getVal("AimCollision_size_x")),
      Number(getVal("AimCollision_size_y")),
      Number(getVal("AimCollision_size_z"))
    ];
  } else if (!getElem("hasAimCollision").checked) compone["minecraft:aim_collision"] = false;
  if(getElem("hasBlockCollision").checked && changeBlockBox) {
    compone["minecraft:block_collision"] = {};
    compone["minecraft:block_collision"].origin = [
      Number(getVal("BlockCollision_origin_x")),
      Number(getVal("BlockCollision_origin_y")),
      Number(getVal("BlockCollision_origin_z"))
    ];
    compone["minecraft:block_collision"].size = [
      Number(getVal("BlockCollision_size_x")),
      Number(getVal("BlockCollision_size_y")),
      Number(getVal("BlockCollision_size_z"))
    ];
  } else if (!getElem("hasBlockCollision").checked) compone["minecraft:block_collision"] = false;
  if(Number(getVal("blockLightEmission")) != 0) compone["minecraft:block_light_emission"] = Math.floor(1000*Number(getVal("blockLightEmission"))/15)/1000;
  if(Number(getVal("blockLightFilter")) != 15) compone["minecraft:block_light_filter"] = Number(getVal("blockLightFilter"));
  // if(getElem("breakOnPush").checked) compone["minecraft:break_on_push"] = true;
  compone["minecraft:breathability"] = getElem("breathability").checked? "air": "solid";
  if(getVal("creativeCategory") != "") {
    compone["minecraft:creative_category"] = {};
    compone["minecraft:creative_category"].category = getVal("creativeCategory");
  }
  if(getVal("creativeCategory") != "" && getVal("creativeGroup") != "") {
    compone["minecraft:creative_category"].group = getVal("creativeGroup");
  }
  if(Number(getVal("destroyTime")) != 0.0) compone["minecraft:destroy_time"] = Number(getVal("destroyTime"));
  if(Number(getVal("explosionResistance")) != 0.0) compone["minecraft:explosion_resistance"] = Number(getVal("explosionResistance"));
  if(getElem("flamable").checked) {
    compone["minecraft:flamable"] = {};
    compone["minecraft:flamable"].burn_odds = Number(getVal("flamable_burnOdds"));
    compone["minecraft:flamable"].flame_odds = Number(getVal("flamable_flameOdds"));
  }
  if(getElem("isSpecialFriction").checked) compone["minecraft:friction"] = Number(getVal("friction"));
  // if(!getElem("immovable").checked) compone["minecraft:immovable"] = true;
  if(getVal("lootTable") != "") compone["minecraft:loot_table"] = getVal("lootTable");
  if(getElem("hasMapColor").checked) compone["minecraft:map_color"] = getVal("mapColor");
  // if(!getElem("onlyPistonPush").checked) compone["minecraft:onlypistonpush"] = true;
  // if(getElem("preventsJumping").checked) compone["minecraft:preventsjumping"] = true;
  if(getElem("unwalkable").checked) compone["minecraft:unwalkable"] = true;

  if(err.length > 0) {
    let text = "エラー\n";
    for(let i of err) {
      text += `・${i}\n`;
    }
    return text;
  } else return shaping(JSON.stringify(res, null, "  "), 20);
}

function makeItem() {
  let err = [];
  let res = {
    format_version: "1.16.100",
    "minecraft:item": {
      description: {
        identifier: `${getVal("prefix_i")}:${getVal("name_i")}`
      },
      components: {}
    }
  }

  if(getVal("creativeCategory_i") != "") res["minecraft:item"].description.category = getVal("creativeCategory_i");

  let compone = res["minecraft:item"].components;
  if(getVal("prefix_i") == "") err.push("ネームスペースは必須項目です");
  if(getVal("name_i") == "") err.push("名前は必須項目です");
  if(getElem("allowOffHand").checked) compone["minecraft:allow_off_hand"] = true;
  if(getElem("armor").checked) {
    compone["minecraft:armor"] = {};
    compone["minecraft:armor"].protection = Number(getVal("armor_protection"));
    compone["minecraft:armor"].texture_type = getVal("armor_textureType");
  }
  if(!getElem("canDestroyInCreative").checked) compone["minecraft:can_destroy_in_creative"] = false;
  if(getElem("cooldown").checked) {
    compone["minecraft:cooldown"] = {};
    compone["minecraft:cooldown"].protection = getVal("cooldown_category");
    compone["minecraft:cooldown"].texture_type = Number(getVal("cooldown_duration"));
  }
  if(getVal("creativeGroup_i") != "") {
    compone["minecraft:creative_category"] = {};
    compone["minecraft:creative_category"].parent = getVal("creativeGroup_i");
  }
  if(Number(getVal("damage")) != 0) compone["minecraft:damage"] = Number(getVal("damage"));
  if(Number(getVal("durability")) != 0) {
    compone["minecraft:durability"] = {};
    compone["minecraft:durability"].max_durability = Number(getVal("durability"));
  }
  if(getElem("enchantable").checked) {
    compone["minecraft:enchantable"] = {};
    compone["minecraft:enchantable"].slot = getVal("enchantable_slot");
    compone["minecraft:enchantable"].value = Number(getVal("enchantable_value"));
  }
  if(!getElem("explodable").checked) compone["minecraft:explodable"] = false;
  if(getElem("foil").checked) compone["minecraft:foil"] = true;
  if(Number(getVal("fuel")) != 0) {
    compone["minecraft:fuel"] = {};
    compone["minecraft:fuel"].duration = Number(getVal("fuel"));
  }
  if(getElem("handEquipped").checked) compone["minecraft:hand_equipped"] = true;
  if(Number(getVal("icon")) != "") {
    compone["minecraft:icon"] = {};
    compone["minecraft:icon"].texture = getVal("icon");
  } else {
    compone["minecraft:icon"] = {};
    compone["minecraft:icon"].texture = getVal("name_i")
  }
  if(getElem("ignoresPermission").checked) compone["minecraft:ignores_permission"] = true;
  if(Number(getVal("knockbackResistance")) != 0) {
    compone["minecraft:knockback_resistance"] = {};
    compone["minecraft:knockback_resistance"].protection = Number(getVal("knockbackResistance"));
  }
  if(getElem("liqidClipped").checked) compone["minecraft:liquid_clipped"] = true;
  if(Number(getVal("maxStackSize")) != 64) compone["minecraft:max_stack_size"] = Number(getVal("maxStackSize"));
  if(Number(getVal("miningSpeed")) != 1) compone["minecraft:mining_speed"] = Number(getVal("miningSpeed"));
  if(getElem("repairable").checked) {
    compone["minecraft:repairable"] = {};
    compone["minecraft:repairable"].repair_items = [];
    let i = {
      items: [ getVal("repairable_item") ],
      repair_amount: Number(getVal("repairable_amount"))
    };
    compone["minecraft:repairable"].repair_items.push(i);
    if(getElem("repairable_useSelf").checked) {
      let j = {
        items: [ `${getVal("prefix_i")}:${getVal("name_i")}` ],
        repair_amount: "(c.other->q.remaining_durability)+0.05*(c.other->q.max_durability)"
      };
      compone["minecraft:repairable"].repair_items.push(j);
    }
  }
  if(!getElem("shouldDespawn").checked) compone["minecraft:shuold_despawn"] = false;
  if(!getElem("stackedByData").checked) compone["minecraft:stacked_by_data"] = true;
  if(Number(getVal("useDuration")) != 0) compone["minecraft:use_duration"] = Number(getVal("useDuration"));
  if(getElem("wearable").checked) {
    compone["minecraft:wearable"] = {};
    compone["minecraft:wearable"].dispensable = getElem("wearable_dispensable").checked;
    compone["minecraft:wearable"].slot = getVal("wearable_slot");
  }

  if(err.length > 0) {
    let text = "エラー\n";
    for(let i of err) {
      text += `・${i}\n`;
    }
    return text;
  } else return shaping(JSON.stringify(res, null, "  "), 20);
}

function tool3() { // ブロックのサウンド抽出

  function extractValue(json) {
    let obj = JSON.parse(json);
    let l = [];
    for(let i of Object.keys(obj)) {
      try{
        let val = obj[i]["sound"];
        if(!l.includes(val) && val != "") l.push(val);
      } catch(e) { l.push(e) }
    }

    let str = "";
    for(let i of l) {
      if(i != undefined) str += `${i}\n`;
    }

    return str;
  }

  try {
    let json = getVal("input3");

    getElem("output3").textContent = extractValue(json);
  } catch(e) {
    getElem("output3").textContent = e;
  }
}

function tool4() { // サウンドのキー一覧抽出

  function extractSoundKey(json) {
    let keys = Object.keys(JSON.parse(json)["sound_definitions"]);
    
    function converter(list, obj) {
      if(!list.length) return obj;
      const key = list.shift();
      obj[key] = converter(list, obj[key]||{});
      return obj;
    };
    const str = {};
    for(const i of keys) {
      const list = i.split('.');
      converter(list, str);
    }

    return JSON.stringify(str);
  }

  try {
    let json = getElemVal("input4");

    getElem("output4").textContent = extractSoundKey(json);
  } catch(e) {
    getElem("output4").textContent = e;
  }
}

function tool5() { // 特殊な変換

  function specialTrans(json, checked) {
    let keys = Object.keys(JSON.parse(json));

    if(checked[0]) {
      let str = "[ ";
      for(let i=0; i<keys.length; i++) {
        if(i!=keys.length-1) str += `"${keys[i]}", `;
        else str += `"${keys[i]}"`
      }
      str += " ]";
      return str;
    } else if(checked[1]) {
      return shaping(
        JSON.stringify(keys, null, 2), 40 // getVal("tool5-num")
      );
    } else if(checked[2]) {
      let str = "[ ";
      for(let i=0; i<keys.length; i++) {
        if(i!=keys.length-1) str += `${keys[i]}, `;
        else str += `${keys[i]}`
      }
      str += " ]";
      return str;
    }
  }

  try {
    let json = getVal("input5");
    let type1 = getElem("tool5-type1").checked;
    let type2 = getElem("tool5-type2").checked;
    let type3 = getElem("tool5-type3").checked;
    let checked = [ type1, type2, type3 ];

    getElem("output5").textContent = specialTrans(json, checked);
  } catch(e) {
    getElem("output5").textContent = e;
  }
}

function tool6() { // 1種類のアイテムだけ落とすルートテーブル
  function simpleLootTable(item, quantity, num, func) {
    let json = { pools: [
      {
        rolls: Number(quantity), entries: [{
          type: "item", name: item, weight: 1
        }]
      }
    ]};

    if(func.includes(true)) {
      json.pools[0].entries[0].functions = [];
    }
    if(func[0]) {
      let p = { function: "set_name", name: getVal("tool6-name") };
      json.pools[0].entries[0].functions.push(p);
    }
    if(func[1]) {
      let p = { function: "set_lore", lore: [ getVal("tool6-lore") ] };
      json.pools[0].entries[0].functions.push(p);
    }

    return shaping(JSON.stringify(json), num);
  }

  try {
    let item = getVal("tool6-itemId");
    let quantity = getVal("tool6-quantity");
    let num = getVal("tool6-num");
    let name = getElem("tool6-name-check").checked;
    let lore = getElem("tool6-lore-check").checked;
    let func = [ name, lore ];

    getElem("output6").textContent = simpleLootTable(item, quantity, num, func);
  } catch(e) {
    getElem("output6").textContent = e;
  }
}

function specialTrans2(json) {
  let mk = Object.keys(JSON.parse(json))[0];
  let l = JSON.parse(json)[mk];
  let o = { [mk]: {} };
  for(let i=0; i<l.length; i++) {
    let sk = Object.keys(l[i])[0];
    o[mk][sk] = l[i][sk];
  }

  return o;
}
function tool7() { // 特殊な変換2

  try {
    let json = getVal("input7");
    let num = getVal("tool7-num");

    getElem("output7").textContent = shaping(JSON.stringify(specialTrans2(json)), num);
  } catch(e) {
    getElem("output7").textContent = e;
  }
}

function tool8() {
  function formatConverter(json, molang, pref, num) {
    let _j = JSON.parse(json);
    let j = _j["minecraft:client_entity"]["description"];

    let n = {
      format_version: "1.10.0",
      "minecraft:client_entity": { description: {} }
    };
    let n_ = {
      identifier: j.identifier,
      min_engine_version: j.min_engine_version,
      materials: j.materials,
      textures: j.textures,
      geometry: j.geometry,
      spawn_egg: j.spawn_egg
    }

    if(j.scripts != undefined) {
      n_.scripts = j.scripts;
      if(j.scripts.pre_animation != undefined) {
        if(molang) {
          let s = [];
          for(let i of j.scripts.pre_animation) {
            s.push(i.replace(/variable./g, "v.").replace(/query./g, "q."));
          }
          n_.scripts.pre_animation = s;
        }
      }
      if(j.animations != undefined) {
        n_.scripts.animate = Object.keys(j.animations);
      }
      if(j.animation_controllers != undefined) {
        n_.scripts.animate.push("~!Space!~");
        let anicon = specialTrans2(JSON.stringify({ anicons: j.animation_controllers }));
        for(let i of Object.keys(anicon.anicons)) {
          n_.scripts.animate.push(pref + "." + i);
        }
      }
    }
    if(j.animations != undefined) {
      n_.animations = j.animations;
    }
    if(j.animation_controllers != undefined) {
      n_.animations["~!Space!~"] = "~!Space!~";
      let anicon = specialTrans2(JSON.stringify({ anicons: j.animation_controllers }));
      for(let i of Object.keys(anicon.anicons)) {
        n_.animations[pref + "." + i] = anicon.anicons[i];
      }
    }

    n_["render_controllers"] = j.render_controllers;
    if(j.enable_attachables != undefined) n_["enable_attachables"] = j.enable_attachables;
    n["minecraft:client_entity"]["description"] = n_;

    return shaping(JSON.stringify(n), num)
      .replace(/        "~!Space!~": "~!Space!~",/g, "")
      .replace(/ "~!Space!~": "~!Space!~",/g, "")
      .replace(/           "~!Space!~",\n/g, "\n")
      .replace(/           "~!Space!~", "/g, "\n           \"")
      .replace(/ "~!Space!~", /g, " ")
      .replace(/ "~!Space!~",\n/g, "\n");
  }

  try {
    let json = getVal("input8");
    let molang = getElem("tool8-molang").checked;
    let pref = getVal("tool8-pref");
    let num = getVal("tool8-num");
    if(pref == "") pref = "ctrl";

    getElem("output8").textContent = formatConverter(json, molang, pref, num);
  } catch(e) {
    getElem("output8").textContent = e;
  }
}

function add() {
  let inp = document.getElementById("cashe").value;
  try {
    obj = JSON.parse(inp);
    new_obj = {
      type: "item",
      name: "minecraft:blaze_rod",
      weight: 1
    };
    obj.pools[0].entries.push(new_obj);
    document.getElementById("cashe").textContent = JSON.stringify(obj);
    document.getElementById("output2").textContent = JSON.stringify(obj, null, "  ");

    var newElement = document.createElement("div");
    newElement.appendChild(document.createTextNode("<h4>エントリ2</h4>\nアイテム：ブレイズロッド\n確率比：1"));
    newElement.setAttribute("id","child-p3");
    document.getElementById("pool_1").insertBefore(newElement, null);
  } catch(e) {
    document.getElementById("output2").textContent = e;
  }
}