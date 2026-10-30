// Scroll reveal
const els = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
} else {
  els.forEach(el => el.classList.add('in'));
}

// Active nav link on scroll
const links = document.querySelectorAll('.nav-links a');
const secs = [...links].map(a => document.querySelector(a.getAttribute('href')));
const onScroll = () => {
  const y = window.scrollY + 100;
  let idx = -1;
  secs.forEach((s, i) => { if (s && s.offsetTop <= y) idx = i; });
  links.forEach((a, i) => a.classList.toggle('active', i === idx));
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ================= Project detail modal =================
// `sections`: list of { heading, html } blocks.
// Images: reference files under projects/, e.g. <img class="screenshot" src="projects/foo.png" alt="..." />
const PROJECTS = {
  usb: {
    title: "USB CDC Serial Port on an STM32 (TinyUSB)",
    date: "Independent Project · STM32 · TinyUSB",
    overview:
      "Started as an infrared transmit/receive link on an STM32 — in the end I shipped it as a USB CDC virtual " +
      "COM port built on the TinyUSB stack, so a host talks to the chip over an ordinary serial/COM port. " +
      "The part I'm proudest of: the target MCU wasn't in TinyUSB's supported list, so I ported the stack to it myself.",
    sections: [
      {
        heading: "A serial port, on the silicon",
        html: `
          <p>Rather than a USART on a pair of wires, the STM32 exposes a <strong>USB CDC</strong> endpoint. To the
          host it looks like a normal serial/COM port — open it, send bytes, read them back — while TinyUSB
          handles the descriptors, endpoints, and control-transfer machinery underneath.</p>`
      },
      {
        heading: "Porting TinyUSB to a part it didn't support",
        html: `
          <p>My target STM32 wasn't in TinyUSB's supported-MCU list. So I took the board and
          <strong>device-controller driver (DCD)</strong> for the closest supported part and adapted it to the new
          silicon — clock setup, endpoint configuration, and the USB interrupt wiring — iterating until the board
          enumerated and the CDC pipe moved data in both directions.</p>
          <p>That's the line I want to cross in an interview: the difference between <em>using</em> a USB stack and
          being able to <em>extend</em> it to hardware it has never seen.</p>`
      },
      {
        heading: "Designed, fabricated, and hand-assembled",
        html: `
          <p>I designed the board in <strong>KiCad</strong> \u2014 the MCU, USB connector, and supporting parts laid out on a custom
          PCB \u2014 had it fabricated and shipped to me, then <strong>soldered the whole board by hand</strong>. So the USB
          port I was driving wasn't a borrowed dev board: it's a board I designed and assembled myself.</p>
          <div class="shot-row">
            <figure class="shot">
              <img src="projects/stm32-usb-pcb-cropped.jpg" alt="KiCad render, top view of the custom STM32 + USB-C board I designed — pin header (J4) along the top edge, the main MCU (IC1) in the center, and the USB-C connector (J1) at the right." />
              <figcaption>KiCad render — as designed</figcaption>
            </figure>
            <figure class="shot">
              <img src="projects/stm32-usb-photo.png" alt="Photo of the finished board after hand-soldering — the main MCU (IC1) in the center, the USB-C connector (J1) at the right, and the pin header (J4) along the top edge." />
              <figcaption>Assembled — hand-soldered</figcaption>
            </figure>
          </div>`
      },
      {
        heading: "Bring-up & debugging",
        html: `
          <p>I designed a <strong>JTAG debug socket</strong> onto the board so I could attach an
          <strong>ST-Link</strong> for flashing and step-through debugging from day one — the test path was
          part of the design, not bolted on later. When a bring-up behaved wrong I went straight to the wire
          and inspected the signals with a <strong>Digilent Analog Discovery 2</strong> oscilloscope to confirm
          the device was enumerating and the CDC pipe moving data both ways.</p>`
      },
      {
        heading: "Stack",
        html: `
          <ul>
            <li>MCU: STM32 · USB stack: TinyUSB · device class: CDC (virtual COM port) · language: C.</li>
            <li>Core work: adapting the board + device-controller (DCD) layer for an unsupported target, then verifying enumeration and bidirectional CDC data transfer.</li>
            <li>Debug &amp; test: ST-Link via on-board JTAG socket · Digilent Analog Discovery 2 oscilloscope.</li>
          </ul>`
      }
    ],
    tags: ["STM32", "TinyUSB", "USB CDC", "Virtual COM Port", "DCD Porting", "ST-Link", "JTAG", "Analog Discovery 2", "C", "Embedded Systems"]
  },

  usv: {
    title: "Canal Cleaning Unmanned Surface Vehicle",
    date: "May 2022 — Feb 2023 · EECE 3991 Senior Capstone · UMass Lowell",
    overview:
      "A four-person senior design team, sponsored by the Community of Lowell, built an unmanned surface vehicle " +
      "to keep canal waterways clear of debris. I owned the motor control and sensing side — the Roboclaw motor " +
      "controller, the IMU, and the system schematic — all integrated on a Raspberry Pi 4 running ROS Noetic.",
    sections: [
      {
        heading: "Team & mentor",
        html: `
          <p>Four-person senior design team, sponsored by the Community of Lowell.</p>
          <ul>
            <li><strong>Partners</strong> — Christa Davis · Matthew Harrison · Sarah Dinsmore</li>
            <li><strong>Mentor</strong> — Steven DeYoreo</li>
          </ul>`
      },
      {
        heading: "The vehicle",
        html: `
          <p>The platform started life as a land prototype to validate the ROS stack — lidar mapping, four
          ultrasonic sensors, and <code>move_base</code> navigation — before the team mounted it in a boat hull
          for canal work. A SIM7000 GPS module and a camera for object detection round out the sensing suite.</p>
          <img class="screenshot" src="projects/usv-boat.jpg" alt="The Canal Cleaner USV on the water" />
          <img class="screenshot" src="projects/usv-land.jpg" alt="The land prototype used to validate the ROS navigation stack" />`
      },
      {
        heading: "Motor control & a 20 kHz noise hunt",
        html: `
          <p>The team swapped the original VNH5019 driver for a <strong>Roboclaw 2x60A</strong> motor controller, and
          I took on the bring-up. Early on, the S1/S2 signal lines showed a <strong>3 Vpp, 20 kHz</strong> noise
          spike that corrupted speed commands. Tracing it back to feedback through the motor snubber capacitors, I
          evaluated three fixes — ferrite cores, a separate battery, and an RC low-pass filter — and went with the
          filter: <strong>R = 800 Ω, C = 10 nF → f<sub>c</sub> ≈ 20 kHz</strong>, which kills the noise without
          slowing legitimate command updates.</p>
          <p>I wrote the Python driver and <code>roboclaw_test.launch</code>, tuned the speed and angle equations
          to the controller’s valid command range [1, 126], and verified drive behavior with an RC controller
          wired with the RB channel as an emergency stop.</p>
          <img class="screenshot" src="projects/usv-roboclaw.png" alt="The Roboclaw 2x60A motor controller" />`
      },
      {
        heading: "IMU: MPU-6050 ROS node",
        html: `
          <p>Attitude and motion data come from an MPU-6050 (GY-521) read over the SMBus. I implemented a
          one-minute offset calibration loop at startup, then published angular velocity, linear acceleration, and
          temperature as a standard ROS topic for the rest of the stack to consume. Adding covariance matrices to
          the published messages is on the future-improvements list.</p>`
      },
      {
        heading: "System schematic",
        html: `
          <p>I created the CAD schematic of the current state of the system — power, motor control, IMU, and the
          Raspberry Pi interconnects — so the next team member could see exactly how everything ties together.</p>
          <img class="screenshot" src="projects/usv-schematic.jpg" alt="CAD circuit schematic of the USV system" />`
      },
      {
        heading: "Team context & handoff",
        html: `
          <p>Teammates handled the GPS dashboard — the Freeboard.io view below shows the logged 24-hour path — and
          camera object detection. Before handing off, I left well-documented code and a handoff document covering
          the driver API, the calibration procedure, and known issues.</p>
          <img class="screenshot" src="projects/usv-dashboard.png" alt="Freeboard.io dashboard with GPS gauges and the logged path" />`
      }
    ],
    tags: ["Roboclaw 2x60A", "MPU-6050", "ROS Noetic", "Raspberry Pi 4", "RC Low-Pass Filter", "CAD Schematic", "move_base", "Ultrasonics", "Python"]
  },

  image: {
    title: "Image Enhancement & Filtering",
    date: "Fall 2022 · EECE 4841 Computer Vision & Digital Image Processing · UMass Lowell",
    overview:
      "A from-scratch image processing pipeline in C: read raw PGM bytes, run Sobel edge detection, " +
      "normalize and threshold into a binary edge map — then stress-test it by injecting noise and " +
      "measuring, pixel by pixel, how much of the original edge image survives.",
    sections: [
      {
        heading: "The pipeline, no libraries",
        html: `
          <p>Everything runs on the raw <code>P5</code> PGM byte stream in plain C (VS Code): <code>fscanf</code>
          for the header, <code>malloc</code> for the pixel buffer — no image libraries in sight.</p>
          <p>Padding was the first trick. Instead of writing explicit border loops, I allocated a
          (W+2) × (H+2) buffer, zeroed it with <code>memset</code>, and shifted the image in by one —
          the zero border came for free, so the convolution never reads past the edge.</p>
          <pre><code>/* Sobel kernels — applied to every padded pixel */
float sobelX[3][3] = { {-1, 0, 1},
                      {-2, 0, 2},
                      {-1, 0, 1} };
float sobelY[3][3] = { {-1, -2, -1},
                      { 0,  0,  0},
                      { 1,  2,  1} };</code></pre>
          <img class="screenshot" src="projects/vis-mri-in.jpg" alt="Coronal MRI brain scan, raw input" />
          <img class="screenshot" src="projects/vis-mri-edge.png" alt="Edge map recovered from the MRI scan" />
          <p>MRI test image: raw input and the recovered edge map. The report flags MRI as the hardest
          image in the set to separate with thresholds alone.</p>`
      },
      {
        heading: "Normalization &amp; thresholding",
        html: `
          <p>Sobel responses blow way past 8-bit range, so I swept the image for min and max
          (clamping out-of-range values as I went), rescaled everything to 0–255, then applied a hard
          threshold to get a clean binary edge map.</p>
          <pre><code>/* min/max normalize to 0–255, then hard-threshold */
edge[i][j] = ((edge[i][j] - min) / (max - min)) * 255;
edge[i][j] = (edge[i][j] &gt; threshold) ? 255 : 0;</code></pre>
          <p>Three cake edge maps from the results table — the concentric rings hold up across settings,
          thinning as the setting tightens:</p>
          <img class="screenshot" src="projects/vis-cake-in.png" alt="Cake test image, raw input" />
          <img class="screenshot" src="projects/vis-cake-edge-low.png" alt="Cake edge map, densest ring recovery" />
          <img class="screenshot" src="projects/vis-cake-edge-med.png" alt="Cake edge map, medium recovery" />
          <img class="screenshot" src="projects/vis-cake-edge-high.png" alt="Cake edge map, sparsest ring recovery" />`
      },
      {
        heading: "Noise robustness: does the edge image survive?",
        html: `
          <p>The real experiment: inject random noise scaled to a level N, push the noisy image through the
          same pipeline, and ask how close the recovered edges come to the clean ones. A companion program,
          <code>accuracy.c</code>, compares the two images pixel by pixel and reports the percentage of
          matching pixels.</p>
          <pre><code>/* noise injection, scaled by level N */
y = ((2 * rand() - RAND_MAX) / RAND_MAX + 1) * N;
imageMatrix[i][j] = imageMatrix[i][j] + y;</code></pre>
          <p>The result: even at a drastic noise level the edges came back recognizably intact. The
          accuracy-versus-noise curve dipped as noise climbed, then ticked back up ~0.22% at the third bar —
          that was the min/max normalization doing its job on the noisy data. I also found that using
          averaging as a noise filter keeps the image's brightness intact, while skipping it lets the image
          fade.</p>
          <img class="screenshot" src="projects/vis-us-night.jpg" alt="Earth at night satellite image, cover figure" />
          <p>Cover figure from the report: Earth at night — credit NASA Earth Observatory / NOAA NGDC.</p>`
      },
      {
        heading: "Observations &amp; honest quirks",
        html: `
          <ul>
            <li>MRI edges are genuinely hard to separate by threshold alone — the best recovery still carries texture noise, but the skull outline reads cleanly.</li>
            <li>The cake's edges along the horizontal axis kept dropping out at every setting — the report suspects a small error in the method; logged as a known issue.</li>
            <li>Edge filtering recovers the structure of an image well enough to be useful, even under heavy noise — which was the whole point of the exercise.</li>
          </ul>`
      }
    ],
    tags: ["C", "Sobel Edge Detection", "Thresholding", "Normalization", "Noise Simulation", "PGM", "Pixel Accuracy", "VS Code"]
  },

  fireplace: {
    title: "Voice Activated Fireplace",
    date: "May 2021 — Dec 2021 · EECE 3120 Electronics II · UMass Lowell",
    overview:
      "A microphone-controlled \u201celectric fireplace\u201d: clap your hands and the LED turns on or off \u2014 never both. " +
      "Built around a 555 timer, a D-type flip-flop, and a band-pass filtered mic amplifier tuned to hand-clap " +
      "frequencies (2.2\u20132.8 kHz), plus an audio amplifier stage for crackle and pop sounds.",
    sections: [
      {
        heading: "Clap on / clap off logic",
        html: `
          <p>A 2N3904 transistor acts as the trigger: the amplified mic signal drives its base (\u22480.7 V) to switch the collector
          between 5 V and ground, feeding the LM555 timer. The 555\u2019s discharge and threshold pins drive a blinking LED,
          while a 74LS74N D-type flip-flop stores a bit and toggles it on each blink \u2014 so the fireplace LED flips between
          ON and OFF with every clap, never both.</p>
          <img class="screenshot" src="projects/fireplace-circuit1.png" alt="Circuit 1: 555 timer and 74LS74N D flip-flop clap logic" />
          <p>For the real-life build I added a small 0.1 \u00b5F capacitor to the 555\u2019s control-voltage pin to reject noise fluctuations.</p>`
      },
      {
        heading: "Alternative: T-type flip-flop",
        html: `
          <p>I also prototyped an all-transistor T-type flip-flop (three 2N3904s) to replace the 74LS74N. The Multisim
          simulation confirms it toggles correctly, but in the real circuit it couldn\u2019t source enough current for the LED
          without taking over the whole breadboard \u2014 so the integrated-circuit version won out.</p>
          <img class="screenshot" src="projects/fireplace-circuit2.png" alt="Circuit 2: T-type flip-flop built from 2N3904 transistors" />`
      },
      {
        heading: "Band-pass mic amplifier",
        html: `
          <p>Hand claps concentrate their energy between 2.2 and 2.8 kHz, so I designed a two-stage LF353 band-pass filter
          around the mic bias to reject everything else. Calculated capacitor values: <strong>C1 = 32.8 nF</strong> (high-pass)
          and <strong>C5 = 1.72 nF</strong> (low-pass). I swept the circuit on a network analyzer, adjusting the gain
          potentiometer until the passband sat cleanly inside the clap band.</p>
          <img class="screenshot" src="projects/fireplace-circuit3.png" alt="Circuit 3: LF353 band-pass filter mic amplifier" />
          <p>The Bode plot below marks the measured cutoff frequencies (2.202 kHz and 2.8014 kHz) against the 100 mV reference.</p>
          <img class="screenshot" src="projects/fireplace-bode.png" alt="Bode plot of Circuit 3 with cutoff frequencies marked at 2.202 kHz and 2.8014 kHz" />`
      },
      {
        heading: "Crackle &amp; pop audio",
        html: `
          <p>A LM386 audio power amplifier with 1N4148 limiting diodes (protecting the chip) drives a speaker to produce
          fireplace crackle and pop sounds. The noise waveform was generated with Digilent Waveforms; a transistor RC
          noise generator was planned as a follow-up.</p>
          <img class="screenshot" src="projects/fireplace-circuit4.png" alt="Circuit 4: LM386 audio amplifier with limiting diodes" />`
      },
      {
        heading: "Tools &amp; testing",
        html: `
          <ul>
            <li>Simulated in NI Multisim; verified with a Digilent ADK2 oscilloscope and network-analyzer sweeps.</li>
            <li>Key parts: LF353, LM386, 74LS74N, 2N3904 transistors, 1N4148 diodes, and calculated RC values.</li>
            <li>Debugging highlight: a 555 trigger anomaly where the LED stayed on after the trigger edge \u2014 tracked down and stabilized with the control-voltage capacitor.</li>
          </ul>`
      }
    ],
    tags: ["555 Timer", "74LS74N D Flip-Flop", "2N3904", "LF353 Band-Pass", "LM386 Audio Amp", "1N4148", "Multisim", "Network Analyzer"]
  },

  mic: {
    title: "Microphone Audio Amplifier",
    date: "Fall 2021 · EECE 3120 Electronics II (Labs 4 & 5) · UMass Lowell",
    overview:
      "A complete analog audio signal chain, hand-built across two labs: an electret microphone feeding an " +
      "LF353N preamp and band-pass filter, then into an LM386N-3 power amplifier driving an 8 Ω speaker — " +
      "with a summing network, tone control, and measured frequency response.",
    sections: [
      {
        heading: "The signal chain",
        html: `
          <p>The goal was a working mic-to-speaker path I could build, measure, and debug end to end. I chained
          three stages in series: an <strong>electret condenser microphone</strong> → an <strong>LF353N preamp with a
          band-pass filter</strong> → an <strong>LM386N-3 power amplifier</strong> → an <strong>8 Ω speaker</strong>. Each
          stage was verified on its own, then the full chain was tested together.</p>`
      },
      {
        heading: "Microphone preamp & band-pass filter",
        html: `
          <p>I used a <strong>LF353N</strong> JFET op-amp as the microphone preamp and added a <strong>band-pass
          filter</strong> to pass the voice band while rejecting out-of-band noise. The electret microphone needed a
          <strong>bias circuit</strong> to operate, which I built and stabilized. To bring the small mic pins into the
          build I worked them by hand — bending them and improvising a contact with alligator clips.</p>
          <p>Once the preamp output was clean, I drove it directly into the LM386 power amplifier so the whole
          chain played audio to the speaker.</p>`
      },
      {
        heading: "Audio power amplifier",
        html: `
          <p>The power stage is the <strong>LM386N-3</strong> audio power amplifier. I built an
          <strong>LM358</strong> unity-gain <strong>summing network</strong> to combine the left and right channel
          signals into a single mono drive for the speaker, and added a <strong>single-knob tone control</strong>
          (potentiometer-based) to shape the response.</p>`
      },
      {
        heading: "Measured response & debugging",
        html: `
          <p>I characterized the response with <strong>Bode plots</strong> on a Digilent ADK2 oscilloscope. The
          <strong>low-frequency cutoff measured ≈ 15.91 Hz</strong>, matching the value I calculated from the
          coupling-capacitor impedance — a good check that the filter design landed where I expected.</p>
          <ul>
            <li>Observed <strong>distortion at high volume</strong> as the stage approached bias/cutoff, and confirmed an audible bandwidth near 20 Hz–20 kHz.</li>
            <li>Traced an intermittent <strong>power-supply fault</strong> back to the summing stage; resolved it by removing the summing network and driving the LM386 directly.</li>
            <li>Reduced unwanted mic pickup with <strong>physical shielding</strong>.</li>
          </ul>`
      },
      {
        heading: "Stack",
        html: `
          <ul>
            <li>ICs: LM386N-3 (power amp) · LM358 (summing) · LF353N (mic preamp).</li>
            <li>Electret condenser microphone · 8 Ω, 2 W speaker · potentiometers (10 k, 20 k) · electrolytic + ceramic caps · 1N4148 diode.</li>
            <li>Tools: NI Multisim (simulation) · Digilent ADK2 oscilloscope + Waveforms · TENMA multimeter · Digilent DC power supply.</li>
          </ul>`
      }
    ],
    tags: ["Analog Audio", "LM386N-3", "LF353N", "LM358", "Mic Preamp", "Band-Pass Filter", "Summing Network", "Tone Control", "Bode Analysis", "Multisim"]
  }
};

const backdrop = document.getElementById('project-modal');
const modalTitle = document.getElementById('modal-title');
const modalDate = document.getElementById('modal-date');
const modalContent = document.getElementById('modal-content');
const modalTags = document.getElementById('modal-tags');
const modalClose = document.getElementById('modal-close');
let lastFocused = null;

function openProject(id) {
  const p = PROJECTS[id];
  if (!p) return;
  lastFocused = document.activeElement;

  modalTitle.textContent = p.title;
  modalDate.textContent = p.date;
  modalContent.innerHTML =
    `<p>${p.overview}</p>` +
    p.sections.map(s => `<h4>${s.heading}</h4>${s.html}`).join('');
  modalTags.innerHTML = p.tags.map(t => `<span class="p-tag">${t}</span>`).join('');

  backdrop.hidden = false;
  backdrop.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => {
    backdrop.classList.add('show');
    modalClose.focus();
    document.body.style.overflow = 'hidden';
  });
}

function closeProject() {
  backdrop.classList.remove('show');
  backdrop.setAttribute('aria-hidden', 'true');
  setTimeout(() => { backdrop.hidden = true; }, 220);
  document.body.style.overflow = '';
  if (lastFocused) lastFocused.focus();
}

document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', () => openProject(card.dataset.project));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openProject(card.dataset.project);
    }
  });
});

modalClose.addEventListener('click', closeProject);
backdrop.addEventListener('click', e => { if (e.target === backdrop) closeProject(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !backdrop.hidden) closeProject();
});
