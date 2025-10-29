function gambar_titik(imageDataA, x, y, r, g, b) {
  var xi = Math.round(x);
  var yi = Math.round(y);

  if (xi < 0 || yi < 0 || xi >= cnv.width || yi >= cnv.height) return;
  var index = 4 * (xi + yi * cnv.width);
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

function bar(imageDataA, x1, y1, x2, y2, r, g, b) {
  for (var i = 0; i < 13; i++) {
    dda_line(imageDataA, x1 + i, y1, x2 + i, y2, r, g, b);
  }
}

function bar_flood(imageDataA, canvas, x1, y1, x2, y2, r, g, b, fillColor) {
  dda_line(imageDataA, x1, y1, x1, y2, r, g, b);
  dda_line(imageDataA, x1, y2, x2, y2, r, g, b);
  dda_line(imageDataA, x2, y2, x2, y1, r, g, b);
  dda_line(imageDataA, x2, y1, x1, y1, r, g, b);

  var fillX = Math.floor((x1 + x2) / 2);
  var fillY = Math.floor((y1 + y2) / 2);

  if (fillX < 0 || fillY < 0 || fillX >= canvas.width || fillY >= canvas.height) return;

  var idx = 4 * (fillX + fillY * canvas.width);
  var toFlood = {
    r: imageDataA.data[idx],
    g: imageDataA.data[idx + 1],
    b: imageDataA.data[idx + 2],
    a: imageDataA.data[idx + 3] !== undefined ? imageDataA.data[idx + 3] : 255
  };

  if (
    toFlood.r === fillColor.r &&
    toFlood.g === fillColor.g &&
    toFlood.b === fillColor.b &&
    toFlood.a === (fillColor.a !== undefined ? fillColor.a : 255)
  ) {
    return;
  }

  floodFillStack(imageDataA, canvas, fillX, fillY, toFlood, fillColor);
}

function draw_bar(canvas, ctx, data) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let imageDataA = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var i = 0;
  var barWidth = 15;
  var spacing = 0;
  var totalWidth = data.length * (barWidth + spacing);
  var startX = (canvas.width - totalWidth) / 2;

  var labelMargin = 14;
  var topPadding = 6;
  var maxUsable = Math.max(0, canvas.height / 2 - (labelMargin + topPadding));
  var maxValue = 0;
  for (var k = 0; k < data.length; k++) {
    var v = Number(data[k]) || 0;
    if (v > maxValue) {
      maxValue = v;
    }
  }
  var scale;
  if (maxValue > 0) {
    scale = maxUsable / maxValue;
  } else {
    scale = 1;
  }

  function animate() {
    if (i < data.length) {
      var rawValue = Number(data[i]) || 0;
      var y = rawValue * scale;
      var x = startX + i * (barWidth + spacing);

      bar_flood(
        imageDataA,
        canvas,
        Math.floor(x),
        Math.floor(canvas.height / 2 - y),
        Math.floor(x + barWidth),
        Math.floor(canvas.height / 2),
        0, 0, 0,
        { r: 173, g: 216, b: 230 }
      );

      ctx.putImageData(imageDataA, 0, 0);

      ctx.fillStyle = "black";
      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (var j = 0; j <= i; j++) {
        var value = data[j];
        var labelX = startX + j * (barWidth + spacing) + barWidth / 2;
        var labelY = canvas.height / 2 + 10;
        ctx.fillText(String(value), labelX, labelY);
      }

      i++;
      setTimeout(() => requestAnimationFrame(animate), 100);
    }
  }
  imageDataA = ctx.getImageData(0, 0, canvas.width, canvas.height);
  animate();
}

function lingkaran(imageDataA, xc, yc, radius, r, g, b) {
  for (var x = xc - radius; x < xc + radius; x++) {
    var y = yc + Math.sqrt(Math.pow(radius, 2) - Math.pow(x - xc, 2));
    gambar_titik(imageDataA, x, y, r, g, b);
    var y = yc - Math.sqrt(Math.pow(radius, 2) - Math.pow(x - xc, 2));
    gambar_titik(imageDataA, x, y, r, g, b);
  }
  for (var x = xc - radius; x < xc + radius; x++) {
    var y = yc + Math.sqrt(Math.pow(radius, 2) - Math.pow(x - xc, 2));
    gambar_titik(imageDataA, y, x, r, g, b);
    var y = yc - Math.sqrt(Math.pow(radius, 2) - Math.pow(x - xc, 2));
    gambar_titik(imageDataA, y, x, r, g, b);
  }
}

function lingkaran_polar(imageDataA, xc, yc, radius, r, g, b) {
  for (var theta = 0; theta < Math.PI * 2; theta += 0.001) {
    x = xc + radius * Math.cos(theta);
    y = yc + radius * Math.sin(theta);
    gambar_titik(imageDataA, x, y, r, g, b);
  }
}

function elips(imageDataA, xc, yc, radiusX, radiusY, r, g, b) {
  for (var theta = 0; theta < Math.PI * 2; theta += 0.001) {
    x = xc + radiusX * Math.cos(theta);
    y = yc + radiusY * Math.sin(theta);
    gambar_titik(imageDataA, x, y, r, g, b);
  }
}

function bunga(imageDataA, xc, yc, radius, n, r, g, b) {
  for (var theta = 0; theta < Math.PI * 2; theta += 0.001) {
    x = xc + radius * Math.cos(theta * n) * Math.cos(theta);
    y = yc + radius * Math.cos(theta * n) * Math.sin(theta);
    gambar_titik(imageDataA, x, y, r, g, b);
  }
}

function floodFillNaive(imageDataA, canvas, x, y, toFlood, color) {
  var index = 4 * (x + y * canvas.width);
  var r1 = imageDataA.data[index];
  var g1 = imageDataA.data[index + 1];
  var b1 = imageDataA.data[index + 2];

  if (r1 == toFlood.r && g1 == toFlood.g && b1 == toFlood.b) {
    imageDataA.data[index] = color.r; //R
    imageDataA.data[index + 1] = color.g; //G
    imageDataA.data[index + 2] = color.b; //B
    imageDataA.data[index + 3] = 255; //A

    floodFillNaive(imageDataA, canvas, x + 1, y, toFlood, color);
    floodFillNaive(imageDataA, canvas, x, y + 1, toFlood, color);
    floodFillNaive(imageDataA, canvas, x - 1, y, toFlood, color);
    floodFillNaive(imageDataA, canvas, x, y - 1, toFlood, color);
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

    if (
      r1 === toFlood.r &&
      g1 === toFlood.g &&
      b1 === toFlood.b &&
      (a1 === undefined ? 255 : a1) === (toFlood.a !== undefined ? toFlood.a : 255)
    ) {
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

function polygon(imageDataA, point_array, r, g, b) {
  for (var i = 0; i < point_array.length - 1; i++) {
    var x1 = point_array[i].x;
    var y1 = point_array[i].y;
    var x2 = point_array[i + 1].x;
    var y2 = point_array[i + 1].y;

    dda_line(imageDataA, x1, y1, x2, y2, r, g, b);
  }

  var xAkhir = point_array[point_array.length - 1].x;
  var yAkhir = point_array[point_array.length - 1].y;
  var xAwal = point_array[0].x;
  var yAwal = point_array[0].y;

  dda_line(imageDataA, xAkhir, yAkhir, xAwal, yAwal, r, g, b);
}
