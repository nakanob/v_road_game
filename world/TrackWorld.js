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
    this.createCheckpoints();
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
      for (let z = -3.4; z <= 3.4; z += 1.15) {
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(this.roadHalfWidth * 2 - 0.8, 0.025, 0.58), stripeMat);
        stripe.position.set(0, 0.12, z);
        group.add(stripe);
      }
      group.position.copy(sample.point);
      group.rotation.y = Math.atan2(sample.tangent.x, sample.tangent.z);
      this.scene.add(group);
    }
  }

  createCheckpoints() {
    [0.24, 0.50, 0.76, 0.995].forEach((t, index) => {
      const s = this.getSample(t);
      const group = new THREE.Group();
      const postGeo = new THREE.BoxGeometry(.34, 5, .34);
      const postMat = new THREE.MeshStandardMaterial({ color: index === 3 ? 0xf4c95d : 0xe7e2d4, roughness: .72 });
      for (const x of [-this.roadHalfWidth - 1, this.roadHalfWidth + 1]) {
        const p = new THREE.Mesh(postGeo, postMat);
        p.position.copy(s.point).addScaledVector(s.side, x);
        p.position.y += 2.5;
        p.castShadow = true;
        group.add(p);
      }
      const bar = new THREE.Mesh(new THREE.BoxGeometry(this.roadHalfWidth * 2 + 2.4, .45, .45), postMat);
      bar.position.copy(s.point);
      bar.position.y += 5;
      bar.rotation.y = Math.atan2(s.tangent.x, s.tangent.z);
      bar.castShadow = true;
      group.add(bar);
      this.scene.add(group);
    });
  }

  createCity() {
    const placements = [
      { type: "house", t: 0.018, side: -1, dist: 14 },
      { type: "house", t: 0.028, side: 1, dist: 15 },
      { type: "building", t: 0.038, side: -1, dist: 18 },
      { type: "house", t: 0.048, side: 1, dist: 15 },
      { type: "supermarket", t: 0.060, side: -1, dist: 19 },
      { type: "convenience", t: 0.072, side: 1, dist: 15 },
      { type: "house", t: 0.084, side: -1, dist: 15 },
      { type: "building", t: 0.094, side: 1, dist: 18 },
      { type: "gas", t: 0.106, side: -1, dist: 20 },
      { type: "house", t: 0.116, side: 1, dist: 15 },
      { type: "police", t: 0.128, side: 1, dist: 19 },
      { type: "convenience", t: 0.138, side: -1, dist: 16 },
      { type: "mall", t: 0.151, side: -1, dist: 24 },
      { type: "building", t: 0.162, side: 1, dist: 18 },
      { type: "house", t: 0.174, side: -1, dist: 15 },
      { type: "house", t: 0.184, side: 1, dist: 16 },
      { type: "supermarket", t: 0.196, side: -1, dist: 20 },
      { type: "building", t: 0.207, side: 1, dist: 18 },
      { type: "house", t: 0.218, side: -1, dist: 15 },
      { type: "building", t: 0.229, side: 1, dist: 18 }
    ];

    for (const item of placements) {
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
    }

    for (let i = 0; i < 22; i++) {
      this.addStreetLight(0.008 + i * 0.0102, i % 2 ? 1 : -1);
    }
  }

  makeCityBuilding() {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ map: this.textures.facade, roughness: .88, color: 0xd0c6b8 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x50565c, roughness: .82 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(9, 12, 8), bodyMat);
    body.position.y = 6; body.castShadow = body.receiveShadow = true; g.add(body);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(9.4, .35, 8.4), roofMat); roof.position.y = 12.18; roof.castShadow = true; g.add(roof);
    return g;
  }

  makeHouse() {
    const g = new THREE.Group();
    const wall = new THREE.MeshStandardMaterial({ color: 0xf0ece4, roughness: .92 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x7c4a3d, roughness: .9 });
    const windowMat = new THREE.MeshBasicMaterial({ color: 0xffd99a, toneMapped: false });
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x5f4334, roughness: .8 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(7.4, 4.2, 6.6), wall);
    body.position.y = 2.1; body.castShadow = body.receiveShadow = true; g.add(body);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(5.9, 2.6, 4), roofMat);
    roof.rotation.y = Math.PI / 4; roof.position.y = 5.3; roof.castShadow = true; g.add(roof);
    const porch = new THREE.Mesh(new THREE.BoxGeometry(2.1, .2, 1.4), roofMat); porch.position.set(0, 0.9, 3.95); g.add(porch);
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.1, .12), doorMat); door.position.set(0, 1.05, 3.36); g.add(door);
    for (const x of [-2.0, 2.0]) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.0), windowMat); win.position.set(x, 2.4, 3.37); g.add(win);
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
    this.createDetailedTrees(.26, .48, 64, 10, 42, false);
    const grassGeo = new THREE.PlaneGeometry(.42, 1.15);
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x7f9c50, roughness: 1, side: THREE.DoubleSide });
    const count = 1500;
    const inst = new THREE.InstancedMesh(grassGeo, grassMat, count);
    const d = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const t = .245 + Math.random() * .255;
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
    const s = this.getSample(.40);
    const yaw = Math.atan2(s.tangent.x, s.tangent.z);
    const group = new THREE.Group();

    const channelMat = new THREE.MeshStandardMaterial({ color: 0x3d332d, roughness: 1 });
    const channel = new THREE.Mesh(new THREE.BoxGeometry(150, 3.5, 24), channelMat);
    channel.position.y = -2.1;
    channel.receiveShadow = true;
    group.add(channel);

    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x2c7fa8,
      roughness: .16,
      metalness: .18,
      transparent: true,
      opacity: .9
    });
    const water = new THREE.Mesh(new THREE.BoxGeometry(150, .18, 18), waterMat);
    water.position.y = -0.65;
    group.add(water);

    const bankMat = new THREE.MeshStandardMaterial({ map: this.textures.dirt, color: 0x70543a, roughness: 1 });
    for (const z of [-15, 15]) {
      const bank = new THREE.Mesh(new THREE.BoxGeometry(150, 2.0, 11), bankMat);
      bank.position.set(0, -0.25, z);
      bank.rotation.x = z < 0 ? -0.22 : 0.22;
      bank.receiveShadow = true;
      group.add(bank);
    }

    const bridge = new THREE.Group();
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(this.roadHalfWidth * 2 + 2.6, .72, 34),
      new THREE.MeshStandardMaterial({ map: this.textures.asphalt, color: 0x656663, roughness: .88 })
    );
    deck.position.y = .35;
    deck.receiveShadow = true;
    bridge.add(deck);

    const beamMat = new THREE.MeshStandardMaterial({ color: 0x4d5459, roughness: .65, metalness: .28 });
    for (const x of [-this.roadHalfWidth - .95, this.roadHalfWidth + .95]) {
      const sideBeam = new THREE.Mesh(new THREE.BoxGeometry(.42, 1.05, 34), beamMat);
      sideBeam.position.set(x, .05, 0);
      sideBeam.castShadow = true;
      bridge.add(sideBeam);
      const rail = new THREE.Mesh(new THREE.BoxGeometry(.16, .18, 34), beamMat);
      rail.position.set(x, 1.12, 0);
      bridge.add(rail);
      for (let z = -15; z <= 15; z += 3) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(.15, 1.5, .15), beamMat);
        post.position.set(x, .65, z);
        bridge.add(post);
      }
    }

    const pierMat = new THREE.MeshStandardMaterial({ color: 0x888079, roughness: .95 });
    for (const z of [-10, 10]) {
      for (const x of [-3.4, 3.4]) {
        const pier = new THREE.Mesh(new THREE.BoxGeometry(1.6, 4.6, 2.2), pierMat);
        pier.position.set(x, -1.8, z);
        pier.castShadow = true;
        bridge.add(pier);
      }
    }

    group.add(bridge);
    group.position.copy(s.point);
    group.rotation.y = yaw;
    this.scene.add(group);
  }

  createTunnel() {
    const s = this.getSample(.515);
    const group = new THREE.Group();
    const rockMat = new THREE.MeshStandardMaterial({ map: this.textures.rock, color: 0x69625d, roughness: 1 });
    const concrete = new THREE.MeshStandardMaterial({ color: 0x898783, roughness: .92, side: THREE.DoubleSide });
    // Mountain mass is built around the opening instead of intersecting the road.
    const leftMass = new THREE.Mesh(new THREE.BoxGeometry(20, 25, 44), rockMat);
    leftMass.position.set(-16.8, 6.5, 0);
    leftMass.castShadow = leftMass.receiveShadow = true;
    group.add(leftMass);
    const rightMass = leftMass.clone();
    rightMass.position.x = 16.8;
    group.add(rightMass);
    const topMass = new THREE.Mesh(new THREE.BoxGeometry(15.0, 16, 44), rockMat);
    topMass.position.set(0, 15.4, 0);
    topMass.castShadow = topMass.receiveShadow = true;
    group.add(topMass);

    for (const z of [-18.1, 18.1]) {
      const top = new THREE.Mesh(new THREE.BoxGeometry(15.6, 1.0, 1.0), concrete);
      top.position.set(0, 7.8, z); group.add(top);
      for (const x of [-7.3, 7.3]) {
        const side = new THREE.Mesh(new THREE.BoxGeometry(1.0, 8.0, 1.0), concrete);
        side.position.set(x, 3.8, z); group.add(side);
      }
      const sign = new THREE.Mesh(new THREE.BoxGeometry(6.4, .55, .22), new THREE.MeshStandardMaterial({ color: 0xe7dfcf, roughness: .8 }));
      sign.position.set(0, 8.7, z + (z < 0 ? -.62 : .62)); group.add(sign);
    }

    const ceiling = new THREE.Mesh(new THREE.BoxGeometry(13.8, .55, 36), concrete);
    ceiling.position.set(0, 7.55, 0); group.add(ceiling);
    for (const x of [-6.65, 6.65]) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(.55, 7.2, 36), concrete);
      wall.position.set(x, 3.6, 0); group.add(wall);
    }

    // Small warm lamps make the tunnel readable while keeping it lightweight.
    for (const z of [-12, -4, 4, 12]) {
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(.9, .10, .22), new THREE.MeshBasicMaterial({ color: 0xffd79a, toneMapped: false }));
      lamp.position.set(0, 7.2, z); group.add(lamp);
    }

    group.position.copy(s.point);
    group.position.y -= 0.15;
    group.rotation.y = Math.atan2(s.tangent.x, s.tangent.z);
    this.scene.add(group);
  }

  createMountain() {
    this.createInstancedRocks(.54, .77, 88);
    this.createDetailedTrees(.55, .75, 56, 13, 48, true);
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
      const t = start + Math.random() * (end - start);
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
      const t = start + Math.random() * (end - start);
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

  createCampground() {
    this.createDetailedTrees(.77, .98, 52, 12, 50, true);
    for (let i = 0; i < 9; i++) {
      const t = .80 + i * .021;
      const s = this.getSample(t);
      const side = i % 2 ? 1 : -1;
      this.createTent(s.point.clone().addScaledVector(s.side, side * (15 + (i % 3) * 5)), (i * 1.1) % 6.28);
    }
    const fireS = this.getSample(.94);
    this.createCampfire(fireS.point.clone().addScaledVector(fireS.side, 17));
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
    const light = new THREE.PointLight(0xffc46a, 1.1, 9, 2);
    light.position.set(0, 1.6, 0); group.add(light);
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
    const light = new THREE.PointLight(0xff8a35, 7, 24, 2); light.position.y = 2; group.add(light);
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
