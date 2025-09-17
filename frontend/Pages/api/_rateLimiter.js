let last = 0;
export function isRateLimited(windowMs = 300){
  const now = Date.now();
  if (now - last < windowMs) return true;
  last = now;
  return false;
}





