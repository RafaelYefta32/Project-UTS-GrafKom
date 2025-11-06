function gambar_titik(imageDataA, x, y, r, g, b) {
  var index;
  index = 4 * (Math.ceil(x) + Math.ceil(y) * cnv.width);
  imageDataA.data[index] = r; //R
  imageDataA.data[index + 1] = g; //G
  imageDataA.data[index + 2] = b; //B
  imageDataA.data[index + 3] = 255; //A
}

function dda_line(imageDataA, x1, y1, x2, y2, r, g, b) {
  var dx, dy;
  dx = x2 - x1;
  dy = y2 - y1;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (x1 > x2) {
      var y = y1;
      for (var x = x1; x > x2; x--) {
        y = y + dy / Math.abs(dx);
        gambar_titik(imageDataA, x, y, r, g, b);
      }
    } else {
      var y = y1;
      for (var x = x1; x < x2; x++) {
        y = y + dy / Math.abs(dx);
        gambar_titik(imageDataA, x, y, r, g, b);
      }
    }
  } else {
    if (y1 > y2) {
      var x = x1;
      for (var y = y1; y > y2; y--) {
        x = x + dx / Math.abs(dy);
        gambar_titik(imageDataA, x, y, r, g, b);
      }
    } else {
      var x = x1;
      for (var y = y1; y < y2; y++) {
        x = x + dx / Math.abs(dy);
        gambar_titik(imageDataA, x, y, r, g, b);
      }
    }
  }
}

function floodFillStack(imageDataA, canvas, x0, y0, toFlood, color) {
  var width = canvas.width;
  var height = canvas.height;

  if (x0 < 0 || y0 < 0 || x0 >= width || y0 >= height) return;

  var stackTumpukan = [];
  stackTumpukan.push({ x: x0, y: y0 });

  while (stackTumpukan.length > 0) {
    var titik_sekarang = stackTumpukan.pop();
    var x = titik_sekarang.x;
    var y = titik_sekarang.y;

    if (x < 0 || y < 0 || x >= width || y >= height) continue;

    var index_sekarang = 4 * (x + y * width);
    var r1 = imageDataA.data[index_sekarang];
    var g1 = imageDataA.data[index_sekarang + 1];
    var b1 = imageDataA.data[index_sekarang + 2];
    var a1 = imageDataA.data[index_sekarang + 3];

    if (r1 === toFlood.r && g1 === toFlood.g && b1 === toFlood.b && (a1 === undefined ? 255 : a1) === (toFlood.a !== undefined ? toFlood.a : 255)) {
      imageDataA.data[index_sekarang] = color.r; //R
      imageDataA.data[index_sekarang + 1] = color.g; //G
      imageDataA.data[index_sekarang + 2] = color.b; //B
      imageDataA.data[index_sekarang + 3] = color.a !== undefined ? color.a : 255; //A

      stackTumpukan.push({ x: x + 1, y: y });
      stackTumpukan.push({ x: x - 1, y: y });
      stackTumpukan.push({ x: x, y: y + 1 });
      stackTumpukan.push({ x: x, y: y - 1 });
    }
  }
}

function bar(imageDataA, p2, r, g, b) {
  dda_line(imageDataA, p2.x1, p2.y1, p2.x2, p2.y1, 0, 0, 0);
  dda_line(imageDataA, p2.x2, p2.y1, p2.x2, p2.y2, 0, 0, 0);
  dda_line(imageDataA, p2.x2, p2.y2, p2.x1, p2.y2, 0, 0, 0);
  dda_line(imageDataA, p2.x1, p2.y2, p2.x1, p2.y1, 0, 0, 0);
}

