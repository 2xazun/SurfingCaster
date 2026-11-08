function updateWave(waveHeight) {
  const wave = document.querySelector(".wave");
  const svgDoc = wave.contentDocument;
  const svgElement = svgDoc.querySelector("svg");

  if (waveHeight <= 0.5) {
    wave.style.height = "100px";
    svgElement.style.setProperty("--wave-color-1", "#A9E3D5");
    svgElement.style.setProperty("--wave-color-2", "#AEE7D7");
    svgElement.style.setProperty("--wave-color-3", "#A4DBCC");

    svgElement.style.setProperty("--wave-dur-1", "12s");
    svgElement.style.setProperty("--wave-dur-2", "10s");
    svgElement.style.setProperty("--wave-dur-3", "8s");
  } else if (waveHeight < 2.0) {
    wave.style.height = "150px";
    svgElement.style.setProperty("--wave-color-1", "#9DD8E5");
    svgElement.style.setProperty("--wave-color-2", "#ABD9E4");
    svgElement.style.setProperty("--wave-color-3", "#91CEDC");

    svgElement.style.setProperty("--wave-dur-1", "8s");
    svgElement.style.setProperty("--wave-dur-2", "6s");
    svgElement.style.setProperty("--wave-dur-3", "4s");
  } else {
    wave.style.height = "200px";
    svgElement.style.setProperty("--wave-color-1", "#E59D9D");
    svgElement.style.setProperty("--wave-color-2", "#C99292");
    svgElement.style.setProperty("--wave-color-3", "#CC6A6A");

    svgElement.style.setProperty("--wave-dur-1", "4s");
    svgElement.style.setProperty("--wave-dur-2", "2s");
    svgElement.style.setProperty("--wave-dur-3", "1s");
  }
}
