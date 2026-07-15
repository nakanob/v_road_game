import * as THREE from "three";

const AREA_DATA = [
  { id: 0, key: "city", name: "街", time: "朝", start: 0.00, end: 0.24, road: 0x454a4e },
  { id: 1, key: "field", name: "草原", time: "昼", start: 0.24, end: 0.50, road: 0x6b7d4e },
  { id: 2, key: "mountain", name: "山", time: "夕方", start: 0.50, end: 0.76, road: 0x71675d },
  { id: 3, key: "camp", name: "キャンプ場", time: "夜", start: 0.76, end: 1.00, road: 0x7b593f }
];

export class TrackWorld {
  constructor(game) {
    this.game = game;
    this.scene = game.scene;
    this.areas = AREA_DATA;
    this.roadHalfWidth = 5.6;
    this.length = 1100;
    this.sampleCount = 540;
    this.samples = [];

    this.curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.0, 0),
      new THREE.Vector3(0, 0.2, 90),
      new THREE.Vector3(16, 0.8, 180),
      new THREE.Vector3(-22, 0.6, 286),
      new THREE.Vector3(-46, 1.3, 388),
      new THREE.Vector3(-10, 3.2, 470),
      new THREE.Vector3(28, 8.5, 552),
      new THREE.Vector3(52, 17.0, 642),
      new THREE.Vector3(24, 28.0, 736),
      new THREE.Vector3(-24, 24.5, 828),
      new THREE.Vector3(-40, 14.0, 915),
      new THREE.Vector3(-8, 7.0, 1000),
      new THREE.Vector3(26, 5.2, 1085)
    ], false, "catmullrom", 0.22);

    this.createTextures();
    this.buildSamples();
    this.createBaseGround();
    this.createTerrainBands();
    this.createRoad();
    this.createRoadEdges();
    this.createCrosswalks();
    this.createCity();
    this.createField();
    this.createRiverAndBridge();
    this.createTunnel();
    this.createMountain();
    this.createCampground();
    this.createStars();
  }

  createTextures() {
    const canvasTexture = (size, draw) => {
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const ctx = c.getContext("2d");
      draw(ctx, size);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.anisotropy = Math.min(4, this.game.renderer.capabilities.getMaxAnisotropy());
      return tex;
    };

    this.textures = {};
    this.textures.asphalt = canvasTexture(256, (ctx, s) => {
      ctx.fillStyle = "#4a4f53"; ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 1200; i++) {
        const v = 50 + Math.random() * 80;
        ctx.fillStyle = `rgba(${v},${v},${v},${0.08 + Math.random() * 0.16})`;
        ctx.fillRect(Math.random() * s, Math.random() * s, 1 + Math.random() * 3, 1 + Math.random() * 3);
      }
      ctx.strokeStyle = "rgba(255,255,255,.03)";
      for (let y = 0; y < s; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(s, y); ctx.stroke(); }
    });
    this.textures.grassRoad = canvasTexture(256, (ctx, s) => {
      ctx.fillStyle = "#6b7d4e"; ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 900; i++) {
        ctx.strokeStyle = Math.random() > .55 ? "#90a862" : "#4b6037";
        const x = Math.random() * s, y = Math.random() * s;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.random() * 3 - 1.5, y - 4 - Math.random() * 5); ctx.stroke();
      }
      ctx.fillStyle = "rgba(120,90,58,.16)";
      ctx.fillRect(s * .24, 0, s * .10, s);
      ctx.fillRect(s * .66, 0, s * .10, s);
    });
    this.textures.rock = canvasTexture(256, (ctx, s) => {
      ctx.fillStyle = "#6d6762"; ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 600; i++) {
        const c = 85 + Math.random() * 70;
        ctx.fillStyle = `rgba(${c},${c * .96},${c * .91},.25)`;
        ctx.beginPath(); ctx.arc(Math.random() * s, Math.random() * s, 1 + Math.random() * 6, 0, Math.PI * 2); ctx.fill();
      }
    });
    this.textures.dirt = canvasTexture(256, (ctx, s) => {
      ctx.fillStyle = "#805d3f"; ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 700; i++) {
        ctx.fillStyle = Math.random() > .5 ? "rgba(35,25,18,.15)" : "rgba(212,164,110,.16)";
        ctx.beginPath(); ctx.arc(Math.random() * s, Math.random() * s, .8 + Math.random() * 2.8, 0, Math.PI * 2); ctx.fill();
      }
    });
    this.textures.cityGround = canvasTexture(256, (ctx, s) => {
      ctx.fillStyle = "#8b9187"; ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = "rgba(255,255,255,.10)";
      for (let x = 0; x < s; x += 32) ctx.fillRect(x, 0, 2, s);
      for (let y = 0; y < s; y += 32) ctx.fillRect(0, y, s, 2);
    });
    this.textures.grass = canvasTexture(256, (ctx, s) => {
      ctx.fillStyle = "#678146"; ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 1000; i++) {
        ctx.strokeStyle = Math.random() > .5 ? "#8ea95f" : "#425b31";
        const x = Math.random() * s, y = Math.random() * s;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.random() * 2 - 1, y - 4 - Math.random() * 5); ctx.stroke();
      }
    });
    this.textures.bark = canvasTexture(128, (ctx, s) => {
      ctx.fillStyle = "#5b3e2b"; ctx.fillRect(0, 0, s, s);
      for (let x = 0; x < s; x += 7) {
        ctx.strokeStyle = x % 14 ? "#76533b" : "#3e291e";
        ctx.lineWidth = 2 + Math.random() * 2;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.bezierCurveTo(x + 5, s * .25, x - 4, s * .7, x + 2, s); ctx.stroke();
      }
    });
    this.textures.leaf = canvasTexture(128, (ctx, s) => {
      ctx.fillStyle = "#355f39"; ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 420; i++) {
        ctx.fillStyle = Math.random() > .5 ? "rgba(103,155,81,.32)" : "rgba(20,60,28,.30)";
        ctx.beginPath(); ctx.arc(Math.random() * s, Math.random() * s, 1 + Math.random() * 3, 0, Math.PI * 2); ctx.fill();
      }
    });
    this.textures.facade = canvasTexture(256, (ctx, s) => {
      ctx.fillStyle = "#cbc2b4"; ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = "#b4ac9e";
      for (let y = 0; y < s; y += 32) ctx.fillRect(0, y, s, 2);
      for (let y = 16; y < s; y += 48) {
        for (let x = 18; x < s; x += 46) {
          ctx.fillStyle = "#3c5160"; ctx.fillRect(x, y, 25, 20);
          ctx.fillStyle = "rgba(255,221,160,.70)"; ctx.fillRect(x + 3, y + 3, 19, 14);
          ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillRect(x + 4, y + 4, 6, 12);
        }
      }
    });
  }

  buildSamples() {
    for (let i = 0; i <= this.sampleCount; i++) {
      const t = i / this.sampleCount;
      const point = this.curve.getPointAt(t);
      const tangent = this.curve.getTangentAt(t).normalize();
      const side = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
      this.samples.push({ t, point, tangent, side });
    }
  }

  createBaseGround() {
    const geo = new THREE.PlaneGeometry(1500, 1500, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ map: this.textures.grass, color: 0x7c9750, roughness: 1 });
    mat.map.repeat.set(90, 90);
    const ground = new THREE.Mesh(geo, mat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.48, 540);
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  createTerrainBands() {
    const cityMat = new THREE.MeshStandardMaterial({ map: this.textures.cityGround, color: 0x98a096, roughness: 1 });
    cityMat.map.repeat.set(18, 28);
    const fieldMat = new THREE.MeshStandardMaterial({ map: this.textures.grass, color: 0x7e9751, roughness: 1 });
    fieldMat.map.repeat.set(18, 28);
    const mountainMat = new THREE.MeshStandardMaterial({ map: this.textures.rock, color: 0x867b70, roughness: 1 });
    mountainMat.map.repeat.set(18, 28);
    const campMat = new THREE.MeshStandardMaterial({ map: this.textures.dirt, color: 0x7a5d44, roughness: 1 });
    campMat.map.repeat.set(18, 26);

    this.createTerrainRibbon(0.00, 0.24, 34, 18, cityMat, (offset, k, sample) => {
      const abs = Math.abs(offset);
      return (abs > 20 ? 0.15 : 0.0) + Math.sin(sample.point.z * 0.015 + offset * 0.2) * 0.03;
    });

    this.createTerrainRibbon(0.24, 0.50, 56, 26, fieldMat, (offset, k, sample) => {
      const abs = Math.abs(offset);
      const shoulder = Math.max(0, abs - 9) * 0.015;
      return shoulder + Math.sin(sample.point.z * 0.04 + offset * 0.09) * 0.38 + Math.cos(sample.point.x * 0.06) * 0.18 - 0.08;
    });

    this.createTerrainRibbon(0.50, 0.76, 76, 48, mountainMat, (offset, k, sample) => {
      const abs = Math.abs(offset);

      // 道路と路肩の範囲は完全に平らにし、山の地形が道路へ被らないようにする
      if (abs <= 13) return -0.12;

      // 13m〜20mの間で緩やかに山地へ接続する
      const blend = THREE.MathUtils.smoothstep(abs, 13, 20);
      const rise = Math.pow(Math.max(0, abs - 13), 1.10) * 0.10;
      const variation = Math.sin(sample.point.z * 0.045 + offset * 0.07) * 0.42
        + Math.cos(sample.point.x * 0.07) * 0.24;

      return THREE.MathUtils.lerp(-0.12, rise + variation, blend);
    });

    this.createTerrainRibbon(0.76, 1.00, 52, 24, campMat, (offset, k, sample) => {
      const abs = Math.abs(offset);
      return Math.max(0, abs - 12) * 0.03 + Math.sin(sample.point.z * 0.035 + offset * 0.08) * 0.22 - 0.1;
    });
  }

  createTerrainRibbon(startT, endT, width, lateralSegments, material, heightFn) {
    const start = Math.floor(startT * this.sampleCount);
    const end = Math.ceil(endT * this.sampleCount);
    const vertices = [], uvs = [], indices = [];
    const rows = end - start;

    for (let i = start; i <= end; i++) {
      const sample = this.samples[i];
      const rowT = rows === 0 ? 0 : (i - start) / rows;
      for (let j = 0; j <= lateralSegments; j++) {
        const u = j / lateralSegments;
        const offset = THREE.MathUtils.lerp(-width, width, u);
        const p = sample.point.clone().addScaledVector(sample.side, offset);
        p.y += heightFn(offset, rowT, sample);
        vertices.push(p.x, p.y, p.z);
        uvs.push(u * 3, rowT * 18);
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < lateralSegments; c++) {
        const a = r * (lateralSegments + 1) + c;
        const b = a + 1;
        const d = a + lateralSegments + 1;
        const e = d + 1;
        indices.push(a, d, b, b, d, e);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    const mesh = new THREE.Mesh(geo, material);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  createRoad() {
    const maps = [this.textures.asphalt, this.textures.grassRoad, this.textures.rock, this.textures.dirt];
    for (const area of this.areas) {
      const vertices = [], uvs = [], indices = [];
      const start = Math.floor(area.start * this.sampleCount);
      const end = Math.ceil(area.end * this.sampleCount);
      for (let i = start; i <= end; i++) {
        const s = this.samples[i];
        const left = s.point.clone().addScaledVector(s.side, -this.roadHalfWidth);
        const right = s.point.clone().addScaledVector(s.side, this.roadHalfWidth);
        left.y += 0.08; right.y += 0.08;
        vertices.push(left.x, left.y, left.z, right.x, right.y, right.z);
        const v = (i - start) / 10;
        uvs.push(0, v, 1, v);
      }
      const rows = end - start;
      for (let r = 0; r < rows; r++) {
        const a = r * 2, b = a + 1, c = a + 2, d = a + 3;
        indices.push(a, c, b, b, c, d);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
      geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      const map = maps[area.id];
      const mat = new THREE.MeshStandardMaterial({ map, color: area.road, roughness: .95, metalness: 0 });
      const road = new THREE.Mesh(geo, mat);
      road.receiveShadow = true;
      this.scene.add(road);
    }

    const points = [];
    for (let i = 0; i <= Math.floor(.24 * this.sampleCount); i++) {
      const p = this.samples[i].point.clone(); p.y += .11; points.push(p);
    }
    const center = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineDashedMaterial({ color: 0xf3e6b2, dashSize: 4, gapSize: 4 })
    );
    center.computeLineDistances();
    this.scene.add(center);
  }

  createRoadEdges() {
    const l = [], r = [];
    for (const s of this.samples) {
      l.push(s.point.clone().addScaledVector(s.side, -this.roadHalfWidth - .14).add(new THREE.Vector3(0, .12, 0)));
      r.push(s.point.clone().addScaledVector(s.side, this.roadHalfWidth + .14).add(new THREE.Vector3(0, .12, 0)));
    }
    const mat = new THREE.LineBasicMaterial({ color: 0xefe9d5, transparent: true, opacity: .72 });
    this.scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(l), mat));
    this.scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(r), mat));
  }

  createCrosswalks() {
    for (const t of [0.055, 0.145]) {
      const sample = this.getSample(t);
      const group = new THREE.Group();
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0xf2f2ed, toneMapped: false });
      // 白線そのものは道路の進行方向と平行。複数本を道路幅方向へ並べる。
      for (let x = -4.4; x <= 4.4; x += 1.1) {
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.025, 4.0), stripeMat);
        stripe.position.set(x, 0.12, 0);
        group.add(stripe);
      }
      group.position.copy(sample.point);
      group.rotation.y = Math.atan2(sample.tangent.x, sample.tangent.z);
      this.scene.add(group);
    }
  }

  createCheckpoints() {}

  createCity() {
    const basePlacements = [
      { type: "house", t: 0.014, side: -1, dist: 13.5 },
      { type: "house", t: 0.022, side: 1, dist: 14.5 },
      { type: "building", t: 0.031, side: -1, dist: 17.5 },
      { type: "building", t: 0.037, side: -1, dist: 24.0 },
      { type: "house", t: 0.043, side: 1, dist: 13.0 },
      { type: "supermarket", t: 0.056, side: -1, dist: 20.5 },
      { type: "convenience", t: 0.067, side: 1, dist: 16.0 },
      { type: "house", t: 0.079, side: -1, dist: 14.0 },
      { type: "building", t: 0.088, side: 1, dist: 18.0 },
      { type: "gas", t: 0.101, side: -1, dist: 21.0 },
      { type: "house", t: 0.108, side: -1, dist: 27.0 },
      { type: "house", t: 0.116, side: 1, dist: 14.0 },
      { type: "police", t: 0.124, side: 1, dist: 20.0 },
      { type: "convenience", t: 0.134, side: -1, dist: 15.0 },
      { type: "mall", t: 0.150, side: -1, dist: 26.0 },
      { type: "building", t: 0.155, side: 1, dist: 17.5 },
      { type: "house", t: 0.166, side: 1, dist: 22.0 },
      { type: "house", t: 0.178, side: -1, dist: 14.0 },
      { type: "supermarket", t: 0.188, side: 1, dist: 23.0 },
      { type: "building", t: 0.202, side: -1, dist: 18.0 },
      { type: "house", t: 0.216, side: 1, dist: 15.0 },
      { type: "building", t: 0.228, side: -1, dist: 19.0 }
    ];

    for (const item of basePlacements) {
      let mesh;
      switch (item.type) {
        case "house": mesh = this.makeHouse(); break;
        case "supermarket": mesh = this.makeSupermarket(); break;
        case "convenience": mesh = this.makeConvenienceStore(); break;
        case "gas": mesh = this.makeGasStation(); break;
        case "mall": mesh = this.makeShoppingMall(); break;
        case "police": mesh = this.makePoliceStation(); break;
        default: mesh = this.makeCityBuilding(); break;
      }
      this.placeRoadside(mesh, item.t, item.side, item.dist);
      if (["building", "mall", "supermarket", "police"].includes(item.type) && Math.random() > 0.35) {
        const parking = this.makeParkingLot(4 + Math.floor(Math.random() * 6), 2 + Math.floor(Math.random() * 3));
        this.placeRoadside(parking, item.t + (Math.random() * 0.004 - 0.002), item.side, item.dist + (item.side > 0 ? 6.5 : -6.5), -0.12);
      }
    }

    for (let i = 0; i < 18; i++) {
      const t = 0.012 + i * 0.0115 + (Math.random() * 0.003 - 0.0015);
      const side = Math.random() > 0.48 ? 1 : -1;
      const dist = 13 + Math.random() * 16;
      const mesh = Math.random() > 0.52 ? this.makeHouse() : this.makeCityBuilding();
      this.placeRoadside(mesh, t, side, dist);
    }

    for (let i = 0; i < 22; i++) {
      this.addStreetLight(0.008 + i * 0.0102, i % 2 ? 1 : -1);
    }
  }

  makeCityBuilding() {
    const g = new THREE.Group();
    const palette = [0xd5cbc0, 0xc7c4bd, 0xb7bec6, 0xd0c4b3, 0xbfc7be, 0xd8d2c9];
    const roofPalette = [0x50565c, 0x444c53, 0x665e58, 0x55615d];
    const width = 7 + Math.random() * 5;
    const depth = 6 + Math.random() * 4;
    const height = 8 + Math.random() * 12;
    const bodyMat = new THREE.MeshStandardMaterial({ map: this.textures.facade, roughness: .88, color: palette[Math.floor(Math.random() * palette.length)] });
    const roofMat = new THREE.MeshStandardMaterial({ color: roofPalette[Math.floor(Math.random() * roofPalette.length)], roughness: .82 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), bodyMat);
    body.position.y = height / 2; body.castShadow = body.receiveShadow = true; g.add(body);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(width + .4, .35, depth + .4), roofMat); roof.position.y = height + .18; roof.castShadow = true; g.add(roof);
    if (Math.random() > .42) {
      const annex = new THREE.Mesh(new THREE.BoxGeometry(width * .35, height * (.38 + Math.random() * .22), depth * .42), bodyMat);
      annex.position.set((Math.random() > .5 ? 1 : -1) * (width * .24), annex.geometry.parameters.height / 2, (Math.random() > .5 ? 1 : -1) * depth * .12);
      annex.castShadow = annex.receiveShadow = true;
      g.add(annex);
    }
    return g;
  }

  makeHouse() {
    const g = new THREE.Group();
    const wallColors = [0xf0ece4, 0xdce7ea, 0xeadccf, 0xe6e0c8, 0xd8ddd3, 0xf1e6d6];
    const roofColors = [0x70463a, 0x4b5967, 0x596b4e, 0x785d43, 0x3f4a52, 0x8a544c];
    const doorColors = [0x5f4334, 0x394a58, 0x6c563e, 0x4e5943];
    const width = 6.7 + Math.random() * 1.5;
    const depth = 5.9 + Math.random() * 1.5;
    const height = 3.8 + Math.random() * 0.8;
    const wall = new THREE.MeshStandardMaterial({ color: wallColors[Math.floor(Math.random() * wallColors.length)], roughness: .92 });
    const roofMat = new THREE.MeshStandardMaterial({ color: roofColors[Math.floor(Math.random() * roofColors.length)], roughness: .9 });
    const windowMat = new THREE.MeshBasicMaterial({ color: Math.random() > .45 ? 0xffd99a : 0x8fb6c2, toneMapped: false });
    const doorMat = new THREE.MeshStandardMaterial({ color: doorColors[Math.floor(Math.random() * doorColors.length)], roughness: .8 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wall);
    body.position.y = height / 2; body.castShadow = body.receiveShadow = true; g.add(body);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(width, depth) * .72, 2.2 + Math.random() * .7, 4), roofMat);
    roof.rotation.y = Math.PI / 4; roof.position.y = height + 1.0; roof.castShadow = true; g.add(roof);
    const doorX = (Math.random() * 2 - 1) * width * .28;
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.98, 1.96, .08), doorMat);
    door.position.set(doorX, .98, depth / 2 + .05); g.add(door);
    const slots = [-width * .32, -width * .12, width * .12, width * .32].filter(x => Math.abs(x - doorX) > 1.05);
    const count = 2 + Math.floor(Math.random() * 2);
    for (const x of slots.sort(() => Math.random() - .5).slice(0, count)) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(1.0 + Math.random() * .22, .82 + Math.random() * .16), windowMat);
      win.position.set(x, 2.15 + Math.random() * .35, depth / 2 + .06); g.add(win);
    }
    return g;
  }

  makeSupermarket() {
    return this.makeShopBase(13, 5, 11, 0xefe7d2, 0x7fb455, 0xf7f4e8);
  }

  makeConvenienceStore() {
    return this.makeShopBase(10, 4.6, 8, 0xf3f2ed, 0x3ca7dd, 0xff6a3d);
  }

  makePoliceStation() {
    const g = this.makeShopBase(9, 5.0, 8.2, 0xe9eef5, 0x274d90, 0xffffff);
    const tower = new THREE.Mesh(new THREE.BoxGeometry(2.4, 7, 2.4), new THREE.MeshStandardMaterial({ color: 0xf3f5fa, roughness: .9 }));
    tower.position.set(0, 3.5, -1.2); tower.castShadow = true; g.add(tower);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(3.1, .35, 3.1), new THREE.MeshStandardMaterial({ color: 0x335a9f, roughness: .8 }));
    cap.position.set(0, 7.18, -1.2); g.add(cap);
    return g;
  }

  makeShoppingMall() {
    const g = new THREE.Group();
    const wall = new THREE.MeshStandardMaterial({ color: 0xd8d0c2, roughness: .92 });
    const glass = new THREE.MeshBasicMaterial({ color: 0xffe4ab, toneMapped: false });
    const accent = new THREE.MeshStandardMaterial({ color: 0xb34141, roughness: .84 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(18, 6.8, 14), wall); body.position.y = 3.4; body.castShadow = body.receiveShadow = true; g.add(body);
    const signBand = new THREE.Mesh(new THREE.BoxGeometry(18.2, 1.0, .25), accent); signBand.position.set(0, 5.1, 7.15); g.add(signBand);
    const entrance = new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.8, .18), new THREE.MeshStandardMaterial({ color: 0x28333f, roughness: .25, metalness: .1, transparent: true, opacity: .85 }));
    entrance.position.set(0, 1.9, 7.12); g.add(entrance);
    for (let x = -6; x <= 6; x += 2.6) {
      if (Math.abs(x) < 2.6) continue;
      const win = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.4), glass); win.position.set(x, 2.3, 7.12); g.add(win);
    }
    return g;
  }

  makeGasStation() {
    const g = new THREE.Group();
    const concrete = new THREE.MeshStandardMaterial({ color: 0xe5e3dc, roughness: .92 });
    const red = new THREE.MeshStandardMaterial({ color: 0xc24234, roughness: .82 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x2e3338, roughness: .75 });
    const shop = new THREE.Mesh(new THREE.BoxGeometry(8.8, 4.1, 6.5), concrete);
    shop.position.set(0, 2.05, -2.4); shop.castShadow = shop.receiveShadow = true; g.add(shop);
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(13.8, .42, 8.0), concrete); canopy.position.set(0, 4.9, 3.2); canopy.castShadow = true; g.add(canopy);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(14.0, .36, 8.2), red); trim.position.set(0, 4.72, 3.2); g.add(trim);
    for (const x of [-3.8, 0, 3.8]) {
      const pole = new THREE.Mesh(new THREE.BoxGeometry(.36, 4.6, .36), concrete); pole.position.set(x, 2.3, 3.2); g.add(pole);
    }
    for (const x of [-2.3, 2.3]) {
      const pump = new THREE.Mesh(new THREE.BoxGeometry(.8, 1.8, .9), red); pump.position.set(x, 0.9, 3.1); pump.castShadow = true; g.add(pump);
      const hose = new THREE.Mesh(new THREE.BoxGeometry(.08, 1.1, .08), dark); hose.position.set(x + 0.18, 1.4, 3.55); g.add(hose);
    }
    return g;
  }

  makeParkingLot(cols, rows) {
    const g = new THREE.Group();
    const w = cols * 2.9 + 2;
    const d = rows * 5.2 + 2;
    const lot = new THREE.Mesh(new THREE.BoxGeometry(w, .06, d), new THREE.MeshStandardMaterial({ color: 0x6e7377, roughness: .95 }));
    lot.position.y = .03;
    lot.receiveShadow = true;
    g.add(lot);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xf4f3e8, toneMapped: false });
    for (let c = -cols / 2; c <= cols / 2; c++) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(.06, .02, d - 1.2), lineMat);
      line.position.set(c * 2.9, .05, 0);
      g.add(line);
    }
    return g;
  }

  makeShopBase(width, height, depth, wallColor, signColor, stripeColor) {
    const g = new THREE.Group();
    const wall = new THREE.MeshStandardMaterial({ color: wallColor, roughness: .9 });
    const roof = new THREE.MeshStandardMaterial({ color: 0x52575d, roughness: .82 });
    const glass = new THREE.MeshBasicMaterial({ color: 0xffdfab, toneMapped: false });
    const accent = new THREE.MeshStandardMaterial({ color: signColor, roughness: .85 });
    const stripe = new THREE.MeshStandardMaterial({ color: stripeColor, roughness: .85 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wall);
    body.position.y = height / 2; body.castShadow = body.receiveShadow = true; g.add(body);
    const band = new THREE.Mesh(new THREE.BoxGeometry(width + .2, .75, .24), accent); band.position.set(0, height - .35, depth / 2 + .12); g.add(band);
    const stripeMesh = new THREE.Mesh(new THREE.BoxGeometry(width + .22, .22, .25), stripe); stripeMesh.position.set(0, height - .85, depth / 2 + .13); g.add(stripeMesh);
    const entrance = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.5, .18), new THREE.MeshStandardMaterial({ color: 0x2f3944, roughness: .25, metalness: .05, transparent: true, opacity: .78 }));
    entrance.position.set(0, 1.25, depth / 2 + .1); g.add(entrance);
    for (let x = -width * .32; x <= width * .32; x += 2.2) {
      if (Math.abs(x) < 1.4) continue;
      const win = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.3), glass); win.position.set(x, 1.9, depth / 2 + .11); g.add(win);
    }
    const roofCap = new THREE.Mesh(new THREE.BoxGeometry(width + .5, .3, depth + .5), roof); roofCap.position.y = height + .15; g.add(roofCap);
    return g;
  }

  addStreetLight(t, side) {
    const s = this.getSample(t);
    const group = new THREE.Group();
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x32383d, roughness: .55, metalness: .25 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.07, .11, 4.3, 8), poleMat); pole.position.y = 2.15; group.add(pole);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(.08, .08, 1.15), poleMat); arm.position.set(0, 4.2, .48); group.add(arm);
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(.35, .18, .55), new THREE.MeshBasicMaterial({ color: 0xffe6a8, toneMapped: false })); lamp.position.set(0, 4.08, 1.02); group.add(lamp);
    group.position.copy(s.point).addScaledVector(s.side, side * 8.2);
    group.rotation.y = Math.atan2(s.tangent.x, s.tangent.z) + (side > 0 ? Math.PI : 0);
    this.scene.add(group);
  }

  createField() {
    this.createDetailedTrees(.26, .48, 150, 10, 42, false);
    this.createSimpleForest(.25, .49, 520, 12, 58, false);
    const grassGeo = new THREE.PlaneGeometry(.42, 1.15);
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x7f9c50, roughness: 1, side: THREE.DoubleSide });
    const count = 8800;
    const inst = new THREE.InstancedMesh(grassGeo, grassMat, count);
    const d = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      let t = .245 + Math.random() * .255;
      if (this.isDecorationBlocked(t)) t = .245 + Math.random() * .255;
      const s = this.getSample(t);
      const side = Math.random() < .5 ? -1 : 1;
      const dist = 7 + Math.random() * 54;
      d.position.copy(s.point).addScaledVector(s.side, side * dist);
      d.position.y += 0.55 + Math.sin(s.point.z * .04 + dist * .1) * .15;
      d.rotation.y = Math.random() * Math.PI;
      const sc = .70 + Math.random() * .9;
      d.scale.set(sc, sc, sc);
      d.updateMatrix();
      inst.setMatrixAt(i, d.matrix);
    }
    inst.castShadow = false;
    inst.receiveShadow = true;
    this.scene.add(inst);
  }

  createRiverAndBridge() {
    const s = this.getSample(.402);
    const yaw = Math.atan2(s.tangent.x, s.tangent.z);
    const group = new THREE.Group();

    const riverWidth = 22;
    const riverLength = 170;
    const bankMat = new THREE.MeshStandardMaterial({ map: this.textures.dirt, color: 0x6f583e, roughness: 1 });
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x2f80a8, roughness: .12, metalness: .15, transparent: true, opacity: .92, side: THREE.DoubleSide });

    const bed = new THREE.Mesh(new THREE.BoxGeometry(riverLength, 2.6, riverWidth), new THREE.MeshStandardMaterial({ color: 0x4b3d33, roughness: 1 }));
    bed.position.y = -1.92;
    bed.receiveShadow = true;
    group.add(bed);

    const water = new THREE.Mesh(new THREE.PlaneGeometry(riverLength, riverWidth - 3), waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.92;
    group.add(water);

    for (const z of [-riverWidth / 2 + 2.0, riverWidth / 2 - 2.0]) {
      const bank = new THREE.Mesh(new THREE.BoxGeometry(riverLength, 2.2, 4.8), bankMat);
      bank.position.set(0, -0.86, z);
      bank.rotation.x = z < 0 ? -0.22 : 0.22;
      bank.receiveShadow = true;
      group.add(bank);
    }

    const bridge = new THREE.Group();
    const deckLength = 26;
    const deck = new THREE.Mesh(new THREE.BoxGeometry(this.roadHalfWidth * 2 + 2.2, .28, deckLength), new THREE.MeshStandardMaterial({ map: this.textures.asphalt, color: 0x5f6468, roughness: .88 }));
    deck.position.y = 0.07;
    deck.receiveShadow = true;
    bridge.add(deck);

    const beamMat = new THREE.MeshStandardMaterial({ color: 0x7d817f, roughness: .7, metalness: .15 });
    for (const x of [-this.roadHalfWidth - 0.8, this.roadHalfWidth + 0.8]) {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(.36, .34, deckLength), beamMat);
      curb.position.set(x, 0.22, 0);
      bridge.add(curb);
      for (let z = -10; z <= 10; z += 4) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(.10, .86, .10), beamMat);
        post.position.set(x, 0.60, z);
        bridge.add(post);
      }
      const rail = new THREE.Mesh(new THREE.BoxGeometry(.10, .08, deckLength), beamMat);
      rail.position.set(x, 1.02, 0);
      bridge.add(rail);
    }

    for (const z of [-7.5, 0, 7.5]) {
      const pier = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.9, 2.4), new THREE.MeshStandardMaterial({ color: 0x7d766c, roughness: 1 }));
      pier.position.set(0, -0.76, z);
      bridge.add(pier);
    }

    group.add(bridge);
    group.position.copy(s.point);
    group.rotation.y = yaw;
    this.scene.add(group);
  }

  createTunnel() {
    const s = this.getSample(.525);
    const group = new THREE.Group();
    const yaw = Math.atan2(s.tangent.x, s.tangent.z);
    const rockMat = new THREE.MeshStandardMaterial({ map: this.textures.rock, color: 0x6f6861, roughness: 1 });
    const concrete = new THREE.MeshStandardMaterial({ color: 0x8b8984, roughness: .92, side: THREE.DoubleSide });

    const shell = new THREE.Mesh(new THREE.CylinderGeometry(11.5, 11.5, 26, 24, 1, true, Math.PI, Math.PI), rockMat);
    shell.rotation.z = Math.PI / 2;
    shell.position.set(0, 7.3, 0);
    shell.castShadow = true; shell.receiveShadow = true;
    group.add(shell);

    const inner = new THREE.Mesh(new THREE.CylinderGeometry(7.6, 7.6, 24, 22, 1, true, Math.PI, Math.PI), new THREE.MeshStandardMaterial({ color: 0x4b4a49, roughness: 1, side: THREE.BackSide }));
    inner.rotation.z = Math.PI / 2;
    inner.position.set(0, 5.4, 0);
    group.add(inner);

    for (const z of [-12.8, 12.8]) {
      const portal = new THREE.Mesh(new THREE.TorusGeometry(7.8, .48, 10, 28, Math.PI), concrete);
      portal.rotation.z = z < 0 ? Math.PI : 0;
      portal.rotation.y = Math.PI / 2;
      portal.position.set(0, 5.4, z);
      group.add(portal);
      for (const x of [-7.8, 7.8]) {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(.8, 6.0, 1.2), concrete);
        wall.position.set(x, 2.9, z); group.add(wall);
      }
    }

    for (let i = 0; i < 10; i++) {
      const lamp = new THREE.PointLight(0xffd8a8, 0.55, 10, 2);
      lamp.position.set((i % 2 ? 2.2 : -2.2), 6.2, -10 + i * 2.2);
      group.add(lamp);
    }

    for (const side of [-1, 1]) {
      for (let i = 0; i < 6; i++) {
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), rockMat);
        rock.position.set(side * (10 + Math.random() * 8), 3 + Math.random() * 8, -12 + i * 5 + Math.random() * 2);
        const sc = 2 + Math.random() * 4;
        rock.scale.set(sc * 1.5, sc, sc * 1.7);
        rock.castShadow = rock.receiveShadow = true;
        group.add(rock);
      }
    }

    group.position.copy(s.point);
    group.position.y -= 0.1;
    group.rotation.y = yaw;
    this.scene.add(group);
  }

  createMountain() {
    this.createInstancedRocks(.54, .77, 74);
    this.createDetailedTrees(.55, .75, 120, 13, 48, true);
    this.createSimpleForest(.53, .76, 520, 14, 65, true);
    this.createMountainBackdrop(0.60, -1, 42, 20);
    this.createMountainBackdrop(0.67, 1, 48, 25);
    this.createMountainBackdrop(0.72, -1, 52, 24);
  }

  createMountainBackdrop(t, side, width, height) {
    const s = this.getSample(t);
    const group = new THREE.Group();
    const rockMat = new THREE.MeshStandardMaterial({ map: this.textures.rock, color: 0x756e68, roughness: 1 });
    for (let i = 0; i < 4; i++) {
      const mass = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 1), rockMat);
      const sx = width * (0.32 + i * 0.05);
      const sy = height * (0.48 + i * 0.06);
      mass.scale.set(sx, sy, sx * 0.9);
      mass.position.set((i - 1.5) * width * 0.28, sy * 0.62 - 5.5, -i * 8);
      mass.castShadow = true;
      mass.receiveShadow = true;
      group.add(mass);
    }
    group.position.copy(s.point).addScaledVector(s.side, side * (46 + width * 0.42));
    group.position.y -= 7;
    group.rotation.y = Math.atan2(s.tangent.x, s.tangent.z) + (side > 0 ? -0.8 : 0.8);
    this.scene.add(group);
  }

  createInstancedRocks(start, end, count) {
    const geo = new THREE.DodecahedronGeometry(1, 0);
    const mat = new THREE.MeshStandardMaterial({ map: this.textures.rock, color: 0x847b72, roughness: 1 });
    const inst = new THREE.InstancedMesh(geo, mat, count);
    const d = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      let t = start + Math.random() * (end - start);
      if (this.isDecorationBlocked(t)) { i--; continue; }
      const s = this.getSample(t);
      const side = Math.random() < .5 ? -1 : 1;
      const dist = 15 + Math.random() * 54;
      d.position.copy(s.point).addScaledVector(s.side, side * dist);
      d.position.y += Math.max(0, dist - 13) * 0.065 + Math.random() * 1.5;
      d.rotation.set(Math.random(), Math.random() * Math.PI, Math.random());
      const sizeBand = Math.random();
      const sc = sizeBand < .45 ? .45 + Math.random() * .75 : sizeBand < .85 ? 1.2 + Math.random() * 1.5 : 2.7 + Math.random() * 1.8;
      d.scale.set(sc, sc * (.65 + Math.random() * .45), sc * (.75 + Math.random() * .4));
      d.updateMatrix();
      inst.setMatrixAt(i, d.matrix);
    }
    inst.castShadow = true;
    inst.receiveShadow = true;
    this.scene.add(inst);
  }

  createDetailedTrees(start, end, count, minDistance, maxDistance, conifer) {
    const barkMat = new THREE.MeshStandardMaterial({ map: this.textures.bark, color: 0x70503a, roughness: 1 });
    const leafMat = new THREE.MeshStandardMaterial({ map: this.textures.leaf, color: conifer ? 0x31523a : 0x447347, roughness: 1 });
    const trunkGeo = new THREE.CylinderGeometry(.22, .34, 3.4, 8);
    const branchGeo = new THREE.CylinderGeometry(.07, .11, 2.0, 6);
    const crownGeo = conifer ? new THREE.ConeGeometry(1.65, 4.5, 9) : new THREE.IcosahedronGeometry(1.45, 1);

    for (let i = 0; i < count; i++) {
      let t = start + Math.random() * (end - start);
      if (this.isDecorationBlocked(t)) { i--; continue; }
      const s = this.getSample(t);
      const side = Math.random() < .5 ? -1 : 1;
      const sc = .75 + Math.random() * .85;
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeo, barkMat); trunk.position.y = 1.7; trunk.castShadow = true; tree.add(trunk);
      for (let b = 0; b < 3; b++) {
        const branch = new THREE.Mesh(branchGeo, barkMat); branch.position.y = 2.1 + b * .55; branch.rotation.z = Math.PI / 2.7; branch.rotation.y = b * 2.1 + Math.random(); branch.castShadow = true; tree.add(branch);
      }
      if (conifer) {
        for (let c = 0; c < 3; c++) {
          const crown = new THREE.Mesh(crownGeo, leafMat); crown.position.y = 3.4 + c * .95; crown.scale.set(1 - c * .18, 1 - c * .10, 1 - c * .18); crown.castShadow = true; tree.add(crown);
        }
      } else {
        for (const p of [[0, 4.3, 0], [.9, 3.9, .2], [-.8, 4.0, -.2], [.2, 4.8, -.7]]) {
          const crown = new THREE.Mesh(crownGeo, leafMat); crown.position.set(...p); crown.castShadow = true; tree.add(crown);
        }
      }
      tree.scale.setScalar(sc);
      const dist = minDistance + Math.random() * (maxDistance - minDistance);
      tree.position.copy(s.point).addScaledVector(s.side, side * dist);
      tree.position.y += Math.max(0, dist - 10) * (conifer ? 0.07 : 0.025) - .2;
      tree.rotation.y = Math.random() * Math.PI * 2;
      this.scene.add(tree);
    }
  }

  createSimpleForest(start, end, count, minDistance, maxDistance, conifer) {
    const trunkGeo = new THREE.CylinderGeometry(.18, .28, 2.8, 6);
    const crownGeo = conifer ? new THREE.ConeGeometry(1.35, 3.8, 7) : new THREE.IcosahedronGeometry(1.15, 0);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5e402d, roughness: 1 });
    const leafMat = new THREE.MeshStandardMaterial({ color: conifer ? 0x294b32 : 0x3d6d3e, roughness: 1 });
    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, count);
    const crowns = new THREE.InstancedMesh(crownGeo, leafMat, count);
    const d = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      let t = start + Math.random() * (end - start);
      if (this.isDecorationBlocked(t)) { i--; continue; }
      const sample = this.getSample(t);
      const side = Math.random() < .5 ? -1 : 1;
      const dist = minDistance + Math.random() * (maxDistance - minDistance);
      const scale = .55 + Math.random() * .85;
      const base = sample.point.clone().addScaledVector(sample.side, side * dist);
      base.y += Math.max(0, dist - minDistance) * (conifer ? .05 : .02);
      d.position.copy(base).add(new THREE.Vector3(0, 1.4 * scale, 0)); d.rotation.y = Math.random() * Math.PI; d.scale.set(scale, scale, scale); d.updateMatrix(); trunks.setMatrixAt(i, d.matrix);
      d.position.copy(base).add(new THREE.Vector3(0, 3.4 * scale, 0)); d.rotation.y = Math.random() * Math.PI; d.scale.set(scale, scale, scale); d.updateMatrix(); crowns.setMatrixAt(i, d.matrix);
    }
    trunks.castShadow = false; crowns.castShadow = false;
    trunks.receiveShadow = true; crowns.receiveShadow = true;
    this.scene.add(trunks, crowns);
  }

  createWelcomeCamp() {
    const finish = this.getSample(.985);
    const base = finish.point.clone().addScaledVector(finish.side, 14.5);
    const group = new THREE.Group();

    const makeHuman = (shirtColor, seated = false, pose = "talk") => {
      const g = new THREE.Group();
      const skin = new THREE.MeshStandardMaterial({ color: 0xd9a276, roughness: .92 });
      const hairMat = new THREE.MeshStandardMaterial({ color: [0x3b2b20,0x5d4733,0x1c1b1b,0x6d5c49][Math.floor(Math.random()*4)], roughness: .9 });
      const cloth = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: .92 });
      const pants = new THREE.MeshStandardMaterial({ color: [0x2e3a4b,0x55514b,0x415e7a,0x3f4d3e][Math.floor(Math.random()*4)], roughness: .95 });
      const shoes = new THREE.MeshStandardMaterial({ color: 0x2a241f, roughness: 1 });
      const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.23, .54, 4, 8), cloth); torso.position.y = seated ? 1.12 : 1.26; g.add(torso);
      const hips = new THREE.Mesh(new THREE.SphereGeometry(.23, 10, 8), cloth); hips.position.y = seated ? .84 : .92; g.add(hips);
      const head = new THREE.Mesh(new THREE.SphereGeometry(.19, 14, 12), skin); head.position.y = seated ? 1.72 : 1.92; g.add(head);
      const hair = new THREE.Mesh(new THREE.SphereGeometry(.195, 14, 10, 0, Math.PI * 2, 0, Math.PI * .52), hairMat); hair.position.copy(head.position); hair.position.y += .02; g.add(hair);
      for (const x of [-.055,.055]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(.016, 6, 6), new THREE.MeshBasicMaterial({ color: 0x1a1a1a, toneMapped: false }));
        eye.position.set(x, head.position.y + .02, .16); g.add(eye);
      }
      const smile = new THREE.Mesh(new THREE.TorusGeometry(.045, .006, 5, 10, Math.PI), new THREE.MeshBasicMaterial({ color: 0x9a5f4b, toneMapped: false }));
      smile.position.set(0, head.position.y - .06, .16); smile.rotation.z = Math.PI; g.add(smile);
      for (const side of [-1,1]) {
        const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(.055,.28,3,6), skin);
        const lowerArm = new THREE.Mesh(new THREE.CapsuleGeometry(.048,.24,3,6), skin);
        upperArm.position.set(side*.34, seated ? 1.26 : 1.42, 0); lowerArm.position.set(side*.47, seated ? 1.05 : 1.26, .02);
        upperArm.rotation.z = side * (pose === "wave" ? -0.95 : pose === "eat" ? -0.4 : -0.65);
        lowerArm.rotation.z = side * (pose === "wave" ? -1.2 : pose === "eat" ? -1.1 : -0.35);
        g.add(upperArm, lowerArm);
      }
      if (seated) {
        for (const side of [-1,1]) {
          const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(.06,.26,3,6), pants); thigh.position.set(side*.11,.62,.10); thigh.rotation.x = Math.PI/2.8; g.add(thigh);
          const calf = new THREE.Mesh(new THREE.CapsuleGeometry(.055,.22,3,6), pants); calf.position.set(side*.11,.38,.26); calf.rotation.x = Math.PI/2.2; g.add(calf);
          const shoe = new THREE.Mesh(new THREE.BoxGeometry(.12,.06,.22), shoes); shoe.position.set(side*.11,.18,.42); g.add(shoe);
        }
      } else {
        for (const side of [-1,1]) {
          const leg = new THREE.Mesh(new THREE.CapsuleGeometry(.065,.38,3,6), pants); leg.position.set(side*.12,.45,0); g.add(leg);
          const shoe = new THREE.Mesh(new THREE.BoxGeometry(.13,.07,.22), shoes); shoe.position.set(side*.12,.07,.03); g.add(shoe);
        }
      }
      return g;
    };

    const warmColors = [0xd34c45,0x3b7fc4,0xe6a33c,0x57a36c,0x8b61b3,0xf1d15c,0xdd6f89];
    const ringR = 6.2;
    for (let i = 0; i < 12; i++) {
      const person = makeHuman(warmColors[i % warmColors.length], false, i % 4 === 0 ? "wave" : "talk");
      const angle = (i / 12) * Math.PI * 2;
      person.position.set(Math.cos(angle) * ringR, 0, Math.sin(angle) * ringR);
      person.rotation.y = -angle + Math.PI/2;
      group.add(person);
    }

    for (let i = 0; i < 8; i++) {
      const person = makeHuman(warmColors[(i + 2) % warmColors.length], true, i % 2 ? "eat" : "talk");
      const angle = (i / 8) * Math.PI * 2;
      person.position.set(Math.cos(angle) * 3.9, 0, Math.sin(angle) * 3.9);
      person.rotation.y = -angle + Math.PI/2;
      group.add(person);
    }

    const tableMat = new THREE.MeshStandardMaterial({ color: 0x6d4a34, roughness: .95 });
    const table = new THREE.Mesh(new THREE.BoxGeometry(2.3,.12,1.2), tableMat); table.position.set(-2.5,.98,-1.4); group.add(table);
    for (const x of [-3.35,-1.65]) for (const z of [-1.85,-0.95]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(.10,.86,.10), tableMat); leg.position.set(x,.43,z); group.add(leg); }
    const bbq = new THREE.Mesh(new THREE.BoxGeometry(2.0,.55,1.0), new THREE.MeshStandardMaterial({ color:0x2b3035, roughness:.88 })); bbq.position.set(1.9,.85,.1); group.add(bbq);
    for (const x of [1.25,2.55]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,1.1,6), new THREE.MeshStandardMaterial({ color:0x394047, roughness:.9 })); leg.position.set(x,.3,.1); group.add(leg); }
    const coals = new THREE.Mesh(new THREE.BoxGeometry(1.6,.08,.72), new THREE.MeshBasicMaterial({ color:0xff6b2b,toneMapped:false })); coals.position.set(1.9,1.16,.1); group.add(coals);
    const bbqLight = new THREE.PointLight(0xffb56c, 6, 20, 2); bbqLight.position.set(1.9,2.8,.1); group.add(bbqLight);

    group.position.copy(base);
    group.rotation.y = Math.atan2(finish.tangent.x, finish.tangent.z);
    this.scene.add(group);
  }

  createCampground() {
    this.createDetailedTrees(.77, .98, 140, 12, 50, true);
    this.createSimpleForest(.77, .99, 620, 14, 62, true);
    for (let i = 0; i < 10; i++) {
      const t = .80 + i * .019;
      const s = this.getSample(t);
      const side = i % 2 ? 1 : -1;
      this.createTent(s.point.clone().addScaledVector(s.side, side * (15 + (i % 3) * 5)), (i * 1.1) % 6.28);
    }
    const fireS = this.getSample(.94);
    this.createCampfire(fireS.point.clone().addScaledVector(fireS.side, 17));
    this.createWelcomeCamp();
  }

  createTent(position, rotation) {
    const group = new THREE.Group();
    const tentMat = new THREE.MeshStandardMaterial({ color: 0xc87c3e, roughness: .95, side: THREE.DoubleSide });
    const innerGlowMat = new THREE.MeshBasicMaterial({ color: 0xffc46a, toneMapped: false, transparent: true, opacity: .55, side: THREE.DoubleSide });
    const tent = new THREE.Mesh(new THREE.ConeGeometry(3.2, 3.5, 4), tentMat);
    tent.rotation.y = Math.PI / 4; tent.position.y = 1.7; tent.castShadow = true; group.add(tent);
    const entrance = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.5), new THREE.MeshStandardMaterial({ color: 0x35241d, roughness: 1, side: THREE.DoubleSide }));
    entrance.position.set(0, 1.1, 2.29); group.add(entrance);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.3), innerGlowMat);
    glow.position.set(0, 1.1, 2.12); group.add(glow);
    const light = new THREE.PointLight(0xffc46a, 1.8, 11, 2);
    light.position.set(0, 1.6, 0); group.add(light);
    const lantern = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,1.1,6), new THREE.MeshStandardMaterial({ color:0x424b44, roughness:.9 })); pole.position.y=.55; lantern.add(pole);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(.24,.32,.24), new THREE.MeshBasicMaterial({ color:0xffd68e, toneMapped:false })); glass.position.y=1.08; lantern.add(glass);
    const lanternLight = new THREE.PointLight(0xffcf8b, 1.5, 8, 2); lanternLight.position.y=1.08; lantern.add(lanternLight);
    lantern.position.set(2.2,0,-1.1); group.add(lantern);
    group.position.copy(position); group.rotation.y = rotation; this.scene.add(group);
  }

  createCampfire(position) {
    const group = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(.18, .18, 2.2, 7), new THREE.MeshStandardMaterial({ map: this.textures.bark, color: 0x4a2d1e }));
      log.rotation.z = Math.PI / 2; log.rotation.y = i * Math.PI / 2.5; log.position.y = .15; group.add(log);
    }
    const flame = new THREE.Mesh(new THREE.ConeGeometry(.55, 1.8, 8), new THREE.MeshBasicMaterial({ color: 0xff8a24, toneMapped: false }));
    flame.position.y = 1.1; group.add(flame);
    const light = new THREE.PointLight(0xff8a35, 9, 28, 2); light.position.y = 2; group.add(light);
    const lantern1 = new THREE.PointLight(0xffcf8b, 2.4, 9, 2); lantern1.position.set(-2.1, 1.9, 1.7); group.add(lantern1);
    const lantern2 = new THREE.PointLight(0xffcf8b, 2.4, 9, 2); lantern2.position.set(2.0, 1.9, -1.4); group.add(lantern2);
    group.position.copy(position); this.scene.add(group);
  }

  createStars() {
    const count = 820;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 300 + Math.random() * 280;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * .46;
      positions[i * 3] = Math.cos(theta) * Math.sin(phi) * r;
      positions[i * 3 + 1] = Math.cos(phi) * r + 40;
      positions[i * 3 + 2] = 780 + Math.sin(theta) * Math.sin(phi) * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, transparent: true, opacity: 0, depthWrite: false, sizeAttenuation: true });
    this.stars = new THREE.Points(geo, mat);
    this.stars.frustumCulled = false;
    this.scene.add(this.stars);
  }

  isDecorationBlocked(t) {
    return (t > 0.37 && t < 0.43) || (t > 0.505 && t < 0.56);
  }

  placeRoadside(object, t, side, distance, yOffset = 0) {
    const s = this.getSample(t);
    object.position.copy(s.point).addScaledVector(s.side, side * distance);
    object.position.y += yOffset - 0.18;
    object.rotation.y = Math.atan2(s.tangent.x, s.tangent.z) + (side > 0 ? -Math.PI / 2 : Math.PI / 2);
    this.scene.add(object);
  }

  getSample(t) {
    return this.samples[Math.round(THREE.MathUtils.clamp(t, 0, 1) * this.sampleCount)];
  }

  getArea(t) {
    return this.areas.find(a => t >= a.start && t < a.end) || this.areas[this.areas.length - 1];
  }

  getPose(progress, laneOffset = 0) {
    const t = THREE.MathUtils.clamp(progress, 0, 1);
    const point = this.curve.getPointAt(t);
    const tangent = this.curve.getTangentAt(t).normalize();
    const side = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    return { position: point.addScaledVector(side, laneOffset), tangent, side };
  }
}
