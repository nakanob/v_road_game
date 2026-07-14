import * as THREE from "three";

const AREA_DATA = [
  { id: 0, key: "city", name: "街", time: "朝", start: 0.00, end: 0.24, road: 0x454a4e },
  { id: 1, key: "field", name: "草原", time: "昼", start: 0.24, end: 0.50, road: 0x66774a },
  { id: 2, key: "mountain", name: "山", time: "夕方", start: 0.50, end: 0.76, road: 0x6b635c },
  { id: 3, key: "camp", name: "キャンプ場", time: "夜", start: 0.76, end: 1.00, road: 0x72533b }
];

export class TrackWorld {
  constructor(game) {
    this.game = game;
    this.scene = game.scene;
    this.areas = AREA_DATA;
    this.roadHalfWidth = 5.5;
    this.length = 1080;
    this.sampleCount = 520;
    this.samples = [];

    this.curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 90),
      new THREE.Vector3(18, 1, 185),
      new THREE.Vector3(-18, 0, 285),
      new THREE.Vector3(-42, 2, 390),
      new THREE.Vector3(8, 8, 500),
      new THREE.Vector3(45, 18, 610),
      new THREE.Vector3(12, 28, 720),
      new THREE.Vector3(-34, 20, 825),
      new THREE.Vector3(-10, 7, 930),
      new THREE.Vector3(28, 3, 1030)
    ], false, "catmullrom", 0.24);

    this.createTextures();
    this.buildSamples();
    this.createGround();
    this.createRoad();
    this.createRoadEdges();
    this.createCheckpoints();
    this.createCity();
    this.createField();
    this.createRiver();
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
    this.textures.asphalt = canvasTexture(128, (ctx, s) => {
      ctx.fillStyle = "#494d50"; ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 800; i++) {
        const v = 55 + Math.random() * 55;
        ctx.fillStyle = `rgba(${v},${v},${v},${0.12 + Math.random() * 0.18})`;
        ctx.fillRect(Math.random() * s, Math.random() * s, 1 + Math.random() * 2, 1 + Math.random() * 2);
      }
    });
    this.textures.grassRoad = canvasTexture(128, (ctx, s) => {
      ctx.fillStyle = "#68784a"; ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 700; i++) {
        ctx.strokeStyle = Math.random() > .5 ? "#7f9259" : "#52633d";
        const x = Math.random() * s, y = Math.random() * s;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.random() * 2 - 1, y - 3 - Math.random() * 4); ctx.stroke();
      }
      ctx.fillStyle = "rgba(125,106,74,.18)";
      ctx.fillRect(s * .23, 0, s * .10, s); ctx.fillRect(s * .67, 0, s * .10, s);
    });
    this.textures.rock = canvasTexture(128, (ctx, s) => {
      ctx.fillStyle = "#6d6660"; ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 350; i++) {
        const c = 70 + Math.random() * 80;
        ctx.fillStyle = `rgba(${c},${c * .95},${c * .9},.35)`;
        ctx.beginPath(); ctx.arc(Math.random() * s, Math.random() * s, 1 + Math.random() * 4, 0, Math.PI * 2); ctx.fill();
      }
    });
    this.textures.dirt = canvasTexture(128, (ctx, s) => {
      ctx.fillStyle = "#77583d"; ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 500; i++) {
        ctx.fillStyle = Math.random() > .5 ? "rgba(55,35,20,.22)" : "rgba(210,170,115,.18)";
        ctx.beginPath(); ctx.arc(Math.random() * s, Math.random() * s, .5 + Math.random() * 2.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = "rgba(45,30,20,.14)";
      ctx.fillRect(s * .24, 0, s * .08, s); ctx.fillRect(s * .68, 0, s * .08, s);
    });
    this.textures.facade = canvasTexture(256, (ctx, s) => {
      ctx.fillStyle = "#c8c0b2"; ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = "#b3aa9b";
      for (let y = 0; y < s; y += 32) ctx.fillRect(0, y, s, 2);
      for (let y = 14; y < s; y += 46) {
        for (let x = 14; x < s; x += 48) {
          ctx.fillStyle = "#344653"; ctx.fillRect(x, y, 26, 22);
          ctx.fillStyle = "rgba(255,223,151,.65)"; ctx.fillRect(x + 3, y + 3, 20, 16);
          ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillRect(x + 4, y + 4, 6, 14);
          ctx.strokeStyle = "#76716a"; ctx.strokeRect(x, y, 26, 22);
        }
      }
    });
    this.textures.bark = canvasTexture(128, (ctx, s) => {
      ctx.fillStyle = "#5b3e2b"; ctx.fillRect(0, 0, s, s);
      for (let x = 0; x < s; x += 7) {
        ctx.strokeStyle = x % 14 ? "#72513a" : "#3f2b20";
        ctx.lineWidth = 2 + Math.random() * 2;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.bezierCurveTo(x + 5, s * .3, x - 4, s * .7, x + 2, s); ctx.stroke();
      }
    });
    this.textures.leaf = canvasTexture(128, (ctx, s) => {
      ctx.fillStyle = "#315b38"; ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 420; i++) {
        ctx.fillStyle = Math.random() > .5 ? "rgba(95,145,78,.35)" : "rgba(20,60,28,.28)";
        ctx.beginPath(); ctx.arc(Math.random() * s, Math.random() * s, 1 + Math.random() * 3, 0, Math.PI * 2); ctx.fill();
      }
    });
    this.textures.grass = canvasTexture(128, (ctx, s) => {
      ctx.fillStyle = "#657b43"; ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 600; i++) {
        ctx.strokeStyle = Math.random() > .5 ? "#8ca85a" : "#445b32";
        const x = Math.random() * s, y = Math.random() * s;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.random() * 2 - 1, y - 4 - Math.random() * 5); ctx.stroke();
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

  createGround() {
    const geo = new THREE.PlaneGeometry(1250, 1250, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ map: this.textures.grass, color: 0x8aa35b, roughness: 1 });
    mat.map.repeat.set(80, 80);
    const ground = new THREE.Mesh(geo, mat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.30, 500);
    ground.receiveShadow = true;
    this.scene.add(ground);
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
        left.y += 0.05; right.y += 0.05;
        vertices.push(left.x, left.y, left.z, right.x, right.y, right.z);
        const v = (i - start) / 8;
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
      geo.setIndex(indices); geo.computeVertexNormals();
      const map = maps[area.id]; map.repeat.set(1, 1);
      const mat = new THREE.MeshStandardMaterial({ map, color: area.road, roughness: .95, metalness: 0 });
      const road = new THREE.Mesh(geo, mat);
      road.receiveShadow = true;
      this.scene.add(road);
    }

    // 街のセンターライン
    const points = [];
    for (let i = 0; i <= Math.floor(.24 * this.sampleCount); i++) {
      const p = this.samples[i].point.clone(); p.y += .09; points.push(p);
    }
    const center = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineDashedMaterial({ color: 0xf3e6b2, dashSize: 4, gapSize: 4 }));
    center.computeLineDistances(); this.scene.add(center);
  }

  createRoadEdges() {
    const l = [], r = [];
    for (const s of this.samples) {
      l.push(s.point.clone().addScaledVector(s.side, -this.roadHalfWidth - .12).add(new THREE.Vector3(0, .10, 0)));
      r.push(s.point.clone().addScaledVector(s.side, this.roadHalfWidth + .12).add(new THREE.Vector3(0, .10, 0)));
    }
    const mat = new THREE.LineBasicMaterial({ color: 0xe9e2cf, transparent: true, opacity: .72 });
    this.scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(l), mat));
    this.scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(r), mat));
  }

  createCheckpoints() {
    [0.24, 0.50, 0.76, 0.995].forEach((t, index) => {
      const s = this.getSample(t); const group = new THREE.Group();
      const postGeo = new THREE.BoxGeometry(.34, 5, .34);
      const postMat = new THREE.MeshStandardMaterial({ color: index === 3 ? 0xf4c95d : 0xe7e2d4, roughness: .72 });
      for (const x of [-this.roadHalfWidth - 1, this.roadHalfWidth + 1]) {
        const p = new THREE.Mesh(postGeo, postMat); p.position.copy(s.point).addScaledVector(s.side, x); p.position.y += 2.5; p.castShadow = true; group.add(p);
      }
      const bar = new THREE.Mesh(new THREE.BoxGeometry(this.roadHalfWidth * 2 + 2.4, .45, .45), postMat);
      bar.position.copy(s.point); bar.position.y += 5; bar.rotation.y = Math.atan2(s.tangent.x, s.tangent.z); bar.castShadow = true; group.add(bar);
      this.scene.add(group);
    });
  }

  createCity() {
    const facadeMat = new THREE.MeshStandardMaterial({ map: this.textures.facade, roughness: .88 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x4d555d, roughness: .82 });
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x45372d, roughness: .72 });
    const windowMat = new THREE.MeshBasicMaterial({ color: 0xffd788, toneMapped: false });

    for (let i = 0; i < 30; i++) {
      const t = .012 + (i / 30) * .21;
      const s = this.getSample(t);
      const sideSign = i % 2 ? 1 : -1;
      const dist = 12 + (i % 4) * 5;
      const w = 7 + (i % 3) * 2.3;
      const h = 7 + (i * 5) % 14;
      const d = 7 + (i % 2) * 3;
      const g = new THREE.Group();
      const building = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), facadeMat);
      building.position.y = h / 2;
      building.castShadow = true; building.receiveShadow = true;
      g.add(building);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(w + .4, .35, d + .4), roofMat);
      roof.position.y = h + .18; roof.castShadow = true; g.add(roof);
      const door = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.4, .12), doorMat);
      door.position.set(0, 1.2, sideSign > 0 ? -d / 2 - .07 : d / 2 + .07);
      if (sideSign > 0) door.rotation.y = Math.PI;
      g.add(door);
      const awning = new THREE.Mesh(new THREE.BoxGeometry(2.3, .16, .7), roofMat);
      awning.position.set(0, 2.7, sideSign > 0 ? -d / 2 - .35 : d / 2 + .35);
      g.add(awning);
      for (let x = -w * .3; x <= w * .3; x += 2.1) {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .8), windowMat);
        win.position.set(x, 2.0, sideSign > 0 ? -d / 2 - .08 : d / 2 + .08);
        if (sideSign > 0) win.rotation.y = Math.PI;
        g.add(win);
      }
      g.position.copy(s.point).addScaledVector(s.side, sideSign * dist);
      g.position.y -= .20;
      g.rotation.y = Math.atan2(s.tangent.x, s.tangent.z);
      this.scene.add(g);
    }

    for (let i = 0; i < 20; i++) this.addStreetLight(.01 + i * .011, i % 2 ? 1 : -1);
  }

  addStreetLight(t, side) {
    const s = this.getSample(t); const group = new THREE.Group();
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x31383d, roughness: .55, metalness: .25 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.07, .11, 4.3, 8), poleMat); pole.position.y = 2.15; group.add(pole);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(.08, .08, 1.15), poleMat); arm.position.set(0, 4.2, .48); group.add(arm);
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(.35, .18, .55), new THREE.MeshBasicMaterial({ color: 0xffe6a8, toneMapped: false })); lamp.position.set(0, 4.08, 1.02); group.add(lamp);
    group.position.copy(s.point).addScaledVector(s.side, side * 8.2);
    group.rotation.y = Math.atan2(s.tangent.x, s.tangent.z) + (side > 0 ? Math.PI : 0);
    this.scene.add(group);
  }

  createField() {
    this.createDetailedTrees(.26, .48, 44, 10, 38, false);
    const grassGeo = new THREE.PlaneGeometry(.42, 1.15);
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x7f9c50, roughness: 1, side: THREE.DoubleSide, alphaTest: .1 });
    const count = 850; const inst = new THREE.InstancedMesh(grassGeo, grassMat, count); const d = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const t = .245 + Math.random() * .255; const s = this.getSample(t); const side = Math.random() < .5 ? -1 : 1;
      d.position.copy(s.point).addScaledVector(s.side, side * (7 + Math.random() * 50)); d.position.y += .45;
      d.rotation.y = Math.random() * Math.PI; const sc = .65 + Math.random() * .9; d.scale.set(sc, sc, sc); d.updateMatrix(); inst.setMatrixAt(i, d.matrix);
    }
    this.scene.add(inst);
  }

  createRiver() {
    const s = this.getSample(.40);
    const water = new THREE.Mesh(new THREE.PlaneGeometry(118, 27), new THREE.MeshStandardMaterial({ color: 0x3b87aa, roughness: .22, metalness: .12, transparent: true, opacity: .88 }));
    water.rotation.x = -Math.PI / 2; water.rotation.z = -Math.atan2(s.tangent.x, s.tangent.z); water.position.copy(s.point); water.position.y -= .18; this.scene.add(water);
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(this.roadHalfWidth * 2 + 1, .45, 28), new THREE.MeshStandardMaterial({ map: this.textures.asphalt, color: 0x686864, roughness: .86 }));
    bridge.position.copy(s.point); bridge.position.y += .02; bridge.rotation.y = Math.atan2(s.tangent.x, s.tangent.z); bridge.receiveShadow = true; this.scene.add(bridge);
  }

  createMountain() {
    this.createInstancedRocks(.51, .77, 125);
    this.createDetailedTrees(.54, .75, 34, 12, 45, true);
  }

  createInstancedRocks(start, end, count) {
    const geo = new THREE.DodecahedronGeometry(1, 0);
    const mat = new THREE.MeshStandardMaterial({ map: this.textures.rock, color: 0x847b72, roughness: 1 });
    const inst = new THREE.InstancedMesh(geo, mat, count); const d = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const t = start + Math.random() * (end - start); const s = this.getSample(t); const side = Math.random() < .5 ? -1 : 1;
      d.position.copy(s.point).addScaledVector(s.side, side * (9 + Math.random() * 58)); d.position.y += Math.random() * 4;
      d.rotation.set(Math.random(), Math.random() * Math.PI, Math.random()); const sc = 1 + Math.random() * 4; d.scale.set(sc, sc * (.65 + Math.random()), sc); d.updateMatrix(); inst.setMatrixAt(i, d.matrix);
    }
    inst.castShadow = true; inst.receiveShadow = true; this.scene.add(inst);
  }

  createDetailedTrees(start, end, count, minDistance, maxDistance, conifer) {
    const barkMat = new THREE.MeshStandardMaterial({ map: this.textures.bark, color: 0x70503a, roughness: 1 });
    const leafMat = new THREE.MeshStandardMaterial({ map: this.textures.leaf, color: conifer ? 0x31523a : 0x447347, roughness: 1 });
    const trunkGeo = new THREE.CylinderGeometry(.22, .34, 3.4, 8);
    const branchGeo = new THREE.CylinderGeometry(.07, .11, 2.0, 6);
    const crownGeo = conifer ? new THREE.ConeGeometry(1.65, 4.5, 9) : new THREE.IcosahedronGeometry(1.45, 1);

    for (let i = 0; i < count; i++) {
      const t = start + Math.random() * (end - start); const s = this.getSample(t); const side = Math.random() < .5 ? -1 : 1;
      const sc = .75 + Math.random() * .75; const tree = new THREE.Group();
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
      tree.position.copy(s.point).addScaledVector(s.side, side * (minDistance + Math.random() * (maxDistance - minDistance)));
      tree.position.y -= .2; tree.rotation.y = Math.random() * Math.PI * 2; this.scene.add(tree);
    }
  }

  createCampground() {
    this.createDetailedTrees(.77, .98, 38, 12, 48, true);
    for (let i = 0; i < 7; i++) {
      const t = .80 + i * .026; const s = this.getSample(t); const side = i % 2 ? 1 : -1;
      this.createTent(s.point.clone().addScaledVector(s.side, side * (15 + (i % 3) * 5)), (i * 1.3) % 6.28);
    }
    const fireS = this.getSample(.94); this.createCampfire(fireS.point.clone().addScaledVector(fireS.side, 17));
  }

  createTent(position, rotation) {
    const group = new THREE.Group();
    const tent = new THREE.Mesh(new THREE.ConeGeometry(3.2, 3.5, 4), new THREE.MeshStandardMaterial({ color: 0xc87c3e, roughness: .95, side: THREE.DoubleSide }));
    tent.rotation.y = Math.PI / 4; tent.position.y = 1.7; tent.castShadow = true; group.add(tent);
    const entrance = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.5), new THREE.MeshStandardMaterial({ color: 0x35241d, roughness: 1, side: THREE.DoubleSide }));
    entrance.position.set(0, 1.1, 2.29); group.add(entrance);
    group.position.copy(position); group.rotation.y = rotation; this.scene.add(group);
  }

  createCampfire(position) {
    const group = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(.18, .18, 2.2, 7), new THREE.MeshStandardMaterial({ map: this.textures.bark, color: 0x4a2d1e }));
      log.rotation.z = Math.PI / 2; log.rotation.y = i * Math.PI / 2.5; log.position.y = .15; group.add(log);
    }
    const flame = new THREE.Mesh(new THREE.ConeGeometry(.55, 1.8, 8), new THREE.MeshBasicMaterial({ color: 0xff8a24, toneMapped: false })); flame.position.y = 1.1; group.add(flame);
    const light = new THREE.PointLight(0xff8a35, 7, 24, 2); light.position.y = 2; group.add(light);
    group.position.copy(position); this.scene.add(group);
  }

  createStars() {
    const count = 600;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 300 + Math.random() * 280;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * .46;
      positions[i * 3] = Math.cos(theta) * Math.sin(phi) * r;
      positions[i * 3 + 1] = Math.cos(phi) * r + 40;
      positions[i * 3 + 2] = 780 + Math.sin(theta) * Math.sin(phi) * r;
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.25, transparent: true, opacity: 0, depthWrite: false, sizeAttenuation: true });
    this.stars = new THREE.Points(geo, mat); this.stars.frustumCulled = false; this.scene.add(this.stars);
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
