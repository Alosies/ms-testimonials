<script setup lang="ts">
/**
 * Full-screen AI processing background with radial waves and data streams.
 * Creates an immersive experience that communicates AI is working.
 */
</script>

<template>
  <div class="absolute inset-0 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50">
    <!-- Large radial pulse waves from center -->
    <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <div class="ai-wave absolute h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-200/30" />
      <div class="ai-wave absolute h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-200/20 [animation-delay:-1.5s]" />
      <div class="ai-wave absolute h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-100/20 [animation-delay:-3s]" />
    </div>

    <!-- Particle streams from corners toward center -->
    <div class="particle-stream particle-stream-tl" />
    <div class="particle-stream particle-stream-tr" />
    <div class="particle-stream particle-stream-bl" />
    <div class="particle-stream particle-stream-br" />

    <!-- Horizontal scanning lines -->
    <div class="scan-line absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400/20 to-transparent" style="top: 25%;" />
    <div class="scan-line absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-300/15 to-transparent [animation-delay:-2s]" style="top: 75%;" />

    <!-- Side accent bars -->
    <div class="absolute bottom-0 left-8 top-0 w-px">
      <div class="data-flow h-full w-full bg-gradient-to-b from-transparent via-teal-400/30 to-transparent" />
    </div>
    <div class="absolute bottom-0 right-8 top-0 w-px">
      <div class="data-flow h-full w-full bg-gradient-to-b from-transparent via-teal-400/30 to-transparent [animation-delay:-1.5s]" />
    </div>

    <!-- Corner glows -->
    <div class="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-teal-200/20 blur-3xl" />
    <div class="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-teal-200/20 blur-3xl" />

    <!-- Center glow - creates focal point behind main content -->
    <div class="center-glow absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl" />
  </div>
</template>

<style scoped>
/* Expanding radial waves */
.ai-wave {
  animation: expand-wave 4.5s ease-out infinite;
}

@keyframes expand-wave {
  0% {
    transform: translate(-50%, -50%) scale(0.1);
    opacity: 0.6;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

/* Particle streams flowing toward center */
.particle-stream {
  position: absolute;
  width: 200px;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(20, 184, 166, 0.4), transparent);
  animation: stream-flow 3s ease-in-out infinite;
}

.particle-stream-tl {
  --rotation: 35deg;
  top: 15%;
  left: 5%;
}

.particle-stream-tr {
  --rotation: -35deg;
  top: 20%;
  right: 5%;
  animation-delay: -0.75s;
}

.particle-stream-bl {
  --rotation: -35deg;
  bottom: 20%;
  left: 8%;
  animation-delay: -1.5s;
}

.particle-stream-br {
  --rotation: 35deg;
  bottom: 15%;
  right: 8%;
  animation-delay: -2.25s;
}

@keyframes stream-flow {
  0%, 100% {
    opacity: 0;
    transform: rotate(var(--rotation)) translateX(-50px);
  }
  50% {
    opacity: 1;
    transform: rotate(var(--rotation)) translateX(50px);
  }
}

/* Horizontal scanning effect */
.scan-line {
  animation: scan 4s ease-in-out infinite;
}

@keyframes scan {
  0%, 100% {
    opacity: 0;
    transform: scaleX(0.5);
  }
  50% {
    opacity: 1;
    transform: scaleX(1);
  }
}

/* Vertical data flow on sides */
.data-flow {
  animation: flow-down 3s ease-in-out infinite;
}

@keyframes flow-down {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(100%);
    opacity: 0;
  }
}

/* Center glow with radial gradient and pulse */
.center-glow {
  background: radial-gradient(circle, rgba(204, 251, 241, 0.4) 0%, rgba(204, 251, 241, 0.1) 40%, transparent 70%);
  animation: glow-pulse 4s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.9;
    transform: translate(-50%, -50%) scale(1.1);
  }
}
</style>