function drawBars(ctx, data, orangeIndices = new Set(), currentKey = -1, currentCompare = -1) {
  ctx.clearRect(0, 0, width, height);

  let imageDataA = ctx.getImageData(0, 0, width, height);

  const barWidth = 30; // lebar bar
  const spacing = 15; // jarak antar bar

  const totalWidth = data.length * barWidth + (data.length - 1) * spacing; // total lebar keseluruhan bar
  const availableWidth = width * 0.9; // maksimal lebar keseluruhan bar

  let scale = 1.0;
  if (totalWidth > availableWidth) {
    scale = availableWidth / totalWidth;
  }
  const s = { x: scale, y: 1.0 };

  const offsetY = height * 0.93; // batas y (tinggi)
  const titik_putar = { x: width / 2, y: offsetY };

  const startX = (width - totalWidth) / 2; // posisi awal bar (tengah canvas)
  const maxValue = Math.max(...data.filter((v) => v !== null), keyValue !== null ? keyValue : 0) > 0 ? Math.max(...data.filter((v) => v !== null), keyValue !== null ? keyValue : 0) : 1;
  const scaleHeight = (height * 0.4) / maxValue; // menskalakan tinggi bar

  let barNumber = [];

  for (let i = 0; i < data.length; i++) {
    const value = data[i];
    if (value === null) {
      continue;
    }

    const barHeight = value * scaleHeight;

    const x1_base = Math.floor(startX + i * (barWidth + spacing));
    const y1_base = Math.floor(offsetY - barHeight);
    const x2_base = Math.floor(x1_base + barWidth);
    const y2_base = Math.floor(offsetY);

    const currentHorizontal = horizontalShifts[i] || 0;
    const currentLift = liftAmounts[i] || 0;
    let m = createTranslation(currentHorizontal, currentLift);

    let p1_base = { x: x1_base, y: y1_base };
    let p2_base = { x: x2_base, y: y2_base };
    let text_base = { x: x1_base + barWidth / 2, y: offsetY + 15 };

    let p1_transform = transform_titik(p1_base, m);
    let p2_transform = transform_titik(p2_base, m);
    let text_transform = transform_titik(text_base, m);

    // menskalakan ukuran ketika lebar sudah mentok
    p1_transform = skalaFP(p1_transform, titik_putar, s);
    p2_transform = skalaFP(p2_transform, titik_putar, s);
    text_transform = skalaFP(text_transform, titik_putar, s);

    const x1 = Math.floor(p1_transform.x);
    const y1 = Math.floor(p1_transform.y);
    const x2 = Math.floor(p2_transform.x);
    const y2 = Math.floor(p2_transform.y);

    let color = colorData.blue;
    if (orangeIndices.has(i)) {
      color = colorData.orange;
    }
    if (i === currentCompare) {
      color = colorData.hijau;
    }

    // menggambar bar
    bar(imageDataA, { x1: x1, y1: y1, x2: x2, y2: y2 }, 0, 0, 0);

    const fillX = Math.floor((x1 + x2) / 2);
    const fillY = Math.floor((y1 + y2) / 2);

    // mewarnai bar
    const toFlood = { r: 0, g: 0, b: 0, a: 0 };
    if (fillX > x1 && fillX < x2 && fillY > y1 && fillY < y2) {
      floodFillStack(imageDataA, ctx.canvas, fillX, fillY, toFlood, color);
    }

    // menyimpan angka nilai bar
    barNumber.push({
      text: value,
      x: text_transform.x,
      y: text_transform.y,
    });
  }

  // menggambar bar merah (yag sedang di cek / diangka)
  if (keyValue !== null) {
    const barHeight = keyValue * scaleHeight;

    const x1_base = keyBaseX;
    const y1_base = Math.floor(offsetY - barHeight);
    const x2_base = Math.floor(x1_base + barWidth);
    const y2_base = Math.floor(offsetY);

    let m = createTranslation(keyShift, keyLift);

    let p1_base = { x: x1_base, y: y1_base };
    let p2_base = { x: x2_base, y: y2_base };
    let text_base = { x: x1_base + barWidth / 2, y: offsetY + 15 };

    let p1_transform = transform_titik(p1_base, m);
    let p2_transform = transform_titik(p2_base, m);
    let text_transform = transform_titik(text_base, m);

    p1_transform = skalaFP(p1_transform, titik_putar, s);
    p2_transform = skalaFP(p2_transform, titik_putar, s);
    text_transform = skalaFP(text_transform, titik_putar, s);

    const x1 = Math.floor(p1_transform.x);
    const y1 = Math.floor(p1_transform.y);
    const x2 = Math.floor(p2_transform.x);
    const y2 = Math.floor(p2_transform.y);

    let color = colorData.merah;

    bar(imageDataA, { x1: x1, y1: y1, x2: x2, y2: y2 }, 0, 0, 0);

    const fillX = Math.floor((x1 + x2) / 2);
    const fillY = Math.floor((y1 + y2) / 2);

    const toFlood = { r: 0, g: 0, b: 0, a: 0 };
    if (fillX > x1 && fillX < x2 && fillY > y1 && fillY < y2) {
      floodFillStack(imageDataA, ctx.canvas, fillX, fillY, toFlood, color);
    }

    barNumber.push({
      text: keyValue,
      x: text_transform.x,
      y: text_transform.y,
    });
  }

  ctx.putImageData(imageDataA, 0, 0);
  ctx.fillStyle = "#000";
  ctx.font = "14px Arial";
  ctx.textAlign = "center";

  // menampilkan angka nilai di bawah bar
  barNumber.forEach((numberInfo) => {
    ctx.fillText(numberInfo.text, numberInfo.x, numberInfo.y);
  });
}

