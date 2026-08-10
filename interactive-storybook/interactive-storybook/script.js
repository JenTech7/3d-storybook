/* =========================================================
   THE GIRL BEYOND THE WINDOW — book engine
   Three.js powered 3D storybook.
   Sections:
     1. Theme tokens & helpers
     2. Content model (faces / leaves) built from STORY
     3. Canvas texture rendering per page type
     4. Three.js scene + book geometry
     5. Page-turn animation (hinge rotation + CPU curl)
     6. Input: pointer, drag, swipe, keyboard
     7. UI: progress, TOC, bookmark, settings panels
     8. Persistence (localStorage) + PWA registration
   ========================================================= */

(function () {
  "use strict";

  /* ---------- 1. THEME TOKENS ---------- */
  const THEMES = {
    day: {
      paper: "#f6efe1", paperShadow: "#e8d9b8", ink: "#2b1d14",
      inkSoft: "#5a4636", gold: "#b98f4e", rule: "rgba(90,70,54,0.28)",
      quoteBg: "#efe3c6"
    },
    sepia: {
      paper: "#ecdcb8", paperShadow: "#dcc38f", ink: "#3a2a17",
      inkSoft: "#6b5432", gold: "#a97c3f", rule: "rgba(90,70,54,0.32)",
      quoteBg: "#e3cd9c"
    },
    night: {
      paper: "#241a1c", paperShadow: "#1a1214", ink: "#ecdfc8",
      inkSoft: "#b9a689", gold: "#c9a66b", rule: "rgba(236,223,200,0.18)",
      quoteBg: "#2c2022"
    }
  };

  const FONT_SIZES = { small: 26, medium: 29, large: 32 }; // base px @ texture scale

  /* ---------- 2. CONTENT MODEL ---------- */
  // Flatten STORY into a linear list of page "faces" (recto/verso order).
  function buildFaces() {
    const faces = [];
    faces.push({ kind: "toc" });
    STORY.chapters.forEach((ch, ci) => {
      ch.pages.forEach((p) => {
        const face = Object.assign({ chapterIndex: ci, chapter: ch }, p);
        if (p.type === "chapter") face.kind = "chapter";
        else if (p.type === "quote") face.kind = "quote";
        else if (p.type === "ending") face.kind = "ending";
        else face.kind = p.type; // text | split | illustration | spread
        faces.push(face);
      });
    });
    return faces;
  }

  const FACES = buildFaces();

  // Leaves: leaf 0 = the front cover itself. Leaves 1..N wrap the content faces.
  function buildLeaves(faces) {
    const leaves = [{ isCover: true, front: { kind: "cover-outside" }, back: { kind: "cover-inside" } }];
    for (let i = 0; i < faces.length; i += 2) {
      leaves.push({
        isCover: false,
        front: faces[i],
        back: faces[i + 1] || { kind: "blank" }
      });
    }
    return leaves;
  }

  const LEAVES = buildLeaves(FACES);
  const TOTAL_LEAVES = LEAVES.length;

  // Given a face's index in FACES, returns the flippedCount that reveals it
  // on the right-hand page (fronts show as-is; backs need one extra turn).
  function flipCountToRevealFaceOnRight(faceIndex) {
    const leafIdx = 1 + Math.floor(faceIndex / 2);
    const isFront = faceIndex % 2 === 0;
    return isFront ? leafIdx : leafIdx + 1;
  }

  /* ---------- 3. CANVAS TEXTURE RENDERING ---------- */
  const TEX_W = 1024, TEX_H = 1462; // portrait page texture resolution
  const illusCache = new Map();

  function loadImage(src) {
    if (illusCache.has(src)) return illusCache.get(src);
    const p = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
    illusCache.set(src, p);
    return p;
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    let curY = y;
    const lines = [];
    for (let n = 0; n < words.length; n++) {
      const test = line + words[n] + " ";
      if (ctx.measureText(test).width > maxWidth && line !== "") {
        lines.push(line.trim());
        line = words[n] + " ";
      } else {
        line = test;
      }
    }
    lines.push(line.trim());
    lines.forEach((l, i) => ctx.fillText(l, x, curY + i * lineHeight));
    return lines.length * lineHeight;
  }

  function paintPaperBackground(ctx, theme, side) {
    const t = THEMES[theme];
    ctx.fillStyle = t.paper;
    ctx.fillRect(0, 0, TEX_W, TEX_H);
    // subtle vignette toward spine for depth
    const grad = ctx.createLinearGradient(side === "left" ? TEX_W : 0, 0, side === "left" ? 0 : TEX_W, 0);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.05)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, TEX_W, TEX_H);
    // grain
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? "#000" : "#fff";
      ctx.fillRect(Math.random() * TEX_W, Math.random() * TEX_H, 1.4, 1.4);
    }
    ctx.globalAlpha = 1;
  }

  function drawPageNumber(ctx, theme, num, side) {
    if (!num) return;
    const t = THEMES[theme];
    ctx.fillStyle = t.inkSoft;
    ctx.font = "26px 'Cormorant SC', serif";
    ctx.textAlign = side === "left" ? "left" : "right";
    ctx.fillText(String(num), side === "left" ? 70 : TEX_W - 70, TEX_H - 56);
  }

  async function drawIllustration(ctx, src, x, y, w, h) {
    const img = await loadImage(src);
    if (!img) return;
    ctx.save();
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  }

  async function renderFace(face, theme, fontSize, side, pageNum) {
    const canvas = document.createElement("canvas");
    canvas.width = TEX_W; canvas.height = TEX_H;
    const ctx = canvas.getContext("2d");
    const t = THEMES[theme];
    const baseFs = FONT_SIZES[fontSize];
    paintPaperBackground(ctx, theme, side);

    const marginX = 96;

    switch (face.kind) {
      case "cover-outside": {
        const img = await loadImage("assets/cover/cover-art.svg");
        if (img) ctx.drawImage(img, 0, 0, TEX_W, TEX_H);
        ctx.fillStyle = "rgba(20,13,10,0.28)";
        ctx.fillRect(0, 0, TEX_W, TEX_H);
        ctx.textAlign = "center";
        ctx.fillStyle = "#f3e6c8";
        ctx.font = "600 74px 'Cormorant Garamond', serif";
        ctx.fillText("THE GIRL", TEX_W / 2, 230);
        ctx.fillText("BEYOND THE WINDOW", TEX_W / 2, 320);
        ctx.font = "italic 30px 'EB Garamond', serif";
        wrapText(ctx, STORY.subtitle, TEX_W / 2, 420, 640, 40);
        ctx.textAlign = "center";
        ctx.font = "26px 'Cormorant SC', serif";
        ctx.fillStyle = "#e8d5a8";
        ctx.fillText("by " + STORY.author.toUpperCase(), TEX_W / 2, TEX_H - 90);
        break;
      }
      case "cover-inside": {
        ctx.textAlign = "center";
        ctx.fillStyle = t.inkSoft;
        ctx.font = "italic 30px 'Cormorant Garamond', serif";
        wrapText(ctx, "For everyone still standing at their own window,", TEX_W / 2, TEX_H / 2 - 40, 680, 44);
        wrapText(ctx, "wondering whether to open it.", TEX_W / 2, TEX_H / 2 + 30, 680, 44);
        break;
      }
      case "blank": {
        break;
      }
      case "toc": {
        ctx.textAlign = "left";
        ctx.fillStyle = t.ink;
        ctx.font = "600 54px 'Cormorant SC', serif";
        ctx.fillText("Contents", marginX, 210);
        ctx.strokeStyle = t.rule; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(marginX, 240); ctx.lineTo(TEX_W - marginX, 240); ctx.stroke();
        ctx.font = "38px 'Cormorant Garamond', serif";
        STORY.chapters.forEach((ch, i) => {
          const y = 330 + i * 118;
          ctx.fillStyle = t.gold;
          ctx.font = "28px 'Cormorant SC', serif";
          ctx.fillText(ch.roman, marginX, y);
          ctx.fillStyle = t.ink;
          ctx.font = "38px 'Cormorant Garamond', serif";
          ctx.fillText(ch.title, marginX + 80, y);
          ctx.strokeStyle = t.rule;
          ctx.beginPath(); ctx.moveTo(marginX, y + 24); ctx.lineTo(TEX_W - marginX, y + 24); ctx.stroke();
        });
        drawPageNumber(ctx, theme, pageNum, side);
        break;
      }
      case "chapter": {
        ctx.textAlign = "center";
        ctx.fillStyle = t.gold;
        ctx.font = "40px 'Cormorant SC', serif";
        ctx.fillText("Chapter " + face.chapter.roman, TEX_W / 2, TEX_H / 2 - 90);
        ctx.fillStyle = t.ink;
        ctx.font = "600 72px 'Cormorant Garamond', serif";
        ctx.fillText(face.chapter.title, TEX_W / 2, TEX_H / 2 + 10);
        ctx.strokeStyle = t.rule; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(TEX_W / 2 - 90, TEX_H / 2 + 60); ctx.lineTo(TEX_W / 2 + 90, TEX_H / 2 + 60);
        ctx.stroke();
        break;
      }
      case "text": {
        let y = 200;
        if (face.heading) {
          ctx.textAlign = "left";
          ctx.fillStyle = t.gold;
          ctx.font = "40px 'Cormorant SC', serif";
          ctx.fillText(face.heading, marginX, y);
          y += 70;
        } else { y = 150; }
        ctx.textAlign = "left";
        ctx.fillStyle = t.ink;
        ctx.font = `${baseFs}px 'EB Garamond', serif`;
        const lh = baseFs * 1.5;
        const maxW = TEX_W - marginX * 2;
        (face.paragraphs || []).forEach((p) => {
          y += wrapText(ctx, p, marginX, y, maxW, lh) + lh * 0.6;
        });
        drawPageNumber(ctx, theme, pageNum, side);
        break;
      }
      case "split": {
        ctx.textAlign = "left";
        ctx.fillStyle = t.gold;
        ctx.font = "36px 'Cormorant SC', serif";
        if (face.heading) ctx.fillText(face.heading, marginX, 130);
        await drawIllustration(ctx, face.illustration, marginX, 170, TEX_W - marginX * 2, 460);
        if (face.caption) {
          ctx.font = "italic 24px 'EB Garamond', serif";
          ctx.fillStyle = t.inkSoft;
          ctx.fillText(face.caption, marginX, 670);
        }
        let y = 730;
        ctx.font = `${baseFs - 2}px 'EB Garamond', serif`;
        ctx.fillStyle = t.ink;
        const lh = (baseFs - 2) * 1.48;
        (face.paragraphs || []).forEach((p) => {
          y += wrapText(ctx, p, marginX, y, TEX_W - marginX * 2, lh) + lh * 0.55;
        });
        drawPageNumber(ctx, theme, pageNum, side);
        break;
      }
      case "illustration": {
        await drawIllustration(ctx, face.illustration, 40, 60, TEX_W - 80, TEX_H - 220);
        if (face.caption) {
          ctx.textAlign = "center";
          ctx.font = "italic 26px 'EB Garamond', serif";
          ctx.fillStyle = t.inkSoft;
          ctx.fillText(face.caption, TEX_W / 2, TEX_H - 110);
        }
        drawPageNumber(ctx, theme, pageNum, side);
        break;
      }
      case "spread": {
        await drawIllustration(ctx, face.illustration, 0, 0, TEX_W, TEX_H);
        ctx.fillStyle = "rgba(0,0,0,0.08)";
        ctx.fillRect(0, 0, TEX_W, TEX_H);
        if (face.caption) {
          ctx.textAlign = side === "left" ? "left" : "right";
          ctx.font = "italic 26px 'EB Garamond', serif";
          ctx.fillStyle = "#f3e6c8";
          ctx.fillText(face.caption, side === "left" ? marginX : TEX_W - marginX, TEX_H - 80);
        }
        break;
      }
      case "quote": {
        ctx.fillStyle = t.quoteBg;
        ctx.fillRect(60, 60, TEX_W - 120, TEX_H - 120);
        ctx.strokeStyle = t.gold; ctx.lineWidth = 1;
        ctx.strokeRect(84, 84, TEX_W - 168, TEX_H - 168);
        ctx.textAlign = "center";
        ctx.fillStyle = t.gold;
        ctx.font = "26px 'Cormorant SC', serif";
        ctx.fillText("A THOUGHT TO KEEP", TEX_W / 2, 300);
        ctx.strokeStyle = t.rule;
        ctx.beginPath(); ctx.moveTo(TEX_W / 2 - 60, 330); ctx.lineTo(TEX_W / 2 + 60, 330); ctx.stroke();
        ctx.fillStyle = t.ink;
        ctx.font = "italic 44px 'Cormorant Garamond', serif";
        const qy = 620;
        wrapText(ctx, "\u201C" + face.chapter.quote + "\u201D", TEX_W / 2, qy, TEX_W - 260, 62);
        ctx.font = "24px 'Cormorant SC', serif";
        ctx.fillStyle = t.inkSoft;
        ctx.fillText("Chapter " + face.chapter.roman, TEX_W / 2, TEX_H - 130);
        break;
      }
      case "ending": {
        ctx.textAlign = "center";
        ctx.fillStyle = t.gold;
        ctx.font = "36px 'Cormorant SC', serif";
        ctx.fillText("THE END", TEX_W / 2, 220);
        ctx.textAlign = "left";
        ctx.fillStyle = t.ink;
        ctx.font = `italic ${baseFs}px 'Cormorant Garamond', serif`;
        let y = 380;
        const lh = baseFs * 1.6;
        (face.paragraphs || []).forEach((p) => {
          y += wrapText(ctx, p, marginX, y, TEX_W - marginX * 2, lh) + lh * 0.6;
        });
        break;
      }
      case "the-end": {
        ctx.textAlign = "center";
        ctx.fillStyle = t.gold;
        ctx.font = "56px 'Cormorant SC', serif";
        ctx.fillText("THE END", TEX_W / 2, TEX_H / 2 - 120);
        ctx.fillStyle = t.ink;
        ctx.font = "italic 32px 'Cormorant Garamond', serif";
        wrapText(ctx, "\u201C" + STORY.backCoverReflection + "\u201D", TEX_W / 2, TEX_H / 2, TEX_W - 260, 48);
        break;
      }
      default:
        break;
    }
    return canvas;
  }

  /* ---------- 4. THREE.JS SCENE ---------- */
  const canvasEl = document.getElementById("book-canvas");
  let renderer, scene, camera;
  let bookGroup, spineMesh, leftPage, rightPage, coverMesh, leftStack, rightStack;
  let turnGroup, turnFront, turnBack, turnGeo, turnGeoOrig;

  const PAGE_W = 2.55, PAGE_H = 3.62, SPINE_W = 0.34, STACK_MAX = 0.46;
  const SEG_X = 14;

  function makePageGeometry() {
    const geo = new THREE.PlaneGeometry(PAGE_W, PAGE_H, SEG_X, 1);
    geo.translate(PAGE_W / 2, 0, 0); // pivot at spine (x = 0)
    return geo;
  }

  function makeCanvasTexture(canvas) {
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 1;
    return tex;
  }

  function initThree() {
    renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.35, 8.6);
    camera.lookAt(0, 0, 0);

    const hemi = new THREE.HemisphereLight(0xfbe9c8, 0x1a120c, 0.65);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffe9c2, 0.9);
    key.position.set(2.4, 3.2, 4.2);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xd9c3ff, 0.18);
    fill.position.set(-3, 1.5, -2);
    scene.add(fill);
    const rim = new THREE.PointLight(0xf3c96a, 0.5, 20);
    rim.position.set(0, 1.5, 3);
    scene.add(rim);

    bookGroup = new THREE.Group();
    bookGroup.position.set(-(PAGE_W + SPINE_W / 2) / 2, 0, 0); // closed-book centering
    scene.add(bookGroup);

    // spine (always visible, decorative)
    const spineGeo = new THREE.BoxGeometry(SPINE_W, PAGE_H + 0.12, STACK_MAX + 0.1);
    const spineMat = new THREE.MeshStandardMaterial({ color: 0x241811, roughness: 0.75, metalness: 0.05 });
    spineMesh = new THREE.Mesh(spineGeo, spineMat);
    spineMesh.position.set(0, 0, 0);
    bookGroup.add(spineMesh);

    // page-block thickness (left = read pages, right = unread pages)
    const stackMat = new THREE.MeshStandardMaterial({ color: 0xefe3c6, roughness: 0.9 });
    leftStack = new THREE.Mesh(new THREE.BoxGeometry(PAGE_W, PAGE_H, 0.001), stackMat.clone());
    leftStack.position.set(-PAGE_W / 2, 0, -0.02);
    bookGroup.add(leftStack);
    rightStack = new THREE.Mesh(new THREE.BoxGeometry(PAGE_W, PAGE_H, STACK_MAX), stackMat.clone());
    rightStack.position.set(PAGE_W / 2, 0, -STACK_MAX / 2);
    bookGroup.add(rightStack);

    // static left/right pages
    const leftGeo = new THREE.PlaneGeometry(PAGE_W, PAGE_H);
    leftGeo.translate(-PAGE_W / 2, 0, 0);
    leftPage = new THREE.Mesh(leftGeo, new THREE.MeshStandardMaterial({ color: 0xf6efe1, roughness: 0.95 }));
    leftPage.position.z = 0.002;
    bookGroup.add(leftPage);

    const rightGeo = new THREE.PlaneGeometry(PAGE_W, PAGE_H);
    rightGeo.translate(PAGE_W / 2, 0, 0);
    rightPage = new THREE.Mesh(rightGeo, new THREE.MeshStandardMaterial({ color: 0xf6efe1, roughness: 0.95 }));
    rightPage.position.z = 0.002;
    bookGroup.add(rightPage);

    // the cover mesh (shown only when closed)
    const coverGeo = new THREE.PlaneGeometry(PAGE_W + 0.14, PAGE_H + 0.16);
    coverGeo.translate((PAGE_W + 0.14) / 2 - 0.07, 0, 0);
    coverMesh = new THREE.Mesh(coverGeo, new THREE.MeshStandardMaterial({ color: 0x3a2818, roughness: 0.55 }));
    coverMesh.position.z = 0.01;
    bookGroup.add(coverMesh);

    // the turning leaf (front + back), hinge at x=0
    turnGeo = makePageGeometry();
    turnGeoOrig = turnGeo.attributes.position.array.slice();
    const turnBackGeo = turnGeo.clone();
    // mirror UV.x on the back face so text reads correctly once flipped
    const uv = turnBackGeo.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
    turnBackGeo.attributes.uv.needsUpdate = true;

    turnGroup = new THREE.Group();
    const blankMat = () => new THREE.MeshStandardMaterial({ color: 0xf6efe1, roughness: 0.95, side: THREE.FrontSide });
    turnFront = new THREE.Mesh(turnGeo, blankMat());
    turnBack = new THREE.Mesh(turnBackGeo, blankMat());
    turnBack.material.side = THREE.BackSide;
    turnBack.position.z = -0.0015;
    turnGroup.add(turnFront, turnBack);
    turnGroup.visible = false;
    bookGroup.add(turnGroup);

    window.addEventListener("resize", onResize);
    onResize();
  }

  function onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    // widen field slightly on narrow / mobile screens so the book still fits
    camera.fov = w < 720 ? 40 : 32;
    camera.updateProjectionMatrix();
  }

  /* ---------- 5. PAGE TURN STATE + ANIMATION ---------- */
  const state = {
    opened: false,
    flippedCount: 0,           // 0 = closed
    animating: false,
    theme: "day",
    fontSize: "medium",
    motion: "full",
    bookmarkFlipCount: null,
    ambient: "none"
  };

  function totalContentPages() { return FACES.length; }

  function pageNumberForFaceIndex(i) { return i + 1; }

  // Determine content shown at a given flippedCount.
  function spreadContent(flipCount) {
    const leftLeaf = flipCount > 0 ? LEAVES[flipCount - 1] : null;
    const rightLeaf = flipCount < TOTAL_LEAVES ? LEAVES[flipCount] : null;
    return { leftLeaf, rightLeaf };
  }

  async function refreshStaticPages() {
    const { leftLeaf, rightLeaf } = spreadContent(state.flippedCount);

    if (state.flippedCount === 0) {
      coverMesh.visible = true;
      leftPage.visible = false;
      rightPage.visible = false;
      const canvas = await renderFace({ kind: "cover-outside" }, state.theme, state.fontSize, "right", null);
      if (coverMesh.material.map) coverMesh.material.map.dispose();
      coverMesh.material.map = makeCanvasTexture(canvas);
      coverMesh.material.needsUpdate = true;
    } else {
      coverMesh.visible = false;
      leftPage.visible = true;
      rightPage.visible = true;

      if (leftLeaf) {
        const face = leftLeaf.back;
        const num = leftLeaf.isCover ? null : facePageNumber(leftLeaf, "back");
        const canvas = await renderFace(face, state.theme, state.fontSize, "left", num);
        if (leftPage.material.map) leftPage.material.map.dispose();
        leftPage.material.map = makeCanvasTexture(canvas);
        leftPage.material.needsUpdate = true;
      }
      if (rightLeaf) {
        const face = rightLeaf.front;
        const num = rightLeaf.isCover ? null : facePageNumber(rightLeaf, "front");
        const canvas = await renderFace(face, state.theme, state.fontSize, "right", num);
        if (rightPage.material.map) rightPage.material.map.dispose();
        rightPage.material.map = makeCanvasTexture(canvas);
        rightPage.material.needsUpdate = true;
      } else {
        const canvas = await renderFace({ kind: "the-end" }, state.theme, state.fontSize, "right", null);
        if (rightPage.material.map) rightPage.material.map.dispose();
        rightPage.material.map = makeCanvasTexture(canvas);
        rightPage.material.needsUpdate = true;
      }
    }
    updateStackDepths();
    updateProgressUI();
  }

  function facePageNumber(leaf, part) {
    const face = leaf[part];
    const idx = FACES.indexOf(face);
    return idx >= 0 ? pageNumberForFaceIndex(idx) : null;
  }

  function updateStackDepths() {
    const ratio = Math.max(0, Math.min(1, state.flippedCount / TOTAL_LEAVES));
    const leftDepth = Math.max(0.001, ratio * STACK_MAX);
    const rightDepth = Math.max(0.001, (1 - ratio) * STACK_MAX);
    leftStack.geometry.dispose();
    leftStack.geometry = new THREE.BoxGeometry(PAGE_W, PAGE_H, leftDepth);
    leftStack.position.z = -leftDepth / 2;
    rightStack.geometry.dispose();
    rightStack.geometry = new THREE.BoxGeometry(PAGE_W, PAGE_H, rightDepth);
    rightStack.position.z = -rightDepth / 2;
  }

  function deformTurnGeometry(progress) {
    // progress: 0 (flat right) .. 1 (flat left). Adds a subtle curl at the midpoint.
    const pos = turnGeo.attributes.position;
    const orig = turnGeoOrig;
    const angle = progress * Math.PI;
    const curl = Math.sin(progress * Math.PI) * 0.24;
    for (let i = 0; i < pos.count; i++) {
      const ox = orig[i * 3];
      const oy = orig[i * 3 + 1];
      const u = ox / PAGE_W; // 0 at spine .. 1 at free edge
      const localAngle = angle; // rigid hinge (whole page turns together)
      const x = ox * Math.cos(localAngle);
      const baseZ = ox * Math.sin(localAngle);
      const bulge = Math.sin(u * Math.PI) * curl;
      pos.setXYZ(i, x, oy, baseZ + bulge);
    }
    pos.needsUpdate = true;
    turnGeo.computeVertexNormals();
    const backPos = turnBack.geometry.attributes.position;
    for (let i = 0; i < backPos.count; i++) backPos.setXYZ(i, pos.getX(i), pos.getY(i), pos.getZ(i) - 0.0015);
    backPos.needsUpdate = true;
    turnBack.geometry.computeVertexNormals();
  }

  function easeTurn(t) { return 1 - Math.pow(1 - t, 3); }

  async function animateTurn(direction /* 1 = forward, -1 = backward */, opts) {
    opts = opts || {};
    if (state.animating) return;
    if (direction > 0 && state.flippedCount >= TOTAL_LEAVES) return;
    if (direction < 0 && state.flippedCount <= 0) return;
    state.animating = true;

    const leafIndex = direction > 0 ? state.flippedCount : state.flippedCount - 1;
    const leaf = LEAVES[leafIndex];

    // Book convention: a leaf's "front" (recto) always belongs to a right-hand
    // page, its "back" (verso) always belongs to a left-hand page — regardless
    // of which direction it's currently being turned.
    const frontSide = "right";
    const backSide = "left";
    const frontNum = leaf.isCover ? null : facePageNumber(leaf, "front");
    const backNum = leaf.isCover ? null : facePageNumber(leaf, "back");

    const [frontCanvas, backCanvas] = await Promise.all([
      renderFace(leaf.front, state.theme, state.fontSize, frontSide, frontNum),
      renderFace(leaf.back, state.theme, state.fontSize, backSide, backNum)
    ]);

    if (turnFront.material.map) turnFront.material.map.dispose();
    if (turnBack.material.map) turnBack.material.map.dispose();
    turnFront.material.map = makeCanvasTexture(frontCanvas);
    turnBack.material.map = makeCanvasTexture(backCanvas);
    turnFront.material.needsUpdate = true;
    turnBack.material.needsUpdate = true;

    // hide statics for the page being replaced so there's no double-render
    if (direction > 0) rightPage.visible = false; else leftPage.visible = false;
    coverMesh.visible = false;
    turnGroup.visible = true;

    const duration = state.motion === "reduced" ? 1 : (opts.duration || 620);
    const startProgress = direction > 0 ? 0 : 1;
    const endProgress = direction > 0 ? 1 : 0;
    const startTime = performance.now();

    await new Promise((resolve) => {
      function frame(now) {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = easeTurn(t);
        const progress = startProgress + (endProgress - startProgress) * eased;
        deformTurnGeometry(progress);
        if (t < 1) requestAnimationFrame(frame); else resolve();
      }
      requestAnimationFrame(frame);
    });

    turnGroup.visible = false;
    state.flippedCount += direction;
    await refreshStaticPages();
    state.animating = false;
    announcePage();
  }

  async function openBook() {
    if (state.opened) return;
    state.opened = true;
    document.getElementById("cover-ui").classList.add("is-hidden");
    document.getElementById("control-bar").hidden = false;
    document.getElementById("reading-progress").hidden = false;

    // recenter the book for the open two-page spread
    const targetX = 0;
    const duration = state.motion === "reduced" ? 1 : 700;
    const startX = bookGroup.position.x;
    const startTime = performance.now();
    const camStart = camera.position.z;
    await new Promise((resolve) => {
      function frame(now) {
        const t = Math.min(1, (now - startTime) / duration);
        bookGroup.position.x = startX + (targetX - startX) * easeTurn(t);
        camera.position.z = camStart + (7.4 - camStart) * easeTurn(t);
        if (t < 1) requestAnimationFrame(frame); else resolve();
      }
      requestAnimationFrame(frame);
    });

    await animateTurn(1, { duration: state.motion === "reduced" ? 1 : 900 });
  }

  async function closeBook() {
    if (!state.opened) return;
    state.animating = false;
    state.flippedCount = 0;
    turnGroup.visible = false;
    leftPage.visible = false;
    rightPage.visible = false;
    await refreshStaticPages();

    const duration = state.motion === "reduced" ? 1 : 600;
    const startX = bookGroup.position.x;
    const targetX = -(PAGE_W + SPINE_W / 2) / 2;
    const startTime = performance.now();
    await new Promise((resolve) => {
      function frame(now) {
        const t = Math.min(1, (now - startTime) / duration);
        bookGroup.position.x = startX + (targetX - startX) * easeTurn(t);
        if (t < 1) requestAnimationFrame(frame); else resolve();
      }
      requestAnimationFrame(frame);
    });

    state.opened = false;
    document.getElementById("cover-ui").classList.remove("is-hidden");
    document.getElementById("control-bar").hidden = true;
    document.getElementById("reading-progress").hidden = true;
  }

  async function navigateToFlipCount(target) {
    target = Math.max(0, Math.min(TOTAL_LEAVES, target));
    while (state.flippedCount < target) await animateTurn(1, { duration: 260 });
    while (state.flippedCount > target) await animateTurn(-1, { duration: 260 });
  }

  /* ---------- 6. INPUT ---------- */
  function setupInput() {
    let dragStartX = null;
    canvasEl.addEventListener("pointerdown", (e) => { dragStartX = e.clientX; });
    canvasEl.addEventListener("pointerup", (e) => {
      if (dragStartX === null) return;
      const dx = e.clientX - dragStartX;
      dragStartX = null;
      if (!state.opened) return;
      if (Math.abs(dx) > 60) {
        if (dx < 0) animateTurn(1); else animateTurn(-1);
        return;
      }
      // simple click zones
      const half = window.innerWidth / 2;
      if (e.clientX > half) animateTurn(1); else if (state.flippedCount > 0) animateTurn(-1);
    });

    // mouse parallax (desktop only, subtle)
    window.addEventListener("pointermove", (e) => {
      if (window.innerWidth < 720) return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetParallax.x = nx * 0.18;
      targetParallax.y = -ny * 0.08;
    });

    document.addEventListener("keydown", (e) => {
      if (!state.opened) {
        if (e.key === "Enter" || e.key === " ") { openBook(); }
        return;
      }
      if (e.key === "ArrowRight") animateTurn(1);
      else if (e.key === "ArrowLeft") animateTurn(-1);
      else if (e.key === "Home") navigateToFlipCount(1);
      else if (e.key === "End") navigateToFlipCount(TOTAL_LEAVES);
      else if (e.key === "Escape") closeBook();
    });
  }

  const parallax = { x: 0, y: 0 };
  const targetParallax = { x: 0, y: 0 };

  function animateParallax() {
    parallax.x += (targetParallax.x - parallax.x) * 0.04;
    parallax.y += (targetParallax.y - parallax.y) * 0.04;
    camera.position.x = parallax.x * 0.6;
    camera.position.y = 0.35 + parallax.y * 0.4;
    camera.lookAt(bookGroup.position.x, 0, 0);
  }

  /* ---------- 7. UI: progress / TOC / bookmark / settings ---------- */
  function updateProgressUI() {
    const idx = Math.max(0, Math.min(FACES.length - 1, state.flippedCount - 1));
    const face = FACES[idx] || FACES[0];
    const chIdx = face && face.chapterIndex !== undefined ? face.chapterIndex : 0;
    const ch = STORY.chapters[chIdx];
    const pct = Math.round((state.flippedCount / TOTAL_LEAVES) * 100);
    document.getElementById("progress-chapter").textContent = ch ? ("Chapter " + ch.roman) : "Contents";
    document.getElementById("progress-percent").textContent = pct + "%";
    const bookmarkBtn = document.getElementById("btn-bookmark");
    bookmarkBtn.setAttribute("aria-pressed", String(state.bookmarkFlipCount === state.flippedCount));
  }

  function announcePage() {
    const idx = Math.max(0, Math.min(FACES.length - 1, state.flippedCount - 1));
    const face = FACES[idx];
    const sr = document.getElementById("sr-page-content");
    if (!face) { sr.textContent = "Cover"; return; }
    const bits = [];
    if (face.heading) bits.push(face.heading);
    if (face.paragraphs) bits.push(face.paragraphs.join(" "));
    sr.textContent = bits.join(". ") || (face.chapter ? face.chapter.title : "");
  }

  function buildTOC() {
    const list = document.getElementById("toc-list");
    list.innerHTML = "";
    STORY.chapters.forEach((ch, i) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.innerHTML = `<span class="toc-num">${ch.roman}</span><span>${ch.title}</span>`;
      btn.addEventListener("click", async () => {
        closePanel("toc-panel");
        if (!state.opened) await openBook();
        const faceIdx = FACES.findIndex(f => f.kind === "chapter" && f.chapterIndex === i);
        navigateToFlipCount(flipCountToRevealFaceOnRight(faceIdx));
      });
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  function openPanel(id) {
    document.getElementById(id).hidden = false;
    document.getElementById("panel-scrim").hidden = false;
  }
  function closePanel(id) {
    document.getElementById(id).hidden = true;
    document.getElementById("panel-scrim").hidden = true;
  }

  function setupPanels() {
    document.getElementById("btn-toc").addEventListener("click", () => {
      document.getElementById("btn-goto-bookmark").hidden = state.bookmarkFlipCount === null;
      openPanel("toc-panel");
    });
    document.getElementById("btn-settings").addEventListener("click", () => openPanel("settings-panel"));
    document.querySelectorAll("[data-close]").forEach(btn => {
      btn.addEventListener("click", () => closePanel(btn.getAttribute("data-close")));
    });
    document.getElementById("panel-scrim").addEventListener("click", () => {
      closePanel("toc-panel"); closePanel("settings-panel");
    });
    document.getElementById("btn-goto-bookmark").addEventListener("click", () => {
      closePanel("toc-panel");
      if (state.bookmarkFlipCount !== null) navigateToFlipCount(state.bookmarkFlipCount);
    });
  }

  function setupSettings() {
    document.querySelectorAll(".segmented").forEach((group) => {
      const key = group.getAttribute("data-setting");
      group.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => {
          group.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", "false"));
          btn.setAttribute("aria-pressed", "true");
          applySetting(key, btn.getAttribute("data-value"));
        });
      });
    });
  }

  function applySetting(key, value) {
    if (key === "fontSize") { state.fontSize = value; document.body.dataset.fontSize = value; refreshStaticPages(); }
    if (key === "theme") { state.theme = value; document.body.dataset.theme = value; refreshStaticPages(); }
    if (key === "motion") { state.motion = value; document.body.dataset.motion = value; }
    if (key === "ambient") { state.ambient = value; setAmbient(value); }
    saveSettings();
  }

  /* ---------- Ambient sound: simple generated tones, off by default ---------- */
  let audioCtx = null, ambientNodes = [];
  function stopAmbient() {
    ambientNodes.forEach(n => { try { n.stop && n.stop(); n.disconnect && n.disconnect(); } catch (e) {} });
    ambientNodes = [];
  }
  function setAmbient(kind) {
    stopAmbient();
    if (kind === "none") return;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer; noise.loop = true;
    const filter = audioCtx.createBiquadFilter();
    filter.type = kind === "rain" ? "highpass" : kind === "fireplace" ? "lowpass" : kind === "forest" ? "bandpass" : "lowpass";
    filter.frequency.value = kind === "rain" ? 1200 : kind === "fireplace" ? 400 : kind === "forest" ? 800 : 300;
    const gain = audioCtx.createGain();
    gain.gain.value = 0.05;
    noise.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
    noise.start();
    ambientNodes = [noise, filter, gain];
  }

  function setupBookmark() {
    document.getElementById("btn-bookmark").addEventListener("click", () => {
      if (!state.opened) return;
      state.bookmarkFlipCount = state.flippedCount;
      localStorage.setItem("storybook:bookmark", String(state.flippedCount));
      updateProgressUI();
    });
  }

  function saveSettings() {
    localStorage.setItem("storybook:settings", JSON.stringify({
      fontSize: state.fontSize, theme: state.theme, motion: state.motion, ambient: state.ambient
    }));
  }
  function loadSettings() {
    try {
      const raw = localStorage.getItem("storybook:settings");
      if (raw) {
        const s = JSON.parse(raw);
        Object.assign(state, s);
        document.body.dataset.fontSize = s.fontSize || "medium";
        document.body.dataset.theme = s.theme || "day";
        document.body.dataset.motion = s.motion || "full";
        document.querySelectorAll(".segmented").forEach((group) => {
          const key = group.getAttribute("data-setting");
          group.querySelectorAll("button").forEach((btn) => {
            btn.setAttribute("aria-pressed", String(btn.getAttribute("data-value") === s[key]));
          });
        });
      }
      const bm = localStorage.getItem("storybook:bookmark");
      if (bm !== null) state.bookmarkFlipCount = parseInt(bm, 10);
    } catch (e) { /* ignore */ }

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      state.motion = "reduced";
      document.body.dataset.motion = "reduced";
    }
  }

  function setupControlBar() {
    document.getElementById("btn-next").addEventListener("click", () => animateTurn(1));
    document.getElementById("btn-prev").addEventListener("click", () => animateTurn(-1));
    document.getElementById("btn-close").addEventListener("click", () => closeBook());
    document.getElementById("open-book-btn").addEventListener("click", () => openBook());
  }

  /* ---------- 8. BOOT ---------- */
  function renderLoop() {
    requestAnimationFrame(renderLoop);
    animateParallax();
    renderer.render(scene, camera);
  }

  async function boot() {
    loadSettings();
    if (!window.WebGLRenderingContext) {
      document.getElementById("scene-container").innerHTML =
        '<div class="no-webgl-msg">This browser does not support the WebGL graphics needed for the 3D storybook. Please try a modern desktop or mobile browser.</div>';
      document.getElementById("loading-screen").classList.add("is-hidden");
      return;
    }
    initThree();
    setupInput();
    setupPanels();
    setupSettings();
    setupBookmark();
    setupControlBar();
    buildTOC();
    await refreshStaticPages();
    renderLoop();

    document.getElementById("loading-screen").classList.add("is-hidden");

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("service-worker.js").catch(() => {});
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
