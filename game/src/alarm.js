// The Gilded Vault — the alarm meter. A viewer that spots the thief
// starts a short "SPOTTED!" grace window; break line of sight in time and
// the alarm never rises. Once the grace runs out while seen, the alarm
// climbs; at 100 the thief is caught. Unseen, the alarm slowly decays.

function updateAlarm(dt, seenByGuard, seenByCamera) {
  if (S.state !== 'playing') return;
  const seen = seenByGuard || seenByCamera;
  // The grace window opens only on the unseen -> seen transition, so a
  // viewer that keeps watching does not keep re-opening it.
  const newlySeen = seen && !S.wasSeen;
  S.wasSeen = seen;

  if (newlySeen && S.alarm < 100) {
    // First sight: open the grace window.
    S.graceActive = true;
    S.grace = CFG.graceTime;
    S.message = 'SPOTTED! Break line of sight!';
    S.messageT = CFG.graceTime;
  }

  if (S.graceActive) {
    S.grace -= dt;
    if (!seen) {
      // Got away clean inside the grace window: no alarm, no ghost lost.
      S.graceActive = false;
      S.grace = 0;
      S.message = 'Lost them…';
      S.messageT = 1.2;
    } else if (S.grace <= 0) {
      S.graceActive = false;
      S.spotted = true;
      S.ghost = false;
    }
  }

  if (seen && !S.graceActive) {
    const rate = seenByGuard ? CFG.alarmRiseGuard : CFG.alarmRiseCamera;
    S.alarm = Math.min(100, S.alarm + rate * dt);
  } else if (!seen) {
    S.alarm = Math.max(0, S.alarm - CFG.alarmDecay * dt);
  }

  if (S.alarm >= 100) {
    S.state = 'caught';
    S.message = '';
  }
}