// animasi utk naik turun bar
function animateLift(targets, targetLift, callback = null) {
  let animationStartTime = performance.now();
  const initialLifts = {};
  targets.forEach((index) => {
    initialLifts[index] = liftAmounts[index] || 0;
  });

  function animate() {
    const elapsed = performance.now() - animationStartTime;
    const progress = Math.min(elapsed / animationDuration, 1);
    const ease = progress * (2 - progress);

    targets.forEach((index) => {
      const start = initialLifts[index];
      liftAmounts[index] = start + (targetLift - start) * ease;
    });

    drawBars(ctx, arr_A, orangeIndices, -1, currentCompare);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      targets.forEach((index) => {
        liftAmounts[index] = targetLift;
        if (targetLift === 0) {
          delete liftAmounts[index];
        }
      });
      if (callback) {
        callback();
      }
    }
  }

  requestAnimationFrame(animate);
}

// animasi pergeseran horizontal bar
function animateHorizontal(targets, targetShift, callback = null) {
  let animationStartTime = performance.now();
  const initialShifts = {};
  targets.forEach((index) => {
    initialShifts[index] = horizontalShifts[index] || 0;
  });

  function animate() {
    const elapsed = performance.now() - animationStartTime;
    const progress = Math.min(elapsed / animationDuration, 1);
    const ease = progress * (2 - progress);

    targets.forEach((index) => {
      const start = initialShifts[index];
      horizontalShifts[index] = start + (targetShift - start) * ease;
    });

    drawBars(ctx, arr_A, orangeIndices, -1, currentCompare);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      targets.forEach((index) => {
        horizontalShifts[index] = targetShift;
        if (targetShift === 0) {
          delete horizontalShifts[index];
        }
      });
      if (callback) {
        callback();
      }
    }
  }

  requestAnimationFrame(animate);
}

// animasi utk naik turun bar merah
function animateKeyLift(targetLift, callback = null) {
  let animationStartTime = performance.now();
  const initialLift = keyLift;

  function animate() {
    const elapsed = performance.now() - animationStartTime;
    const progress = Math.min(elapsed / animationDuration, 1);
    const ease = progress * (2 - progress);

    keyLift = initialLift + (targetLift - initialLift) * ease;

    drawBars(ctx, arr_A, orangeIndices, -1, currentCompare);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      keyLift = targetLift;
      if (callback) {
        callback();
      }
    }
  }

  requestAnimationFrame(animate);
}

// animasi pergeseran horizontal bar merah
function animateKeyHorizontal(targetShift, callback = null) {
  let animationStartTime = performance.now();
  const initialShift = keyShift;

  function animate() {
    const elapsed = performance.now() - animationStartTime;
    const progress = Math.min(elapsed / animationDuration, 1);
    const ease = progress * (2 - progress);

    keyShift = initialShift + (targetShift - initialShift) * ease;

    drawBars(ctx, arr_A, orangeIndices, -1, currentCompare);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      keyShift = targetShift;
      if (callback) {
        callback();
      }
    }
  }

  requestAnimationFrame(animate);
}

