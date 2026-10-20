/* Readable speed sampling + a sustained acceleration envelope. Anime.js (MIT)
 * smooths RPM and acceleration telemetry. Presentation never changes physics. */
window.createDashboardMotion = function () {
  const el = id => document.getElementById(id);
  const speedEl = el('speed'), rpmEl = el('rpm'), arcEl = el('rpmArc');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  // Keep the primary speed as one opaque, readable number. No rolling digits,
  // crossfades or per-digit transforms on a continuously changing instrument.
  speedEl.textContent = '0';
  const state = { rpm: 0, accel: 0 };
  const tween = window.anime?.createAnimatable(state, {
    rpm: 100, accel: 100, ease: 'out(2)'
  });
  let running = false, enabled = true, lastGear = 'P';
  let frame = 0, lastFrame = 0, lastNumberAt = 0, lastDigit = -1;
  let brakeEnvelope = 0, warningEnvelope = 0;
  const edgeAccel = el('edgeAccel'), edgeBrake = el('edgeBrake'), edgeWarning = el('edgeWarning');
  let pushEnvelope = 0, lastRpm = -1, shiftAnimation = null;
  let telemetry = { speed: 0, rpm: 0, accel: 0 };
  const instrument = document.querySelector('.instrument');
  function setValue(target, value, duration) {
    if (tween) tween[target](value, duration);
    else state[target] = value;
  }
  function paint(now) {
    frame = 0;
    if (!running || document.hidden) return;
    const dt = Math.min(64, now - (lastFrame || now - 16));
    lastFrame = now;
    const active = enabled && !reduce.matches;
    const speed = telemetry.speed;
    const rpm = active ? state.rpm : telemetry.rpm;
    const accel = active ? state.accel : 0;
    // Stable 10 Hz sampling, with a small rounding deadband near an integer.
    // Each change is immediate and fully opaque; no unreadable in-between digits.
    const integer = Math.max(0, Math.round(speed));
    const boundaryPassed = lastDigit < 0 || Math.abs(speed - lastDigit) >= .65;
    if ((integer !== lastDigit && boundaryPassed && now - lastNumberAt >= 100) || (speed < .35 && lastDigit !== 0)) {
      const value = speed < .35 ? 0 : integer;
      speedEl.textContent = String(value);
      speedEl.setAttribute('aria-label', value + ' km/h');
      lastDigit = value; lastNumberAt = now;
    }
    const rpmRounded = Math.round(rpm / 10) * 10;
    if (rpmRounded !== lastRpm) {
      rpmEl.textContent = rpmRounded.toLocaleString('en-US');
      lastRpm = rpmRounded;
    }
    const arc = Math.min(100, Math.max(0, rpm / 100));
    arcEl.style.strokeDasharray = arc + ' 100';
    // Tension belongs to the whole readout. One sustained envelope instead of
    // repeated scale pulses on each number change or every telemetry packet.
    const pushTarget = active && accel > .18 ? Math.sqrt(Math.min(1, (accel - .18) / 3)) : 0;
    const response = pushTarget > pushEnvelope ? 115 : 420;
    pushEnvelope += (pushTarget - pushEnvelope) * (1 - Math.exp(-dt / response));
    if (pushEnvelope < .001) pushEnvelope = 0;
    const scale = active ? 1 + pushEnvelope * .24 : 1;
    speedEl.style.transform = active
      ? `translate3d(0,${(-pushEnvelope * 9).toFixed(2)}px,0) scale(${scale.toFixed(4)})`
      : 'none';
    instrument.style.setProperty('--thrust', active ? pushEnvelope.toFixed(3) : '0');
    // Colored layers are rasterized once; only opacity changes with the
    // acceleration envelope. No flashing and no tint over the central readout.
    const moving = speed > 1;
    const brakeTarget = active && moving ? Math.min(1, Math.max(0, (-accel - .35) / 3.5)) : 0;
    const warningTarget = active && moving ? Math.min(.65, Math.max(0, (-accel - 3.5) / 3.5)) : 0;
    brakeEnvelope += (brakeTarget - brakeEnvelope) * (1 - Math.exp(-dt / (brakeTarget > brakeEnvelope ? 125 : 360)));
    warningEnvelope += (warningTarget - warningEnvelope) * (1 - Math.exp(-dt / (warningTarget > warningEnvelope ? 115 : 420)));
    if (brakeEnvelope < .001) brakeEnvelope = 0;
    if (warningEnvelope < .001) warningEnvelope = 0;
    edgeAccel.style.opacity = active ? (pushEnvelope * (1 - brakeEnvelope)).toFixed(3) : '0';
    edgeBrake.style.opacity = active ? brakeEnvelope.toFixed(3) : '0';
    edgeWarning.style.opacity = active ? warningEnvelope.toFixed(3) : '0';
    instrument.style.setProperty('--braking', active ? brakeEnvelope.toFixed(3) : '0');
    arcEl.style.strokeWidth = (2.2 + pushEnvelope * 2.2).toFixed(2);
    frame = requestAnimationFrame(paint);
  }
  function reset() {
    cancelAnimationFrame(frame); frame = 0; lastFrame = 0;
    for (const key of ['rpm', 'accel']) setValue(key, 0, 0);
    speedEl.textContent = '0';
    speedEl.setAttribute('aria-label', '0 km/h');
    rpmEl.textContent = '0'; arcEl.style.strokeDasharray = '0 100';
    speedEl.style.transform = 'none';
    instrument.style.setProperty('--thrust', '0');
    instrument.style.setProperty('--braking', '0');
    brakeEnvelope = 0; warningEnvelope = 0;
    for (const layer of [edgeAccel, edgeBrake, edgeWarning]) layer.style.opacity = '0';
    pushEnvelope = 0; lastDigit = 0; lastRpm = 0; lastNumberAt = 0;
  }
  function kick() {
    if (running && !document.hidden && !frame) frame = requestAnimationFrame(paint);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; lastFrame = 0; }
    else kick();
  });
  return {
    update(t, effects) {
      const wasRunning = running;
      running = !!t.running; enabled = !!effects;
      telemetry = { speed: Math.max(0, t.speed * 3.6), rpm: t.rpm, accel: t.accel };
      if (!running) { if (wasRunning || lastDigit < 0) reset(); return; }
      const active = enabled && !reduce.matches;
      setValue('rpm', telemetry.rpm, active ? 100 : 0);
      setValue('accel', telemetry.accel, active ? 100 : 0);
      const gear = t.gear < 0 ? '∞' : t.gear === 0 ? 'N' : String(t.gear);
      if (gear !== lastGear) {
        shiftAnimation?.cancel();
        if (active && wasRunning) shiftAnimation = anime.animate(el('gear'), {
          y: [5, 0], opacity: [.55, 1], scale: [1.09, 1],
          duration: 230, ease: 'out(3)'
        });
        lastGear = gear;
      }
      kick();
    }
  };
};
