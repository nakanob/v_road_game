import * as THREE from "three";

const AREA_DATA = [
  { id: 0, key: "city", name: "街", time: "朝", start: 0.00, end: 0.31, road: 0x444b50 },
  { id: 1, key: "field", name: "草原", time: "昼", start: 0.31, end: 0.57, road: 0x6b7d4e },
  { id: 2, key: "mountain", name: "山", time: "夕方", start: 0.57, end: 0.80, road: 0x776c61 },
  { id: 3, key: "camp", name: "キャンプ場", time: "夜", start: 0.80, end: 1.00, road: 0x7b5a3f }
];

export class TrackWorld {
  constructor(game) {
    this.game = game;
    this.scene = game.scene;
    this.areas = AREA_DATA;
    this.roadHalfWidth = 5.5;
    this.length = 1180;
    this.sampleCount = 640;
    this.samples = [];

    this.curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.0, 0),
      new THREE.Vector3(0, 0.0, 110),
      new THREE.Vector3(3, 0.0, 230),
      new THREE.Vector3(7, 0.0, 360),
      new THREE.Vector3(12, 0.0, 500),
      new THREE.Vector3(14, 0.0, 620),
      new THREE.Vector3(18, 2.0, 725),
      new THREE.Vector3(16, 5.5, 815),
      new THREE.Vector3(10, 8.0, 925),
      new THREE.Vector3(6, 7.6, 1035),
      new THREE.Vector3(4, 7.4, 1150)
    ], false, "catmullrom", 0.18);

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
    const makeTexture = (size, draw) => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext("2d");
      draw(ctx, size);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.anisotropy = Math.min(4, this.game.renderer.capabilities.getMaxAnisotropy());
      return texture;
    };

    this.textures = {};

    this.textures.grass = makeTexture(256, (ctx, s) => {
      ctx.fillStyle = "#6d8748"; ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 1200; i++) {
        ctx.strokeStyle = Math.random() > 0.5 ? "rgba(151,186,100,.55)" : "rgba(54,92,37,.48)";
        const x = Math.random() * s, y = Math.random() * s;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.random() * 2 - 1, y - 3 - Math.random() * 8); ctx.stroke();
      }
    });

    this.textures.city = makeTexture(256, (ctx, s) => {
      ctx.fillStyle = "#96998f"; ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = "rgba(255,255,255,.12)";
      for (let x = 0; x < s; x += 34) ctx.fillRect(x, 0, 2, s);
      for (let y = 0; y < s; y += 34) ctx.fillRect(0, y, s, 2);
    });

    this.textures.rock = makeTexture(256, (ctx, s) => {
      ctx.fillStyle = "#7a7066"; ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 700; i++) {
        const c = 70 + Math.random() * 80;
        ctx.fillStyle = `rgba(${c},${c},${c*.95},${0.12 + Math.random() * 0.18})`;
        ctx.beginPath(); ctx.arc(Math.random() * s, Math.random() * s, 1 + Math.random() * 8, 0, Math.PI * 2); ctx.fill();
      }
    });

    this.textures.dirt = makeTexture(256, (ctx, s) => {
      ctx.fillStyle = "#825e42"; ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 850; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? "rgba(42,28,18,.18)" : "rgba(215,179,124,.18)";
        ctx.beginPath(); ctx.arc(Math.random() * s, Math.random() * s, 1 + Math.random() * 3.4, 0, Math.PI * 2); ctx.fill();
      }
    });

    this.textures.asphalt = makeTexture(256, (ctx, s) => {
      ctx.fillStyle = "#4a5054"; ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 1500; i++) {
        const c = 60 + Math.random() * 70;
        ctx.fillStyle = `rgba(${c},${c},${c},${0.07 + Math.random() * 0.12})`;
        ctx.fillRect(Math.random() * s, Math.random() * s, 1 + Math.random() * 3, 1 + Math.random() * 3);
      }
    });

    this.textures.leaf = makeTexture(128, (ctx, s) => {
      ctx.fillStyle = "#35623a"; ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 420; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? "rgba(115,170,94,.30)" : "rgba(19,56,25,.32)";
        ctx.beginPath(); ctx.arc(Math.random() * s, Math.random() * s, 1 + Math.random() * 4, 0, Math.PI * 2); ctx.fill();
      }
    });

    this.textures.bark = makeTexture(128, (ctx, s) => {
      ctx.fillStyle = "#5b3e2a"; ctx.fillRect(0, 0, s, s);
      for (let x = 0; x < s; x += 8) {
        ctx.strokeStyle = x % 16 ? "#6c4932" : "#432c1e";
        ctx.lineWidth = 2 + Math.random() * 2;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.bezierCurveTo(x + 2, s * .3, x - 2, s * .6, x + 1, s); ctx.stroke();
      }
    });

    this.textures.water = makeTexture(256, (ctx, s) => {
      const g = ctx.createLinearGradient(0, 0, s, s);
      g.addColorStop(0, "#3aa4d1");
      g.addColorStop(1, "#1d5c7d");
      ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = "rgba(255,255,255,.12)";
      for (let y = 10; y < s; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.quadraticCurveTo(s * .25, y + 6, s * .5, y); ctx.quadraticCurveTo(s * .75, y - 6, s, y); ctx.stroke();
      }
    });
  }

  buildSamples() {
    this.cumulative = [0];
    let total = 0;
    for (let i = 0; i <= this.sampleCount; i++) {
      const t = i / this.sampleCount;
      const point = this.curve.getPointAt(t);
      const tangent = this.curve.getTangentAt(t).normalize();
      const side = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
      if (i > 0) total += point.distanceTo(this.samples[i - 1].point);
      this.cumulative.push(total);
      this.samples.push({ t, point, tangent, side, distance: total });
    }
    this.length = total;
  }

  getArea(progress) {
    return this.areas.find((a) => progress >= a.start && progress < a.end) || this.areas[this.areas.length - 1];
  }

  getPose(progress, laneOffset = 0) {
    const index = Math.min(this.sampleCount - 1, Math.max(0, Math.floor(progress * this.sampleCount)));
    const s = this.samples[index];
    return {
      index,
      progress: s.t,
      tangent: s.tangent.clone(),
      side: s.side.clone(),
      position: s.point.clone().addScaledVector(s.side, laneOffset)
    };
  }

  getNearestState(position, lastIndex = 0, range = 36) {
    let start = Math.max(0, lastIndex - range);
    let end = Math.min(this.sampleCount, lastIndex + range);
    let best = null;
    let bestDistSq = Infinity;
    for (let i = start; i <= end; i++) {
      const sample = this.samples[i];
      const d = position.distanceToSquared(sample.point);
      if (d < bestDistSq) {
        bestDistSq = d;
        best = sample;
        best.index = i;
      }
    }
    const to = position.clone().sub(best.point);
    const lateral = to.dot(best.side);
    const along = to.dot(best.tangent);
    return { sample: best, index: best.index, lateral, along, distanceSq: bestDistSq };
  }

  createBaseGround() {
    const geo = new THREE.PlaneGeometry(1800, 1700);
    const mat = new THREE.MeshStandardMaterial({ map: this.textures.grass, color: 0x7b9550, roughness: 1 });
    mat.map.repeat.set(90, 90);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(0, -0.7, 590);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  createTerrainBands() {
    const mats = {
      city: new THREE.MeshStandardMaterial({ map: this.textures.city, color: 0xa0a49a, roughness: 1 }),
      field: new THREE.MeshStandardMaterial({ map: this.textures.grass, color: 0x7b9550, roughness: 1 }),
      mountain: new THREE.MeshStandardMaterial({ map: this.textures.rock, color: 0x86786d, roughness: 1 }),
      camp: new THREE.MeshStandardMaterial({ map: this.textures.dirt, color: 0x7f5d42, roughness: 1 })
    };
    mats.city.map.repeat.set(20, 24);
    mats.field.map.repeat.set(22, 34);
    mats.mountain.map.repeat.set(18, 28);
    mats.camp.map.repeat.set(20, 20);

    this.createTerrainRibbon(0.0, 0.31, 34, 18, mats.city, (offset) => Math.abs(offset) > 18 ? 0.08 : -0.02);
    this.createTerrainRibbon(0.31, 0.57, 56, 28, mats.field, (offset, k, sample) => {
      const abs = Math.abs(offset);
      if (abs < 9) return -0.08;
      return (abs - 9) * 0.012 + Math.sin(sample.point.z * 0.022 + offset * 0.08) * 0.28 + Math.cos(sample.point.x * 0.06) * 0.10 - 0.10;
    });
    this.createTerrainRibbon(0.57, 0.80, 70, 30, mats.mountain, (offset, k, sample) => {
      const abs = Math.abs(offset);
      if (abs < 10) return -0.06;
      const rise = Math.pow(abs - 10, 1.08) * 0.10;
      const blend = THREE.MathUtils.smoothstep(abs, 10, 20);
      const rugged = Math.sin(sample.point.z * 0.03 + offset * 0.06) * 0.6 + Math.cos(sample.point.x * 0.04) * 0.34;
      return THREE.MathUtils.lerp(-0.06, rise + rugged, blend);
    });
    this.createTerrainRibbon(0.80, 1.0, 54, 24, mats.camp, (offset, k, sample) => {
      const abs = Math.abs(offset);
      return Math.max(0, abs - 12) * 0.024 + Math.sin(sample.point.z * 0.03 + offset * 0.07) * 0.2 - 0.12;
    });
  }

  createTerrainRibbon(startT, endT, width, segments, material, heightFn) {
    const start = Math.floor(startT * this.sampleCount);
    const end = Math.ceil(endT * this.sampleCount);
    const verts = [], uvs = [], indices = [];
    const rows = end - start;
    for (let i = start; i <= end; i++) {
      const sample = this.samples[i];
      const rowT = rows === 0 ? 0 : (i - start) / rows;
      for (let j = 0; j <= segments; j++) {
        const u = j / segments;
        const offset = THREE.MathUtils.lerp(-width, width, u);
        const p = sample.point.clone().addScaledVector(sample.side, offset);
        p.y += heightFn(offset, rowT, sample);
        verts.push(p.x, p.y, p.z);
        uvs.push(u * 4, rowT * 20);
      }
    }
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < segments; c++) {
        const a = r * (segments + 1) + c;
        const b = a + 1;
        const d = a + segments + 1;
        const e = d + 1;
        indices.push(a, d, b, b, d, e);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, material);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  createRoad() {
    const areaMats = {
      city: new THREE.MeshStandardMaterial({ map: this.textures.asphalt, color: 0x4b5055, roughness: 1 }),
      field: new THREE.MeshStandardMaterial({ map: this.textures.grass, color: 0x718550, roughness: 1 }),
      mountain: new THREE.MeshStandardMaterial({ map: this.textures.rock, color: 0x756b62, roughness: 1 }),
      camp: new THREE.MeshStandardMaterial({ map: this.textures.dirt, color: 0x7f5d42, roughness: 1 })
    };
    areaMats.city.map.repeat.set(1.5, 40);
    areaMats.field.map.repeat.set(1.2, 40);
    areaMats.mountain.map.repeat.set(1.2, 35);
    areaMats.camp.map.repeat.set(1.3, 35);

    for (const area of this.areas) this.createRoadRibbon(area.start, area.end, areaMats[area.key]);
  }

  createRoadRibbon(startT, endT, material) {
    const start = Math.floor(startT * this.sampleCount);
    const end = Math.ceil(endT * this.sampleCount);
    const verts = [], uvs = [], indices = [];
    const rows = end - start;
    for (let i = start; i <= end; i++) {
      const sample = this.samples[i];
      const rowT = rows === 0 ? 0 : (i - start) / rows;
      for (const offset of [-this.roadHalfWidth, this.roadHalfWidth]) {
        const p = sample.point.clone().addScaledVector(sample.side, offset);
        p.y += 0.06;
        verts.push(p.x, p.y, p.z);
      }
      uvs.push(0, rowT * 20, 1, rowT * 20);
    }
    for (let r = 0; r < rows; r++) {
      const a = r * 2, b = a + 1, c = a + 2, d = a + 3;
      indices.push(a, c, b, b, c, d);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, material);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  createRoadEdges() {
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xf0f0e8, toneMapped: false });
    const stripe = (sideOffset, startT, endT) => {
      const start = Math.floor(startT * this.sampleCount);
      const end = Math.ceil(endT * this.sampleCount);
      const verts = [], uvs = [], indices = [];
      const rows = end - start;
      for (let i = start; i <= end; i++) {
        const s = this.samples[i];
        const left = s.point.clone().addScaledVector(s.side, sideOffset - 0.07); left.y += 0.08;
        const right = s.point.clone().addScaledVector(s.side, sideOffset + 0.07); right.y += 0.08;
        verts.push(left.x, left.y, left.z, right.x, right.y, right.z);
        const t = rows === 0 ? 0 : (i - start) / rows;
        uvs.push(0, t * 25, 1, t * 25);
      }
      for (let r = 0; r < rows; r++) {
        const a = r * 2, b = a + 1, c = a + 2, d = a + 3;
        indices.push(a, c, b, b, c, d);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
      geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      this.scene.add(new THREE.Mesh(geo, lineMat));
    };
    stripe(-this.roadHalfWidth, 0, 1);
    stripe(this.roadHalfWidth, 0, 1);
  }

  createCrosswalks() {
    const mat = new THREE.MeshBasicMaterial({ color: 0xf6f6f2, toneMapped: false });
    [0.11, 0.16].forEach((t) => {
      const pose = this.getPose(t);
      for (let i = -4; i <= 4; i++) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 3.2), mat);
        const offset = i * 0.95;
        stripe.position.copy(pose.position).addScaledVector(pose.side, offset);
        stripe.position.y += 0.09;
        stripe.rotation.x = -Math.PI / 2;
        stripe.rotation.z = Math.atan2(pose.tangent.x, pose.tangent.z);
        this.scene.add(stripe);
      }
    });
  }

  createCity() {
    const houseWallColors = [0xe6e0d7, 0xdacfbf, 0xcfd8e0, 0xe7d8cf, 0xd9e3d1];
    const roofColors = [0x8f4d42, 0x4f5964, 0x6e4a34, 0x645547];
    const doorColors = [0x5a4538, 0x394b65, 0x35543a, 0x6b3e35];

    const makeHouse = (scale = 1) => {
      const g = new THREE.Group();
      const wallMat = new THREE.MeshStandardMaterial({ color: houseWallColors[Math.floor(Math.random() * houseWallColors.length)], roughness: 0.9 });
      const roofMat = new THREE.MeshStandardMaterial({ color: roofColors[Math.floor(Math.random() * roofColors.length)], roughness: 0.9 });
      const trim = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 });
      const glass = new THREE.MeshStandardMaterial({ color: 0x8cb7cb, roughness: 0.2, metalness: 0.05, transparent: true, opacity: 0.8 });
      const doorMat = new THREE.MeshStandardMaterial({ color: doorColors[Math.floor(Math.random() * doorColors.length)], roughness: 0.9 });

      const bodyW = 4.2 + Math.random() * 1.6;
      const bodyH = 2.7 + Math.random() * 0.7;
      const bodyD = 4.6 + Math.random() * 2.2;
      const body = new THREE.Mesh(new THREE.BoxGeometry(bodyW, bodyH, bodyD), wallMat);
      body.position.y = bodyH / 2;
      body.castShadow = body.receiveShadow = true;
      g.add(body);

      const roof = new THREE.Mesh(new THREE.BoxGeometry(bodyW * 1.08, 0.55 + Math.random() * 0.18, bodyD * 1.05), roofMat);
      roof.position.y = bodyH + 0.22;
      roof.castShadow = true;
      g.add(roof);

      const doorX = (Math.random() - 0.5) * (bodyW * 0.45);
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.72, 0.08), doorMat);
      door.position.set(doorX, 0.86, bodyD / 2 + 0.05);
      g.add(door);

      const porch = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.09, 0.6), trim);
      porch.position.set(doorX, 0.04, bodyD / 2 + 0.32);
      g.add(porch);

      const windowCount = 2 + Math.floor(Math.random() * 3);
      for (let row = 0; row < 2; row++) {
        for (let i = 0; i < windowCount; i++) {
          const wx = THREE.MathUtils.lerp(-bodyW * 0.32, bodyW * 0.32, windowCount === 1 ? 0.5 : i / (windowCount - 1));
          if (Math.abs(wx - doorX) < 0.7 && row === 0) continue;
          const win = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.66, 0.07), glass);
          win.position.set(wx, 0.95 + row * 0.95, bodyD / 2 + 0.06);
          g.add(win);
        }
      }
      g.scale.setScalar(scale);
      return g;
    };

    const makeLot = (sampleIndex, sideSign, offset, obj) => {
      const s = this.samples[sampleIndex];
      const lot = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(11, 0.16, 14), new THREE.MeshStandardMaterial({ color: 0x8a8f87, roughness: 1 }));
      base.receiveShadow = true;
      base.position.y = 0.01;
      lot.add(base);
      const yard = new THREE.Mesh(new THREE.BoxGeometry(9, 0.1, 11), new THREE.MeshStandardMaterial({ color: 0x79964f, roughness: 1 }));
      yard.position.set(0, 0.07, 0.3);
      yard.receiveShadow = true;
      lot.add(yard);
      lot.add(obj);
      obj.position.set(0, 0.15, -1.0);
      lot.position.copy(s.point).addScaledVector(s.side, sideSign * offset);
      lot.rotation.y = Math.atan2(-s.side.x * sideSign, -s.side.z * sideSign);
      this.scene.add(lot);
    };

    // Spacious houses first
    for (let i = 30; i <= 145; i += 20) {
      makeLot(i, -1, 16 + Math.random() * 3, makeHouse(0.95 + Math.random() * 0.12));
      makeLot(i + 8, 1, 16 + Math.random() * 3, makeHouse(0.92 + Math.random() * 0.16));
    }

    // Gas station
    const gas = new THREE.Group();
    const gasMat = new THREE.MeshStandardMaterial({ color: 0xe9ecef, roughness: 0.9 });
    const red = new THREE.MeshStandardMaterial({ color: 0xd6453d, roughness: 0.9 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x34424f, roughness: 0.9 });
    const gasBody = new THREE.Mesh(new THREE.BoxGeometry(12, 3.3, 7), gasMat); gasBody.position.y = 1.65; gas.add(gasBody);
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(15, 0.35, 10), red); canopy.position.set(0, 4.4, 0); gas.add(canopy);
    for (const x of [-3.2, 3.2]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.45, 4.0, 0.45), gasMat); post.position.set(x, 2, 1.2); gas.add(post);
      const pump = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.8, 0.9), dark); pump.position.set(x, 0.9, 1.8); gas.add(pump);
    }
    const shopWin = new THREE.Mesh(new THREE.BoxGeometry(8.5, 1.2, 0.1), new THREE.MeshStandardMaterial({ color: 0x99c7db, transparent: true, opacity: 0.8 }));
    shopWin.position.set(0, 2.0, 3.56); gas.add(shopWin);
    makeLot(168, -1, 18, gas);

    // Police station
    const police = new THREE.Group();
    const policeBody = new THREE.Mesh(new THREE.BoxGeometry(10, 3.6, 8), new THREE.MeshStandardMaterial({ color: 0xe6e6e8, roughness: 0.9 })); policeBody.position.y = 1.8; police.add(policeBody);
    const blueRoof = new THREE.Mesh(new THREE.BoxGeometry(10.6, 0.28, 8.6), new THREE.MeshStandardMaterial({ color: 0x456fa8, roughness: 0.9 })); blueRoof.position.y = 3.8; police.add(blueRoof);
    const entry = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.3, 1.4), new THREE.MeshStandardMaterial({ color: 0xcfd4dc, roughness: 0.9 })); entry.position.set(0, 1.15, 4.5); police.add(entry);
    const emblem = new THREE.Mesh(new THREE.CircleGeometry(0.5, 20), new THREE.MeshBasicMaterial({ color: 0x2a5aa6, toneMapped: false })); emblem.position.set(0, 2.5, 4.1); police.add(emblem);
    makeLot(186, 1, 18, police);

    // Dense mixed buildings later
    const buildFacadeMat = new THREE.MeshStandardMaterial({ color: 0xc7c0b5, roughness: 0.95 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x8fb4c8, roughness: 0.12, transparent: true, opacity: 0.82 });
    const lotCount = 36;
    let seed = 0;
    for (let i = 198; i <= 314; i += 8) {
      const s = this.samples[i];
      for (const sideSign of [-1, 1]) {
        if (seed++ > lotCount) break;
        const gap = 12 + Math.random() * 4;
        const w = 4 + Math.random() * 7;
        const h = 7 + Math.random() * 14;
        const d = 6 + Math.random() * 9;
        const b = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.02 + Math.random() * 0.12, 0.08 + Math.random() * 0.18, 0.55 + Math.random() * 0.22), roughness: 0.95 }));
        body.position.y = h / 2;
        body.castShadow = body.receiveShadow = true;
        b.add(body);
        for (let y = 1.4; y < h - 1.2; y += 1.6) {
          const cols = Math.max(2, Math.floor(w / 1.6));
          for (let c = 0; c < cols; c++) {
            const wx = THREE.MathUtils.lerp(-w * 0.35, w * 0.35, cols === 1 ? 0.5 : c / (cols - 1));
            const win = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.08), glassMat);
            win.position.set(wx, y, d / 2 + 0.05);
            b.add(win);
          }
        }
        const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(w + 1.6, 0.1, d + 2.0), new THREE.MeshStandardMaterial({ color: 0xa6aaa3, roughness: 1 }));
        sidewalk.position.y = 0.05;
        b.add(sidewalk);
        if (Math.random() > 0.56) {
          const parking = new THREE.Mesh(new THREE.BoxGeometry(w + 5, 0.08, 5), new THREE.MeshStandardMaterial({ color: 0x8a8e88, roughness: 1 }));
          parking.position.set(0, 0.04, d * 0.56 + 3.0);
          b.add(parking);
        }
        b.position.copy(s.point).addScaledVector(s.side, sideSign * gap);
        b.rotation.y = Math.atan2(-s.side.x * sideSign, -s.side.z * sideSign);
        this.scene.add(b);
      }
    }
  }

  createField() {
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x7fa653, roughness: 1, side: THREE.DoubleSide });
    const grassGeo = new THREE.PlaneGeometry(0.16, 0.88);
    grassGeo.translate(0, 0.44, 0);
    const grassCount = 1800;
    const grassMesh = new THREE.InstancedMesh(grassGeo, grassMat, grassCount);
    const dummy = new THREE.Object3D();
    let placed = 0;
    while (placed < grassCount) {
      const s = this.samples[205 + Math.floor(Math.random() * 170)];
      const side = (Math.random() > 0.5 ? -1 : 1) * (11 + Math.random() * 40);
      const along = (Math.random() - 0.5) * 14;
      const pos = s.point.clone().addScaledVector(s.side, side).addScaledVector(s.tangent, along);
      pos.y = -0.05;
      dummy.position.copy(pos);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.rotation.z = THREE.MathUtils.degToRad(-10 + Math.random() * 20);
      dummy.scale.setScalar(0.65 + Math.random() * 1.1);
      dummy.updateMatrix();
      grassMesh.setMatrixAt(placed++, dummy.matrix);
    }
    grassMesh.receiveShadow = true;
    this.scene.add(grassMesh);

    const trunkMat = new THREE.MeshStandardMaterial({ map: this.textures.bark, color: 0x69422e, roughness: 1 });
    const leafMat = new THREE.MeshStandardMaterial({ map: this.textures.leaf, color: 0x3f6d3f, roughness: 1 });
    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.24, 2.8, 7);
    const leafGeo = new THREE.SphereGeometry(1.45, 8, 7);

    for (let i = 0; i < 220; i++) {
      const s = this.samples[215 + Math.floor(Math.random() * 170)];
      const side = (Math.random() > 0.5 ? -1 : 1) * (16 + Math.random() * 48);
      const along = (Math.random() - 0.5) * 10;
      const group = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1.4;
      trunk.castShadow = true;
      group.add(trunk);
      const layers = 2 + Math.floor(Math.random() * 2);
      for (let l = 0; l < layers; l++) {
        const crown = new THREE.Mesh(leafGeo, leafMat);
        crown.scale.set(1.0 + Math.random() * 0.35, 0.85 + Math.random() * 0.4, 1.0 + Math.random() * 0.35);
        crown.position.set((Math.random() - 0.5) * 0.2, 2.3 + l * 0.45, (Math.random() - 0.5) * 0.2);
        crown.castShadow = true;
        group.add(crown);
      }
      group.position.copy(s.point).addScaledVector(s.side, side).addScaledVector(s.tangent, along);
      group.position.y = 0;
      this.scene.add(group);
    }
  }

  createRiverAndBridge() {
    const pose = this.getPose(0.57);
    const riverGroup = new THREE.Group();
    const riverAngle = Math.atan2(pose.side.x, pose.side.z);
    riverGroup.position.copy(pose.position);
    riverGroup.rotation.y = riverAngle;

    // river trench
    const bankMat = new THREE.MeshStandardMaterial({ color: 0x7c6443, roughness: 1 });
    const waterMat = new THREE.MeshStandardMaterial({ map: this.textures.water, color: 0x38a3cd, roughness: 0.28, metalness: 0.08, transparent: true, opacity: 0.95 });
    waterMat.map.repeat.set(4, 24);

    const riverBed = new THREE.Mesh(new THREE.BoxGeometry(24, 2.6, 85), bankMat);
    riverBed.position.set(0, -2.0, 0);
    riverBed.receiveShadow = true;
    riverGroup.add(riverBed);

    const water = new THREE.Mesh(new THREE.PlaneGeometry(12, 84), waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -0.75, 0);
    riverGroup.add(water);

    for (const x of [-9.2, 9.2]) {
      const bank = new THREE.Mesh(new THREE.BoxGeometry(7.6, 2.8, 84), bankMat);
      bank.position.set(x, -0.58, 0);
      bank.receiveShadow = true;
      riverGroup.add(bank);

      const slope = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.8, 84), new THREE.MeshStandardMaterial({ color: 0x6f8b46, roughness: 1 }));
      slope.position.set(x * 1.2, 0.55, 0);
      slope.rotation.z = x < 0 ? 0.26 : -0.26;
      slope.receiveShadow = true;
      riverGroup.add(slope);
    }

    // bridge deck aligned to road direction, over the river
    const bridge = new THREE.Group();
    bridge.position.copy(pose.position);
    bridge.rotation.y = Math.atan2(pose.tangent.x, pose.tangent.z);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(this.roadHalfWidth * 2 + 1.8, 0.34, 18), new THREE.MeshStandardMaterial({ color: 0x484b50, roughness: 1 }));
    deck.position.y = 0.18;
    deck.receiveShadow = true;
    bridge.add(deck);
    const deck2 = new THREE.Mesh(new THREE.BoxGeometry(this.roadHalfWidth * 2 + 0.6, 0.12, 16), new THREE.MeshStandardMaterial({ color: 0x5b5e61, roughness: 1 }));
    deck2.position.y = 0.40;
    bridge.add(deck2);
    for (const x of [-(this.roadHalfWidth + 0.65), this.roadHalfWidth + 0.65]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.8, 18), new THREE.MeshStandardMaterial({ color: 0x98a0a8, roughness: 0.55, metalness: 0.25 }));
      rail.position.set(x, 0.62, 0);
      bridge.add(rail);
      for (let z = -8; z <= 8; z += 2.8) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, 0.12), new THREE.MeshStandardMaterial({ color: 0x7f8790, roughness: 0.6, metalness: 0.2 }));
        post.position.set(x, 0.24, z);
        bridge.add(post);
      }
    }
    for (const z of [-4.5, 4.5]) {
      const support = new THREE.Mesh(new THREE.BoxGeometry(this.roadHalfWidth * 2 - 1.2, 1.2, 0.55), new THREE.MeshStandardMaterial({ color: 0x54585d, roughness: 1 }));
      support.position.set(0, -1.1, z);
      bridge.add(support);
    }
    this.scene.add(riverGroup, bridge);
  }

  createTunnel() {
    const pose = this.getPose(0.72);
    const group = new THREE.Group();
    group.position.copy(pose.position);
    group.rotation.y = Math.atan2(pose.tangent.x, pose.tangent.z);

    const rockMat = new THREE.MeshStandardMaterial({ map: this.textures.rock, color: 0x766d65, roughness: 1 });
    const tunnelMat = new THREE.MeshStandardMaterial({ color: 0x5f625f, roughness: 1 });
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x9a9b95, roughness: 1 });

    // mountain shell - triangular silhouette
    const leftHill = new THREE.Mesh(new THREE.BoxGeometry(18, 16, 26), rockMat);
    leftHill.position.set(-14, 5.5, 0); leftHill.rotation.z = 0.42; leftHill.castShadow = leftHill.receiveShadow = true; group.add(leftHill);
    const rightHill = new THREE.Mesh(new THREE.BoxGeometry(18, 16, 26), rockMat);
    rightHill.position.set(14, 5.5, 0); rightHill.rotation.z = -0.42; rightHill.castShadow = rightHill.receiveShadow = true; group.add(rightHill);
    const topHill = new THREE.Mesh(new THREE.ConeGeometry(18, 16, 4), rockMat);
    topHill.position.set(0, 12.5, 0); topHill.rotation.y = Math.PI * 0.25; topHill.castShadow = topHill.receiveShadow = true; group.add(topHill);

    // tunnel interior and clear opening
    const inner = new THREE.Group();
    const length = 30;
    const halfW = 5.4;
    const height = 6.4;
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.7, height, length), tunnelMat); leftWall.position.set(-halfW, height / 2 - 0.05, 0); inner.add(leftWall);
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.7, height, length), tunnelMat); rightWall.position.set(halfW, height / 2 - 0.05, 0); inner.add(rightWall);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2, 0.6, length), tunnelMat); roof.position.set(0, height - 0.1, 0); inner.add(roof);
    inner.position.y = 0.1;
    group.add(inner);

    for (const z of [-length / 2 + 0.4, length / 2 - 0.4]) {
      const frameSideL = new THREE.Mesh(new THREE.BoxGeometry(0.8, height + 0.8, 0.8), frameMat); frameSideL.position.set(-halfW - 0.3, height / 2, z); group.add(frameSideL);
      const frameSideR = new THREE.Mesh(new THREE.BoxGeometry(0.8, height + 0.8, 0.8), frameMat); frameSideR.position.set(halfW + 0.3, height / 2, z); group.add(frameSideR);
      const frameTop = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2 + 1.6, 0.8, 0.8), frameMat); frameTop.position.set(0, height + 0.35, z); group.add(frameTop);
    }

    const portalFloor = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2 + 0.8, 0.06, length), new THREE.MeshStandardMaterial({ color: 0x4f4338, roughness: 1 }));
    portalFloor.position.y = 0.06;
    group.add(portalFloor);

    for (let z = -12; z <= 12; z += 6) {
      const light = new THREE.PointLight(0xffd49a, 0.6, 14, 2);
      light.position.set(0, 5.4, z);
      group.add(light);
    }

    this.scene.add(group);
  }

  createMountain() {
    const rockMat = new THREE.MeshStandardMaterial({ map: this.textures.rock, color: 0x7b7268, roughness: 1 });
    const mountainAreaStart = 0.60 * this.sampleCount;
    const mountainAreaEnd = 0.83 * this.sampleCount;
    for (let i = 0; i < 72; i++) {
      const s = this.samples[Math.floor(mountainAreaStart + Math.random() * (mountainAreaEnd - mountainAreaStart))];
      const sideDist = (Math.random() > 0.5 ? -1 : 1) * (14 + Math.random() * 44);
      const cluster = new THREE.Group();
      const pieces = 2 + Math.floor(Math.random() * 3);
      for (let p = 0; p < pieces; p++) {
        const radius = 1.2 + Math.random() * 3.6;
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(radius, 0), rockMat);
        rock.position.set((Math.random() - 0.5) * radius * 1.4, Math.random() * radius * 0.55, (Math.random() - 0.5) * radius * 1.2);
        rock.scale.set(1, 0.8 + Math.random() * 0.7, 1);
        rock.castShadow = rock.receiveShadow = true;
        cluster.add(rock);
      }
      cluster.position.copy(s.point).addScaledVector(s.side, sideDist).addScaledVector(s.tangent, (Math.random() - 0.5) * 10);
      this.scene.add(cluster);
    }
  }

  createHuman(options = {}) {
    const g = new THREE.Group();
    const skin = new THREE.MeshStandardMaterial({ color: options.skin || 0xf1c39f, roughness: 0.85 });
    const cloth = new THREE.MeshStandardMaterial({ color: options.cloth || 0x5574a8, roughness: 0.95 });
    const pants = new THREE.MeshStandardMaterial({ color: options.pants || 0x353b4a, roughness: 0.95 });
    const hair = new THREE.MeshStandardMaterial({ color: options.hair || 0x3b2418, roughness: 0.9 });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.95, 0.38), cloth); torso.position.y = 1.35; torso.castShadow = true; g.add(torso);
    const waist = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.22, 0.32), pants); waist.position.y = 0.82; g.add(waist);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 18, 14), skin); head.position.y = 2.05; head.castShadow = true; g.add(head);
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.285, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), hair); hairCap.position.y = 2.12; g.add(hairCap);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111, toneMapped: false });
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0xa83e3e, toneMapped: false });
    for (const x of [-0.08, 0.08]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), eyeMat); eye.position.set(x, 2.08, 0.25); g.add(eye);
    }
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.02, 0.02), mouthMat); mouth.position.set(0, 1.95, 0.27); g.add(mouth);

    const armGeo = new THREE.BoxGeometry(0.16, 0.72, 0.16);
    const foreGeo = new THREE.BoxGeometry(0.14, 0.64, 0.14);
    const legGeo = new THREE.BoxGeometry(0.18, 0.78, 0.18);
    const leftArm = new THREE.Group();
    const rightArm = new THREE.Group();
    const la1 = new THREE.Mesh(armGeo, cloth); la1.position.y = -0.24; leftArm.add(la1);
    const la2 = new THREE.Mesh(foreGeo, skin); la2.position.set(0, -0.65, 0); leftArm.add(la2);
    const ra1 = new THREE.Mesh(armGeo, cloth); ra1.position.y = -0.24; rightArm.add(ra1);
    const ra2 = new THREE.Mesh(foreGeo, skin); ra2.position.set(0, -0.65, 0); rightArm.add(ra2);
    leftArm.position.set(-0.46, 1.72, 0);
    rightArm.position.set(0.46, 1.72, 0);
    leftArm.rotation.z = options.armLeft ?? (Math.random() * 0.35 - 0.25);
    rightArm.rotation.z = options.armRight ?? -(Math.random() * 0.35 - 0.25);
    g.add(leftArm, rightArm);

    for (const x of [-0.15, 0.15]) {
      const leg = new THREE.Mesh(legGeo, pants); leg.position.set(x, 0.39, 0); leg.castShadow = true; g.add(leg);
    }

    if (options.drink) {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 10), new THREE.MeshStandardMaterial({ color: 0xd8d0c3, roughness: 0.8 }));
      cup.position.set(0.56, 1.14, 0.14); g.add(cup);
      rightArm.rotation.z = -0.65;
      rightArm.rotation.x = -0.4;
    }
    if (options.seated) {
      g.position.y = -0.3;
      torso.rotation.x = -0.14;
      for (const child of g.children) {
        if (child.geometry?.parameters?.height === 0.78) child.rotation.x = -1.1;
      }
    }
    return g;
  }

  createCampground() {
    const pose = this.getPose(0.96);
    const root = new THREE.Group();
    root.position.copy(pose.position).addScaledVector(pose.side, -18);
    root.rotation.y = Math.atan2(pose.tangent.x, pose.tangent.z) - 0.35;

    const ground = new THREE.Mesh(new THREE.CircleGeometry(20, 32), new THREE.MeshStandardMaterial({ color: 0x7a5c3e, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0.02;
    ground.receiveShadow = true;
    root.add(ground);

    const fireMat = new THREE.MeshBasicMaterial({ color: 0xffb25b, toneMapped: false });
    const ember = new THREE.Mesh(new THREE.SphereGeometry(0.52, 12, 10), fireMat);
    ember.scale.set(1, 0.65, 1);
    ember.position.set(0, 0.45, 0);
    root.add(ember);
    const fireLight = new THREE.PointLight(0xffa34a, 2.1, 18, 2);
    fireLight.position.set(0, 1.6, 0);
    root.add(fireLight);

    const logMat = new THREE.MeshStandardMaterial({ color: 0x5e432a, roughness: 1 });
    for (let i = 0; i < 3; i++) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.4, 8), logMat);
      log.rotation.z = Math.PI / 2;
      log.rotation.y = i * Math.PI / 3;
      log.position.y = 0.08;
      root.add(log);
    }

    const lanternPositions = [
      [-6, 0, -5], [6, 0, -4], [-7, 0, 6], [7, 0, 7], [0, 0, -8], [0, 0, 8]
    ];
    for (const [x, y, z] of lanternPositions) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.6, 8), new THREE.MeshStandardMaterial({ color: 0x676b6e, roughness: 0.9 }));
      pole.position.set(x, 0.8, z); root.add(pole);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffd59a, toneMapped: false }));
      bulb.position.set(x, 1.55, z); root.add(bulb);
      const light = new THREE.PointLight(0xffd09a, 1.4, 14, 2); light.position.set(x, 1.55, z); root.add(light);
    }

    // BBQ and tables
    const grill = new THREE.Group();
    const bbqBody = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.65, 0.95), new THREE.MeshStandardMaterial({ color: 0x414141, roughness: 0.9 }));
    bbqBody.position.y = 0.86; grill.add(bbqBody);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.55, 0.95), new THREE.MeshStandardMaterial({ color: 0x565656, roughness: 0.9 }));
    lid.position.set(0, 1.25, -0.12); grill.add(lid);
    for (const x of [-0.65, 0.65]) {
      for (const z of [-0.25, 0.25]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.82, 8), new THREE.MeshStandardMaterial({ color: 0x505050, roughness: 1 }));
        leg.position.set(x, 0.4, z); grill.add(leg);
      }
    }
    grill.position.set(-5.5, 0, 2.5);
    root.add(grill);
    const bbqLight = new THREE.PointLight(0xffa665, 1.0, 8, 2); bbqLight.position.set(-5.5, 1.2, 2.5); root.add(bbqLight);

    const tableMat = new THREE.MeshStandardMaterial({ color: 0x6f4d30, roughness: 1 });
    for (const [x, z] of [[4.6, 2.6], [4.0, -4.0], [-3.5, -4.8]]) {
      const table = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 1.2), tableMat);
      table.position.set(x, 0.92, z); root.add(table);
      for (const dx of [-0.85, 0.85]) {
        for (const dz of [-0.35, 0.35]) {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.84, 0.12), tableMat);
          leg.position.set(x + dx, 0.42, z + dz); root.add(leg);
        }
      }
    }

    // tents
    const tentColors = [0xd86d44, 0x4b6aa8, 0x7b8b3f, 0xd0a14a];
    const tentPositions = [[-9, -8], [9, -7], [-10, 9], [10, 8], [13, 1]];
    for (const [x, z] of tentPositions) {
      const tent = new THREE.Group();
      const color = tentColors[Math.floor(Math.random() * tentColors.length)];
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.92 });
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.15, 2.2), new THREE.MeshStandardMaterial({ color: 0x69604d, roughness: 1 }));
      base.position.y = 0.08; tent.add(base);
      const cloth = new THREE.Mesh(new THREE.ConeGeometry(1.8, 1.6, 4), mat);
      cloth.rotation.y = Math.PI / 4; cloth.position.y = 0.9; cloth.scale.z = 1.25; tent.add(cloth);
      const glow = new THREE.PointLight(0xffcc8c, 0.85, 8, 2); glow.position.set(0, 1.0, 0); tent.add(glow);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.10, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffdb9e, toneMapped: false })); bulb.position.set(0, 1.0, 0); tent.add(bulb);
      tent.position.set(x, 0, z); root.add(tent);
    }

    // people groups
    const clothPalette = [0x7b8fb5, 0x8c5c4b, 0x5f8a52, 0xb28348, 0x7e668f, 0x3d6a76];
    const pantsPalette = [0x363c4f, 0x4d4638, 0x2d3948, 0x4f4f4f];
    const hairPalette = [0x2b1b12, 0x4b362b, 0x221917, 0x7c5c3c];
    const peopleSpots = [
      [-2, 0, -3], [2, 0, -3], [-3.6, 0, 1.8], [3.7, 0, 1.6], [-1.4, 0, 4.2], [1.8, 0, 4.3],
      [4.8, 0, 2.1], [5.6, 0, 3.4], [3.8, 0, -3.5], [5.2, 0, -4.6],
      [-5.0, 0, 3.2], [-6.2, 0, 1.7], [-6.0, 0, -1.0], [-4.0, 0, -4.1],
      [8.5, 0, -2.2], [9.5, 0, 0.2], [-8.8, 0, 0.5], [-9.5, 0, 3.0], [0.8, 0, -7.2], [-0.9, 0, -7.0]
    ];

    peopleSpots.forEach((spot, idx) => {
      const person = this.createHuman({
        cloth: clothPalette[idx % clothPalette.length],
        pants: pantsPalette[idx % pantsPalette.length],
        hair: hairPalette[idx % hairPalette.length],
        armLeft: (Math.random() - 0.2) * 0.7,
        armRight: -(Math.random() - 0.2) * 0.7,
        drink: idx % 4 === 0
      });
      person.position.set(spot[0], 0, spot[2]);
      person.rotation.y = Math.random() * Math.PI * 2;
      root.add(person);
    });

    this.scene.add(root);
  }

  createStars() {
    const positions = [];
    for (let i = 0; i < 280; i++) {
      positions.push((Math.random() - 0.5) * 1200, 150 + Math.random() * 280, -100 + Math.random() * 1400);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
    this.stars = new THREE.Points(geo, mat);
    this.scene.add(this.stars);
  }
}