// fungsi insertion sort per langkah utk visualisasi (tombol sort)
function insertionSortStep() {
  if (!isSorting || isPaused) {
    return;
  }

  sortHistory();
  updateProgressInfo();

  const barWidth = 30;
  const spacing = 15;
  const dx = barWidth + spacing;

  if (state === "chooseBar") {
    //  memilih bar merah (utk dicek)
    if (p >= N) {
      animateKeyLift(0, () => {
        animateLift(Object.keys(liftAmounts).map(Number), 0, () => {
          isSorting = false;
          isPaused = false;
          sortBtn.disabled = false;
          sortedBtn.disabled = false;
          playPauseBtn.disabled = true;
          stopBtn.disabled = true;
          prevBtn.disabled = true;
          nextBtn.disabled = true;
          playPauseBtn.textContent = "▶ Play";
          data = arr_A;
          liftAmounts = {};
          horizontalShifts = {};
          keyValue = null;
          updateProgressInfo();
          drawBars(ctx, data);
        });
      });
      return;
    }

    initialKeyPos = p;
    const totalWidth = N * barWidth + (N - 1) * spacing;
    const startX = (width - totalWidth) / 2;
    keyBaseX = startX + p * (barWidth + spacing);
    tem = arr_A[p];
    keyValue = tem;
    arr_A[p] = null;
    keyShift = 0;
    keyLift = 0;

    currentCompare = -1;

    const maxValue = Math.max(...arr_A.filter((v) => v !== null), keyValue) > 0 ? Math.max(...arr_A.filter((v) => v !== null), keyValue) : 1;
    const scaleHeight = (height * 0.4) / maxValue;
    const maxBarHeight = maxValue * scaleHeight;
    liftTarget = -(maxBarHeight + liftMargin);

    animateKeyLift(liftTarget, () => {
      setTimeout(insertionSortStep, pauseDuration);
    });

    i = p - 1;
    state = "compare";

    drawBars(ctx, arr_A, orangeIndices, -1, currentCompare);
    return;
  } else if (state === "compare") {
    // membandingkan bar merah dengan bar sebelumnya
    let conditionMet = false;

    if (i >= 0) {
      currentCompare = i;
      setTimeout(insertionSortStep, pauseDuration);
      conditionMet = currentDir === "asc" ? keyValue < arr_A[i] : keyValue > arr_A[i];
    } else {
      setTimeout(insertionSortStep, pauseDuration);
    }

    drawBars(ctx, arr_A, orangeIndices, -1, currentCompare);

    if (conditionMet) {
      state = "moveBar";
    } else {
      state = "insert";
    }
    return;
  } else if (state === "moveBar") {
    // menggeser bar horizontal jika nilai lebih kecil / lebih besar
    horizontalShifts[i] = horizontalShifts[i] || 0;

    animateHorizontal([i], dx, () => {
      arr_A[i + 1] = arr_A[i];
      arr_A[i] = null;
      horizontalShifts[i + 1] = 0;
      delete horizontalShifts[i];

      orangeIndices.add(i + 1);

      i = i - 1;
      currentCompare = -1;

      setTimeout(insertionSortStep, pauseDuration);
    });

    const newKeyShift = keyShift - dx;
    animateKeyHorizontal(newKeyShift);

    state = "compare";
    return;
  } else if (state === "insert") {
    // bar merah turun
    const targetPos = i + 1;
    const targetDx = (targetPos - initialKeyPos) * dx;

    animateKeyHorizontal(targetDx, () => {
      arr_A[targetPos] = keyValue;
      liftAmounts[targetPos] = keyLift;
      horizontalShifts[targetPos] = 0;
      orangeIndices.add(targetPos);
      if (i >= 0) {
        orangeIndices.add(i);
      }
      keyValue = null;
      keyShift = 0;
      keyLift = 0;

      animateLift([targetPos], 0, () => {
        delete liftAmounts[targetPos];
        delete horizontalShifts[targetPos];

        currentCompare = -1;

        p = p + 1;
        state = "chooseBar";

        setTimeout(insertionSortStep, pauseDuration);
      });
    });
    return;
  }
}

// fungsi insertion sort langsung tanpa animasi (tombol sorted)
function insertionSort(A, direction) {
  var N = A.length;
  for (var p = 1; p < N; p++) {
    var tem = A[p];
    var i = p - 1;

    if (direction === "asc") {
      while (i >= 0 && tem < A[i]) {
        A[i + 1] = A[i];
        i = i - 1;
      }
      A[i + 1] = tem;
    } else {
      while (i >= 0 && tem > A[i]) {
        A[i + 1] = A[i];
        i = i - 1;
      }
      A[i + 1] = tem;
    }
  }
  return A;
}
